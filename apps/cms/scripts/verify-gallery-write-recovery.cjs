"use strict";
const assert = require("node:assert/strict");
const { captureWriteAttempt, nativeWriteConfirmed, relationChanges, savedIntentMatches, writeAction, writeFailureOutcome } = require("../src/admin/gallery-write-recovery");
const { galleryGeneralErrors } = require("../src/admin/gallery-workflow-utils");

let checks = 0;
const clone = (value) => JSON.parse(JSON.stringify(value));
const initial = {
  id: 5, title: "Raniji naslov", description: "Raniji tekst", updatedAt: "2026-10-29T12:00:00.000Z", publishedAt: null,
  authors: [{ id: 6, name: "Raniji autor", __temp_key__: "a" }], topics: [], tags: [], locations: [], relatedArticles: [],
  images: [{ id: 20, __temp_key__: "a", image: { id: 10, name: "foto-10.jpg" }, adminLabel: "01 · foto-10.jpg", caption: "Opis", caption_en: "Translation", internalName: "Interno", authorName: "Autor", sourceUrl: "https://example.test/a", copyrightNotice: "Prava" }],
  shareImage: { id: 10, name: "foto-10.jpg" }, seo: { id: 2, seoTitle: "Naslov", seoDescription: "SEO opis" },
};
const modified = clone(initial); modified.title = "Novi naslov"; modified.description = "Nesnimljeni tekst";
const attempt = captureWriteAttempt("submit-pending", initial, modified);
assert.equal(writeAction("submit-pending"), "save"); assert.equal(writeAction("publish-pending"), "publish"); assert.equal(writeAction("resolved"), null); checks++;
modified.images[0].caption = "Naknadna izmena";
assert.equal(attempt.intent.images[0].caption, "Opis", "The pending snapshot is independent of later editing");
assert.equal(initial.title, "Raniji naslov"); checks++;

assert.equal(nativeWriteConfirmed(attempt, initial), false);
assert.equal(nativeWriteConfirmed(attempt, { ...initial, updatedAt: "2026-10-29T12:01:00.000Z" }), true); checks++;
assert.equal(nativeWriteConfirmed(attempt, { ...initial, id: 6, updatedAt: "2026-10-29T12:01:00.000Z" }), false, "Navigating to another record cannot confirm the previous gallery"); checks++;
const creatingAttempt = captureWriteAttempt("submit-pending", {}, { title: "Nova galerija", slug: "nova-galerija", images: [] });
assert.equal(nativeWriteConfirmed(creatingAttempt, { id: 6, title: "Druga galerija", slug: "druga-galerija", images: [], updatedAt: "2026-10-29T12:01:00.000Z" }), false);
assert.equal(nativeWriteConfirmed(creatingAttempt, { id: 7, title: "Nova galerija", slug: "nova-galerija", images: [], updatedAt: "2026-10-29T12:01:00.000Z" }), true); checks++;
assert.equal(savedIntentMatches(attempt, initial), false, "An older GET cannot confirm a write while it is still pending"); checks++;

const saved = clone(attempt.intent); saved.updatedAt = "2026-10-29T12:01:00.000Z";
saved.images[0].id = 99; saved.images[0].__temp_key__ = "new"; saved.images[0].adminLabel = "01 · jiné";
saved.images[0].image = { id: 10, name: "server-metadata.jpg", url: "https://example.test/photo" };
saved.shareImage = { id: 10, name: "server-metadata.jpg" }; saved.seo.id = 77;
saved.authors = { count: 1 };
assert.equal(savedIntentMatches(attempt, saved), true, "Stable IDs and editorial values, not regenerated row IDs/media names/temp keys, establish a match"); checks++;
for (const field of ["caption", "caption_en", "internalName", "authorName", "sourceUrl", "copyrightNotice"]) {
  const changed = clone(saved); changed.images[0][field] += " changed";
  assert.equal(savedIntentMatches(attempt, changed), false, `${field} must match before claiming a save succeeded`);
}
checks++;
const changedSelection = clone(saved); changedSelection.images[0].image.id = 11;
assert.equal(savedIntentMatches(attempt, changedSelection), false); checks++;
const addedRow = clone(saved); addedRow.images.push(clone(addedRow.images[0]));
assert.equal(savedIntentMatches(attempt, addedRow), false, "Image count cannot be hidden by verification"); checks++;
const multiple = clone(attempt.intent); multiple.images.push({ ...clone(multiple.images[0]), image: { id: 11 }, caption: "Druga slika" });
const orderedAttempt = captureWriteAttempt("submit-pending", initial, multiple);
const reordered = clone(multiple); reordered.updatedAt = saved.updatedAt; reordered.images.reverse();
assert.equal(savedIntentMatches(orderedAttempt, reordered), false, "Image order must match"); checks++;

