"use strict";

const { AsyncLocalStorage } = require("node:async_hooks");
const { errors } = require("@strapi/utils");
const ARTICLE_UID = "api::article.article";
const CONFIG_UID = "api::homepage-config.homepage-config";
const transactionScope = new AsyncLocalStorage();
let queue = Promise.resolve();

function cleanIds(ids) {
  return [...new Set((Array.isArray(ids) ? ids : []).map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))].slice(0, 5);
}

function normalizeState(value) {
  let state = value;
  if (typeof state === "string") { try { state = JSON.parse(state); } catch { state = null; } }
  return {
    initialized: state?.initialized === true,
    revision: Number.isSafeInteger(state?.revision) && state.revision >= 0 ? state.revision : 0,
    articleIds: cleanIds(state?.articleIds),
    operations: Array.isArray(state?.operations) ? state.operations.slice(-64) : [],
  };
}

function validateProposal(value) {
  if (value == null) return null;
  if (!Number.isInteger(value.position) || value.position < 0 || value.position > 5
    || !Number.isSafeInteger(value.baseRevision) || value.baseRevision < 0
    || typeof value.operationId !== "string" || !/^[A-Za-z0-9_-]{12,80}$/.test(value.operationId)) {
    throw new errors.ValidationError("Neispravna pozicija na naslovnoj. Osveži pregled i ponovo izaberi poziciju.");
  }
  return { position: value.position, baseRevision: value.baseRevision, operationId: value.operationId };
}

function insertAt(ids, articleId, position) {
  const remaining = cleanIds(ids).filter((id) => id !== Number(articleId));
  if (position > 0) remaining.splice(Math.min(position - 1, remaining.length), 0, Number(articleId));
  return cleanIds(remaining);
}

function conflict(message) {
  const error = new errors.ApplicationError(message);
  error.status = 409;
  return error;
}

function applyProposal(state, articleId, proposal) {
  const previous = state.operations.find((operation) => operation.operationId === proposal.operationId);
  if (previous) {
    if (previous.articleId !== Number(articleId) || previous.position !== proposal.position) throw conflict("Ova operacija je već iskorišćena. Osveži pregled.");
    return state;
  }
  if (proposal.baseRevision !== state.revision) throw conflict("Naslovna je u međuvremenu promenjena. Osveži pregled, proveri novi raspored i sačuvaj izbor ponovo.");
  return {
    initialized: true,
    revision: state.revision + 1,
    articleIds: insertAt(state.articleIds, articleId, proposal.position),
    operations: [...state.operations, { operationId: proposal.operationId, articleId: Number(articleId), position: proposal.position }].slice(-64),
  };
}

function removeIds(state, ids) {
  const removed = new Set(ids.map(Number));
  const next = state.articleIds.filter((id) => !removed.has(id));
  return next.length === state.articleIds.length ? state : { ...state, articleIds: next, revision: state.revision + 1 };
}

// These are the existing hero rules. Priority keeps all of its other uses.
function compareLegacyArticles(a, b) {
  const ac = a.editorialControl || {}, bc = b.editorialControl || {};
  const timestamp = (value) => { const parsed = Date.parse(value || ""); return Number.isFinite(parsed) ? parsed : 0; };
  return Number(bc.isFeatured === true) - Number(ac.isFeatured === true)
    || (Number(bc.priority) || 0) - (Number(ac.priority) || 0)
    || Number(bc.isBreaking === true) - Number(ac.isBreaking === true)
    || Number(bc.isTrending === true) - Number(ac.isTrending === true)
    || timestamp(b.publishedAt) - timestamp(a.publishedAt);
}

function legacySelection(articles) {
  const available = articles.filter((article) => article.publishedAt && article.slug && article.title);
  const hasSignal = available.some((article) => {
    const control = article.editorialControl || {};
    return control.isFeatured === true || control.isBreaking === true || control.isTrending === true || (Number(control.priority) || 0) !== 0;
  });
  return cleanIds((hasSignal ? [...available].sort(compareLegacyArticles) : available).map((article) => article.id));
}

