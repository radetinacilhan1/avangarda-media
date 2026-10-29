"use strict";
const assert = require("node:assert/strict");
const { errors, convertQueryParams } = require("@strapi/utils");
const { RateLimit } = require("koa2-ratelimit");
const { createCmsRequestDiagnostics, ensureRetryAfter } = require("../src/cms-request-diagnostics");
const { createGalleryWriteGuard } = require("../src/gallery-write-guard");
const { normalizeArticlePagination, findPublicArticles } = require("../src/public-article-pagination");
const { createPublicReadCoalescer } = require("../src/public-read-coalescing");

function context(method, path, user = 1) {
  const headers = {};
  return { method, path, status: 404, state: { user: user ? { id: user } : null }, params: { model: "api::gallery.gallery", id: "5" }, request: { header: {}, body: { email: "private-email@example.test", secret: "do-not-log" }, ip: "private-ip" }, response: { headers, get(name) { return headers[name.toLowerCase()] || ""; } }, set(name, value) { headers[name.toLowerCase()] = String(value); } };
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
(async () => {
  let checks = 0;
  const test = async (name, work) => { await work(); checks++; console.log(`PASS ${name}`); };
  await test("REST page window reaches installed Entity Service query parser", () => {
    global.strapi = { getModel: () => ({ attributes: { title: { type: "string" }, publishedAt: { type: "datetime" } } }) };
    const old = convertQueryParams.transformParamsToQuery("api::article.article", { pagination: { page: 2, pageSize: 12 } });
    assert.equal(old.limit, undefined);
    const { query } = normalizeArticlePagination({ pagination: { page: "2", pageSize: "12" }, fields: ["title"] });
    const actual = convertQueryParams.transformParamsToQuery("api::article.article", query);
    // findPage retains page/pageSize for the repository's pagination transform.
    assert.equal(actual.page, 2);
    assert.equal(actual.pageSize, 12);
    assert.deepEqual(actual.select, ["id", "title"]);
    delete global.strapi;
  });
  await test("pagination preserves requested240, filters, populate, and count metadata", async () => {
    const filters = { title: { $containsi: "test" } };
    let called;
    const result = await findPublicArticles({ findPage: async (uid, query) => { called = { uid, query }; return { results: [{ id: 3, body: "complete body", bodyEn: "translation" }], pagination: { page: 1, pageSize: 240, total: 333, pageCount: 2 } }; } }, { pagination: { pageSize: 240 }, filters, populate: ["authors"] });
    assert.equal(called.query.pageSize, 240);
    assert.equal(called.query.publicationState, "live");
    assert.equal(called.query.filters, filters);
    assert.deepEqual(called.query.populate, ["authors"]);
    assert.equal(result.meta.pagination.total, 333);
    assert.equal(result.data[0].bodyEn, "translation");
  });
  await test("withoutCount applies offset without expensive count", async () => {
    let called;
    const result = await findPublicArticles({ findMany: async (_uid, query) => { called = query; return [{ id: 25 }]; }, count() { throw Error("unexpected count"); } }, { pagination: { page: 3, pageSize: 12, withCount: "false" } });
    assert.equal(called.start, 24); assert.equal(called.limit, 12);
    assert.deepEqual(result.meta.pagination, { page: 3, pageSize: 12 });
  });
  await test("unpaginated and equivalent legacy limit aliases retain behavior", async () => {
    let called;
    const result = await findPublicArticles({ findMany: async (_uid, query) => { called = query; return [{ id: 1 }]; } }, { fields: ["id"] });
    assert.equal(called.limit, undefined); assert.deepEqual(result.meta, {});
    const legacy = normalizeArticlePagination({ limit: "5", pagination: { pageSize: "5" } });
    assert.equal(legacy.query.limit, 5);
    assert.throws(() => normalizeArticlePagination({ limit: 5, pagination: { pageSize: 12 } }), errors.ValidationError);
    assert.throws(() => normalizeArticlePagination({ pagination: { page: 0 } }), errors.ValidationError);
    assert.throws(() => normalizeArticlePagination({ pagination: { withCount: "invalid" } }), errors.ValidationError);
  });
  const log = [];
  const app = { log: Object.fromEntries(["info", "warn", "error"].map(level => [level, text => log.push({ level, text })])), db: { connection: { client: { pool: { numUsed: () => 1, numFree: () => 2, numPendingAcquires: () => 0 } } } } };
  const diagnostics = createCmsRequestDiagnostics(app);
  await test("native rate limiter throws429 with unchanged limit and restored Retry-After", async () => {
    const limiter = RateLimit.middleware({ interval: { min: 5 }, max: 5, prefixKey: `stability-${Date.now()}`, handler() { throw new errors.RateLimitError(); } });
    let ctx;
    for (let i = 0; i < 6; i++) {
      ctx = context("POST", "/admin/login");
      const call = diagnostics(ctx, () => limiter(ctx, async () => { ctx.status = 400; }));
      if (i < 5) await call; else await assert.rejects(call, errors.RateLimitError);
    }
    assert.equal(ctx.response.get("X-RateLimit-Limit"), "5");
    assert.equal(ctx.response.get("X-RateLimit-Remaining"), "0");
    assert(Number(ctx.response.get("Retry-After")) > 290);
    assert(Number(ctx.response.get("Retry-After")) <= 301);
    const entry = JSON.parse(log.at(-1).text.replace(/^\[cms-request\] /, ""));
    assert.equal(entry.status, 429); assert.equal(entry.endpoint, "/admin/login");
    assert(entry.requestId); assert(entry.resources.heapLimit > 0);
    assert.equal(entry.resources.pool.used, 1);
    assert(!JSON.stringify(log).includes("private-email")); assert(!JSON.stringify(log).includes("private-ip")); assert(!JSON.stringify(log).includes("do-not-log"));
  });
  await test("existing Retry-After preserved and no invented reset", () => {
    const ctx = context("GET", "/upload/files"); ctx.set("Retry-After", "Fri, 30 Oct 2026 10:00:00 GMT"); ctx.set("X-RateLimit-Reset", "1");
    ensureRetryAfter(ctx, 429); assert.equal(ctx.response.get("Retry-After"), "Fri, 30 Oct 2026 10:00:00 GMT");
    const absent = context("GET", "/upload/files"); ensureRetryAfter(absent, 429); assert.equal(absent.response.get("Retry-After"), "");
  });
  await test("gallery write emits start/completion correlation without serializing response", async () => {
    const ctx = context("PUT", "/content-manager/collection-types/api::gallery.gallery/5");
    Object.defineProperty(ctx.response, "length", { get() { throw Error("response serialization attempted"); } });
    const before = log.length;
    await diagnostics(ctx, async () => { ctx.status = 200; ctx.body = { caption: "private-unsaved-text" }; });
    const records = log.slice(before).map(item => JSON.parse(item.text.replace(/^\[cms-request\] /, "")));
    assert.deepEqual(records.map(item => item.phase), ["start", "complete"]);
    assert.equal(records[0].requestId, records[1].requestId);
    assert.equal(ctx.response.get("X-CMS-Request-ID"), records[0].requestId);
    assert(!JSON.stringify(records).includes("private-unsaved-text"));
  });
  await test("Save blocks simultaneous Publish on same gallery across users; clears after success", async () => {
    const gate = deferred(); let calls = 0;
    const guard = createGalleryWriteGuard();
    const update = guard(async ctx => { calls++; await gate.promise; ctx.status = 200; }, "update");
    const publish = guard(async ctx => { calls++; ctx.status = 200; }, "publish");
    const first = update(context("PUT", "gallery"));
    const second = context("POST", "gallery", 2); await publish(second);
    assert.equal(second.status, 409); assert.equal(second.body.error.details.code, "WRITE_IN_PROGRESS");
    assert.equal(second.response.get("Retry-After"), "1"); assert.equal(calls, 1);
    gate.resolve(); await first; await publish(context("POST", "gallery")); assert.equal(calls, 2);
  });
  await test("guard clears after thrown error and ignores unauthenticated/unrelated controllers", async () => {
    const guard = createGalleryWriteGuard(); let calls = 0;
    const failure = guard(async () => { calls++; throw Error("controlled"); }, "update");
    await assert.rejects(failure(context("PUT", "gallery")), /controlled/);
    const success = guard(async ctx => { calls++; ctx.status = 200; }, "publish");
    const ctx = context("POST", "gallery"); await success(ctx); assert.equal(ctx.status, 200);
    const unauthenticated = context("POST", "gallery", null); await success(unauthenticated); assert.equal(unauthenticated.status, 200);
    assert.equal(calls, 3);
  });
  await test("identical concurrent public reads share one query, retaining order and complete payload", async () => {
    const coalesce = createPublicReadCoalescer(); const gate = deferred(); let reads = 0;
    const query = { pagination: { pageSize: 240, page: 1 }, filters: { publishedAt: { $notNull: true } }, populate: ["authors", "cover"] };
    const data = [{ id: 2, body: "full body", bodyEn: "translation" }, { id: 1, body: "second" }];
    const read = async () => { reads++; await gate.promise; return data; };
    const first = coalesce("articles", query, read);
    const second = coalesce("articles", { populate: ["authors", "cover"], filters: { publishedAt: { $notNull: true } }, pagination: { page: 1, pageSize: 240 } }, read);
    const third = coalesce("articles", query, read);
    await Promise.resolve(); assert.equal(reads, 1); gate.resolve();
    const result = await Promise.all([first, second, third]);
    assert.equal(result[0], data); assert.equal(result[1], data); assert.equal(result[2], data);
    assert.deepEqual(result[0].map(item => item.id), [2, 1]);
    await coalesce("articles", query, read); assert.equal(reads, 2);
  });
  await test("public read coalescing isolates queries/models and clears rejected operations", async () => {
    const coalesce = createPublicReadCoalescer(); let reads = 0;
    const read = async () => { reads++; return []; };
    await Promise.all([coalesce("articles", { fields: ["id"] }, read), coalesce("articles", { fields: ["body"] }, read), coalesce("team", { fields: ["id"] }, read)]);
    assert.equal(reads, 3);
    await assert.rejects(coalesce("articles", {}, async () => { throw Error("controlled failure"); }), /controlled failure/);
    await coalesce("articles", {}, read); assert.equal(reads, 4);
  });
  await test("article controllers share reads while keeping publication rules and independent public projections", async () => {
    const controller = require("../src/api/article/controllers/article");
    const gate = deferred(); let reads = 0;
    const article = { id: 99, body: "complete article", homepagePlacement: { lead: true }, authors: [{ id: 7 }] };
    const previous = global.strapi;
    global.strapi = { entityService: { async findPage(_uid, query) { reads++; assert.equal(query.publicationState, "live"); await gate.promise; return { results: [article], pagination: { page: 1, pageSize: 1, total: 9, pageCount: 9 } }; } } };
    try {
      const first = { query: { pagination: { pageSize: 1 }, publicationState: "preview" } };
      const second = { query: { pagination: { pageSize: 1 }, publicationState: "preview" } };
      const calls = [controller.publicFind(first), controller.publicFind(second)];
      await Promise.resolve(); assert.equal(reads, 1); gate.resolve(); await Promise.all(calls);
      assert.equal(first.body.data[0].homepagePlacement, undefined);
      assert.equal(second.body.data[0].homepagePlacement, undefined);
      assert.deepEqual(article.homepagePlacement, { lead: true });
      assert.equal(first.body.meta.pagination.total, 9);
      assert.notEqual(first.body.data[0], second.body.data[0]);
      assert.equal(first.body.data[0].body, "complete article");
    } finally { if (previous === undefined) delete global.strapi; else global.strapi = previous; }
  });
  console.log(`CMS request stability: ${checks} checks passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
