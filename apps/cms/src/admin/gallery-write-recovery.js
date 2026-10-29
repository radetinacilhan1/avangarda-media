"use strict";

const RELATION_FIELDS = ["authors", "topics", "tags", "locations", "relatedArticles"];
const IGNORED_FIELDS = new Set(["id", "createdAt", "updatedAt", "publishedAt", "createdBy", "updatedBy", "adminLabel", "__temp_key__", "__component"]);
const { mediaId } = require("./gallery-workflow-utils");

function writeAction(status) {
  return ({ "submit-pending": "save", "publish-pending": "publish", "unpublish-pending": "unpublish" })[status] || null;
}

function savedVersion(data) {
  return [data?.id ?? "", data?.updatedAt ?? "", data?.publishedAt ?? ""].join("|");
}

function relationIds(value) {
  const rows = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : null;
  if (!rows) return null;
  const ids = rows.map(mediaId);
  return ids.every(Boolean) ? ids : null;
}

function relationChanges(attempt) {
  return RELATION_FIELDS.flatMap((field) => {
    const before = relationIds(attempt.baseline?.[field]);
    const after = relationIds(attempt.intent?.[field]);
    if (!before || !after || JSON.stringify(before) === JSON.stringify(after)) return [];
    return [{ field, before, after }];
  });
}

function canonicalValue(value, field) {
  if (field === "image" || field === "shareImage") return mediaId(value);
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.map((row) => canonicalValue(row));
  if (typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).filter((key) => !IGNORED_FIELDS.has(key) && !RELATION_FIELDS.includes(key))
    .sort().map((key) => [key, canonicalValue(value[key], key)]));
}

function intendedValueMatches(intent, saved, field) {
  if (field === "image" || field === "shareImage") return mediaId(intent) === mediaId(saved);
  if (intent === null || intent === undefined || intent === "") return saved === null || saved === undefined || saved === "";
  if (Array.isArray(intent)) return Array.isArray(saved) && intent.length === saved.length
    && intent.every((row, index) => intendedValueMatches(row, saved[index]));
  if (typeof intent !== "object") return intent === saved;
  if (!saved || typeof saved !== "object") return false;
  return Object.keys(intent).filter((key) => !IGNORED_FIELDS.has(key) && !RELATION_FIELDS.includes(key))
    .every((key) => intendedValueMatches(intent[key], saved[key], key));
}

function captureWriteAttempt(status, initialData, modifiedData) {
  const action = writeAction(status);
  if (!action) return null;
  // One bounded snapshot per actual native write. Never keep historical drafts
  // or write this editor's content to localStorage or a remote service.
  return {
    action,
    id: initialData?.id ?? modifiedData?.id ?? null,
    baselineVersion: savedVersion(initialData),
    baseline: JSON.parse(JSON.stringify(initialData || {})),
    intent: JSON.parse(JSON.stringify(modifiedData || {})),
  };
}

function nativeWriteConfirmed(attempt, initialData) {
  return Boolean(attempt && initialData?.id && (attempt.id === null || String(attempt.id) === String(initialData.id))
    && savedVersion(initialData) !== attempt.baselineVersion
    && (attempt.action !== "publish" || initialData.publishedAt)
    && (attempt.action !== "unpublish" || !initialData.publishedAt)
    && (attempt.id !== null || savedIntentMatches(attempt, initialData)));
}

function savedIntentMatches(attempt, saved, savedRelations = {}) {
  if (!attempt || !saved?.id || (attempt.id !== null && String(saved.id) !== String(attempt.id))) return false;
  if (savedVersion(saved) === attempt.baselineVersion) return false;
  if (attempt.action === "publish" && !saved.publishedAt) return false;
  if (attempt.action === "unpublish" && saved.publishedAt) return false;
  const intent = attempt.intent;
  for (const key of Object.keys(intent)) {
    if (IGNORED_FIELDS.has(key) || RELATION_FIELDS.includes(key)) continue;
    if (!intendedValueMatches(intent[key], saved[key], key)) return false;
  }
  // Native Strapi sends relation connect/disconnect/reorder deltas against the
  // loaded rows. Compare those deltas with all saved IDs, never relation names
  // or a count (and never assume the form loaded every relation page).
  for (const { field, before, after } of relationChanges(attempt)) {
    const actual = relationIds(savedRelations[field]);
    if (!actual) return false;
    if (before.some((id) => !after.includes(id) && actual.includes(id))) return false;
    let previous = -1;
    for (const id of after) {
      const position = actual.indexOf(id);
      if (position <= previous) return false;
      previous = position;
    }
  }
  return true;
}

function writeFailureOutcome({ hasFieldErrors = false, generalMessages = [] } = {}) {
  if (hasFieldErrors) return "rejected";
  const text = generalMessages.filter((message) => typeof message === "string").join(" ");
  if (/\b429\b|RateLimitError/i.test(text)) return "rejected";
  return "unconfirmed";
}

module.exports = { RELATION_FIELDS, canonicalValue, captureWriteAttempt, intendedValueMatches, nativeWriteConfirmed, relationChanges, relationIds, savedIntentMatches, savedVersion, writeAction, writeFailureOutcome };
