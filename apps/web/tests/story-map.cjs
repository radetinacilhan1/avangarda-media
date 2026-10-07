/* Offline map regression checks: node apps/web/tests/story-map.cjs */
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
  return Array.isArray(data) ? data.map((item) => ({ ...(item.attributes || item), ...(item.id != null ? { id: item.id } : {}) })) : [];
};
const strapi = {
  unwrapStrapiCollection: unwrap,
  unwrapStrapiSingle: (value) => value?.data ?? value,
  getStrapiMediaUrl: (value) => value,
  strapiGet: async (url) => { calls.push(url); return typeof response === "function" ? response(url) : response; },
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
    module, exports: module.exports, process: { env: { NODE_ENV: "test" } }, URL, URLSearchParams,
    require: (name) => name === "@/lib/strapi" ? strapi : name.startsWith("@/") ? load(`${name.slice(2)}.ts`) : require(name),
  }, { filename });
  return module.exports;
}
const markers = load("lib/story-map-markers.ts");
const map = load("lib/story-map.ts");
const sourceQueries = load("lib/story-map-source.ts");
const galleries = load("lib/galleries.ts");
const ilhan = { id: 2, name: "Ilhan Radetinac", slug: "ilhan-radetinac", mapColor: "#111111", mapEffect: "pulse" };
const berina = { id: 1, name: "Berina Škrijelj", slug: "berina-skrijelj", mapColor: "#7C3AED", mapEffect: "ring" };
const rogozna = { name: "Rogozna", name_ar: "روغوزنا", slug: "rogozna", latitude: 43.014444, longitude: 20.58 };
const alias = { ...rogozna, name: "Rogozna field", slug: "rogozna-field" };
const belgrade = { name: "Beograd", name_ar: "بلغراد", slug: "beograd", latitude: 44.7866, longitude: 20.4489 };
const article = { id: 10, title: "A coauthored story", slug: "story", publishedAt: "2026-09-19", authors: [ilhan, berina], locations: [rogozna, alias, belgrade], topics: [] };
const documentary = { id: 20, title: "Film", slug: "film", description: "Film", date: "2026-09-19", mapLocation: "Rogozna", location: "روغوزنا", mapDirector: "Ilhan Radetinac", director: "Ilhan Radetinac", isActive: true };
const gallery = { id: 30, title: "Photos", slug: "photos", publishedAt: "2026-09-19", authors: [berina], locations: [alias], topics: [] };

