"use strict";

const { AsyncLocalStorage } = require("node:async_hooks");
const { errors, contentTypes } = require("@strapi/utils");
const GALLERY_UID = "api::gallery.gallery";
const galleryTransactions = new AsyncLocalStorage();
const FIELD_LABELS = {
  title: "Naslov galerije", slug: "Slug", photographerName: "Fotograf",
  image: "Fotografija", shareImage: "Slika za deljenje", internalName: "Interni naziv fotografije",
  adminLabel: "Naziv reda", matchUrl: "URL fotografije", altText: "Alt tekst", caption: "Opis",
  layout: "Raspored", insertAfterParagraph: "Pozicija posle pasusa", creditType: "Vrsta kredita",
  authorName: "Autor", sourceName: "Naziv izvora", sourceUrl: "URL izvora", year: "Godina",
  license: "Licenca", copyrightNotice: "Autorska prava", showCredit: "Prikaži kredit",
  downloadable: "Omogući preuzimanje", watermark: "Vodeni žig", order: "Redosled",
  galleryDate: "Datum galerije", seoTitle: "SEO naslov", images: "Fotografije galerije",
};
const LANGUAGES = { en: "engleski", tr: "turski", fr: "francuski", de: "nemački", es: "španski", el: "grčki", ar: "arapski" };

function fieldLabel(path) {
  const last = String(path[path.length - 1] || "Galerija");
  const translated = /^(.*)_(en|tr|fr|de|es|el|ar)$/.exec(last);
  const label = translated ? `${FIELD_LABELS[translated[1]] || translated[1]} (${LANGUAGES[translated[2]]})` : FIELD_LABELS[last] || last;
  return path[0] === "images" && /^\d+$/.test(String(path[1])) ? `Fotografija ${Number(path[1]) + 1} · ${label}` : label;
}

function addIssue(issues, path, explanation) {
  const normalized = path.map((part) => /^\d+$/.test(String(part)) ? Number(part) : String(part));
  // One actionable explanation per field; several fields remain visible together.
  if (!issues.some((issue) => JSON.stringify(issue.path) === JSON.stringify(normalized))) {
    issues.push({ path: normalized, message: `${fieldLabel(normalized)}: ${explanation}`, name: "ValidationError" });
  }
}

function storageStringLimit(attribute) {
  const physicalType = attribute.column?.type || attribute.type;
  if (["string", "uid", "email", "password", "enumeration"].includes(physicalType)) {
    return Number.isInteger(attribute.column?.args?.[0]) ? attribute.column.args[0] : 255;
  }
  return null;
}

function mediaValues(value) {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    if (value.id !== undefined) return [value];
    if (value.set !== undefined) return Array.isArray(value.set) ? value.set : [value.set];
    if (value.connect !== undefined) return Array.isArray(value.connect) ? value.connect : [value.connect];
    if (value.disconnect !== undefined) return [];
  }
  return [value];
}

function collectMediaIds(app, model, data, ids = new Set()) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return ids;
  for (const [name, attribute] of Object.entries(model.attributes || {})) {
    const value = data[name];
    if (value === undefined || value === null) continue;
    if (attribute.type === "media") {
      for (const item of mediaValues(value)) {
        const id = item && typeof item === "object" ? item.id : item;
        if (/^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0) ids.add(Number(id));
      }
    } else if (attribute.type === "component") {
      const component = app.getModel(attribute.component);
      for (const row of attribute.repeatable && Array.isArray(value) ? value : [value]) collectMediaIds(app, component, row, ids);
    }
  }
  return ids;
}

async function collectStorageIssues(app, model, data, issues, prefix = [], mediaCache) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return;
  if (!mediaCache) {
    const ids = [...collectMediaIds(app, model, data)];
    // One lookup for the full gallery, including nested components and duplicates.
    // Sequential per-photo queries make larger galleries unnecessarily slow on a remote database.
    const files = ids.length ? await app.db.query("plugin::upload.file").findMany({ where: { id: { $in: ids } }, select: ["id", "mime"] }) : [];
    mediaCache = new Map(files.map((file) => [String(file.id), file]));
  }
  for (const [name, attribute] of Object.entries(model.attributes || {})) {
    if (!Object.prototype.hasOwnProperty.call(data, name)) continue;
    const value = data[name], path = [...prefix, name];
    if (value === null || value === undefined) continue;
    const physicalLimit = storageStringLimit(attribute);
    if (typeof value === "string") {
      const explicitLimit = Number.isInteger(attribute.maxLength) ? attribute.maxLength : null;
      const exceedsPhysical = physicalLimit !== null && Array.from(value).length > physicalLimit;
      const exceedsExplicit = explicitLimit !== null && value.length > explicitLimit;
      if (exceedsPhysical || exceedsExplicit) {
        const limit = exceedsExplicit ? Math.min(explicitLimit, physicalLimit ?? explicitLimit) : physicalLimit;
        addIssue(issues, path, `Skrati unos na najviše ${limit} znakova (trenutno ${Array.from(value).length}).`);
      }
    }
    if (attribute.type === "integer" && value !== "") {
      const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
      if (!Number.isInteger(number) || number < -2147483648 || number > 2147483647) {
        addIssue(issues, path, "Unesi ceo broj od -2147483648 do 2147483647.");
      }
    }
    if (attribute.type === "component") {
      const component = app.getModel(attribute.component);
      if (attribute.repeatable && Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) await collectStorageIssues(app, component, value[index], issues, [...path, index], mediaCache);
      } else if (!attribute.repeatable) await collectStorageIssues(app, component, value, issues, path, mediaCache);
    }
    if (attribute.type === "media") {
      const values = mediaValues(value);
      if (!attribute.multiple && values.length > 1) {
        addIssue(issues, path, "Izaberi jednu fotografiju iz Media Library.");
        continue;
      }
      for (const item of values) {
        const id = item && typeof item === "object" ? item.id : item;
        if (!/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
          addIssue(issues, path, "Izaberi postojeću fotografiju iz Media Library ili ostavi polje prazno.");
          continue;
        }
        const key = String(id);
        const file = mediaCache.get(key);
        if (!file) addIssue(issues, path, "Izabrani fajl više ne postoji u Media Library. Izaberi drugi fajl.");
        else if (attribute.allowedTypes?.includes("images") && !String(file.mime).startsWith("image/")) addIssue(issues, path, "Izabrani fajl nije fotografija. Izaberi sliku iz Media Library.");
      }
    }
  }
}

