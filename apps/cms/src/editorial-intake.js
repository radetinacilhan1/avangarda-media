"use strict";

const { createHash } = require("node:crypto");
const LANGUAGES = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
const MAX_INTAKE_JSON_BYTES = 3 * 1024 * 1024;
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;

function text(value, max, multiline = false) {
  if (typeof value !== "string") return "";
  const clean = value.replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "");
  return (multiline ? clean.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ") : clean.replace(/\s+/g, " ")).trim().slice(0, max);
}
function email(value) { const clean = text(value, 160); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : ""; }
function httpUrl(value) {
  const clean = text(value, 2000);
  if (!clean) return "";
  try { const url = new URL(clean); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
function fail(code, status = 400) { const error = new Error(code); error.status = status; error.code = code; return error; }
function hit(key, max, now = Date.now()) {
  for (const [entry, state] of attempts) if (state.until <= now) attempts.delete(entry);
  if (attempts.size > 10000 && !attempts.has(key)) return false;
  const state = attempts.get(key) || { count: 0, until: now + WINDOW_MS };
  state.count += 1; attempts.set(key, state);
  return state.count <= max;
}
function limitIntake(ctx, family, payload) {
  // Runs on the direct CMS endpoint as well as requests forwarded by the web app.
  // Use the actual transport peer: proxy:true makes ctx.ip / X-Forwarded-For
  // caller-controlled on a directly reachable CMS. A proxy shares this coarse
  // allowance; the web form additionally has its own per-visitor limiter.
  const fingerprint = createHash("sha256").update(JSON.stringify([payload?.claim || payload?.storyTitle, payload?.contact || payload?.email])).digest("hex");
  const peer = ctx.req?.socket?.remoteAddress || ctx.request?.req?.socket?.remoteAddress || "unknown";
  const network = createHash("sha256").update(peer).digest("hex");
  if (!hit(`${family}:peer:${network}`, 30) || !hit(`${family}:content:${fingerprint}`, 3) || !hit(`${family}:global`, 300)) {
    ctx.set?.("Retry-After", "600"); throw fail("RATE_LIMITED", 429);
  }
}
function screenshot(value) {
  if (value == null) return null;
  if (!value || typeof value !== "object" || typeof value.base64 !== "string" || value.base64.length > Math.ceil(MAX_SCREENSHOT_BYTES / 3) * 4
    || value.base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value.base64)) throw fail("INVALID_SCREENSHOT");
  const bytes = Buffer.from(value.base64, "base64");
  if (!bytes.length || bytes.length > MAX_SCREENSHOT_BYTES || bytes.toString("base64") !== value.base64) throw fail("INVALID_SCREENSHOT");
  let mime = "", extension = "";
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.toString("ascii", 12, 16) === "IHDR") { mime = "image/png"; extension = "png"; }
  if (bytes.length >= 12 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 && bytes[bytes.length - 2] === 255 && bytes[bytes.length - 1] === 217) { mime = "image/jpeg"; extension = "jpg"; }
  if (bytes.length >= 20 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" && bytes.readUInt32LE(4) + 8 === bytes.length && ["VP8 ", "VP8L", "VP8X"].includes(bytes.toString("ascii", 12, 16))) { mime = "image/webp"; extension = "webp"; }
  if (!mime || value.mimeType !== mime) throw fail("INVALID_SCREENSHOT");
  return { name: `screenshot.${extension}`, originalName: text(value.name, 120), mimeType: mime, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), base64: value.base64 };
}
function factSubmission(payload) {
  if (!payload || typeof payload !== "object" || text(payload.website, 120)) throw fail("INVALID_SUBMISSION");
  const claim = text(payload.claim, 8000, true), rawUrl = text(payload.sourceUrl, 2000), sourceUrl = httpUrl(rawUrl);
  if (claim.length < 12 || (rawUrl && !sourceUrl)) throw fail("INVALID_SUBMISSION");
  return { claim, sourceUrl, contact: text(payload.contact, 240), lang: LANGUAGES.includes(payload.lang) ? payload.lang : "sr", screenshot: screenshot(payload.screenshot), status: "new" };
}
function contribution(payload) {
  if (!payload || typeof payload !== "object" || text(payload.website, 120)) throw fail("INVALID_SUBMISSION");
  const data = { fullName: text(payload.fullName, 120), email: email(payload.email), storyTitle: text(payload.storyTitle, 180), storySummary: text(payload.storySummary, 4000, true), location: text(payload.location, 160), collaborationType: text(payload.collaborationType, 80), links: text(payload.links, 1200, true), lang: LANGUAGES.includes(payload.lang) ? payload.lang : "sr", acknowledged: payload.acknowledged === true, status: "new" };
  if (!data.fullName || !data.email || !data.storyTitle || data.storySummary.length < 24 || !data.acknowledged || !["", "story-pitch", "research", "fieldwork", "production"].includes(data.collaborationType)) throw fail("INVALID_SUBMISSION");
  return data;
}
function sendError(ctx, error) {
  ctx.status = error?.status || 503; ctx.body = { error: error?.code || "SUBMISSION_UNAVAILABLE" };
}

module.exports = { LANGUAGES, MAX_SCREENSHOT_BYTES, MAX_INTAKE_JSON_BYTES, text, email, httpUrl, fail, limitIntake, screenshot, factSubmission, contribution, sendError, hit };
