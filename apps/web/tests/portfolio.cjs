/* node apps/web/tests/portfolio.cjs [path-to-read-only-public-fixtures] */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = path.resolve(__dirname, "../src");
const loaded = new Map();
const calls = [];
let response = { data: [], meta: {} };
const unwrap = (value) => {
  const data = value?.data ?? value;
  return Array.isArray(data) ? data.map((row) => ({ ...(row.attributes || row), ...(row.id != null ? { id: row.id } : {}) })) : [];
};
const strapi = {
  strapiGet: async (url) => { calls.push(url); return typeof response === "function" ? response(url) : response; },
  unwrapStrapiCollection: unwrap,
  unwrapStrapiSingle: (value) => value?.data ?? value,
  getStrapiMediaUrl: (value) => value,
};
function load(file) {
  const filename = path.resolve(source, file);
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const module = { exports: {} };
  loaded.set(filename, module);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Intl, URL, URLSearchParams, process: { env: { NODE_ENV: "test" } },
    require: (name) => name === "@/lib/strapi" ? strapi : name.startsWith("@/") ? load(`${name.slice(2)}.ts`) : require(name),
  }, { filename });
  return module.exports;
}
const articles = load("lib/portfolio-articles.ts");
const counts = load("lib/portfolio-counts.ts");
const docs = load("lib/portfolio-documentaries.ts");
const progress = load("lib/portfolio-timeline-progress.ts");
const about = load("lib/about.ts");
const langs = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const published = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1, slug: `story-${index + 1}`, title: `Story ${index + 1}`, title_ar: `مقال ${index + 1}`,
  publishedAt: "2026-10-01T10:00:00.000Z", authors: [{ id: 2, slug: "canonical-author" }, { id: 5, slug: "coauthor" }],
}));