const relationIntent = clone(attempt.intent); relationIntent.authors = [{ id: 7 }, { id: 8 }];
const relationAttempt = captureWriteAttempt("submit-pending", initial, relationIntent);
assert.deepEqual(relationChanges(relationAttempt).map(({ field }) => field), ["authors"]);
const relationSaved = { ...saved, authors: { count: 3 } };
assert.equal(savedIntentMatches(relationAttempt, relationSaved), false, "Relation counts alone never confirm edited relations");
assert.equal(savedIntentMatches(relationAttempt, relationSaved, { authors: [{ id: 2 }, { id: 7 }, { id: 8 }] }), true, "Unloaded unchanged relation rows are preserved by native relation deltas");
assert.equal(savedIntentMatches(relationAttempt, relationSaved, { authors: [{ id: 6 }, { id: 7 }, { id: 8 }] }), false, "A disconnected ID must be absent");
assert.equal(savedIntentMatches(relationAttempt, relationSaved, { authors: [{ id: 8 }, { id: 7 }] }), false, "Edited relation order must match"); checks++;

const publishAttempt = captureWriteAttempt("publish-pending", initial, initial);
const publishing = { ...clone(initial), updatedAt: saved.updatedAt, publishedAt: "2026-10-29T12:01:00.000Z" };
assert.equal(savedIntentMatches(publishAttempt, { ...publishing, publishedAt: null }), false);
assert.equal(savedIntentMatches(publishAttempt, publishing), true);
assert.equal(nativeWriteConfirmed(publishAttempt, { ...publishing, publishedAt: null }), false); checks++;
const unpublishAttempt = captureWriteAttempt("unpublish-pending", publishing, publishing);
assert.equal(savedIntentMatches(unpublishAttempt, { ...publishing, updatedAt: "2026-10-29T12:02:00.000Z", publishedAt: null }), true); checks++;

for (const message of ["Request failed with status code 502", "Request failed with status code 503", "Internal Server Error", "Network Error", "WRITE_IN_PROGRESS 409"]) {
  assert.equal(writeFailureOutcome({ generalMessages: [message] }), "unconfirmed");
}
assert.equal(writeFailureOutcome({ generalMessages: ["Request failed with status code 429"] }), "rejected");
assert.equal(writeFailureOutcome({ hasFieldErrors: true }), "rejected"); checks++;
const characters = { ..."Request failed with status code 503" };
assert.deepEqual(galleryGeneralErrors(characters), ["Request failed with status code 503"], "Native string spread remains one message"); checks++;
assert.deepEqual(attempt.intent.images.map(({ image }) => image.id), [10], "Verification does not mutate selected IDs or editorial fields");
assert.equal(attempt.intent.images[0].caption, "Opis"); checks++;
console.log(JSON.stringify({ ok: true, checks, tested: ["bounded pending snapshot", "native save confirmation", "unconfirmed gateway/network outcome", "older read stays unconfirmed", "stable media IDs", "image order/credits/translations", "native relation deltas", "publish state", "single general error", "no form mutation"] }));
