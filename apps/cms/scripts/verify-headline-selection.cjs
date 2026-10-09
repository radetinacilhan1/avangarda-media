"use strict";

// Run only against a fresh, disposable local SQLite app copied from this CMS.
// No production credentials or production URL are accepted by this runner.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const http = require("node:http");
const assert = require("node:assert/strict");
const appDir = path.resolve(process.env.HEADLINE_QA_APP_DIR || "");
if (!path.basename(appDir).startsWith("avangarda_headline_qa_") || !fs.existsSync(path.join(appDir, "isolated-headline-qa.marker"))) throw new Error("A marked isolated headline QA app is required.");
process.chdir(appDir);
process.env.NODE_ENV = "production";
process.env.STRAPI_TELEMETRY_DISABLED = "true";
process.env.STRAPI_DISABLE_UPDATE_NOTIFICATION = "true";
process.env.HOST = "127.0.0.1";
process.env.PORT = process.env.HEADLINE_QA_PORT || "1350";
assert.match(process.env.PORT, /^135[0-9]$/, "Use a dedicated local QA port");
for (const name of ["ADMIN_JWT_SECRET", "JWT_SECRET", "API_TOKEN_SALT", "TRANSFER_TOKEN_SALT"]) process.env[name] = crypto.randomBytes(32).toString("hex");
process.env.APP_KEYS = Array.from({ length: 4 }, () => crypto.randomBytes(24).toString("hex")).join(",");
for (const name of ["CLOUDINARY_NAME", "CLOUDINARY_KEY", "CLOUDINARY_SECRET", "CMS_REVALIDATE_URL", "FRONTEND_REVALIDATE_URL", "CMS_REVALIDATE_SECRET", "PUBLIC_URL"]) delete process.env[name];

