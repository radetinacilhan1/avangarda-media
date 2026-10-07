"use strict";

const assert = require("node:assert/strict");
const article = require("../src/api/article/content-types/article/schema.json");
const author = require("../src/api/author/content-types/author/schema.json");
const { applyAppearanceAdminLayouts, configureAppearanceLayout, BACKUP_KEY, STATUS_KEY } = require("../src/admin-appearance-layouts");
const { initializeAuthorMapDefaults, getInitialAuthorColor, stablePaletteColor, INITIAL_AUTHORS } = require("../src/author-map-defaults");

async function main() {
  for (const language of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
    const attribute = article.attributes[language === "sr" ? "focus" : `focus_${language}`];
    assert.equal(attribute.type, "string");
    assert.notEqual(attribute.required, true);
  }
  assert.equal(author.attributes.mapColor.customField, "global::map-color");
  assert.notEqual(author.attributes.mapColor.required, true);
  const colorPattern = new RegExp(author.attributes.mapColor.regex);
  assert.ok(colorPattern.test("#7C3AED"));
  assert.ok(colorPattern.test("#111111"));
  for (const invalid of ["blue", "#000", "#11111111", "#12345Z", "red; color: blue"]) assert.ok(!colorPattern.test(invalid));
  assert.deepEqual(author.attributes.mapEffect.enum, ["none", "pulse", "ring"]);

  const config = {
    settings: { mainField: "title", pageSize: 25 },
    metadatas: { title: { edit: { label: "Custom title" } }, viewCount: { edit: { editable: true } } },
    layouts: { edit: [[{ name: "title", size: 12 }], [{ name: "focus", size: 12 }]], list: ["title", "publishedAt", "updatedAt", "editorialControl", "slug"] },
    options: { draftAndPublish: true },
  };
  const configured = configureAppearanceLayout("api::article.article", config, article);
  assert.deepEqual(configured.layouts.list, ["title", "publishedAt", "updatedAt", "editorialControl", "slug", "viewCount"]);
  assert.equal(configured.metadatas.viewCount.list.label, "Prikazi");
  assert.equal(configured.metadatas.viewCount.edit.editable, false);
  assert.equal(configured.metadatas.title.edit.label, "Custom title");
  assert.deepEqual(configured.settings, config.settings);
  const editNames = configured.layouts.edit.flat().map((field) => field.name);
  assert.equal(new Set(editNames).size, editNames.length);
  for (const language of ["en", "tr", "fr", "de", "es", "el", "ar"]) assert.ok(editNames.includes(`focus_${language}`));
  assert.deepEqual(configureAppearanceLayout("api::article.article", configured, article), configured);

  const storeData = new Map();
  const savedConfigurations = new Map([["api::article.article", structuredClone(config)], ["api::author.author", { ...structuredClone(config), layouts: { edit: [[{ name: "name", size: 6 }, { name: "slug", size: 6 }]], list: ["name", "updatedAt"] } }]]);
  const updates = [];
  const store = { get: async ({ key }) => storeData.get(key), set: async ({ key, value }) => storeData.set(key, structuredClone(value)) };
  const service = {
    findConfiguration: async (model) => savedConfigurations.get(model.uid),
    updateConfiguration: async (model, configuration) => { updates.push(model.uid); savedConfigurations.set(model.uid, structuredClone(configuration)); },
  };
  const strapi = {
    store: () => store,
    plugin: () => ({ service: () => service }),
    contentTypes: { "api::article.article": { ...article, uid: "api::article.article" }, "api::author.author": { ...author, uid: "api::author.author" } },
    log: { info() {}, warn() {} },
  };
  await applyAppearanceAdminLayouts(strapi);
  await applyAppearanceAdminLayouts(strapi);
  assert.deepEqual(updates, ["api::article.article", "api::author.author"]);
  assert.deepEqual(storeData.get(BACKUP_KEY).configurations["api::article.article"], config);
  assert.equal(storeData.get(STATUS_KEY).complete, true);

  const records = Object.entries(INITIAL_AUTHORS).map(([slug, entry]) => ({ id: entry.id, name: entry.name, slug, publicProfile: entry.profile ? { slug: entry.profile } : null, mapColor: null }));
  const colors = records.map(getInitialAuthorColor);
  assert.equal(new Set(colors).size, 10);
  assert.equal(getInitialAuthorColor({ ...records.find((record) => record.slug === "berina-skrijelj"), name: " Berina Škrijelj" }), "#7C3AED");
  assert.equal(getInitialAuthorColor({ ...records[0], id: 9999 }), null);
  assert.equal(getInitialAuthorColor({ ...records[0], publicProfile: { slug: "other-profile" } }), null);
  assert.equal(stablePaletteColor("future-author"), stablePaletteColor("future-author"));
  records[0].mapColor = "#123456";
  const writes = [];
  strapi.entityService = {
    findMany: async () => records,
    update: async (_uid, id, { data }) => { writes.push({ id, data }); Object.assign(records.find((record) => record.id === id), data); },
  };
  await initializeAuthorMapDefaults(strapi);
  await initializeAuthorMapDefaults(strapi);
  assert.equal(writes.length, 9);
  assert.equal(records[0].mapColor, "#123456");
  assert.ok(writes.every((write) => Object.keys(write.data).join() === "mapColor"));
  console.log("Passed: 8 optional focus languages, HEX validation, native list Prikazi, preserved layouts, idempotent admin migration, verified distinct author defaults, existing color preservation.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
