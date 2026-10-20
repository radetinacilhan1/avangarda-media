/* Offline archive regression suite: no network, CMS writes or user data. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = path.resolve(__dirname, '../src');
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} }; cache.set(file, module.exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(source, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, URLSearchParams, Intl, Set, Map, ...overrides,
      require: (name) => name in overrides ? overrides[name] : name.startsWith('@/') ? load(name.slice(2) + (name.includes('components/') ? '.tsx' : '.ts')) : require(name),
    }, { filename: file });
    cache.set(file, module.exports); return module.exports;
  }
  return load;
}
const unwrap = (value) => (Array.isArray(value) ? value : value?.data || []).map((item) => ({ ...item.attributes, ...item }));
const strapi = { unwrapStrapiCollection: unwrap, getStrapiMediaUrl: (url) => `https://cms.example${url}`, formatDisplayDate: (date) => date || '' };
const editorial = { getArticleYear: (article) => article.year || (article.publishedAt ? new Date(article.publishedAt).getFullYear() : null) };
const load = loader({ '@/lib/strapi': strapi, '@/lib/editorial': editorial });
const state = load('lib/archive-catalogue-state.ts');
const { buildArchiveCatalogue } = load('lib/archive-catalogue.ts');
const empty = state.readArchiveState(new URLSearchParams());
const langs = ['sr', 'en', 'tr', 'fr', 'de', 'es', 'el', 'ar'];
const records = Array.from({ length: 287 }, (_, index) => ({
  id: index + 1, slug: `story-${index + 1}`, title: `Full title ${index + 1}`, subtitle: `Description ${index + 1}`,
  content: `Server-only body needle-${index + 1}`, section: index < 180 ? 'analysis' : 'column',
  publishedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(), year: index < 180 ? 2026 : 2025,
  style: index < 180 ? 'analiza' : 'kolumna',
  topics: [{ id: index < 180 ? 1 : 2, slug: index < 180 ? 'democracy' : 'society', name: index < 180 ? 'Demokratija' : 'Društvo', name_en: index < 180 ? 'Democracy' : 'Society', name_ar: index < 180 ? 'الديمقراطية' : 'المجتمع' }],
  authors: [{ id: index < 180 ? 11 : 12, slug: index < 180 ? 'author-a' : 'author-b', name: index < 180 ? 'Author A' : 'Author B' }],
  locations: [{ id: index < 180 ? 21 : 22, slug: index < 180 ? 'belgrade' : 'pazar', name: index < 180 ? 'Beograd' : 'Novi Pazar', name_en: index < 180 ? 'Belgrade' : 'Novi Pazar' }],
  ...(index % 3 ? { cover: { url: '/image.jpg', formats: { small: { url: '/small.jpg' } } } } : {}),
}));

async function run() {
  for (const lang of langs) {
    const initial = buildArchiveCatalogue(records, lang, empty);
    assert.equal(initial.total, 287); assert.equal(initial.pageCount, 24); assert.equal(initial.items.length, 12);
    assert.equal(initial.items[0].id, '287');
    const ids = [];
    for (let page = 1; page <= initial.pageCount; page++) ids.push(...buildArchiveCatalogue(records, lang, { ...empty, page }).items.map((item) => item.id));
    assert.equal(ids.length, 287); assert.equal(new Set(ids).size, 287, 'All records beyond the old 240 cap appear exactly once');
    assert(!JSON.stringify(initial).includes('Server-only body'), 'Bodies never enter card/facet/client payload');
    assert.deepEqual(Object.keys(initial.items[0]).sort(), ['author', 'chips', 'date', 'excerpt', 'href', 'id', 'imageUrl', 'section', 'title'].sort());
    const narrowed = buildArchiveCatalogue(records, lang, { ...empty, section: 'analysis' });
    assert.equal(narrowed.total, 180); assert.equal(narrowed.facets.author.length, 1); assert.equal(narrowed.facets.topic.length, 1);
    assert.equal(narrowed.facets.year[0].value, '2026'); assert.equal(narrowed.facets.location[0].value, 'belgrade');
    assert.equal(narrowed.facets.section.length, 2, 'Own facet is excluded so an earlier selection can be changed');
    const incompatible = buildArchiveCatalogue(records, lang, { ...empty, section: 'analysis', author: 'author-b', year: '2026' }, 'author');
    assert.equal(incompatible.filters.author, 'author-b'); assert.equal(incompatible.filters.section, ''); assert.equal(incompatible.filters.year, '');
    assert.deepEqual([...incompatible.cleared], ['section', 'year'], 'Newest choice takes priority and incompatible selections are announced');
    const compatible = buildArchiveCatalogue(records, lang, { ...empty, section: 'analysis', author: 'author-a', topic: 'democracy', year: '2026', style: 'analiza', location: 'belgrade' }, 'location');
    assert.equal(compatible.cleared.length, 0); assert.equal(compatible.total, 180);
    const invalid = buildArchiveCatalogue(records, lang, { ...empty, topic: 'missing' });
    assert.deepEqual([...invalid.cleared], ['topic']); assert.equal(invalid.total, 287);
    const none = buildArchiveCatalogue(records, lang, { ...empty, q: 'definitely no matching article', section: 'analysis' });
    assert.equal(none.total, 0); assert.equal(none.items.length, 0); assert.equal(none.featured.length, 0, 'No unrelated featured fallback on zero results');
    assert.equal(none.filters.section, 'analysis'); assert.equal(none.facets.section[0].count, 0);
    const body = buildArchiveCatalogue(records, lang, { ...empty, q: 'needle-287' });
    assert.equal(body.total, 1); assert.equal(body.items[0].id, '287');
    assert.equal(buildArchiveCatalogue(records, lang, { ...empty, sort: 'oldest' }).items[0].id, '1');
    const clamped = buildArchiveCatalogue(records, lang, { ...empty, page: 1000000 }); assert.equal(clamped.page, 24); assert.equal(clamped.items.length, 11);
    const href = state.archiveHref(lang, { ...empty, author: 'author-a', sort: 'oldest', page: 2 });
    assert.equal(href, `/${lang}/archive?author=author-a&sort=oldest&page=2`);
    assert.equal(state.readArchiveState(new URL(href, 'https://example.test').searchParams).author, 'author-a');
  }
  assert.equal(buildArchiveCatalogue(records, 'en', { ...empty, topic: 'Demokratija' }).filters.topic, 'democracy', 'Legacy names map using the same relation record');
  assert.equal(buildArchiveCatalogue(records, 'en', { ...empty, topic: 'Democracy' }).filters.topic, 'democracy');
  const ambiguous = [{ ...records[0], topics: [{ id: 91, slug: 'one', name: 'Shared' }] }, { ...records[1], topics: [{ id: 92, slug: 'two', name: 'Shared' }] }];
  assert.equal(buildArchiveCatalogue(ambiguous, 'en', { ...empty, topic: 'Shared' }).filters.topic, '', 'Ambiguous aliases never guess taxonomy identity');
  assert.equal(buildArchiveCatalogue(records, 'ar', empty).facets.topic.find((item) => item.value === 'democracy').label, 'الديمقراطية');
  assert.equal(buildArchiveCatalogue(records, 'es', empty).facets.style.find((item) => item.value === 'analiza').label, 'Análisis');
  assert.equal(state.readArchiveState(new URLSearchParams('page=NaN&section=vesti')).page, 1); assert.equal(state.readArchiveState(new URLSearchParams('section=vesti')).section, 'front');

  // Exercise actual source projection with flat public-controller responses,
  // changing caps, explicit empty tail, Strapi wrapping and failed pages.
  for (const includeContent of [false, true]) {
    const requests = [];
    const fetchLoad = loader({ '@/lib/strapi': { ...strapi, strapiGet: async (url) => {
      const params = new URL(url, 'https://cms.example').searchParams; const start = Number(params.get('start'));
      requests.push(params); const cap = Math.min(Number(params.get('limit')), start < 100 ? 17 : 23);
      return { data: records.slice(start, start + cap), meta: {} };
    } } });
    const result = await fetchLoad('lib/archive-source.ts').fetchArchiveArticles('ar', includeContent);
    assert.equal(result.length, 287); assert.equal(new Set(result.map((row) => row.id)).size, 287);
    assert.equal(Number(requests.at(-1).get('start')), 287, 'Short batches do not silently stop the scan');
    assert(requests.every((params) => params.get('sort[0]') === 'id:asc'));
    assert(requests.every((params) => params.get('pagination[pageSize]') === null));
    const keys = [...requests[0].values()];
    assert(keys.includes('title_ar')); assert(!keys.includes('title_en'));
    assert.equal(keys.includes('content'), includeContent); assert.equal(keys.includes('content_ar'), includeContent);
    assert(!keys.includes('content_en') && !keys.includes('bodyImages') && !keys.includes('imageCredits'));
    assert.equal(requests[0].get('limit'), includeContent ? '10' : '100');
  }
  const repeat = loader({ '@/lib/strapi': { ...strapi, strapiGet: async () => ({ data: records.slice(0, 2) }) } });
  await assert.rejects(() => repeat('lib/archive-source.ts').fetchArchiveArticles('en'), /repeated/);
  let calls = 0;
  const failed = loader({ '@/lib/strapi': { ...strapi, strapiGet: async () => ++calls === 1 ? { data: records.slice(0, 2) } : null } });
  await assert.rejects(() => failed('lib/archive-source.ts').fetchArchiveArticles('en'), /unavailable/);
  const incomplete = loader({ '@/lib/strapi': { ...strapi, strapiGet: async (url) => ({ data: new URL(url, 'https://cms.example').searchParams.get('start') === '0' ? records.slice(0, 2) : [], meta: { pagination: { total: 287 } } }) } });
  await assert.rejects(() => incomplete('lib/archive-source.ts').fetchArchiveArticles('en'), /incomplete/);
  console.log('PASS archive catalogue: 287 records beyond cap; 8 languages; 12/page; full-set dependent disjunctive facets; newest choice priority; compatible/invalid/ambiguous aliases; zero featured; sort/URL; small source projections; capped offset scan, empty tail and fail-closed errors');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