async function withSelectionTransaction(app, callback) {
  const active = transactionScope.getStore();
  if (active) return callback(active);
  let release;
  const previous = queue;
  queue = new Promise((resolve) => { release = resolve; });
  await previous;
  try {
    return await app.db.transaction(async ({ trx, onCommit }) => {
      const scope = { trx, invalidations: new Map() };
      return transactionScope.run(scope, async () => {
        const result = await callback(scope);
        onCommit(() => {
          // The native cache webhook reads only committed article + selection data.
          transactionScope.run(null, () => scope.invalidations.forEach((invalidate) => { Promise.resolve().then(invalidate).catch((error) => app.log.warn(`[headline-selection] Revalidation failed: ${error.message}`)); }));
        });
        return result;
      });
    });
  } finally { release(); }
}

function deferRevalidation(key, callback) {
  const scope = transactionScope.getStore();
  if (!scope) return false;
  scope.invalidations.set(key, callback);
  return true;
}

async function lockState(app, trx) {
  const metadata = app.db.metadata.get(CONFIG_UID);
  const column = metadata.attributes.headlineState.columnName;
  const row = await trx(metadata.tableName).select("id", column).orderBy("id", "asc").forUpdate().first();
  if (!row) throw new errors.ApplicationError("Podešavanja naslovne nisu dostupna.");
  return { id: row.id, state: normalizeState(row[column]), table: metadata.tableName, column };
}

async function persistState(app, trx, locked, state) {
  if (state === locked.state) return;
  await trx(locked.table).where({ id: locked.id }).update({ [locked.column]: JSON.stringify(state) });
  const { revalidateFrontend } = require("./revalidate-frontend");
  await revalidateFrontend(CONFIG_UID, "afterUpdate", { result: { id: locked.id }, params: { data: { headlineState: state } } });
}

