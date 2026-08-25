"use strict";

const createStrapi = require("@strapi/strapi").default;

const WEB_ORIGIN = process.env.WEB_INTERNAL_ORIGIN || "http://web:3000";
const ARTICLE_UID = "api::article.article";
const AUTHOR_UID = "api::author.author";
const MEMBER_UID = "api::team-member.team-member";
const TAG_UID = "api::tag.tag";
const TOPIC_UID = "api::topic.topic";
const LOCATION_UID = "api::location.location";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchHtml(pathname) {
  const response = await fetch(`${WEB_ORIGIN}${pathname}`, { redirect: "follow" });
  const html = await response.text();
  assert(response.ok, `${pathname} returned HTTP ${response.status}`);
  return html;
}

async function fetchHtmlUntil(pathname, predicate, expectation) {
  let html = "";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    html = await fetchHtml(pathname);
    if (predicate(html)) return html;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`${pathname} did not show ${expectation}`);
}

async function main() {
  const app = await createStrapi().load();
  const created = [];
  const marker = `codex-workflow-${Date.now()}`;
  const articleSlug = `${marker}-article`;
  const profileSlug = `${marker}-profile`;

  async function create(uid, data) {
    const entry = await app.entityService.create(uid, { data });
    created.push([uid, entry.id]);
    return entry;
  }

  try {
    const images = await app.entityService.findMany("plugin::upload.file", {
      filters: { mime: { $startsWith: "image/" } },
      fields: ["id", "url", "mime"],
      sort: { id: "asc" },
      limit: 20,
    });
    assert(images.length >= 2, "Two local image assets are required for the replacement test");
    const [firstImage, secondImage] = images;
    const firstImageToken = firstImage.url.split("/").pop();
    const secondImageToken = secondImage.url.split("/").pop();

    const member = await create(MEMBER_UID, {
      fullName: `Codex Workflow ${marker}`,
      slug: profileSlug,
      role: "Test profile",
      shortBio: "Temporary local verification record.",
      portrait: firstImage.id,
      portfolioEnabled: true,
      isActive: true,
      order: 9999,
    });
    const author = await create(AUTHOR_UID, {
      name: `Codex Workflow ${marker}`,
      slug: `${marker}-author`,
      publicProfile: member.id,
    });
    const tag = await create(TAG_UID, { name: `Tag ${marker}`, slug: `${marker}-tag` });
    const topic = await create(TOPIC_UID, { name: `Topic ${marker}`, slug: `${marker}-topic` });
    const location = await create(LOCATION_UID, { name: `Location ${marker}`, slug: `${marker}-location` });

    const profileBefore = await fetchHtml(`/sr/people/${profileSlug}`);
    assert(!profileBefore.includes(articleSlug), "Profile unexpectedly contains an article before creation");

    const richContent = [
      "## Formatirani naslov",
      "",
      "**Podebljano**, *kurziv*, ~~precrtano~~ i <u>podvučeno</u>.",
      "",
      "- prva stavka",
      "- druga stavka",
      "",
      "> Citirani pasus",
      "",
      "[Interni link](/archive)",
    ].join("\n");
    const article = await create(ARTICLE_UID, {
      title: `Workflow ${marker}`,
      title_en: `Workflow EN ${marker}`,
      slug: articleSlug,
      section: "analysis",
      content: richContent,
      content_en: `## English heading\n\n**English bold** and *English italic*.`,
      cover: firstImage.id,
      authors: [author.id],
      tags: [tag.id],
      topics: [topic.id],
      locations: [location.id],
      publishedAt: new Date().toISOString(),
    });

    const stored = await app.entityService.findOne(ARTICLE_UID, article.id, {
      populate: ["cover", "authors", "tags", "topics", "locations"],
    });
    assert(stored.cover?.id === firstImage.id, "Initial article cover was not persisted");
    assert(stored.authors?.some((entry) => entry.id === author.id), "Author relation was not persisted");
    assert(stored.tags?.some((entry) => entry.id === tag.id), "Tag relation was not persisted");
    assert(stored.topics?.some((entry) => entry.id === topic.id), "Topic relation was not persisted");
    assert(stored.locations?.some((entry) => entry.id === location.id), "Location relation was not persisted");
    assert(stored.content_en.includes("English bold"), "Localized rich text was not persisted");

    const canonicalArticles = await app.entityService.findMany(ARTICLE_UID, {
      filters: { authors: { publicProfile: { id: member.id } }, publishedAt: { $notNull: true } },
      fields: ["id", "slug"],
    });
    assert(canonicalArticles.some((entry) => entry.id === article.id), "Canonical profile relation query missed the article");

    const articleBefore = await fetchHtmlUntil(`/sr/a/${articleSlug}`, (html) => html.includes(firstImageToken), "the initial article cover");
    const homeBefore = await fetchHtmlUntil("/sr", (html) => html.includes(firstImageToken), "the initial homepage cover");
    await fetchHtmlUntil(`/sr/people/${profileSlug}`, (html) => html.includes(`Workflow ${marker}`), "the canonical authored article");
    ["<strong>Podebljano</strong>", "<em>kurziv</em>", "<s>precrtano</s>", "<u>podvučeno</u>", "<ul>", "<blockquote>"].forEach((fragment) => {
      assert(articleBefore.includes(fragment), `Rendered rich text is missing ${fragment}`);
    });
    assert(/href=["']\/archive\?lang=sr["']/.test(articleBefore), "Internal rich-text link was not localized");

    await app.entityService.update(ARTICLE_UID, article.id, { data: { cover: secondImage.id } });
    const articleAfter = await fetchHtmlUntil(`/sr/a/${articleSlug}`, (html) => html.includes(secondImageToken), "the replacement article cover");
    const homeAfter = await fetchHtmlUntil("/sr", (html) => html.includes(secondImageToken), "the replacement homepage cover");
    const englishAfter = await fetchHtmlUntil(`/en/a/${articleSlug}`, (html) => html.includes(secondImageToken), "the replacement localized cover");
    assert(articleAfter.includes(secondImageToken), "Article detail remained stale after cover replacement");
    assert(homeAfter.includes(secondImageToken), "Homepage card remained stale after cover replacement");
    assert(englishAfter.includes("<strong>English bold</strong>"), "Localized Markdown did not render on the English route");

    await app.entityService.update(MEMBER_UID, member.id, { data: { portrait: secondImage.id } });
    await fetchHtmlUntil(`/sr/people/${profileSlug}`, (html) => html.includes(secondImageToken), "the replacement profile portrait");

    const revalidationEndpoint = process.env.FRONTEND_REVALIDATE_URL;
    const revalidationSecret = process.env.CMS_REVALIDATE_SECRET;
    assert(revalidationEndpoint && revalidationSecret, "Local revalidation endpoint/secret are not configured");
    const unauthorized = await fetch(revalidationEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json", "x-cms-revalidate-secret": "incorrect" },
      body: JSON.stringify({ uid: ARTICLE_UID }),
    });
    assert(unauthorized.status === 401, "Revalidation endpoint accepted an invalid secret");

    console.log(JSON.stringify({
      ok: true,
      marker,
      checks: [
        "quick-create relation persistence",
        "canonical profile authorship",
        "Markdown rendering and localized links",
        "initial/replacement article cover on detail and homepage",
        "localized article cover/content",
        "initial/replacement profile portrait",
        "authenticated cache revalidation",
      ],
    }, null, 2));
  } finally {
    for (const [uid, id] of created.reverse()) {
      try {
        await app.entityService.delete(uid, id);
      } catch (error) {
        console.warn(`Cleanup failed for ${uid} ${id}: ${error.message}`);
      }
    }
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
