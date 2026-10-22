"use strict";
// Fresh, isolated SQLite CMS. This script never reads production credentials or sends email.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const cmsRoot = path.resolve(__dirname, "..");
const runtime = path.resolve(process.env.CMS_EDITORIAL_QA_DIR || path.join(cmsRoot, ".codex-temp", `editorial-integration-${Date.now()}`));
if (fs.existsSync(runtime)) throw new Error("Use a new, empty private QA runtime directory.");
fs.mkdirSync(runtime, { recursive: true });
for (const dir of ["src", "config"]) fs.cpSync(path.join(cmsRoot, dir), path.join(runtime, dir), { recursive: true });
fs.copyFileSync(path.join(cmsRoot, "package.json"), path.join(runtime, "package.json"));
fs.mkdirSync(path.join(runtime, "public", "uploads"), { recursive: true });
fs.symlinkSync(fs.realpathSync(path.join(cmsRoot, "node_modules")), path.join(runtime, "node_modules"), "junction");
fs.writeFileSync(path.join(runtime, "config/database.js"), 'const path=require("node:path");module.exports=()=>({connection:{client:"sqlite",connection:{filename:path.join(__dirname,"../qa-only.sqlite")},useNullAsDefault:true,pool:{min:0,max:1}}});\n');
fs.writeFileSync(path.join(runtime, "config/admin.js"), 'module.exports=({env})=>({serveAdminPanel:false,auth:{secret:env("ADMIN_JWT_SECRET")},apiToken:{salt:env("API_TOKEN_SALT")},transfer:{token:{salt:env("TRANSFER_TOKEN_SALT")}}});\n');
process.env.NODE_ENV = "production";
process.env.STRAPI_TELEMETRY_DISABLED = "true";
process.env.STRAPI_DISABLE_UPDATE_NOTIFICATION = "true";
process.env.HOST = "127.0.0.1";
process.env.PORT = "0";
for (const name of ["ADMIN_JWT_SECRET", "JWT_SECRET", "API_TOKEN_SALT", "TRANSFER_TOKEN_SALT"]) process.env[name] = crypto.randomBytes(32).toString("hex");
process.env.APP_KEYS = Array.from({ length: 4 }, () => crypto.randomBytes(24).toString("hex")).join(",");
for (const name of ["CLOUDINARY_NAME", "CLOUDINARY_KEY", "CLOUDINARY_SECRET", "FRONTEND_REVALIDATE_URL", "CMS_REVALIDATE_URL", "CMS_REVALIDATE_SECRET", "CONTRIBUTE_RECIPIENT_EMAIL", "CONTRIBUTE_SUBMISSION_READY", "PUBLIC_URL"]) delete process.env[name];
process.chdir(runtime);
const FACT = "api::fact-check.fact-check", SUBMISSION = "api::fact-check-submission.fact-check-submission", CONTRIBUTE = "api::contribution-submission.contribution-submission";
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
const png = { name: "TEST-ONLY-original.png", mimeType: "image/png", base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXz8AAAAASUVORK5CYII=" };

async function main() {
  const app = await require("@strapi/strapi").default({ dir: runtime }).load();
  try {
    const role = await app.db.query("admin::role").findOne({ where: { code: "strapi-super-admin" } });
    const email = "editorial-test@example.test", password = crypto.randomBytes(24).toString("base64url") + "!aA9";
    await app.admin.services.user.create({ firstname: "QA", lastname: "Editor", email, password, isActive: true, roles: [role.id] });
    await app.listen();
    const origin = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    async function request(url, method = "GET", body, token) {
      const response = await fetch(origin + url, { method, headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const data = await response.json().catch(() => null);
      return { status: response.status, data };
    }
    const login = await request("/admin/login", "POST", { email, password }); check(login.status === 200, "Local editor session established");
    const token = login.data.data.token;
    const draft = await app.entityService.create(FACT, { data: { title: "TEST ONLY saved verification", slug: "test-only-saved-verification", claim: "This is a controlled test claim.", rating: "unverifiable", summary: "Insufficient evidence is not a false rating.", context: "Local test only, never production editorial content.", responsiblePerson: "QA Editor", checkedAt: "2026-10-22", sources: [{ name: "Local evidence", url: "https://example.test/evidence", accessedAt: "2026-10-22" }], publishedAt: null } });
    const route = `/content-manager/collection-types/${FACT}/${draft.id}`;
    const publicBefore = await request("/api/fact-checks?publicationState=preview&populate=*"); check(publicBefore.status === 200 && publicBefore.data.data.length === 0, "Native public API excludes drafts despite forged query");
    const blocked = await request(route + "/actions/publish", "POST", {}, token); check(blocked.status >= 400 && blocked.status < 500, "Native Content Manager cannot publish unapproved draft");
    const anonymous = await request(`/content-manager/fact-check-review/${draft.id}/approve`, "POST", { confirmed: true, fingerprint: "spoof" }); check([401, 403].includes(anonymous.status), "Anonymous approval blocked by real admin policy");
    const state = await request(`/content-manager/fact-check-review/${draft.id}`, "GET", null, token); check(state.status === 200 && state.data.data.fingerprint, "Editor gets current saved fingerprint");
    const confirmed = await request(`/content-manager/fact-check-review/${draft.id}/approve`, "POST", { confirmed: true, fingerprint: state.data.data.fingerprint, approvedBy: "spoof" }, token); check(confirmed.status === 200 && confirmed.data.data.approved, "Real editor confirms saved content");
    const stored = await app.entityService.findOne(FACT, draft.id, { populate: ["sources", "corrections"] }); check(stored.approvedBy.endsWith("QA Editor") && !stored.approvedBy.includes("spoof"), "Saved reviewer identity comes from authenticated admin");
    const published = await request(route + "/actions/publish", "POST", {}, token); check(published.status === 200, "Native Publish succeeds only after review");
    const publicAfter = await request("/api/fact-checks?populate=*&fields=internalNotes"); check(publicAfter.status === 200 && publicAfter.data.data.length === 1 && !JSON.stringify(publicAfter.data).includes("approvedBy"), "Published approved check is public with safe whitelist");
    const changed = await request(route, "PUT", { sources: [{ ...stored.sources[0], name: "Changed controlled evidence" }] }, token); check(changed.status === 200, "Native Content Manager updates evidence component");
    const changedRecord = await app.entityService.findOne(FACT, draft.id, { populate: ["sources", "corrections"] }); check(changedRecord.reviewStatus === "pending" && changedRecord.publishedAt === null, "Component edit clears approval and unpublishes atomically");
    const hiddenAgain = await request("/api/fact-checks"); check(hiddenAgain.data.data.length === 0, "Changed evidence cannot remain publicly visible");
    const factSubmission = await request("/api/fact-check-submissions/submit", "POST", { data: { claim: "TEST ONLY privately stored report", contact: "private@example.test", screenshot: png, lang: "ar", reviewStatus: "approved" } }); check(factSubmission.status === 201 && factSubmission.data.data.received === true, "Anonymous intake acknowledges actual DB persistence");
    const queued = await app.entityService.findMany(SUBMISSION); check(queued.length === 1 && queued[0].contact === "private@example.test" && queued[0].screenshot.base64 === png.base64 && queued[0].status === "new", "Private database contains original and contact with safe new status");
    const publicQueue = await request("/api/fact-check-submissions?populate=*"); check([401, 403, 404, 405].includes(publicQueue.status) || (publicQueue.status === 204 && publicQueue.data === null), "No anonymous private-queue route or response body");
    const privateRoute = `/content-manager/fact-check-submissions/${queued[0].id}/attachment`;
    const publicOriginal = await request(privateRoute); check([401, 403].includes(publicOriginal.status), "Anonymous original download blocked");
    const allowedOriginal = await fetch(origin + privateRoute + "?download=1", { headers: { Authorization: `Bearer ${token}` } }); check(allowedOriginal.status === 200 && allowedOriginal.headers.get("cache-control").includes("no-store") && allowedOriginal.headers.get("content-disposition").startsWith("attachment"), "Real authorized download uses private attachment headers");
    check(Buffer.from(await allowedOriginal.arrayBuffer()).toString("base64") === png.base64, "Authorized download bytes match private original");
    const intakeReader = await app.admin.services.role.create({ name: "QA Intake Reader", code: "qa-intake-reader" });
    const intakeFields = Object.keys(app.contentTypes[SUBMISSION].attributes).filter((key) => !["createdBy", "updatedBy"].includes(key));
    await app.admin.services.role.assignPermissions(intakeReader.id, [{ action: "plugin::content-manager.explorer.read", subject: SUBMISSION, properties: { fields: intakeFields }, conditions: [] }]);
    const readerEmail = "intake-reader@example.test";
    await app.admin.services.user.create({ firstname: "QA", lastname: "Intake Reader", email: readerEmail, password, isActive: true, roles: [intakeReader.id] });
    const readerLogin = await request("/admin/login", "POST", { email: readerEmail, password }); check(readerLogin.status === 200, "Non-super-admin intake reader authenticates");
    const readerToken = readerLogin.data.data.token;
    const readerOriginal = await fetch(origin + privateRoute + "?download=1", { headers: { Authorization: `Bearer ${readerToken}` } }); check(readerOriginal.status === 200 && Buffer.from(await readerOriginal.arrayBuffer()).toString("base64") === png.base64, "Explicitly authorized ordinary editor downloads private original");
    const readerApproval = await request(`/content-manager/fact-check-review/${draft.id}/approve`, "POST", { confirmed: true, fingerprint: "spoof" }, readerToken); check(readerApproval.status === 403, "Intake-only editor cannot approve fact checks");
    await app.admin.services.role.assignPermissions(intakeReader.id, [{ action: "plugin::content-manager.explorer.read", subject: SUBMISSION, properties: { fields: intakeFields.filter((key) => key !== "screenshot") }, conditions: [] }]);
    const deniedReader = await request(privateRoute, "GET", null, readerToken); check(deniedReader.status === 403, "Ordinary editor without screenshot field permission cannot download original");
    const config = await app.entityService.findMany("api::contribute-page.contribute-page");
    await app.entityService.update("api::contribute-page.contribute-page", config.id, { data: { submissionEnabled: false } });
    const pitch = { data: { fullName: "QA User", email: "qa@example.test", storyTitle: "TEST ONLY private collaboration", storySummary: "A controlled test summary held only in this private local database.", acknowledged: true, collaborationType: "research", lang: "en" } };
    const closed = await request("/api/contribute-page/submit", "POST", pitch); check(closed.status === 403 && closed.data.error === "SUBMISSIONS_CLOSED", "Closed contribution endpoint refuses intake");
    await app.entityService.update("api::contribute-page.contribute-page", config.id, { data: { submissionEnabled: true } });
    const open = await request("/api/contribute-page"); check(open.status === 200 && open.data.data.submissionFormReady === true, "Working private database reports truthful form readiness without email");
    const received = await request("/api/contribute-page/submit", "POST", pitch); check(received.status === 201 && received.data.data.received === true && await app.db.query(CONTRIBUTE).count() === 1, "Opened collaboration persists actual private record without an email service");
    const summary = { ok: true, checks, runtime, database: "fresh isolated SQLite", realEmailsSent: 0, productionWrites: 0, tested: ["real admin authentication", "native Content Manager publish/save", "component evidence update invalidation", "private binary attachment download", "actual anonymous DB intake", "contribution close/open DB fallback"] };
    fs.writeFileSync(path.join(runtime, "integration-results.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary));
  } finally { await app.destroy(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
