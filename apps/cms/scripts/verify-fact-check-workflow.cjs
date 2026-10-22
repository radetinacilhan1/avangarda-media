"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const intake = require("../src/editorial-intake");
const workflow = require("../src/fact-check-workflow");
const { installEditorialAdminRoutes } = require("../src/editorial-admin-routes");
const facts = require("../src/api/fact-check/controllers/fact-check");
const submissions = require("../src/api/fact-check-submission/controllers/fact-check-submission");
const contribute = require("../src/api/contribute-page/controllers/contribute-page");
const { extendBodyFactory } = require("../src/editorial-body-limit");
const schema = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, `../src/api/${name}/content-types/${name}/schema.json`), "utf8"));
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
function throws(callback, expression, message) { assert.throws(callback, expression, message); checks++; }
function ctx(body = {}, query = {}) { return { ip: `test-${checks}`, request: { body: { data: body } }, query, params: { id: 1 }, state: {}, set() {}, forbidden() { this.status = 403; }, notFound() { this.status = 404; }, badRequest() { this.status = 400; } }; }
const claim = { title: "TEST ONLY: saved verification", slug: "test-only-verification", claim: "A specific test claim with an inspectable source", rating: "unverifiable", summary: "The evidence does not permit a conclusion.", context: "This fixture is not a published editorial check.", responsiblePerson: "Test reviewer", checkedAt: "2026-10-22", sources: [{ id: 1, name: "Test source", url: "https://example.test/evidence", accessedAt: "2026-10-22" }], corrections: [] };
function approved(extra = {}) { const record = { id: 1, ...claim, ...extra, reviewStatus: "approved", approvedBy: "7: Actual editor", approvedAt: "2026-10-22T12:00:00Z" }; record.reviewFingerprint = workflow.fingerprint(record); return record; }
const png = { name: "private.png", mimeType: "image/png", base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXz8AAAAASUVORK5CYII=" };

async function run() {
  check(schema("fact-check").options.draftAndPublish === true, "Fact checks start as drafts");
  check(JSON.stringify(schema("fact-check").attributes.rating.enum) === JSON.stringify(workflow.RATINGS), "Ratings are one stable enum");
  for (const lang of intake.LANGUAGES) for (const key of ["title", "claim", "summary", "context"]) check(Boolean(schema("fact-check").attributes[lang === "sr" ? key : `${key}_${lang}`]), "All eight content translations exist");
  for (const key of workflow.REVIEW_FIELDS) check(schema("fact-check").attributes[key].private && schema("fact-check").attributes[key].pluginOptions["content-manager"].visible === false, "Review fields cannot be edited as ordinary form values");
  for (const key of ["contact", "internalNotes", "screenshot"]) check(schema("fact-check-submission").attributes[key].private, "Sensitive submission fields private");
  check(!schema("fact-check-submission").options.draftAndPublish, "Private intake is not public publishing");
  const publicRoutes = require("../src/api/fact-check/routes/fact-check").routes;
  check(publicRoutes.every((route) => route.method === "GET"), "No public check write or approval routes");
  check(require("../src/api/fact-check-submission/routes/fact-check-submission").routes.length === 1, "No public private-queue listing route");
  check(intake.screenshot(png).mimeType === "image/png", "Real PNG magic accepted");
  throws(() => intake.screenshot({ ...png, mimeType: "image/jpeg" }), /INVALID_SCREENSHOT/, "MIME spoof rejected");
  throws(() => intake.screenshot({ ...png, base64: Buffer.from("<svg onload=alert(1)>").toString("base64") }), /INVALID_SCREENSHOT/, "SVG/script rejected");
  throws(() => intake.screenshot({ ...png, base64: Buffer.alloc(intake.MAX_SCREENSHOT_BYTES + 1).toString("base64") }), /INVALID_SCREENSHOT/, "Actual file limit");
  throws(() => intake.factSubmission({ claim: "Long enough test claim", sourceUrl: "javascript:alert(1)" }), /INVALID_SUBMISSION/, "Unsafe links rejected");
  throws(() => intake.factSubmission({ claim: "Long enough test claim", website: "spam" }), /INVALID_SUBMISSION/, "Honeypot has no fake receipt");
  const cleanSubmission = intake.factSubmission({ claim: "Long enough test claim", reviewStatus: "approved", status: "processed", contact: "private-contact", screenshot: png, lang: "ar" });
  check(cleanSubmission.status === "new" && cleanSubmission.reviewStatus === undefined && cleanSubmission.lang === "ar", "Public payload cannot control editorial state");
  const draft = { ...claim }; workflow.guard(draft, null); check(draft.reviewStatus === "pending" && draft.publishedAt === null, "Create always draft");
  throws(() => workflow.guard({ ...claim, reviewStatus: "approved", approvedBy: "spoof" }, null), /serverska akcija/, "Spoofed approval blocked");
  throws(() => workflow.guard({ publishedAt: new Date().toISOString() }, claim), /potvrdu/, "Unapproved publication blocked");
  const record = approved({ publishedAt: "2026-10-22T12:01:00Z", internalNotes: "PRIVATE", contact: "PRIVATE", screenshot: png });
  check(workflow.isApproved(record), "Approved fingerprint valid");
  const changed = { claim: "Changed claim after approval" }; workflow.guard(changed, record);
  check(changed.reviewStatus === "pending" && changed.publishedAt === null && changed.approvedBy === null, "Editing claim revokes approval and publication");
  for (const data of [{ rating: "false" }, { sources: [{ name: "Different evidence", url: "https://example.test/new", accessedAt: "2026-10-22" }] }, { claim_ar: "تغير الادعاء" }, { corrections: [{ date: "2026-10-22", note: "Public correction" }] }]) { workflow.guard(data, record); check(data.reviewStatus === "pending" && data.publishedAt === null, "Evidence/rating/translation/correction edits require review"); }
  throws(() => workflow.beforeUpdateMany({ params: { data: { publishedAt: new Date() } } }), /pojedinačno/, "Bulk publish cannot bypass per-check review");
  const safe = workflow.publicRecord(record);
  check(!JSON.stringify(safe).includes("PRIVATE") && !JSON.stringify(safe).includes("approvedBy") && !JSON.stringify(safe).includes("base64"), "Public whitelist excludes contacts, notes, originals and private review identity");
  check(workflow.publicRecord({ ...record, rating: "false" }) === null && workflow.publicRecord({ ...record, publishedAt: null }) === null, "Stale review and drafts cannot appear publicly");

  let canPublish = true, canRead = true, saved = [], storageFails = false;
  const db = { metadata: { get: () => ({ tableName: "fact_checks" }) }, transaction: async (callback) => callback({ trx: () => ({ where: () => ({ forUpdate: () => ({ first: async () => ({ id: 1 }) }) }) }) }), query: () => ({ count: async () => { if (storageFails) throw new Error("offline"); return 0; } }) };
  const config = { id: 1, submissionEnabled: true, submissionRecipientEmail: "private@example.test", submissionFormTitle: "Title" };
  global.strapi = { db, log: { warn() {} }, contentTypes: { "api::contribution-submission.contribution-submission": {}, "api::contribute-page.contribute-page": { attributes: { submissionEnabled: {}, submissionRecipientEmail: { private: true }, submissionFormTitle: {} } } }, entityService: {
    findOne: async (uid) => uid === workflow.UID ? record : { id: 1, screenshot: png, contact: "private" },
    findMany: async (uid) => uid === workflow.UID ? [record, { ...record, id: 2, publishedAt: null }] : config,
    create: async (uid, params) => { if (storageFails) throw new Error("DB failure"); saved.push({ uid, ...params }); return { id: saved.length }; },
    update: async (uid, id, params) => { saved.push({ uid, id, ...params }); return { id }; },
  }, plugin: (name) => name === "email" ? { service: () => ({ send: async () => { throw new Error("test transport failure"); } }) } : { service: () => ({ create: () => ({ cannot: { read: () => !canRead, publish: () => !canPublish } }) }) } };
  const publicCtx = ctx({}, { publicationState: "preview", populate: "*", fields: ["internalNotes"] }); await facts.find(publicCtx);
  check(publicCtx.body.data.length === 1 && !JSON.stringify(publicCtx.body).includes("PRIVATE"), "Controller ignores forged preview/projection and excludes drafts");
  const plugin = { controllers: {}, routes: { admin: { routes: [] } } }; installEditorialAdminRoutes(plugin);
  const admin = plugin.controllers["fact-check-review"];
  const anonymous = ctx(); await admin.approve(anonymous); check(anonymous.status === 403, "Anonymous approval denied");
  const editor = ctx(); editor.state = { user: { id: 42, firstname: "Real", lastname: "Editor" }, userAbility: {} }; editor.request.body = { confirmed: true, fingerprint: workflow.fingerprint(record), approvedBy: "Spoof" };
  canPublish = false; await admin.approve(editor); check(editor.status === 403 && saved.length === 0, "Read-only admin cannot approve"); canPublish = true;
  await admin.approve(editor); check(editor.body.data.approved && saved.at(-1).data.approvedBy === "42: Real Editor", "Approval uses verified admin identity, not payload");
  const staleEditor = ctx(); staleEditor.state = editor.state; staleEditor.request.body = { confirmed: true, fingerprint: "stale" }; await admin.approve(staleEditor); check(staleEditor.status === 409, "Stale saved version cannot be approved");
  const publicAttachment = ctx(); await admin.attachment(publicAttachment); check(publicAttachment.status === 403, "Original attachment cannot be downloaded anonymously");
  const privateAttachment = ctx({}, { download: "1" }); privateAttachment.state = editor.state; await admin.attachment(privateAttachment); check(Buffer.isBuffer(privateAttachment.body), "Authorized editor can download actual original bytes");
  canRead = false; const deniedAttachment = ctx(); deniedAttachment.state = editor.state; await admin.attachment(deniedAttachment); check(deniedAttachment.status === 403, "Restricted admin cannot download"); canRead = true;
  const valid = { claim: "TEST ONLY sufficiently long claim", contact: "private@example.test", screenshot: png };
  const received = ctx(valid); await submissions.submit(received); check(received.status === 201 && received.body.data.received && !JSON.stringify(received.body).includes("private"), "Receipt follows real storage without echoing private data");
  storageFails = true; const failed = ctx({ ...valid, claim: "TEST ONLY storage failure claim" }); await submissions.submit(failed); check(failed.status === 503 && !failed.body.data, "DB failure never returns receipt"); storageFails = false;
  const repeated = { claim: "TEST ONLY direct endpoint spam test" }; let last; for (let i = 0; i < 4; i++) { last = ctx(repeated); await submissions.submit(last); } check(last.status === 429, "Direct CMS endpoint throttles repeated submissions");
  let forwardedBlocked = false;
  for (let i = 0; i < 31; i++) {
    const probe = { ip: `spoof-${i}`, req: { socket: { remoteAddress: "127.0.0.77" } }, request: { header: { "x-forwarded-for": `203.0.113.${i}` } }, set() {} };
    try { intake.limitIntake(probe, "forwarded-regression", { claim: `distinct claim ${i}`, contact: `distinct-${i}` }); } catch (error) { forwardedBlocked = error.status === 429; }
  }
  check(forwardedBlocked, "Changing X-Forwarded-For/ctx.ip cannot evade the actual transport-peer quota");
  const pitch = { fullName: "Test User", email: "private@example.test", storyTitle: "TEST ONLY: pitch", storySummary: "A complete controlled summary that is not a real submission.", acknowledged: true, collaborationType: "research", lang: "en" };
  config.submissionEnabled = false; const closed = ctx(pitch); await contribute.publicSubmit(closed); check(closed.status === 403 && closed.body.error === "SUBMISSIONS_CLOSED", "Closed collaboration refuses requests");
  config.submissionEnabled = true; storageFails = true; const unavailable = ctx({ ...pitch, storyTitle: "TEST ONLY: storage failure" }); await contribute.publicSubmit(unavailable); check(unavailable.status === 503 && !unavailable.body.data, "Failed storage cannot produce contribution success");
  const unavailableConfig = ctx(); await contribute.publicFind(unavailableConfig); check(!unavailableConfig.body.data.submissionFormReady, "Readiness is false when actual DB storage fails"); storageFails = false;
  const oldFlag = process.env.CONTRIBUTE_SUBMISSION_READY; process.env.CONTRIBUTE_SUBMISSION_READY = "true";
  const success = ctx(pitch); await contribute.publicSubmit(success); check(success.status === 201 && success.body.data.received, "Optional email failure retains durable DB receipt");
  if (oldFlag === undefined) delete process.env.CONTRIBUTE_SUBMISSION_READY; else process.env.CONTRIBUTE_SUBMISSION_READY = oldFlag;
  const publicConfig = ctx(); await contribute.publicFind(publicConfig); check(publicConfig.body.data.submissionFormReady && !JSON.stringify(publicConfig.body).includes("private@example"), "Working private storage enables form without exposing recipient");
  const Koa = require("koa"), { Readable } = require("node:stream");
  const { body: nativeBody } = require(path.join(path.dirname(require.resolve("@strapi/strapi")), "middlewares/body.js"));
  const serverApp = new Koa();
  serverApp.silent = true;
  serverApp.use(async (ctx, next) => { try { await next(); } catch (error) { ctx.status = error.status || 500; ctx.body = { error: "rejected" }; } });
  serverApp.use(extendBodyFactory(nativeBody)({ jsonLimit: "25mb", formLimit: "25mb", textLimit: "25mb" }, { strapi: { plugin: () => null } }));
  serverApp.use((ctx) => { ctx.body = { parsed: typeof ctx.request.body?.value === "string" }; });
  const server = serverApp.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const content = JSON.stringify({ value: "a".repeat(intake.MAX_INTAKE_JSON_BYTES + 1024) });
    const streamed = await fetch(`${origin}/api/fact-check-submissions/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: Readable.from([content]), duplex: "half" });
    check(streamed.status === 413, "Chunked intake body exceeding 3 MiB rejected by real parser"); await streamed.arrayBuffer();
    for (const variant of ["/api/fact-check-submissions/submit/", "/api/contribute-page/submit/", "/API/FACT-CHECK-SUBMISSIONS/SUBMIT"]) {
      const oversized = await fetch(origin + variant, { method: "POST", headers: { "Content-Type": "application/json" }, body: Readable.from([content]), duplex: "half" });
      check(oversized.status === 413, "Router canonical variants cannot bypass intake parser limit"); await oversized.arrayBuffer();
    }
    const ordinary = await fetch(`${origin}/api/article-editor-test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: content });
    check(ordinary.status === 200 && (await ordinary.json()).parsed, "Ordinary editor endpoint retains its existing 25 MB limit");
  } finally { await new Promise((resolve) => server.close(resolve)); }
  console.log(JSON.stringify({ ok: true, checks, realEmailsSent: 0, productionWrites: 0 }));
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
