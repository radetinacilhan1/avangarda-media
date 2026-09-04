/* Run inside qa-server's local container. Uses GETs and frontend cache invalidation only. */
const assert = require("node:assert/strict");
const origin = "http://127.0.0.1:3000";
const proxy = "http://127.0.0.1:1338";
async function measure(path) {
  await fetch(`${proxy}/__qa/reset`);
  const start = performance.now();
  const response = await fetch(`${origin}${path}`);
  const html = await response.text();
  const status = await (await fetch(`${proxy}/__qa/status`)).json();
  const result = { path, status: response.status, ms: Math.round(performance.now() - start), cache: response.headers.get("x-nextjs-cache"), control: response.headers.get("cache-control"), cookie: response.headers.has("set-cookie"), cmsCalls: status.requests.length, bytes: Buffer.byteLength(html) };
  console.log(JSON.stringify(result));
  assert.equal(response.status, 200, path);
  assert.equal(result.cookie, false, "Public pages must not set server cookies");
  return { html, result };
}
async function main() {
  assert.ok(process.env.CMS_REVALIDATE_SECRET, "Local revalidation must be configured");
  const home = await measure("/sr");
  assert.match(home.html, /<html lang="sr" dir="ltr"/);
  await measure("/en");
  const ar = await measure("/ar");
  assert.match(ar.html, /<html lang="ar" dir="rtl"/);
  const slug = home.html.match(/href="\/sr\/a\/([^"?#]+)"/)?.[1];
  assert.ok(slug, "A published local article is required");
  const pathname = `/sr/a/${slug}`;
  const cold = await measure(pathname);
  const warm = await measure(pathname);
  assert.equal(warm.result.cache, "HIT");
  assert.equal(warm.result.cmsCalls, 0);
  assert.match(warm.html, /<meta property="og:image"/);
  assert.match(warm.html, /rel="canonical" href="https:\/\/avangarda.media\/sr\/a\//);
  const reject = await fetch(`${origin}/api/revalidate-cms`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  assert.equal(reject.status, 401);
  const invalidate = () => fetch(`${origin}/api/revalidate-cms`, {
    method: "POST", headers: { "content-type": "application/json", "x-cms-revalidate-secret": process.env.CMS_REVALIDATE_SECRET },
    body: JSON.stringify({ uid: "api::article.article", event: "afterUpdate", slug, changedFields: ["title"] }),
  });
  assert.equal((await invalidate()).status, 200);
  const refreshed = await measure(pathname);
  assert.match(refreshed.html, /article-header__title/);
  await measure(pathname);
  await fetch(`${proxy}/__qa/outage?on=1`);
  try {
    assert.equal((await invalidate()).status, 503, "Unavailable origin defers hard invalidation");
    const stale = await measure(pathname);
    assert.equal(stale.html, refreshed.html, "CMS outage must retain the complete previous article HTML");
    if (process.env.QA_CMS_REVALIDATE_SECONDS) {
      await new Promise((resolve) => setTimeout(resolve, (Number(process.env.QA_CMS_REVALIDATE_SECONDS) + 1) * 1000));
      const expired = await measure(pathname);
      assert.equal(expired.html, refreshed.html, "Timed SWR must preserve previous HTML while CMS is unavailable");
    }
    console.log("PASS: ISR cache hits make zero CMS calls; secret enforcement and cache invalidation work; last successful HTML survives a simulated CMS outage. No CMS/database writes.");
  } finally { await fetch(`${proxy}/__qa/outage?on=0`); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