function nativeExplanation(issue) {
  const message = String(issue.message || "");
  if (/required|cannot be null|cannot be empty|must be defined/i.test(message)) return "Popuni ovo obavezno polje.";
  if (/unique/i.test(message)) return "Ova vrednost je već zauzeta. Unesi jedinstvenu vrednost.";
  if (/one of|oneOf/i.test(message)) return "Izaberi jednu od ponuđenih vrednosti.";
  if (/integer/i.test(message)) return "Unesi ceo broj.";
  if (/number/i.test(message)) return "Unesi ispravan broj.";
  if (/boolean/i.test(message)) return "Izaberi da ili ne.";
  if (/must be a.*string|must be.*string type/i.test(message)) return "Unesi tekst.";
  if (/must be a.*array|must be.*array type/i.test(message)) return "Vrednost mora biti lista. Proveri dodate redove.";
  if (/must be a.*object|Expected an object/i.test(message)) return "Proveri sadržaj ovog reda.";
  if (/matches/i.test(message) && issue.path?.[issue.path.length - 1] === "slug") return "Koristi slova bez dijakritike, brojeve, crticu, donju crtu ili tačku.";
  if (/relation|associated.*do not exist/i.test(message)) return "Povezani zapis više ne postoji. Proveri izbor povezanih zapisa.";
  // Do not echo Yup's technical message: it can contain the complete submitted value.
  return "Unesi vrednost u formatu koji ovo polje prihvata.";
}

async function validateGallery(app, data, entity, creating) {
  const issues = [], model = app.getModel(GALLERY_UID);
  await collectStorageIssues(app, model, data, issues);
  const knownMissingMedia = new Set(issues
    .filter((issue) => issue.message.endsWith("Izabrani fajl više ne postoji u Media Library. Izaberi drugi fajl."))
    .flatMap((issue) => mediaValues(issue.path.reduce((value, part) => value?.[part], data)))
    .map((value) => String(value && typeof value === "object" ? value.id : value)));
  try {
    const validate = creating ? app.entityValidator.validateEntityCreation : app.entityValidator.validateEntityUpdate;
    await validate(model, data, { isDraft: contentTypes.isDraft(creating ? data : entity, model) }, entity);
  } catch (error) {
    if (!(error instanceof errors.ValidationError)) throw error;
    const nativeIssues = error.details?.errors?.length ? error.details.errors : [{ path: [], message: error.message }];
    for (const issue of nativeIssues) {
      const path = Array.isArray(issue.path) ? issue.path : [];
      const duplicateMissingMedia = /^(\d+) relation\(s\) of type plugin::upload\.file associated with this entity do not exist$/.exec(String(issue.message));
      // Native relation validation also emits an unlocated summary. Omit it only
      // when its entire media count already has precise field/photo errors.
      if (!path.length && duplicateMissingMedia && Number(duplicateMissingMedia[1]) <= knownMissingMedia.size) continue;
      addIssue(issues, path, nativeExplanation(issue));
    }
  }
  if (issues.length) throw new errors.ValidationError("Galerija nije sačuvana. Ispravi označena polja; svi unosi ostaju u otvorenoj formi.", { errors: issues });
}

async function withGalleryTransaction(app, callback) {
  if (galleryTransactions.getStore()) return callback();
  return app.db.transaction(async ({ onCommit }) => {
    const callbacks = [];
    onCommit(() => {
      // Strapi invokes onCommit without awaiting it; keep revalidation failures out of the save response.
      galleryTransactions.run(undefined, () => {
        for (const callback of callbacks) Promise.resolve().then(callback).catch(() => app.log.warn("[gallery] Frontend revalidation failed after commit."));
      });
    });
    return galleryTransactions.run(callbacks, callback);
  });
}

function revalidateGallery(action, event) {
  const revalidate = () => require("./revalidate-frontend").revalidateFrontend(GALLERY_UID, action, event);
  const callbacks = galleryTransactions.getStore();
  if (callbacks) { callbacks.push(revalidate); return; }
  return revalidate();
}

function installGalleryValidation(app) {
  app.entityService.decorate((service) => ({
    async create(uid, params) {
      if (uid !== GALLERY_UID) return service.create.call(this, uid, params);
      return withGalleryTransaction(app, async () => {
        await validateGallery(app, params?.data, undefined, true);
        return service.create.call(this, uid, params);
      });
    },
    async update(uid, id, params) {
      if (uid !== GALLERY_UID) return service.update.call(this, uid, id, params);
      return withGalleryTransaction(app, async () => {
        const entity = await app.db.query(uid).findOne({ where: { id } });
        if (entity) await validateGallery(app, params?.data, entity, false);
        return service.update.call(this, uid, id, params);
      });
    },
  }));
}

module.exports = { GALLERY_UID, fieldLabel, storageStringLimit, mediaValues, collectStorageIssues, validateGallery, installGalleryValidation, revalidateGallery };