async function main() {
  for (const lang of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
    const data = map.buildStoryMapData({ articles: [article, { ...article, title: "Translation duplicate" }], documentaries: [documentary, { ...documentary, id: 21, mapLocation: undefined, location: undefined }], galleries: [gallery, { ...gallery, id: 31, locations: [] }], lang });
    assert.equal(data.groups.length, 2, "exact coordinates share one group; absent locations never create coordinates");
    const group = data.groups.find((item) => item.locationSlugs.includes("rogozna"));
    assert.equal(group.totalCount, 3, "coauthors, location aliases and duplicate translations must not inflate story count");
    assert.equal(group.locationSlugs.length, 2, "both real location identities stay addressable");
    assert.equal(group.articleCount, 1);
    assert.equal(group.documentaryCount, 1);
    assert.equal(group.galleryCount, 1);
    assert.equal(group.latitude, rogozna.latitude);
    assert.equal(group.longitude, rogozna.longitude);
    assert.equal(group.authors.length, 2);
    assert.equal(group.authors.find((author) => author.id === "author-2").color, "#111111");
    assert.equal(group.authors.find((author) => author.id === "author-1").color, "#7C3AED");
    assert.equal(group.entries.find((entry) => entry.type === "documentary").authors[0].id, "author-2", "canonical documentary credit resolves to the populated author identity on every language");
    assert.equal(markers.summarizeMapStories(data.groups.flatMap((item) => item.entries)).totalCount, 3, "header and spatial cluster count each story once across locations");
    assert.equal(markers.getStoryMapMarkerKind(markers.summarizeMapStories(group.entries)), "mixed");
    const filtered = group.entries.filter((entry) => entry.type === "gallery");
    const summary = markers.summarizeMapStories(filtered);
    assert.equal(summary.totalCount, 1);
    assert.equal(summary.authors.length, 1, "filter recomputes colors from visible content");
    assert.equal(summary.authors[0].color, "#7C3AED");
    assert.equal(markers.getStoryMapMarkerKind(summary), "gallery");
    assert(markers.getStoryMapAuthorBackground(group.authors).includes("#111111"));
    assert(markers.getStoryMapAuthorBackground(group.authors).includes("#7C3AED"));
    assert.equal(markers.getStoryMapEffect(group.authors), "ring", "a shared marker uses one controlled effect");
    assert.equal(map.getStoryMapCopy(lang).galleriesLabel.length > 0, true);
    assert.equal(map.getStoryMapCopy(lang).legendLabel.length > 0, true);
  }
  const invalid = map.buildStoryMapData({ articles: [{ ...article, locations: [{ ...rogozna, latitude: 91 }, { ...belgrade, active: false }] }], documentaries: [{ ...documentary, mapLocation: "Unknown place", location: "Unknown place" }], lang: "sr" });
  assert.equal(invalid.groups.length, 0, "invalid, inactive and unknown locations are excluded");
  assert(map.resolveExistingStoryLocationHref({ name: "Rogozna", slug: "rogozna" }, "sr").includes("location=rogozna"));
  assert.equal(map.resolveExistingStoryLocationHref({ name: "Unknown location", slug: "unknown" }, "sr"), undefined);
  assert.equal(map.resolveExistingStoryLocationHref({ ...rogozna, active: false }, "sr"), undefined);
  assert.equal(map.resolveExistingStoryLocationHref({ ...rogozna, latitude: 91 }, "sr"), undefined);
  const fallback = markers.getStoryMapAuthorColor("author-999", "not-a-color");
  assert.equal(markers.getStoryMapAuthorColor("author-999"), fallback, "fallback is stable across refreshes");
  assert(markers.STORY_MAP_AUTHOR_PALETTE.includes(fallback));
  assert.equal(markers.getStoryMapAuthorColor("author-999", "#abcdef"), "#ABCDEF");
  assert.equal(markers.getStoryMapAuthorColor("ilhan-radetinac"), "#111111");
  assert.equal(markers.getStoryMapAuthorColor("berina-skrijelj"), "#7C3AED");
  assert.equal(markers.getStoryMapMarkerKind(markers.summarizeMapStories([{ id: "a", type: "article", authors: [] }])), "article");
  assert.equal(markers.getStoryMapMarkerKind(markers.summarizeMapStories([{ id: "d", type: "documentary", authors: [] }])), "documentary");

  for (const lang of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
    calls.length = 0;
    response = { data: [article], meta: {} };
    const articles = await sourceQueries.fetchStoryMapArticles(lang);
    assert.equal(articles.length, 1);
    response = { data: [gallery], meta: {} };
    assert.equal((await galleries.fetchStoryMapGalleries(lang)).length, 1);
    for (const url of calls) {
      const params = new URLSearchParams(url.split("?")[1]);
      const fieldValues = [...params].filter(([key]) => key.includes("fields")).map(([, value]) => value);
      assert(!fieldValues.includes("content"));
      assert(!/images|cover|bodyImages/.test(url));
      assert(fieldValues.includes("mapColor") && fieldValues.includes("mapEffect"));
      assert(fieldValues.includes("latitude") && fieldValues.includes("longitude"));
      assert(fieldValues.includes("title"));
      if (lang !== "sr") assert(fieldValues.includes(`title_${lang}`));
    }
  }
  calls.length = 0;
  response = (url) => new URLSearchParams(url.split("?")[1]).get("pagination[page]") === "1" ? { data: Array.from({ length: 100 }, (_, id) => ({ ...article, id })), meta: { pagination: { pageCount: 2 } } } : { data: [{ ...article, id: 101 }], meta: { pagination: { pageCount: 2 } } };
  assert.equal((await sourceQueries.fetchStoryMapArticles("sr")).length, 101, "standard REST catalog pagination is complete");
  assert.equal(calls.length, 2);
  calls.length = 0;
  response = { data: Array.from({ length: 120 }, (_, id) => ({ ...article, id })), meta: {} };
  assert.equal((await sourceQueries.fetchStoryMapArticles("sr")).length, 120, "existing complete publicFind responses do not loop or truncate");
  assert.equal(calls.length, 1);
  console.log("story-map: identity, author segments, unique counts, filters, coordinates, shapes, eight languages and projected sources passed");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
