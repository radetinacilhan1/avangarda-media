import express from "express";
import fetch from "node-fetch";
import { MeiliSearch } from "meilisearch";

const app = express();
app.use(express.json({ limit: "2mb" }));

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

const meili = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY
});

const index = meili.index("content");

async function upsertArticle(id) {
  const res = await fetch(`${STRAPI_URL}/api/articles/${id}?populate=authors,tags,topics,locations`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
  });
  const json = await res.json();
  const a = json?.data;
  if (!a) return;

  const doc = {
    id: `article_${a.id}`,
    type: "article",
    title: a.attributes.title,
    title_en: a.attributes.title_en || "",
    title_tr: a.attributes.title_tr || "",
    title_fr: a.attributes.title_fr || "",
    title_de: a.attributes.title_de || "",
    subtitle: a.attributes.subtitle || "",
    subtitle_en: a.attributes.subtitle_en || "",
    subtitle_tr: a.attributes.subtitle_tr || "",
    subtitle_fr: a.attributes.subtitle_fr || "",
    subtitle_de: a.attributes.subtitle_de || "",
    slug: a.attributes.slug,
    section: a.attributes.section,
    content: a.attributes.content || "",
    content_en: a.attributes.content_en || "",
    content_tr: a.attributes.content_tr || "",
    content_fr: a.attributes.content_fr || "",
    content_de: a.attributes.content_de || "",
    focus: a.attributes.focus || "",
    style: a.attributes.style || "",
    year: a.attributes.year || null,
    publishedAt: a.attributes.publishedAt,
    authors: (a.attributes.authors?.data || []).map(x => x.attributes.name),
    topics: (a.attributes.topics?.data || []).map(x => x.attributes.name),
    tags: (a.attributes.tags?.data || []).map(x => x.attributes.name),
    locations: (a.attributes.locations?.data || []).map(x => x.attributes.name)
  };

  await index.addDocuments([doc]);
}

async function deleteDoc(docId) {
  await index.deleteDocument(docId);
}

app.post("/webhooks/strapi", async (req, res) => {
  try {
    const event = req.body?.event;
    const model = req.body?.model;
    const entry = req.body?.entry;

    if (model === "article" && entry?.id) {
      if (event === "entry.unpublish") {
        await deleteDoc(`article_${entry.id}`);
      } else {
        await upsertArticle(entry.id);
      }
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post("/admin/init-search", async (req, res) => {
  try {
    await index.updateSearchableAttributes([
      "title",
      "title_en",
      "title_tr",
      "title_fr",
      "title_de",
      "subtitle",
      "subtitle_en",
      "subtitle_tr",
      "subtitle_fr",
      "subtitle_de",
      "content",
      "content_en",
      "content_tr",
      "content_fr",
      "content_de",
      "focus",
      "style",
      "authors",
      "topics",
      "tags",
      "locations"
    ]);

    await index.updateFilterableAttributes([
      "type",
      "section",
      "year",
      "authors",
      "topics",
      "tags",
      "locations"
    ]);

    await index.updateSortableAttributes(["publishedAt"]);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(4000, () => console.log("worker on 4000"));