async function main() {
  const app = await require("@strapi/strapi").default({ dir: appDir }).load();
  assert.equal(app.db.config.connection.client, "sqlite", "Only disposable SQLite is allowed");
  const selection = require(path.join(appDir, "src/headline-selection"));
  const uid = selection.ARTICLE_UID, configUid = selection.CONFIG_UID;
  const manager = app.plugin("content-manager").service("entity-manager");
  const fixture = JSON.parse(fs.readFileSync(process.env.HEADLINE_QA_FIXTURE, "utf8")).data;
  assert.deepEqual(selection.legacySelection(fixture), [34, 28, 25, 19, 31], "Captured production seed order");
  const checks = ["exact legacy production fixture seed 34,28,25,19,31"];
  const cover = await app.entityService.create("plugin::upload.file", { data: { name: "qa-cover.jpg", hash: "headline-qa-cover", ext: ".jpg", mime: "image/jpeg", size: 1, url: "https://avangarda.media/favicon.ico", provider: "local", folderPath: "/" } });
  const entries = [];
  for (const title of ["A", "B", "C", "D", "E", "F", "G"]) entries.push(await app.entityService.create(uid, { data: { title: `Headline QA ${title}`, slug: `headline-qa-${title.toLowerCase()}`, content: `Unchanged QA content ${title}.`, cover: cover.id, section: "front", style: "reportaža", viewCount: 37, editorialControl: { isFeatured: true, priority: 17 }, publishedAt: title === "F" || title === "G" ? null : new Date().toISOString() } }));
  const [A, B, C, D, E, F, G] = entries;
  const ids = [A, B, C, D, E].map((article) => article.id);
  const metadata = app.db.metadata.get(configUid), table = metadata.tableName, column = metadata.attributes.headlineState.columnName;
  const config = await app.db.query(configUid).findOne();
  const reset = async () => {
    await app.db.connection(table).where({ id: config.id }).update({ [column]: JSON.stringify({ initialized: true, revision: 0, articleIds: ids, operations: [] }) });
    for (const article of [F, G]) await app.db.query(uid).update({ where: { id: article.id }, data: { publishedAt: null, homepagePlacement: null } });
  };
  const state = async () => selection.normalizeState((await app.db.query(configUid).findOne()).headlineState);
  const propose = async (article, position, baseRevision = 0, operationId = crypto.randomUUID().replaceAll("-", "_")) => {
    await app.entityService.update(uid, article.id, { data: { homepagePlacement: { position, baseRevision, operationId } } });
    return operationId;
  };
  const publish = async (article) => manager.publish(await manager.findOne(article.id, uid), uid);
  const unchanged = await app.entityService.findMany(uid, { filters: { id: { $in: ids } }, populate: { editorialControl: true, cover: true } });
  for (const [position, expected] of [[1, [F.id, A.id, B.id, C.id, D.id]], [3, [A.id, B.id, F.id, C.id, D.id]], [5, [A.id, B.id, C.id, D.id, F.id]]]) {
    await reset();
    await propose(F, position);
    assert.deepEqual((await state()).articleIds, ids, "Save draft leaves public order unchanged");
    assert.equal((await app.entityService.findOne(uid, F.id)).publishedAt, null);
    await publish(F);
    assert.deepEqual((await state()).articleIds, expected);
    assert.ok((await app.entityService.findOne(uid, F.id)).publishedAt);
    checks.push(`native draft save + Publish insertion at ${position}`);
  }
  await reset();
  const moveOperation = await propose(D, 2);
  await selection.applySavedPlacement(app, D.id, moveOperation);
  assert.deepEqual((await state()).articleIds, [A.id, D.id, B.id, C.id, E.id]);
  const once = await state();
  await selection.applySavedPlacement(app, D.id, moveOperation);
  assert.deepEqual(await state(), once, "Repeated operation is idempotent");
  checks.push("move selected D to 2; repeat is idempotent");
  const removeOperation = await propose(D, 0, once.revision);
  await selection.applySavedPlacement(app, D.id, removeOperation);
  assert.deepEqual((await state()).articleIds, [A.id, B.id, C.id, E.id]);
  assert.ok((await app.entityService.findOne(uid, D.id)).publishedAt);
  checks.push("remove compacts; removed story stays published");
  await reset();
  await manager.unpublish(await manager.findOne(C.id, uid), uid);
  assert.deepEqual((await state()).articleIds, [A.id, B.id, D.id, E.id]);
  assert.equal((await app.entityService.findOne(uid, C.id)).publishedAt, null);
  await app.db.query(uid).update({ where: { id: C.id }, data: { publishedAt: C.publishedAt } });
  checks.push("native Unpublish removes and compacts");
  await reset();
  await propose(F, 1);
  await app.db.connection.raw(`CREATE TRIGGER qa_reject_headline BEFORE UPDATE OF ${column} ON ${table} BEGIN SELECT RAISE(ABORT, 'isolated failed selection write'); END`);
  try {
    await assert.rejects(publish(F), /isolated failed selection write/);
    assert.equal((await app.entityService.findOne(uid, F.id)).publishedAt, null, "Failed canonical write rolls back actual publication");
    assert.deepEqual((await state()).articleIds, ids);
  } finally { await app.db.connection.raw("DROP TRIGGER qa_reject_headline"); }
  checks.push("database failed write rolls back publishedAt + canonical order");
  await reset();
  await propose(F, 1); await propose(G, 3);
  const concurrent = await Promise.allSettled([publish(F), publish(G)]);
  assert.equal(concurrent.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(concurrent.filter((result) => result.status === "rejected" && result.reason.status === 409).length, 1);
  assert.equal((await state()).revision, 1);
  const competitors = await Promise.all([F, G].map((article) => app.entityService.findOne(uid, article.id)));
  assert.equal(competitors.filter((article) => article.publishedAt).length, 1);
  checks.push("concurrent editors: one commit, one 409, losing publication remains draft");
  await reset();
  await manager.unpublishMany(await Promise.all([B, D].map((article) => manager.findOne(article.id, uid))), uid);
  assert.deepEqual((await state()).articleIds, [A.id, C.id, E.id]);
  for (const article of [B, D]) await app.db.query(uid).update({ where: { id: article.id }, data: { publishedAt: new Date().toISOString() } });
  checks.push("native bulk Unpublish also compacts atomically");
  await reset();
  await propose(F, 1);
  const hookReads = [];
  const hookServer = http.createServer(async (request, response) => {
    request.resume();
    request.on("end", async () => {
      try {
        hookReads.push({ published: Boolean((await app.entityService.findOne(uid, F.id)).publishedAt), ids: (await state()).articleIds });
        response.writeHead(200, { "content-type": "application/json" }); response.end("{}");
      } catch (error) { response.writeHead(500); response.end(error.message); }
    });
  });
  await new Promise((resolve) => hookServer.listen(1351, "127.0.0.1", resolve));
  process.env.FRONTEND_REVALIDATE_URL = "http://127.0.0.1:1351/revalidate";
  process.env.CMS_REVALIDATE_SECRET = "isolated-test-webhook";
  try {
    await publish(F);
    for (let attempt = 0; hookReads.length < 2 && attempt < 100; attempt += 1) await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(hookReads.length, 2, "Article and homepage selection each invalidate after commit");
    for (const read of hookReads) { assert.equal(read.published, true); assert.deepEqual(read.ids, [F.id, A.id, B.id, C.id, D.id]); }
    await reset(); await propose(F, 2);
    // Ignore the legitimate Save webhook before deliberately failing Publish.
    await new Promise((resolve) => setTimeout(resolve, 30)); hookReads.length = 0;
    await app.db.connection.raw(`CREATE TRIGGER qa_reject_hook BEFORE UPDATE OF ${column} ON ${table} BEGIN SELECT RAISE(ABORT, 'isolated webhook rollback'); END`);
    try { await assert.rejects(publish(F), /isolated webhook rollback/); }
    finally { await app.db.connection.raw("DROP TRIGGER qa_reject_hook"); }
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(hookReads.length, 0, "A rolled-back publication sends no cache webhook");
    assert.equal((await app.entityService.findOne(uid, F.id)).publishedAt, null);
    checks.push("cache hooks observe committed publication + order; failed transaction sends no hooks");
  } finally {
    delete process.env.FRONTEND_REVALIDATE_URL; delete process.env.CMS_REVALIDATE_SECRET;
    await new Promise((resolve) => hookServer.close(resolve));
  }
  const after = await app.entityService.findMany(uid, { filters: { id: { $in: ids } }, populate: { editorialControl: true, cover: true } });
  for (const article of after) {
    const previous = unchanged.find((entry) => entry.id === article.id);
    for (const field of ["title", "subtitle", "slug", "content", "style", "section", "viewCount"]) assert.equal(article[field], previous[field], `Other article ${article.id} ${field} preserved`);
    assert.deepEqual(article.editorialControl, previous.editorialControl, "Other editorial flags/priority preserved");
  }
  checks.push("no contents, view counts, editorial flags or priority overwritten on other articles");
  for (const style of ["esej", "komentar"]) {
    await manager.update(await manager.findOne(F.id, uid), { style }, uid);
    const reopened = await manager.findOne(F.id, uid);
    assert.equal(reopened.style, style); assert.equal(reopened.section, "front");
  }
  await assert.rejects(app.entityService.update(uid, F.id, { data: { style: "new-section" } }));
  checks.push("Esej/Komentar save and reopen, Section unchanged, invalid enum rejected");
  await reset();
  // Make two true drafts for the native browser Save/Publish workflow.
  const browserArticle = F.id;
  const role = await app.db.query("admin::role").findOne({ where: { code: "strapi-super-admin" } });
  const email = "headline-qa@example.test", password = `${crypto.randomBytes(24).toString("base64url")}!aA9`;
  await app.admin.services.user.create({ firstname: "QA", lastname: "Headlines", email, password, isActive: true, roles: [role.id] });
  await app.listen();
  const origin = `http://127.0.0.1:${process.env.PORT}`;
  const loginResponse = await fetch(`${origin}/admin/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
  assert.equal(loginResponse.status, 200);
  const token = (await loginResponse.json()).data.token;
  const headers = { Authorization: `Bearer ${token}`, "content-type": "application/json" };
  assert.equal((await fetch(`${origin}/content-manager/headline-selection/state`)).status, 401);
  const stateResponse = await fetch(`${origin}/content-manager/headline-selection/state`, { headers });
  assert.equal(stateResponse.status, 200);
  const detail = await fetch(`${origin}/content-manager/collection-types/${uid}/${browserArticle}`, { headers });
  assert.equal(detail.status, 200);
  const nativeArticle = await detail.json();
  assert.ok(Object.hasOwn(nativeArticle, "homepagePlacement"), "Custom field roundtrips through native admin sanitization");
  checks.push("admin route requires authentication; native custom JSON field roundtrip");
  const noPublishRole = await app.db.query("admin::role").create({ data: { name: "QA without publish", code: "qa-headline-no-publish", description: "Isolated permissions test" } });
  const restrictedEmail = "headline-restricted@example.test";
  await app.admin.services.user.create({ firstname: "QA", lastname: "Restricted", email: restrictedEmail, password, isActive: true, roles: [noPublishRole.id] });
  const restrictedLogin = await fetch(`${origin}/admin/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: restrictedEmail, password }) });
  const restrictedToken = (await restrictedLogin.json()).data.token;
  const forbidden = await fetch(`${origin}/content-manager/headline-selection/apply/${A.id}`, { method: "POST", headers: { Authorization: `Bearer ${restrictedToken}`, "content-type": "application/json" }, body: JSON.stringify({ operationId: "qa_without_permission" }) });
  assert.equal(forbidden.status, 403);
  checks.push("published reorder requires native article Publish permission (403 without it)");
  const apiOperation = crypto.randomUUID().replaceAll("-", "_");
  const apiSave = await fetch(`${origin}/content-manager/collection-types/${uid}/${F.id}`, { method: "PUT", headers, body: JSON.stringify({ homepagePlacement: { position: 1, baseRevision: 0, operationId: apiOperation } }) });
  assert.equal(apiSave.status, 200);
  assert.deepEqual((await state()).articleIds, ids);
  const apiPublish = await fetch(`${origin}/content-manager/collection-types/${uid}/${F.id}/actions/publish`, { method: "POST", headers });
  assert.equal(apiPublish.status, 200);
  assert.deepEqual((await state()).articleIds, [F.id, A.id, B.id, C.id, D.id]);
  const publishedOrder = (await state()).articleIds;
  await propose(A, 5, 1);
  assert.deepEqual((await state()).articleIds, publishedOrder, "Save on an already published article also leaves canonical order unchanged");
  await app.entityService.update(uid, F.id, { data: { relatedArticles: [A.id] } });
  await propose(G, 2);
  const stalePublish = await fetch(`${origin}/content-manager/collection-types/${uid}/${G.id}/actions/publish`, { method: "POST", headers });
  assert.equal(stalePublish.status, 409);
  assert.equal((await app.entityService.findOne(uid, G.id)).publishedAt, null);
  const publicConfig = await fetch(`${origin}/api/homepage-config`);
  assert.equal(publicConfig.status, 200);
  const publicData = (await publicConfig.json()).data;
  assert.ok(!Object.hasOwn(publicData, "headlineState"));
  assert.deepEqual(publicData.headlineArticles.map((article) => article.id), [F.id, A.id, B.id, C.id, D.id]);
  assert.equal(publicData.headlineArticles[0].style, "komentar");
  const publicArticle = (await (await fetch(`${origin}/api/articles/${F.id}?populate[relatedArticles]=*`)).json()).data;
  assert.ok(!Object.hasOwn(publicArticle, "homepagePlacement"));
  assert.ok(publicArticle.relatedArticles.length > 0);
  assert.ok(publicArticle.relatedArticles.every((article) => !Object.hasOwn(article, "homepagePlacement")));
  checks.push("native HTTP Save leaves order unchanged; Publish applies; stale Publish returns409 + remains draft; public ordered projection hides private proposal/state");
  await reset();
  fs.writeFileSync(path.join(appDir, "credentials.private.json"), JSON.stringify({ origin, email, password, token, articleId: browserArticle, selectedIds: ids, secondaryDraftId: G.id }));
  fs.writeFileSync(path.join(appDir, "checks.json"), JSON.stringify({ ok: true, environment: "isolated fresh SQLite using installed Strapi 4.26.1", checks }, null, 2));
  console.log(JSON.stringify({ ok: true, checks, origin, articleId: browserArticle }));
  if (process.env.HEADLINE_QA_SERVE !== "true") await app.destroy();
}
main().catch((error) => { console.error(error); process.exit(1); });