async function publishedArticles(app, ids, fields, populate) {
  if (!ids.length) return [];
  const articles = await app.entityService.findMany(ARTICLE_UID, {
    filters: { id: { $in: ids }, publishedAt: { $notNull: true } },
    fields, populate, sort: "publishedAt:desc", limit: 5,
  });
  const byId = new Map(articles.filter((article) => article.slug && article.title && article.publishedAt).map((article) => [Number(article.id), article]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

async function initializeHeadlineSelection(app) {
  return withSelectionTransaction(app, async ({ trx }) => {
    const locked = await lockState(app, trx);
    if (locked.state.initialized) return locked.state;
    const articles = await app.entityService.findMany(ARTICLE_UID, {
      filters: { publishedAt: { $notNull: true } }, fields: ["id", "title", "slug", "publishedAt"],
      populate: { editorialControl: true }, sort: "publishedAt:desc", limit: -1,
    });
    const state = { initialized: true, revision: 0, articleIds: legacySelection(articles), operations: [] };
    await persistState(app, trx, locked, state);
    app.log.info(`[headline-selection] Initialized ${state.articleIds.length} stories in their existing production order.`);
    return state;
  });
}

async function readHeadlineSelection(app, configuration, withCards = false) {
  const config = configuration || await app.db.query(CONFIG_UID).findOne();
  const state = normalizeState(config?.headlineState);
  const fields = ["id", "title", "slug", "publishedAt"];
  if (withCards) {
    fields.push("subtitle", "section", "style", "focus", "videoEmbedUrl", "readingTime", "year");
    for (const language of ["en", "tr", "fr", "de", "es", "el", "ar"]) fields.push(`title_${language}`, `subtitle_${language}`, `focus_${language}`);
  }
  const articles = await publishedArticles(app, state.articleIds, fields, withCards ? { cover: true, authors: { fields: ["id", "name", "slug"] }, editorialControl: true, topics: true, editorialDirection: true } : undefined);
  return {
    headlineSelection: { initialized: state.initialized, revision: state.revision, articleIds: articles.map((article) => Number(article.id)) },
    headlineArticles: articles,
  };
}

async function applySavedPlacement(app, id, operationId) {
  return withSelectionTransaction(app, async ({ trx }) => {
    const locked = await lockState(app, trx);
    if (!locked.state.initialized) throw new errors.ApplicationError("Naslovni izbor još nije inicijalizovan.");
    const article = await app.entityService.findOne(ARTICLE_UID, id, { fields: ["id", "title", "slug", "publishedAt", "homepagePlacement"] });
    if (!article?.publishedAt || !article.slug || !article.title) throw new errors.ValidationError("Samo objavljen i dostupan članak može biti izabran.");
    const proposal = validateProposal(article.homepagePlacement);
    if (!proposal || proposal.operationId !== operationId) throw conflict("Najpre sačuvaj izabranu poziciju članka, pa objavi raspored.");
    await persistState(app, trx, locked, applyProposal(locked.state, id, proposal));
    return readHeadlineSelection(app);
  });
}

function installHeadlineSelection(app) {
  app.entityService.decorate((service) => ({
    async create(uid, params) {
      if (uid === ARTICLE_UID && params?.data?.homepagePlacement != null) validateProposal(params.data.homepagePlacement);
      if (uid === CONFIG_UID && Object.hasOwn(params?.data || {}, "headlineState")) throw new errors.ValidationError("Naslovni raspored se menja kroz članak.");
      // Native Content Manager creates drafts; other server callers must publish
      // through update so that proposal + publishedAt are one transaction.
      if (uid === ARTICLE_UID && params?.data?.publishedAt && params?.data?.homepagePlacement) throw new errors.ValidationError("Sačuvaj članak kao nacrt, zatim ga objavi.");
      return service.create.call(this, uid, params);
    },
    async update(uid, id, params) {
      if (uid === CONFIG_UID && Object.hasOwn(params?.data || {}, "headlineState")) throw new errors.ValidationError("Naslovni raspored se menja kroz članak.");
      if (uid !== ARTICLE_UID) return service.update.call(this, uid, id, params);
      if (Object.hasOwn(params?.data || {}, "homepagePlacement")) validateProposal(params.data.homepagePlacement);
      if (!Object.hasOwn(params?.data || {}, "publishedAt")) return service.update.call(this, uid, id, params);
      return withSelectionTransaction(app, async ({ trx }) => {
        const locked = await lockState(app, trx);
        const article = await service.findOne.call(this, uid, id, { fields: ["id", "homepagePlacement", "publishedAt"] });
        const publishing = Boolean(params.data.publishedAt);
        const proposal = publishing ? validateProposal(params.data.homepagePlacement === undefined ? article?.homepagePlacement : params.data.homepagePlacement) : null;
        if (proposal && !locked.state.initialized) throw new errors.ApplicationError("Naslovni izbor još nije inicijalizovan.");
        // Check the saved preview version before touching publication or components.
        let next = proposal ? applyProposal(locked.state, id, proposal) : publishing ? locked.state : removeIds(locked.state, [id]);
        const result = await service.update.call(this, uid, id, params);
        if (proposal && (!result?.publishedAt || !result.slug || !result.title)) throw new errors.ValidationError("Članak nije dostupan za naslovnu.");
        await persistState(app, trx, locked, next);
        return result;
      });
    },
    async delete(uid, id, params) {
      if (uid === CONFIG_UID) throw new errors.ValidationError("Podešavanja naslovne sadrže aktivan raspored i ne mogu se obrisati.");
      if (uid !== ARTICLE_UID) return service.delete.call(this, uid, id, params);
      return withSelectionTransaction(app, async ({ trx }) => {
        const locked = await lockState(app, trx);
        const result = await service.delete.call(this, uid, id, params);
        await persistState(app, trx, locked, removeIds(locked.state, [id]));
        return result;
      });
    },
    async deleteMany(uid, params) {
      if (uid === CONFIG_UID) throw new errors.ValidationError("Podešavanja naslovne ne mogu se obrisati.");
      if (uid !== ARTICLE_UID) return service.deleteMany.call(this, uid, params);
      return withSelectionTransaction(app, async ({ trx }) => {
        const locked = await lockState(app, trx);
        const articles = await service.findMany.call(this, uid, { ...params, fields: ["id"], limit: -1 });
        const result = await service.deleteMany.call(this, uid, params);
        await persistState(app, trx, locked, removeIds(locked.state, articles.map((article) => article.id)));
        return result;
      });
    },
  }));
}

module.exports = {
  ARTICLE_UID, CONFIG_UID, cleanIds, normalizeState, validateProposal, insertAt, applyProposal,
  removeIds, compareLegacyArticles, legacySelection, withSelectionTransaction, deferRevalidation,
  initializeHeadlineSelection, readHeadlineSelection, applySavedPlacement, installHeadlineSelection,
};
