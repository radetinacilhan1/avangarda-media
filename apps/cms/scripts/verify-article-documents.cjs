/* Test-only database required. Never run this against production. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const createStrapi = require("@strapi/strapi").default;

async function main() {
  assert.match(process.env.DATABASE_NAME || "", /^avangarda_screenshot_qa_/, "A dedicated QA database is required");
  assert.equal(process.env.FRONTEND_REVALIDATE_URL || "", "", "No production revalidation in QA");
  const app = await createStrapi({ dir: process.cwd() }).load();
  try {
    const filename = "/tmp/avangarda-document-qa.pdf";
    fs.writeFileSync(filename, "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF");
    const [file] = await app.plugin("upload").service("upload").upload({ data: {}, files: {
      path: filename, name: "avangarda-document-qa.pdf", type: "application/pdf", size: fs.statSync(filename).size,
    } });
    const UID = "api::article.article";
    const slug = `qa-article-documents-${Date.now()}`;
    const record = await app.entityService.create(UID, { data: {
      title: "QA — Dokumenti uz tekst", slug, content: "Testni nacrt.", section: "analysis",
      documents: [{ title: "Probni dokument", description: "Opis priloga", linkLabel: "Pročitaj dokument", pdfFile: file.id }],
    } });
    const reopen = () => app.entityService.findOne(UID, record.id, { populate: { documents: { populate: ["pdfFile"] } } });
    let saved = await reopen();
    assert.equal(saved.documents[0].pdfFile.id, file.id);
    assert.equal(saved.documents[0].linkLabel, "Pročitaj dokument");
    assert.equal(saved.publishedAt, null);
    await app.entityService.update(UID, record.id, { data: { documents: [
      { id: saved.documents[0].id, title: "Izmenjen naziv", pdfFile: file.id, description: "Sačuvan opis" },
      { title: "Drugi prilog", pdfFile: file.id },
    ] } });
    saved = await reopen();
    assert.equal(saved.documents.length, 2);
    assert.equal(saved.documents[0].description, "Sačuvan opis");
    const invalid = await app.entityService.create("plugin::upload.file", { data: {
      name: "invalid.txt", hash: "qa-invalid", ext: ".txt", mime: "text/plain", size: 1, url: "/uploads/invalid.txt", provider: "local", folderPath: "/",
    } });
    await assert.rejects(() => app.entityService.update(UID, record.id, { data: { documents: [{ title: "Invalid", pdfFile: invalid.id }] } }), /PDF/);
    assert.deepEqual((await reopen()).documents, saved.documents, "Rejected file must not mutate existing documents");
    const oversized = await app.entityService.create("plugin::upload.file", { data: {
      name: "oversized.pdf", hash: "qa-oversized", ext: ".pdf", mime: "application/pdf", size: 15361, url: "/uploads/oversized.pdf", provider: "local", folderPath: "/",
    } });
    await assert.rejects(() => app.entityService.update(UID, record.id, { data: { documents: [{ title: "Oversized", pdfFile: oversized.id }] } }), /15 MB/);
    assert.deepEqual((await reopen()).documents, saved.documents, "Oversized file must not mutate existing documents");
    // Restore the disposable record after intentionally rejected component writes.
    await app.entityService.update(UID, record.id, { data: { documents: [{ title: "Probni dokument", pdfFile: file.id }] } });
    const old = await app.entityService.create(UID, { data: { title: "QA without documents", slug: `${slug}-empty`, content: "No attachments.", section: "analysis" } });
    assert.equal((await app.entityService.findOne(UID, old.id, { populate: ["documents"] })).documents.length, 0);
    // Read-only public source; only a metadata reference is created in the QA database.
    const publicUrl = "https://res.cloudinary.com/avangarda-media/image/upload/v1786204787/ZAKON_O_ZABRANI_DISKRIMINACIJE_e2bf204258.pdf";
    const source = await fetch(publicUrl);
    assert.equal(source.status, 200);
    const sourceBytes = Buffer.from(await source.arrayBuffer());
    assert.equal(sourceBytes.subarray(0, 5).toString(), "%PDF-");
    const publicFile = await app.entityService.create("plugin::upload.file", { data: {
      name: "Zakon o zabrani diskriminacije.pdf", hash: "qa-public-pdf", ext: ".pdf", mime: "application/pdf", size: sourceBytes.length / 1024,
      url: publicUrl,
      provider: "cloudinary", folderPath: "/",
    } });
    await app.entityService.update(UID, record.id, { data: { documents: [
      { title: "Zakon o zabrani diskriminacije", description: "Javni PDF za proveru otvaranja na zahtev.", pdfFile: publicFile.id, linkLabel: "Otvori dokument" },
    ], publishedAt: new Date().toISOString() } });
    saved = await reopen();
    const documentId = saved.documents[0].id;
    await app.entityService.update(UID, record.id, { data: {
      content: `Testni zapis.\n\n[Dokument u glavnom tekstu](/api/article-document?slug=${slug}&document=${documentId})`,
    } });
    console.log(JSON.stringify({ ok: true, slug, id: record.id, fileUrl: file.url,
      documentId,
      checks: ["PDF upload", "draft save/reopen", "repeatable attachments", "edit persistence", "reject non-PDF", "reject >15 MB", "legacy article without documents"] }));
  } finally { await app.destroy(); }
}
main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