async function main() {
  const query = new URL(articles.buildPortfolioArticlesQuery(2), "https://fixture.test").searchParams;
  assert.equal(query.get("filters[authors][publicProfile][id][$eq]"), "2");
  assert.equal(query.get("filters[publishedAt][$notNull]"), "true");
  assert.equal(query.get("publicationState"), "live");
  assert(!Array.from(query).some(([key, value]) => key.includes("name") && key.includes("filters") || value.startsWith("content")), "No display-name association or body transfer");
  response = { data: [...published, { ...published[0], title: "Translation duplicate" }, { id: 99, publishedAt: null }], meta: {} };
  assert.equal((await articles.fetchPortfolioAuthoredArticles(2)).length, 13, "Coauthors/translations count each published identity once; drafts do not count");
  assert.equal(calls.length, 1, "The current complete public endpoint needs only one projected request");

  response = (url) => {
    const page = Number(new URL(url, "https://fixture.test").searchParams.get("pagination[page]"));
    return { data: page === 1 ? published.slice(0, 7) : [published[6], ...published.slice(7)], meta: { pagination: { page, pageCount: 2 } } };
  };
  assert.equal((await articles.fetchPortfolioAuthoredArticles(2)).length, 13, "Standard paginated endpoints are completed and overlap is deduplicated");
  for (const invalid of [null, { data: null }, { data: published, meta: { pagination: { page: 1, pageCount: NaN } } }, { data: [{ id: null, publishedAt: "2026-10-01" }] }, { data: [{ id: 10 }] }, { data: [{ id: 10, publishedAt: "broken" }] }]) {
    response = invalid;
    await assert.rejects(articles.fetchPortfolioAuthoredArticles(2), "Unavailable/malformed responses must not publish a false zero");
  }
  response = { data: [], meta: {} };
  assert.equal((await articles.fetchPortfolioAuthoredArticles(2)).length, 0, "A successful empty canonical result is a real zero");

  const member = { id: 2, fullName: "Renamed person", slug: "canonical-profile", role: "Role", shortBio: "Bio", projects: [{ title: "One" }, { title: "Two" }, { title: "Three" }], relatedArticles: [{ id: 900, slug: "curated-only", title: "Curated relationship" }], isActive: true };
  response = (url) => ({ data: url.startsWith("/api/team-members") ? [member] : published, meta: {} });
  for (const lang of langs) {
    const profile = await about.fetchTeamMemberBySlug("canonical-profile", lang);
    assert.equal(profile.publishedArticleCount, 13);
    assert.equal(profile.relatedArticles.length, 13, "Total data is independent of the six-card presentation limit");
    for (const kind of ["projects", "articles", "documentaries"]) {
      for (const number of [0, 1, 2, 3, 6, 11, 13, 21, 22, 101]) assert(counts.formatPortfolioCount(number, kind, lang).length > 2);
    }
  }
  assert.equal(counts.formatPortfolioCount(3, "projects", "sr"), "3 projekta");
  assert.equal(counts.formatPortfolioCount(6, "articles", "sr"), "6 tekstova");
  assert.equal(counts.formatPortfolioCount(1, "documentaries", "sr"), "1 dokumentarac");
  assert.equal(counts.formatPortfolioCount(13, "articles", "sr"), "13 tekstova");
  assert.equal(counts.formatPortfolioCount(21, "articles", "sr"), "21 tekst");
  assert.equal(counts.formatPortfolioCount(22, "articles", "sr"), "22 teksta");
  assert.equal(counts.formatPortfolioCount(2, "projects", "tr"), "2 proje");
  assert.equal(counts.formatPortfolioCount(1, "documentaries", "de"), "1 Dokumentarfilm");
  assert.equal(counts.formatPortfolioCount(2, "articles", "ar"), `${new Intl.NumberFormat("ar").format(2)} نصان`);
  const expectedWords = {
    sr: ["projekat", "projekta", "tekst", "tekstova", "dokumentarac", "dokumentaraca"],
    en: ["project", "projects", "article", "articles", "documentary", "documentaries"],
    tr: ["proje", "proje", "yazı", "yazı", "belgesel", "belgesel"],
    fr: ["projet", "projets", "texte", "textes", "documentaire", "documentaires"],
    de: ["Projekt", "Projekte", "Text", "Texte", "Dokumentarfilm", "Dokumentarfilme"],
    es: ["proyecto", "proyectos", "texto", "textos", "documental", "documentales"],
    el: ["έργο", "έργα", "κείμενο", "κείμενα", "ντοκιμαντέρ", "ντοκιμαντέρ"],
    ar: ["مشروع", "مشاريع", "نص", "نصوص", "فيلم وثائقي", "أفلام وثائقية"],
  };
  for (const lang of langs) {
    ["projects", "articles", "documentaries"].forEach((kind, index) => {
      assert.equal(counts.formatPortfolioCount(1, kind, lang), `${new Intl.NumberFormat(lang).format(1)} ${expectedWords[lang][index * 2]}`);
      const count = lang === "sr" && kind !== "projects" ? 6 : 3;
      assert.equal(counts.formatPortfolioCount(count, kind, lang), `${new Intl.NumberFormat(lang).format(count)} ${expectedWords[lang][index * 2 + 1]}`);
    });
  }

  const relation = { id: 10, slug: "film", title: "Translated title", director: "A displayed name" };
  const archive = [{ ...relation, title: "Canonical title", youtubeUrl: "https://youtu.be/abc", isActive: true }, { id: 11, slug: "unrelated-film", title: relation.title, director: relation.director, isActive: true }];
  const confirmed = docs.getCanonicalPortfolioDocumentaries([relation, { ...relation, title: "Duplicate" }], archive);
  assert.equal(confirmed.length, 1, "Matching free-text names/titles never adds an unrelated documentary");
  assert.equal(confirmed[0].youtubeUrl, archive[0].youtubeUrl, "A confirmed identity retains its archive video/link");
  assert.equal(docs.getCanonicalPortfolioDocumentaries([relation], []).length, 1, "A confirmed CMS relation survives an absent archive row");
  assert.equal(docs.getCanonicalPortfolioDocumentaries([relation], [{ ...archive[0], isActive: false }]).length, 0);
  const sevenFilms = Array.from({ length: 7 }, (_, i) => ({ ...relation, id: i + 20, slug: `film-${i}` }));
  assert.equal(docs.getCanonicalPortfolioDocumentaries(sevenFilms, []).length, 7, "Documentary total is independent of the preview limit");

  assert.equal(progress.getPortfolioTimelineProgress(1000, 2000, 900), 0);
  assert.equal(progress.getPortfolioTimelineProgress(-2200, 2000, 900), 1);
  const before = progress.getPortfolioTimelineProgress(300, 2000, 900);
  const down = progress.getPortfolioTimelineProgress(-200, 2000, 900);
  assert(down > before);
  assert.equal(progress.getPortfolioTimelineProgress(300, 2000, 900), before, "Upward scrolling reverses section-relative progress");
  assert.notEqual(progress.getPortfolioTimelineProgress(-200, 2500, 700), down, "Resize recalculates geometry rather than using document scroll percent");
  assert(progress.getPortfolioTimelineProgress(-700, 2000, 900) > down, "A direct section jump recomputes from its current position");
  assert.equal(progress.getPortfolioTimelineProgress(0, 0, 900), 0);

  if (process.argv[2]) {
    const fixture = (name) => JSON.parse(fs.readFileSync(path.join(process.argv[2], `${name}.json`), "utf8"));
    const catalog = unwrap(fixture("articles"));
    const members = unwrap(fixture("teamMembers"));
    const documentaryArchive = unwrap(fixture("documentaries"));
    const audit = fixture("audit");
    response = (url) => {
      const parsed = new URL(url, "https://fixture.test");
      if (parsed.pathname === "/api/team-members") return { data: members.filter((row) => row.slug === parsed.searchParams.get("filters[slug][$eq]")), meta: {} };
      const id = Number(parsed.searchParams.get("filters[authors][publicProfile][id][$eq]"));
      return { data: catalog.filter((row) => row.publishedAt && unwrap(row.authors).some((author) => author.publicProfile?.id === id)), meta: {} };
    };
    for (const expected of audit.profiles.filter((row) => row.active)) {
      for (const lang of langs) {
        const profile = await about.fetchTeamMemberBySlug(expected.slug, lang);
        assert.equal(profile.publishedArticleCount, expected.articles, `${expected.slug}/${lang}: canonical total agrees with the public CMS audit`);
        assert.equal(profile.projects.length, expected.projects);
        assert.equal(docs.getCanonicalPortfolioDocumentaries(profile.relatedDocumentaries, documentaryArchive).length, expected.documentaries);
      }
      console.log(`${expected.slug}: ${expected.articles} published articles, ${expected.projects} projects, ${expected.documentaries} confirmed documentaries`);
    }
  }
  console.log("Portfolio checks passed: canonical totals, pagination, failure retention, plurals (8 languages), documentary identity, reversible section progress.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
