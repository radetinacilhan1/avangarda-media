"use strict";
const assert = require("node:assert/strict");
const { GALLERY_UID, IMAGE_COMPONENT_UID, mediaId, imageLabel, galleryMediaIds, galleryLayout, focusGalleryField, galleryErrorEntries, galleryGeneralErrors } = require("../src/admin/gallery-workflow-utils");
const schema = require("../src/components/shared/article-image-credit.json");

const originalFile = { id: 42, name: "stolice-izborna-noć.jpg", alternativeText: "Originalni alt", caption: "Originalni opis" };
const row = { image: originalFile, caption: "Opis galerije", authorName: "Autor", internalName: "" };
assert.equal(imageLabel(row, 0), "01 · stolice-izborna-noć.jpg");
assert.equal(imageLabel({ ...row, internalName: "  Izborna noć  " }, 1), "02 · Izborna noć");
assert.equal(imageLabel({ image: null }, 2), "Fotografija 03 — izaberi sliku");
assert.equal(imageLabel({ image: { data: { id: 42, attributes: originalFile } } }, 3), "04 · stolice-izborna-noć.jpg");
assert.equal(mediaId({ data: { id: 42 } }), "42");
assert.deepEqual([...galleryMediaIds([row, { image: { id: "42" } }, { image: { id: 43, name: originalFile.name } }, { image: null }])], ["42", "43"]);
assert.deepEqual(originalFile, { id: 42, name: "stolice-izborna-noć.jpg", alternativeText: "Originalni alt", caption: "Originalni opis" });

const component = { attributes: schema.attributes, settings: { mainField: "caption", customSetting: true }, layouts: { edit: [[{ name: "caption" }], [{ name: "adminLabel" }]], list: ["caption"] } };
const gallery = { contentType: { uid: GALLERY_UID }, components: { [IMAGE_COMPONENT_UID]: component } };
const before = JSON.stringify(gallery);
const transformed = galleryLayout({ layout: gallery, query: { plugins: true } });
assert.equal(transformed.layout.components[IMAGE_COMPONENT_UID].settings.mainField, "adminLabel");
assert.equal(transformed.layout.components[IMAGE_COMPONENT_UID].layouts.edit[0][0].name, "internalName");
assert.equal(transformed.layout.components[IMAGE_COMPONENT_UID].layouts.edit.flat().some(field => field.name === "adminLabel"), false);
assert.equal(JSON.stringify(gallery), before, "Gallery hook must not mutate the cached shared component layout");
const article = { layout: { ...gallery, contentType: { uid: "api::article.article" } }, query: {} };
assert.equal(galleryLayout(article).layout, article.layout, "Article component layout and main field remain unchanged");

// The native query focus reloads form data. This adapter must only invoke the
// existing semantic accordion button and input, retaining all current values.
const unsaved = { title: "Nesnimljen naslov", images: [{ caption: "Nesnimljen opis" }] };
const snapshot = JSON.stringify(unsaved);
let open = false;
let focused = false;
let scrolled = false;
let notified;
const input = { focus() { focused = true; }, scrollIntoView() { scrolled = true; } };
const toggle = {
  getAttribute(name) { return name === "aria-controls" ? "accordion-content-images.0" : String(open); },
  click() { open = true; },
};
const documentStub = {
  querySelectorAll(selector) { assert.equal(selector, "[data-strapi-accordion-toggle]"); return [toggle]; },
  getElementById(id) { assert.equal(id, "images.0.caption"); return open ? input : null; },
};
assert.equal(focusGalleryField("images.0.caption", documentStub, callback => callback(), value => { notified = value; }), true);
assert(open && focused && scrolled && notified);
assert.equal(JSON.stringify(unsaved), snapshot, "Error navigation must retain unsaved content");
assert.equal(focusGalleryField("images.2.caption", { querySelectorAll: () => [] }), false);
notified = true;
assert.equal(focusGalleryField("title", { getElementById: () => null }, callback => callback(), value => { notified = value; }), true);
assert.equal(notified, false, "Missing focus targets must report a readable fallback");
assert.deepEqual(galleryErrorEntries({ title: { id: "required" }, images: [{ caption: "Prva greška", year: { message: "Druga greška" } }] }).map(([path]) => path), ["title", "images.0.caption", "images.0.year"]);
const serverError = "Server nije uspeo da sačuva galeriju. Nesnimljeni unosi su ostali u otvorenoj formi.";
const nativeSpreadError = { ...serverError };
assert.deepEqual(galleryErrorEntries(serverError), []);
assert.deepEqual(galleryErrorEntries(nativeSpreadError), [], "Native string-spread errors are not field errors");
assert.deepEqual(galleryGeneralErrors(nativeSpreadError), [serverError], "Native server error is rendered once, not once per character");
assert.deepEqual(galleryGeneralErrors(serverError), [serverError]);
assert.deepEqual(galleryGeneralErrors({ message: serverError }), [{ message: serverError }]);
assert.deepEqual(galleryGeneralErrors({ title: { id: "required" } }, new Set(["title"])), []);
assert.equal(schema.attributes.internalName.maxLength, 255);
assert.equal(schema.attributes.internalName.private, true);
assert.equal(schema.attributes.adminLabel.private, true);
assert.equal(schema.attributes.adminLabel.type, "text");
for (const [name, attribute] of Object.entries(schema.attributes)) {
  if (["internalName", "image", "layout", "insertAfterParagraph", "creditType", "year", "showCredit", "downloadable", "watermark"].includes(name)) continue;
  assert.equal(attribute.type, "text", `${name} must preserve long freeform values without varchar(255) failures`);
}
console.log("Gallery admin checks passed: labels, stable media IDs, shared layout isolation, aggregate errors and unsaved focus.");
