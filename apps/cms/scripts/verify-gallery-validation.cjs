"use strict";
// Actual Content Manager requests against a fresh local SQLite CMS. No production credentials or uploads.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const cmsRoot = path.resolve(__dirname, "..");
const runtime = path.resolve(process.env.CMS_GALLERY_QA_DIR || path.join(cmsRoot, ".codex-temp", `gallery-validation-${Date.now()}`));
if (fs.existsSync(runtime)) throw new Error("Use a new empty QA runtime directory.");
fs.mkdirSync(runtime, { recursive: true });
for (const name of ["src", "config"]) fs.cpSync(path.join(cmsRoot, name), path.join(runtime, name), { recursive: true });
fs.copyFileSync(path.join(cmsRoot, "package.json"), path.join(runtime, "package.json"));
fs.mkdirSync(path.join(runtime, "public/uploads"), { recursive: true });
fs.symlinkSync(fs.realpathSync(path.join(cmsRoot, "node_modules")), path.join(runtime, "node_modules"), "junction");
fs.writeFileSync(path.join(runtime, "config/database.js"), 'const path=require("node:path");module.exports=()=>({connection:{client:"sqlite",connection:{filename:path.join(__dirname,"../gallery-qa.sqlite")},useNullAsDefault:true,pool:{min:0,max:1}}});\n');
fs.writeFileSync(path.join(runtime, "config/admin.js"), 'module.exports=({env})=>({serveAdminPanel:false,auth:{secret:env("ADMIN_JWT_SECRET")},apiToken:{salt:env("API_TOKEN_SALT")},transfer:{token:{salt:env("TRANSFER_TOKEN_SALT")}}});\n');
for (const name of Object.keys(process.env)) if (/^(?:CLOUDINARY|DATABASE_|FRONTEND_|CMS_REVALIDATE|CMS_GALLERY_QA_DIR|CONTRIBUTE_|SMTP_|SENDGRID|MAILGUN|PUBLIC_URL|STRAPI_URL|NEXT_PUBLIC_STRAPI)/.test(name)) delete process.env[name];
Object.assign(process.env, { NODE_ENV: "production", HOST: "127.0.0.1", PORT: "0", STRAPI_TELEMETRY_DISABLED: "true", STRAPI_DISABLE_UPDATE_NOTIFICATION: "true" });
for (const name of ["ADMIN_JWT_SECRET", "JWT_SECRET", "API_TOKEN_SALT", "TRANSFER_TOKEN_SALT"]) process.env[name] = crypto.randomBytes(32).toString("hex");
process.env.APP_KEYS = Array.from({ length: 4 }, () => crypto.randomBytes(24).toString("hex")).join(",");
process.chdir(runtime);
const GALLERY = "api::gallery.gallery", IMAGE = "shared.article-image-credit";
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }

