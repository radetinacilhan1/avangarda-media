"use strict";

const { errors } = require("@strapi/utils");
const MAX_PDF_KB = 15 * 1024;

// Strapi media.size is expressed in KB, including Cloudinary originals.
async function validateArticleDocuments(event) {
  const documents = event.params?.data?.documents;
  if (documents === undefined || documents === null) return;
  if (!Array.isArray(documents)) throw new errors.ValidationError("Dokumenti moraju biti lista.");
  for (const document of documents) {
    // Entity Service stores repeatable components before firing article lifecycles.
    const stored = document.pdfFile === undefined && document.id
      ? await strapi.db.query("shared.article-document").findOne({ where: { id: document.id }, populate: ["pdfFile"] })
      : document;
    const value = stored?.pdfFile;
    const id = typeof value === "object" && value ? value.id : value;
    const file = id ? await strapi.entityService.findOne("plugin::upload.file", id, {
      fields: ["mime", "ext", "size"],
    }) : null;
    if (!file || file.mime !== "application/pdf" || String(file.ext).toLowerCase() !== ".pdf") {
      throw new errors.ValidationError("Dokumenti uz tekst: izaberite PDF fajl iz Media Library.");
    }
    if (!Number.isFinite(Number(file.size)) || Number(file.size) <= 0 || Number(file.size) > MAX_PDF_KB) {
      throw new errors.ValidationError("Dokumenti uz tekst: PDF mora biti manji ili jednak 15 MB.");
    }
  }
}

function installArticleDocumentValidation(app) {
  app.entityService.decorate((service) => ({
    async create(uid, params) {
      if (uid === "api::article.article") await validateArticleDocuments({ params });
      return service.create.call(this, uid, params);
    },
    async update(uid, id, params) {
      if (uid === "api::article.article") await validateArticleDocuments({ params });
      return service.update.call(this, uid, id, params);
    },
  }));
}

async function configureArticleDocumentFields(app) {
  const service = app.plugin("content-manager").service("components");
  const component = app.components["shared.article-document"];
  const config = await service.findConfiguration(component);
  const labels = { pdfFile: "PDF dokument (do 15 MB)", title: "Naziv dokumenta", description: "Opis (opciono)", linkLabel: "Tekst linka (opciono)" };
  if (Object.entries(labels).every(([field, label]) => config.metadatas[field]?.edit?.label === label)) return;
  const metadatas = { ...config.metadatas };
  for (const [field, label] of Object.entries(labels)) {
    metadatas[field] = { ...metadatas[field], edit: { ...metadatas[field].edit, label } };
  }
  await service.updateConfiguration(component, { settings: config.settings, layouts: config.layouts, metadatas });
}

module.exports = { validateArticleDocuments, installArticleDocumentValidation, configureArticleDocumentFields };
