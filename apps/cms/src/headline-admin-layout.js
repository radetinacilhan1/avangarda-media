"use strict";

const VERSION = "avangarda-headline-layout-v1";
async function configureHeadlineAdminLayout(app) {
  const store = app.store({ type: "plugin", name: "content_manager" });
  if (await store.get({ key: `${VERSION}-complete` })) return;
  const model = app.contentTypes["api::article.article"];
  const service = app.plugin("content-manager").service("content-types");
  const previous = await service.findConfiguration(model);
  await store.set({ key: `${VERSION}-backup`, value: previous });
  const rows = previous.layouts.edit.map((row) => row.filter((field) => field.name !== "homepagePlacement")).filter((row) => row.length);
  const anchor = rows.findIndex((row) => row.some((field) => field.name === "editorialControl"));
  rows.splice(anchor < 0 ? 1 : anchor, 0, [{ name: "homepagePlacement", size: 12 }]);
  await service.updateConfiguration(model, {
    settings: previous.settings, options: previous.options,
    layouts: { ...previous.layouts, edit: rows },
    metadatas: {
      ...previous.metadatas,
      homepagePlacement: {
        ...previous.metadatas.homepagePlacement,
        edit: { ...previous.metadatas.homepagePlacement?.edit, label: "Pozicija na naslovnoj", description: "Predlog reda; Save ne menja javnu naslovnu. Primenjuje se pri Publish ili kroz Objavi raspored za objavljen članak.", visible: true, editable: true },
      },
      style: {
        ...previous.metadatas.style,
        edit: { ...previous.metadatas.style?.edit, label: "Stil teksta", description: "Vrsta teksta: analiza, intervju, kolumna, reportaža, Esej (esej) ili Komentar (komentar). Section zasebno određuje rubriku.", visible: true },
        list: { ...previous.metadatas.style?.list, label: "Stil teksta" },
      },
    },
  });
  await store.set({ key: `${VERSION}-complete`, value: true });
}

module.exports = { configureHeadlineAdminLayout };