async function main() {
  const app = await require("@strapi/strapi").default({ dir: runtime }).load();
  try {
    assert.equal(app.config.get("database.connection.client"), "sqlite");
    assert.equal(app.config.get("plugin.upload.provider"), "local");
    const role = await app.db.query("admin::role").findOne({ where: { code: "strapi-super-admin" } });
    const email = "gallery-validation@example.test", password = crypto.randomBytes(24).toString("base64url") + "!Aa9";
    await app.admin.services.user.create({ firstname: "QA", lastname: "Gallery", email, password, isActive: true, roles: [role.id] });
    await app.listen();
    const origin = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    let token;
    async function request(route, method = "GET", body) {
      const response = await fetch(origin + route, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, data: await response.json().catch(() => null) };
    }
    const login = await request("/admin/login", "POST", { email, password });
    check(login.status === 200, "Actual admin login succeeds"); token = login.data.data.token;
    const picture = await app.db.query("plugin::upload.file").create({ data: { name: "local-only.png", hash: "local-only", ext: ".png", mime: "image/png", size: 1, provider: "local", url: "/uploads/local-only.png", folderPath: "/" } });
    const document = await app.db.query("plugin::upload.file").create({ data: { name: "local-only.pdf", hash: "local-only-pdf", ext: ".pdf", mime: "application/pdf", size: 1, provider: "local", url: "/uploads/local-only.pdf", folderPath: "/" } });
    const longUrl = "https://example.test/photo?description=" + "a".repeat(700), longAlt = "dugačak opis ".repeat(70);
    const gallery = await app.entityService.create(GALLERY, { data: { title: "QA gallery preservation", slug: "qa-gallery-preservation", publishedAt: null, images: [{ image: picture.id, caption: "original caption", caption_en: "original translation", sourceUrl: longUrl, altText: longAlt, authorName: "original author", copyrightNotice: "original rights" }, { image: picture.id, caption: "duplicate reuse stays" }] } });
    const route = `/content-manager/collection-types/${GALLERY}/${gallery.id}`;
    const snapshot = () => app.entityService.findOne(GALLERY, gallery.id, { populate: { images: { populate: ["image"] }, seo: true, shareImage: true } });
    let stored = await snapshot();
    check(stored.images[0].sourceUrl === longUrl && stored.images[0].altText === longAlt, "Long source URL and alt text persist without truncation");
    check(stored.images.length === 2 && stored.images[0].image.id === stored.images[1].image.id, "Repeated existing media remains available without deduplication");
    const beforeInvalid = JSON.stringify(stored), componentsBefore = await app.db.query(IMAGE).count();
    const invalid = await request(route, "PUT", { title: "x".repeat(256), images: [{ id: stored.images[0].id, image: document.id, internalName: "x".repeat(256), year: 2147483648 }, { id: stored.images[1].id, image: 999999999, creditType: "not-a-credit-type" }], seo: { seoTitle: "x".repeat(256) } });
    check(invalid.status === 400, "Invalid gallery returns native field ValidationError400");
    const issues = invalid.data.error.details.errors;
    const paths = issues.map((issue) => issue.path.join("."));
    check(paths.every(Boolean), "Missing media is reported at its field without a duplicate unlocated summary");
    for (const expected of ["title", "images.0.image", "images.0.internalName", "images.0.year", "images.1.image", "images.1.creditType", "seo.seoTitle"]) check(paths.includes(expected), `Aggregate errors include ${expected}`);
    check(issues.find((issue) => issue.path.join(".") === "images.0.year").message.includes("Fotografija 1") && !JSON.stringify(issues).includes("x".repeat(256)), "Messages identify photo and field without echoing payload");
    check(JSON.stringify(await snapshot()) === beforeInvalid && await app.db.query(IMAGE).count() === componentsBefore, "Rejected preflight preserves every component and parent value");
    let injected = false, childWrites = 0;
    const unsubscribeChildren = app.db.lifecycles.subscribe({ models: [IMAGE], afterUpdate() { if (injected) childWrites++; } });
    const unsubscribeFailure = app.db.lifecycles.subscribe({ models: [GALLERY], beforeUpdate() { if (injected) throw new Error("QA_ONLY parent failure after component writes"); } });
    injected = true;
    const failed = await request(route, "PUT", { description: "must roll back", images: [{ id: stored.images[0].id, image: picture.id, caption: "must roll back child" }, { image: picture.id, caption: "must not leave orphan" }] });
    injected = false; unsubscribeFailure(); unsubscribeChildren();
    check(failed.status === 500 && childWrites > 0, "Controlled server failure occurs after real component update");
    check(JSON.stringify(await snapshot()) === beforeInvalid && await app.db.query(IMAGE).count() === componentsBefore, "Transaction rolls back changed, removed and inserted components on server failure");
    const optional = await request(route, "PUT", { images: [{ id: stored.images[0].id, image: picture.id, caption: "updated caption" }, { image: null, internalName: "Draft empty row" }, { image: picture.id, internalName: "Reuse original" }] });
    check(optional.status === 200, "Optional empty draft row and repeated existing media save successfully");
    stored = await snapshot();
    check(stored.images.length === 3 && stored.images[1].image === null && stored.images[0].image.id === stored.images[2].image.id, "Saved form preserves optional empty row and duplicate media reuse");
    check(stored.images[0].sourceUrl === longUrl && stored.images[0].caption_en === "original translation" && stored.images[0].copyrightNotice === "original rights", "Unsubmitted translation, URL and credits remain intact");
    const badArticle = await app.entityService.create("api::article.article", { data: { title: "QA unaffected article", slug: "qa-unaffected-article", section: "analysis", content: "Local QA only.", publishedAt: null, bodyImages: [{ image: picture.id, sourceUrl: longUrl, altText: longAlt }] } });
    const article = await app.entityService.findOne("api::article.article", badArticle.id, { populate: ["bodyImages"] });
    check(article.bodyImages[0].sourceUrl === longUrl && article.bodyImages[0].altText === longAlt, "Shared component still works in articles with long freeform metadata");
    const results = { ok: true, checks, runtime, database: "fresh isolated SQLite", productionWrites: 0, cloudinaryOperations: 0, tested: ["native authenticated CM400 aggregate errors", "preflight before mutation", "server500 after actual child writes", "transaction rollback", "long metadata preservation", "optional empty draft rows", "media identity reuse", "article shared component"] };
    fs.writeFileSync(path.join(runtime, "gallery-validation-results.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results));
  } finally { await app.destroy(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
