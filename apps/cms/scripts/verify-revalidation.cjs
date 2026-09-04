"use strict";
// In-memory mocks only. Never connects to Strapi or a database.
const assert = require("node:assert/strict");
const { captureRevalidationContext, revalidateFrontend } = require("../src/revalidate-frontend");

async function main() {
  let reads = 0;
  const requests = [];
  global.strapi = {
    entityService: { findOne: async () => { reads += 1; return { slug: "test", publishedAt: "2026-01-01", authors: [] }; } },
    log: { warn: () => {} },
  };
  const originalFetch = global.fetch;
  const originalEndpoint = process.env.FRONTEND_REVALIDATE_URL;
  const originalSecret = process.env.CMS_REVALIDATE_SECRET;
  process.env.FRONTEND_REVALIDATE_URL = "http://localhost.invalid/revalidate-test";
  process.env.CMS_REVALIDATE_SECRET = "local-test-value-not-a-secret";
  global.fetch = async (_url, options) => { requests.push(JSON.parse(options.body)); return { ok: true }; };
  try {
    const view = { params: { where: { id: 1 }, data: { viewCount: 20, updatedAt: "2026-01-01" } }, result: { id: 1 } };
    await captureRevalidationContext("api::article.article", view);
    await revalidateFrontend("api::article.article", "afterUpdate", view);
    assert.equal(reads, 0);
    assert.equal(requests.length, 0);
    const edit = { params: { where: { id: 1 }, data: { title: "Updated", viewCount: 20 } }, result: { id: 1 } };
    await captureRevalidationContext("api::article.article", edit);
    await revalidateFrontend("api::article.article", "afterUpdate", edit);
    assert.equal(reads, 2);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].slug, "test");
    assert.equal(requests[0].event, "afterUpdate");
    await revalidateFrontend("api::article.article", "afterUpdate", { params: { data: { publishedAt: null } }, result: { id: 1 } });
    assert.equal(requests.length, 2, "Unpublish still invalidates");
    console.log("PASS: view-only updates do not invalidate; Save/Publish/Unpublish payloads still invalidate. In-memory test only.");
  } finally {
    global.fetch = originalFetch;
    delete global.strapi;
    if (originalEndpoint === undefined) delete process.env.FRONTEND_REVALIDATE_URL;
    else process.env.FRONTEND_REVALIDATE_URL = originalEndpoint;
    if (originalSecret === undefined) delete process.env.CMS_REVALIDATE_SECRET;
    else process.env.CMS_REVALIDATE_SECRET = originalSecret;
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
