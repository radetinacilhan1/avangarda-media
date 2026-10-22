"use strict";

const { AsyncLocalStorage } = require("node:async_hooks");
const { createHash } = require("node:crypto");
const { errors } = require("@strapi/utils");
const { LANGUAGES, httpUrl } = require("./editorial-intake");
const UID = "api::fact-check.fact-check";
const scope = new AsyncLocalStorage();
const REVIEW_FIELDS = ["reviewStatus", "approvedBy", "approvedAt", "reviewFingerprint"];
const LOCALIZED = ["title", "claim", "summary", "context"];
const CONTENT_FIELDS = ["slug", "sourceUrl", "claimant", "claimDate", "rating", "responsiblePerson", "checkedAt", ...LOCALIZED.flatMap((name) => LANGUAGES.map((lang) => lang === "sr" ? name : `${name}_${lang}`)), "sources", "corrections"];
const RATINGS = ["true", "partly_true", "false", "misleading", "unverifiable"];
const POPULATE = { sources: true, corrections: true };

function canonical(value) {
  if (value == null || value === "") return null;
  if (Array.isArray(value)) return value.map(canonical);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return Object.fromEntries(Object.keys(value).filter((key) => !["id", "__component", "__pivot"].includes(key)).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
function fingerprint(record) { return createHash("sha256").update(JSON.stringify(canonical(Object.fromEntries(CONTENT_FIELDS.map((key) => [key, record?.[key]]))))).digest("hex"); }
function isApproved(record) { return Boolean(record && record.reviewStatus === "approved" && record.approvedBy && record.approvedAt && record.reviewFingerprint === fingerprint(record)); }
function validateForReview(record) {
  if (!["title", "claim", "summary", "context", "responsiblePerson", "checkedAt", "slug"].every((field) => typeof record?.[field] === "string" && record[field].trim()) || !RATINGS.includes(record.rating)) throw new errors.ValidationError("Provera mora imati tvrdnju, obrazloženje, kontekst, potpis, datum i ocenu.");
  if (record.sourceUrl && !httpUrl(record.sourceUrl)) throw new errors.ValidationError("Izvor tvrdnje mora biti direktan HTTP(S) link.");
  if (!Array.isArray(record.sources) || !record.sources.length || record.sources.some((source) => !source.name?.trim() || !httpUrl(source.url) || !/^\d{4}-\d{2}-\d{2}$/.test(source.accessedAt || ""))) throw new errors.ValidationError("Dodaj proverljive izvore: naziv, direktan link i datum pristupa.");
  if ((record.corrections || []).some((correction) => !correction.note?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(correction.date || ""))) throw new errors.ValidationError("Svaka javna ispravka zahteva datum i opis.");
}
async function read(app, id) { return app.entityService.findOne(UID, id, { populate: POPULATE }); }
function guard(data, previous) {
  if (!scope.getStore()?.approving) {
    for (const field of REVIEW_FIELDS) {
      if (data[field] !== undefined && canonical(data[field]) !== canonical(previous?.[field]) && !(field === "reviewStatus" && data[field] === "pending")) throw new errors.ForbiddenError("Uredničku potvrdu može zabeležiti samo serverska akcija pregleda.");
    }
  }
  const next = { ...(previous || {}), ...data };
  const changed = !previous || fingerprint(next) !== fingerprint(previous);
  if (!scope.getStore()?.approving && changed) {
    if (data.publishedAt) throw new errors.ValidationError("Sadržaj je promenjen. Sačuvaj nacrt i ponovi uredničku potvrdu pre objave.");
    Object.assign(data, { reviewStatus: "pending", approvedBy: null, approvedAt: null, reviewFingerprint: null, publishedAt: null });
  }
  if (data.publishedAt && !isApproved({ ...(previous || {}), ...data })) throw new errors.ValidationError("Objava zahteva važeću uredničku potvrdu sačuvanog sadržaja.");
  return data;
}

function installFactCheckWorkflow(app) {
  app.entityService.decorate((service) => ({
    async create(uid, params) {
      if (uid !== UID) return service.create.call(this, uid, params);
      guard(params.data, null);
      return scope.run({ ...scope.getStore(), managed: true }, () => service.create.call(this, uid, params));
    },
    async update(uid, id, params) {
      if (uid !== UID) return service.update.call(this, uid, id, params);
      const update = async () => {
        const previous = await read(app, id);
        guard(params.data, previous);
        return scope.run({ ...scope.getStore(), managed: true, locked: true }, () => service.update.call(this, uid, id, params));
      };
      if (scope.getStore()?.locked) return update();
      return app.db.transaction(async ({ trx }) => {
        const table = app.db.metadata.get(UID).tableName;
        await trx(table).where({ id }).forUpdate().first();
        return update();
      });
    },
  }));
}

async function beforeCreate(event) { if (!scope.getStore()?.managed) guard(event.params.data, null); }
async function beforeUpdate(event) {
  if (scope.getStore()?.managed) return;
  const previous = await strapi.db.query(UID).findOne({ where: event.params.where, populate: POPULATE });
  guard(event.params.data, previous);
}
function beforeUpdateMany(event) {
  if (Object.keys(event.params.data || {}).some((key) => [...CONTENT_FIELDS, ...REVIEW_FIELDS, "publishedAt"].includes(key))) throw new errors.ValidationError("Grupna objava/izmena provera nije dozvoljena. Pregledaj svaki zapis pojedinačno.");
}

async function approve(app, id, editor, expectedFingerprint) {
  if (!editor?.id || !expectedFingerprint) throw new errors.ForbiddenError("Neophodna je prijava ovlašćenog urednika.");
  return app.db.transaction(async ({ trx }) => {
    const table = app.db.metadata.get(UID).tableName;
    await trx(table).where({ id }).forUpdate().first();
    const record = await read(app, id);
    if (!record) throw new errors.NotFoundError("Provera nije pronađena.");
    validateForReview(record);
    const hash = fingerprint(record);
    if (hash !== expectedFingerprint) { const error = new errors.ApplicationError("Sadržaj je promenjen. Osveži, pročitaj novu verziju i ponovi pregled."); error.status = 409; throw error; }
    // Identity comes exclusively from the verified Strapi admin session, never the payload.
    const approvedBy = `${editor.id}: ${[editor.firstname, editor.lastname].filter(Boolean).join(" ") || editor.username || "Urednik"}`;
    await scope.run({ approving: true, locked: true }, () => app.entityService.update(UID, id, { data: { reviewStatus: "approved", approvedBy, approvedAt: new Date().toISOString(), reviewFingerprint: hash } }));
    return { approved: true, fingerprint: hash };
  });
}

function publicRecord(record) {
  if (!record?.publishedAt || !isApproved(record)) return null;
  const attributes = Object.fromEntries([...CONTENT_FIELDS, "publishedAt", "updatedAt"].map((key) => [key, record[key]]));
  attributes.sources = (record.sources || []).map(({ name, url, accessedAt }) => ({ name, url, accessedAt }));
  attributes.corrections = (record.corrections || []).map((entry) => Object.fromEntries(["date", ...LANGUAGES.map((lang) => lang === "sr" ? "note" : `note_${lang}`)].map((key) => [key, entry[key]])));
  return { id: record.id, attributes };
}
module.exports = { UID, REVIEW_FIELDS, CONTENT_FIELDS, POPULATE, RATINGS, canonical, fingerprint, isApproved, guard, validateForReview, read, installFactCheckWorkflow, beforeCreate, beforeUpdate, beforeUpdateMany, approve, publicRecord };
