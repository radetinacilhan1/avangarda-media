"use strict";

const VERSION = "avangarda-appearance-layout-v1";
const BACKUP_KEY = `${VERSION}-backup`;
const STATUS_KEY = `${VERSION}-status`;
const FOCUS_LANGUAGES = ["en", "tr", "fr", "de", "es", "el", "ar"];
const LANGUAGE_LABELS = { en: "engleski", tr: "turski", fr: "francuski", de: "nemački", es: "španski", el: "grčki", ar: "arapski" };

function addEditFields(layout, anchor, names) {
  const movingNames = new Set(names.filter((name) => name !== anchor));
  const rows = (layout || []).map((row) => row.filter((field) => !movingNames.has(field.name))).filter((row) => row.length);
  const additions = [];
  const fields = names.filter((name) => name !== anchor).map((name) => ({ name, size: 6 }));
  for (let index = 0; index < fields.length; index += 2) additions.push(fields.slice(index, index + 2));
  if (names.includes(anchor) && !rows.flat().some((field) => field.name === anchor)) rows.push([{ name: anchor, size: 12 }]);
  const anchorIndex = rows.findIndex((row) => row.some((field) => field.name === anchor));
  rows.splice(anchorIndex === -1 ? rows.length : anchorIndex + 1, 0, ...additions);
  return rows;
}

function fieldMetadata(previous, label, description, editable = true) {
  return {
    ...previous,
    edit: { ...previous?.edit, label, description, visible: true, editable },
    list: { ...previous?.list, label, searchable: true, sortable: true },
  };
}

function configureAppearanceLayout(uid, configuration, model) {
  const metadatas = { ...configuration.metadatas };
  let edit = configuration.layouts?.edit || [];
  let list = configuration.layouts?.list || [];
  if (uid === "api::article.article") {
    const focusFields = ["focus", ...FOCUS_LANGUAGES.map((language) => `focus_${language}`)]
      .filter((name) => model.attributes[name]);
    for (const name of focusFields) {
      const language = name === "focus" ? null : name.slice(-2);
      metadatas[name] = fieldMetadata(
        metadatas[name],
        language ? `Fokus — ${LANGUAGE_LABELS[language]}` : "Fokus — srpski",
        language ? `Opcioni prevod na ${LANGUAGE_LABELS[language]}. Prazan prevod koristi postojeći srpski fokus.` : "Srpski fokus; čuva postojeću vrednost i služi kao fallback za prazne prevode."
      );
    }
    edit = addEditFields(edit, "focus", focusFields);
    if (model.attributes.viewCount) {
      metadatas.viewCount = fieldMetadata(metadatas.viewCount, "Prikazi", "Informativni javni brojač. Otvaranje članka u CMS-u ne povećava broj prikaza.", false);
      list = list.filter((name) => name !== "viewCount");
      // Strapi v4 hides publishedAt from configurable columns and appends its
      // built-in State column. The last configurable column is beside it.
      list.push("viewCount");
    }
  } else if (uid === "api::author.author") {
    const fields = ["mapColor", "mapEffect"].filter((name) => model.attributes[name]);
    if (fields.includes("mapColor")) metadatas.mapColor = fieldMetadata(metadatas.mapColor, "Boja na mapi", "Opciono. Izaberi boju ili unesi HEX #RRGGBB. Prazno polje koristi stabilnu boju autora.");
    if (fields.includes("mapEffect")) metadatas.mapEffect = fieldMetadata(metadatas.mapEffect, "Efekat na mapi", "Opciono: none — bez efekta; pulse — kratki puls; ring — iscrtavanje prstena. Poštuje smanjeno kretanje.");
    edit = addEditFields(edit, "slug", fields);
  }
  return {
    settings: configuration.settings,
    metadatas,
    layouts: { ...configuration.layouts, edit, list },
    options: configuration.options,
  };
}

// Strapi v4's own Content Manager service persists list/edit configuration.
// Only these two collections change; the original layout backup stays intact.
async function applyAppearanceAdminLayouts(strapi) {
  const service = strapi.plugin("content-manager").service("content-types");
  const store = strapi.store({ type: "plugin", name: "content_manager" });
  const status = (await store.get({ key: STATUS_KEY })) || {};
  if (status.complete) return;
  const completed = new Set(status.completed || []);
  const backup = (await store.get({ key: BACKUP_KEY })) || { version: VERSION, configurations: {} };
  for (const uid of ["api::article.article", "api::author.author"]) {
    if (completed.has(uid)) continue;
    const model = strapi.contentTypes[uid];
    if (!model) throw new Error(`Content type ${uid} is unavailable`);
    const configuration = await service.findConfiguration(model);
    if (!backup.configurations[uid]) {
      backup.configurations[uid] = configuration;
      await store.set({ key: BACKUP_KEY, value: backup });
    }
    await service.updateConfiguration(model, configureAppearanceLayout(uid, configuration, model));
    completed.add(uid);
    await store.set({ key: STATUS_KEY, value: { version: VERSION, completed: [...completed], complete: completed.size === 2 } });
    strapi.log.info(`[${VERSION}] Configured ${uid}.`);
  }
}

module.exports = { applyAppearanceAdminLayouts, configureAppearanceLayout, BACKUP_KEY, STATUS_KEY };
