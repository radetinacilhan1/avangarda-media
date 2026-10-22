/* Real module/proxy tests. Offline: no CMS submissions or browser automation. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = path.resolve(__dirname, "../src");
const langs = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const i18n = { languages: langs.map(code => ({ code })), isLang: value => langs.includes(value) };
function load(file, imports = {}, globals = {}) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(source, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, {
    module, exports: module.exports, URL, atob, Uint8Array, Set, Map, Buffer, Request, Response, Headers, AbortSignal, SyntaxError,
    require: name => imports[name] || (name === "@/lib/i18n" ? i18n : name === "react" ? { cache: fn => fn } : require(name)), ...globals,
  }, { filename: file });
  return module.exports;
}

async function main() {
  const copy = load("lib/fact-check-copy.ts");
  assert.equal(copy.factCheckRatings.join(","), "true,partly_true,false,misleading,unverifiable");
  for (const lang of langs) {
    const row = copy.getFactCheckCopy(lang);
    assert.equal(Object.keys(row).length, 37, `${lang}: full UI copy`);
    for (const [key, value] of Object.entries(row)) if (key !== "ratings") assert.equal(typeof value === "string" && value.length > 0, true, `${lang}:${key}`);
    assert.equal(Object.keys(row.ratings).length, 5);
    assert.notEqual(row.ratings.false, row.ratings.unverifiable, `${lang}: insufficient evidence must not mean false`);
  }
  const unwrap = response => (response?.data || []).map(row => ({ ...row.attributes, id: row.id }));
  const calls = [];
  const valid = { id: 42, slug: "offline-test-claim", title: "Tvrdnja", claim: "Konkretna tvrdnja", summary: "Obrazloženje", context: "Kontekst", rating: "unverifiable", responsiblePerson: "Test editor", checkedAt: "2026-10-22", sources: [{ name: "Official evidence", url: "https://example.test/evidence", accessedAt: "2026-10-22" }], corrections: [{ date: "2026-10-22", note: "Original note" }] };
  let cmsPage = 0;
  const data = load("lib/fact-checks.ts", {
    "@/lib/fact-check-copy": copy,
    "@/lib/strapi": {
      strapiGet: async url => { calls.push(url); cmsPage++; return cmsPage < 3 ? { data: Array.from({ length: 50 }, (_, index) => ({ id: (cmsPage - 1) * 50 + index, attributes: { ...valid, slug: `claim-${(cmsPage - 1) * 50 + index}` } })), meta: { pagination: { pageCount: 3 } } } : { data: [{ id: 101, attributes: { ...valid, slug: "claim-last" } }], meta: { pagination: { pageCount: 3 } } }; },
      unwrapStrapiCollection: unwrap, unwrapStrapiSingle: response => response?.data?.attributes || null,
    },
  });
  for (const rating of copy.factCheckRatings) assert.equal(data.normalizeFactCheck({ ...valid, rating }, "sr").rating, rating);
  assert.equal(data.normalizeFactCheck({ ...valid, rating: "unknown" }, "sr"), null);
  assert.equal(data.normalizeFactCheck({ ...valid, reviewStatus: "draft" }, "sr"), null);
  assert.equal(data.normalizeFactCheck({ ...valid, publishedAt: null }, "sr"), null);
  assert.equal(data.normalizeFactCheck({ ...valid, responsiblePerson: "" }, "sr"), null);
  assert.equal(data.normalizeFactCheck({ ...valid, sources: [{ name: "Bad", url: "javascript:alert(1)" }] }, "sr"), null);
  assert.equal(data.safeFactCheckUrl("https://user:secret@example.test"), "");
  const fallback = data.normalizeFactCheck(valid, "ar");
  assert.equal(fallback.canonicalLang, "sr");
  assert.equal(fallback.availableLanguages.join(","), "sr");
  const translated = { ...valid, ...Object.fromEntries(["title", "claim", "summary", "context"].map(key => [`${key}_en`, `English ${key}`])) };
  assert.equal(data.normalizeFactCheck(translated, "en").canonicalLang, "en");
  assert.equal(data.getFactCheckLanguages(translated).join(","), "sr,en");
  const partial = data.normalizeFactCheck({ ...valid, title_en: "Only a translated title" }, "en");
  assert.equal(partial.canonicalLang, "sr", "A partial translation does not create an independent canonical page");
  assert.equal(partial.availableLanguages.join(","), "sr");
  assert.equal(partial.title, valid.title, "An incomplete translation clearly shows the complete Serbian original");
  assert.equal(data.getFactCheckLanguages({ ...valid, title_en: valid.title, claim_en: valid.claim, summary_en: valid.summary, context_en: valid.context }).join(","), "sr");
  const catalog = await data.fetchFactChecks("sr");
  assert.equal(catalog.checks.length, 101, "Follow pagination beyond first response");
  assert.equal(catalog.available, true);
  assert.equal(calls.length, 3, "No extra request per card; respect the CMS page-size cap");
  assert(calls[1].includes("pagination[page]=2"));

  const offline = load("lib/fact-checks.ts", {
    "@/lib/fact-check-copy": copy,
    "@/lib/strapi": { strapiGet: async () => { throw new Error("Strapi returned a non-JSON response"); }, unwrapStrapiCollection: unwrap, unwrapStrapiSingle: () => null },
  });
  assert.deepEqual(JSON.parse(JSON.stringify(await offline.fetchFactChecks("sr"))), { checks: [], available: false }, "CMS outage or a not-yet-deployed endpoint must not break the page or sitemap build");
  assert.equal(await offline.fetchFactCheck("offline-test-claim", "ar"), null);

  const validation = load("lib/fact-check-submission.ts");
  const payload = { claim: "Offline validation test claim", sourceUrl: "https://example.test/source", contact: "", lang: "sr", website: "", approved: true, internalNotes: "untrusted" };
  assert.equal(validation.validateFactSubmission(payload).approved, undefined);
  assert.equal(validation.validateFactSubmission({ ...payload, website: "spam" }), null);
  assert.equal(validation.validateFactSubmission({ ...payload, claim: "short" }), null);
  assert.equal(validation.validateFactSubmission({ ...payload, sourceUrl: "javascript:alert(1)" }), null);
  assert.equal(validation.validateFactSubmission({ ...payload, lang: "xx" }), null);
  assert.equal(validation.validateFactSubmission({ ...payload, contact: "x".repeat(241) }), null);
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
  assert(validation.validateFactSubmission({ ...payload, screenshot: { name: "private.png", mimeType: "image/png", base64: png } }));
  assert.equal(validation.validateFactSubmission({ ...payload, screenshot: { name: "fake.png", mimeType: "image/png", base64: Buffer.from("<svg>not a PNG</svg>").toString("base64") } }), null);
  assert.equal(validation.validateFactSubmission({ ...payload, screenshot: { name: "mismatch.jpg", mimeType: "image/jpeg", base64: png } }), null);
  assert.equal(validation.validateFactSubmission({ ...payload, screenshot: { name: "huge.png", mimeType: "image/png", base64: "A".repeat(3_000_000) } }), null);

  let rateAllowed = true, upstream = { status: 201, payload: { data: { received: true } } }, writes = [];
  const route = load("app/api/fact-check-submissions/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => new Response(JSON.stringify(body), init) } },
    "@/lib/fact-check-submission": validation,
    "@/lib/security": { checkRateLimit: () => ({ allowed: rateAllowed, retryAfterSeconds: 600 }) },
  }, {
    process: { env: { NODE_ENV: "production", VERCEL_ENV: "production", STRAPI_URL: "https://cms.avangarda.media" } },
    fetch: async (url, options) => { writes.push({ url, body: JSON.parse(options.body) }); return new Response(JSON.stringify(upstream.payload), { status: upstream.status }); },
  });
  const request = body => new Request("https://avangarda.media/api/fact-check-submissions", { method: "POST", headers: { "content-type": "application/json", origin: "https://avangarda.media" }, body: JSON.stringify(body) });
  const saved = await route.POST(request(payload));
  assert.equal(saved.status, 201);
  assert.equal((await saved.json()).data.received, true);
  assert.equal(writes[0].url, "https://cms.avangarda.media/api/fact-check-submissions/submit");
  assert.equal(writes[0].body.data.approved, undefined);
  assert.equal(writes[0].body.data.internalNotes, undefined);
  upstream = { status: 200, payload: { data: {} } };
  assert.equal((await route.POST(request(payload))).status, 502, "HTTP success without saved acknowledgment is not success");
  upstream = { status: 500, payload: { error: "private details must not leak" } };
  const failed = await route.POST(request(payload));
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).error, "SUBMISSION_FAILED");
  const beforeSpam = writes.length;
  assert.equal((await route.POST(request({ ...payload, website: "spam" }))).status, 400);
  assert.equal(writes.length, beforeSpam, "Honeypot never writes or claims a saved submission");
  rateAllowed = false;
  const limited = await route.POST(request(payload));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "600");
  assert.equal(writes.length, beforeSpam);
  assert.equal((await route.POST(new Request("https://avangarda.media/api/fact-check-submissions", { method: "POST", headers: { origin: "https://untrusted.example" } }))).status, 403);
  const middleware = fs.readFileSync(path.join(source, "middleware.ts"), "utf8");
  assert(middleware.includes('pathname === "/provera-cinjenica"'), "Native localized route keeps true detail 404 status");
  console.log("PASS fact checking: 8 languages, ratings, canonical/hreflang, pagination, source safety, uploads, proxy storage acknowledgment, privacy and spam/rate limits.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
