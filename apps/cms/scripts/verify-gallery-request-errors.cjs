"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { errors } = require("@strapi/utils");
const { boundedUploadHash, extendUploadService } = require("../src/upload-file-hash");
const { requestKind, safeDiagnostic, createGalleryRequestErrors } = require("../src/gallery-request-errors");
const { removePrivateEditorialFields } = require("../src/middlewares/private-editorial-fields");

(async () => {
  const originalName = "fotografija-" + "dug-naziv-".repeat(24) + ".png";
  const longHash = originalName.replace(/\.png$/, "") + "_abc1234567";
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), "avangarda-hash-check-"));
  try {
    const hash = boundedUploadHash(longHash);
    await fs.writeFile(path.join(folder, `optimized-${hash}`), "test");
    await fs.writeFile(path.join(folder, `thumbnail_${hash}.png`), "test");
    assert(Buffer.byteLength(`thumbnail_${hash}.png`) < 255);
    assert.notEqual(hash, boundedUploadHash(longHash + "_different-random-suffix"));
    assert.equal(boundedUploadHash("normal_abc1234567"), "normal_abc1234567");
    const service = extendUploadService(() => ({ async formatFileInfo() { return { name: originalName, hash: longHash, alternativeText: "alt", caption: "opis" }; } }))({});
    const info = await service.formatFileInfo();
    assert.equal(info.name, originalName);
    assert.equal(info.alternativeText, "alt");
    assert.equal(info.caption, "opis");
    assert.equal(info.hash, hash);
  } finally { await fs.rm(folder, { recursive: true, force: true }); }

  const privateToken = "local-test-secret-123";
  const publicData = removePrivateEditorialFields({ data: [{ images: [{ internalName: "urednički naziv", adminLabel: "01 · fajl.png", image: { id: 7, name: originalName }, caption: "javni opis", altText: "javni alt", authorName: "Autor" }] }] });
  assert.deepEqual(publicData.data[0].images[0], { image: { id: 7, name: originalName }, caption: "javni opis", altText: "javni alt", authorName: "Autor" });
  const diagnostic = safeDiagnostic(new Error(`https://user:private-pass@provider.test/path?token=${privateToken} password=private-pass`), { API_TOKEN: privateToken, DATABASE_PASSWORD: "private-pass" });
  assert(!diagnostic.includes(privateToken));
  assert(!diagnostic.includes("private-pass"));
  const jsonDiagnostic = safeDiagnostic(new Error('{"token":"request-secret","api_key":"provider-secret"} escaped={\\"password\\":\\"json-secret\\"} Bearer unknown-bearer'), { APP_KEYS: "first-app-key,second-app-key" });
  for (const secret of ["request-secret", "provider-secret", "json-secret", "unknown-bearer"]) assert(!jsonDiagnostic.includes(secret));
  assert(!safeDiagnostic(new Error("first-app-key"), { APP_KEYS: "first-app-key,second-app-key" }).includes("first-app-key"));
  assert(!safeDiagnostic(new Error("postgres://editor:database-private@localhost/db"), {}).includes("database-private"));
  const providerDiagnostic = safeDiagnostic(new Error('{"client_secret":"client-private","access_token":"access-private","signature":"signature-private"}'), {});
  for (const secret of ["client-private", "access-private", "signature-private"]) assert(!providerDiagnostic.includes(secret));
  const logs = [];
  const middleware = createGalleryRequestErrors({ log: { error: value => logs.push(value) } });
  for (const [method, url, kind] of [["PUT", "/content-manager/collection-types/api::gallery.gallery/5", "gallery"], ["POST", "/upload", "upload"]]) {
    const ctx = { method, path: url };
    assert.equal(requestKind(ctx), kind);
    await middleware(ctx, async () => { throw new Error("controlled server failure"); });
    assert.equal(ctx.status, 500);
    assert.equal(ctx.body.error.status, 500);
    assert(ctx.body.error.details.requestId);
    assert.equal(ctx.body.error.details.errors, undefined);
    assert(!JSON.stringify(ctx.body).includes("controlled server failure"));
    assert(logs.at(-1).includes(ctx.body.error.details.requestId));
  }
  const invalid = new errors.ValidationError("Fotografija 02 · Godina: neispravan broj.", { errors: [{ path: ["images", 1, "year"], message: "neispravan broj" }] });
  const headers = {};
  const correlated = { method: "PUT", path: "/content-manager/collection-types/api::gallery.gallery/5", state: { cmsRequestId: "qa-correlated-request" }, set(name, value) { headers[name] = value; } };
  await middleware(correlated, async () => { throw new Error("response failed after commit"); });
  assert.equal(correlated.body.error.details.requestId, "qa-correlated-request");
  assert.equal(headers["X-CMS-Request-ID"], "qa-correlated-request");
  assert.match(correlated.body.error.message, /ishod čuvanja još nije potvrđen/);
  assert(!correlated.body.error.message.includes("Pokušajte ponovo"));
  const limited = new errors.RateLimitError("Too many requests");
  await assert.rejects(middleware({ method: "PUT", path: correlated.path }, async () => { throw limited; }), error => error === limited);
  await assert.rejects(middleware({ method: "PUT", path: "/content-manager/collection-types/api::gallery.gallery/5" }, async () => { throw invalid; }), error => error === invalid);
  const unrelated = new Error("article stays native");
  await assert.rejects(middleware({ method: "PUT", path: "/content-manager/collection-types/api::article.article/5" }, async () => { throw unrelated; }), error => error === unrelated);
  console.log("Gallery request errors: native validation preserved, server/upload failures classified, diagnostics redacted, long upload storage keys verified.");
})().catch(error => { console.error(error); process.exitCode = 1; });
