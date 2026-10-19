const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, requireMock = () => { throw new Error('Unexpected runtime dependency'); }, globals = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, URLSearchParams, Intl, Set, Map, ...globals });
  return module.exports;
}
const catalogue = load('src/lib/legal-catalogue.ts');
const { buildLegalCatalogue, readLegalCatalogueState, legalCatalogueHref, legalCatalogueQuery, LEGAL_FACETS } = catalogue;
const state = (values = {}) => ({ q: '', type: '', area: '', framework: '', right: '', page: 1, ...values });
const resource = (id, values = {}) => ({
  id, slug: `resource-${String(id).padStart(3, '0')}`, title: `Resource ${id}`, shortDescription: 'A concise preview',
  type: 'law', countryOrFramework: 'serbia', legalAreaKey: 'Rad', legalArea: 'Work',
  body: 'A private server-only body phrase', whatIsThisFor: '', whoCanUseIt: '', whenToUseIt: '', sourceName: '',
  tags: [], relatedHumanRights: [{ id: 1, slug: 'work', title: 'Work right' }], ...values,
});
const labels = { types: { law: 'Law', guide: 'Guide', template: 'Template' }, frameworks: { serbia: 'Serbia', eu: 'EU' } };
const languages = ['sr', 'en', 'tr', 'fr', 'de', 'es', 'el', 'ar'];
const records = Array.from({ length: 173 }, (_, index) => resource(index + 1));
for (const lang of languages) {
  const ordered = [...records].sort((left, right) => new Intl.Collator(catalogue.legalCatalogueLocales[lang], { sensitivity: 'base', numeric: true }).compare(left.title, right.title));
  const visited = [];
  for (let page = 1; page <= 15; page++) {
    const result = buildLegalCatalogue([...records].reverse(), lang, state({ page }), labels);
    assert.equal(result.pageCount, 15);
    assert.equal(result.total, 173);
    assert.equal(result.items.length, page === 15 ? 5 : 12);
    assert.equal(result.from, (page - 1) * 12 + 1);
    assert.equal(result.to, Math.min(page * 12, 173));
    visited.push(...result.items.map((item) => item.slug));
    assert.equal(JSON.stringify(result).includes('private server-only body'), false, 'Never serialize full bodies');
    const href = new URL(legalCatalogueHref(lang, state({ page, q: 'café & law', area: 'Rad' })), 'https://avangarda.media');
    assert.equal(href.pathname, `/${lang}/pravni-kompas`);
    assert.deepEqual(JSON.parse(JSON.stringify(readLegalCatalogueState(href.searchParams))), state({ page, q: 'café & law', area: 'Rad' }));
  }
  assert.deepEqual(visited, ordered.map((item) => item.slug));
  assert.equal(new Set(visited).size, 173, 'Pagination must have no omissions or duplicates at any viewport');
  const bodySearch = buildLegalCatalogue(records, lang, state({ q: 'server-only body phrase' }), labels);
  assert.equal(bodySearch.total, 173, 'Search still includes legal bodies on server');
}

const mixed = [
  resource(1), resource(2),
  resource(3, { type: 'guide', countryOrFramework: 'eu', legalAreaKey: 'Okolina', legalArea: 'Environment', relatedHumanRights: [{ id: 2, slug: 'environment', title: 'Environment right' }] }),
  resource(4, { type: 'template', legalAreaKey: 'Postupak', legalArea: 'Procedure' }),
];
let result = buildLegalCatalogue(mixed, 'en', state({ type: 'law' }), labels);
assert.deepEqual(Array.from(result.facets.area, (option) => [option.value, option.count]), [['Rad', 2]]);
assert.deepEqual(Array.from(result.facets.framework, (option) => option.value), ['serbia']);
assert.deepEqual(Array.from(result.facets.right, (option) => option.value), ['work']);
assert.deepEqual(Array.from(result.facets.type, (option) => [option.value, option.count]), [['guide', 1], ['law', 2], ['template', 1]], 'Own facet counts exclude itself, across all records');
result = buildLegalCatalogue(mixed, 'en', state({ type: 'law', area: 'Okolina', right: 'environment' }), labels, 'area');
assert.equal(result.filters.area, 'Okolina');
assert.equal(result.filters.type, '');
assert.equal(result.filters.right, 'environment');
assert.deepEqual(Array.from(result.cleared), ['type']);
assert.equal(result.total, 1);
result = buildLegalCatalogue(mixed, 'en', state({ type: 'guide', framework: 'eu', right: 'work' }), labels, 'type');
assert.equal(result.filters.framework, 'eu');
assert.equal(result.filters.right, '');
assert.deepEqual(Array.from(result.cleared), ['right']);
result = buildLegalCatalogue(mixed, 'en', state({ area: 'Environment' }), labels);
assert.equal(result.filters.area, 'Okolina', 'Resolve a legacy label using its exact raw/base field pair');
result = buildLegalCatalogue([...mixed, resource(5, { legalAreaKey: 'Different base', legalArea: 'Environment' })], 'en', state({ area: 'Environment' }), labels);
assert.equal(result.filters.area, '', 'Never guess an ambiguous legacy translated area identity');
assert.deepEqual(Array.from(result.cleared), ['area']);
result = buildLegalCatalogue([resource(1, { legalAreaKey: '', legalArea: 'Translated-only area' })], 'en', state(), labels);
assert.equal(result.facets.area.length, 0, 'A known empty base identity must not become a translated identity');
result = buildLegalCatalogue(mixed, 'en', state({ q: 'no such legal phrase', type: 'law', page: 99 }), labels);
assert.equal(result.total, 0); assert.equal(result.page, 1); assert.equal(result.from, 0); assert.equal(result.to, 0);
assert.equal(result.filters.type, 'law', 'A no-result text search must not silently discard a valid facet');
assert.equal(result.facets.type.find((option) => option.value === 'law').count, 0);
result = buildLegalCatalogue(mixed, 'en', state({ right: 'invalid', type: 'unknown', page: 99 }), labels);
assert.equal(result.total, 4); assert.equal(result.page, 1); assert.equal(result.cleared.length, 2);
const duplicates = [resource(2, { title: 'Equal' }), resource(1, { title: 'equal' })];
assert.deepEqual(Array.from(buildLegalCatalogue(duplicates, 'en', state(), labels).items, (item) => item.slug), ['resource-001', 'resource-002']);
assert.equal(buildLegalCatalogue([resource(1, { title: 'IŞIK' })], 'tr', state({ q: 'ışık' }), labels).total, 1);
assert.equal(legalCatalogueQuery(state({ page: 1 })), '');
assert.equal(readLegalCatalogueState(new URLSearchParams('page=-1')).page, 1);
assert.equal(readLegalCatalogueState(new URLSearchParams('page=2.5')).page, 1);

async function sourcePaginationTests() {
  let calls = [];
  let responseFor;
  const helpers = load('src/lib/human-rights.ts', (name) => {
    if (name === '@/lib/i18n') return { withLang: (url, lang) => `/${lang}${url}` };
    if (name === '@/lib/strapi') return {
      strapiGet: async (url) => { calls.push(url); return responseFor(new URL(url, 'https://cms.avangarda.media')); },
      unwrapStrapiCollection: (response) => response?.data?.map((record) => ({ ...(record.attributes || record), id: record.id })) || [],
      unwrapStrapiSingle: (response) => response?.data || null,
      getStrapiMediaUrl: (url) => url,
    };
    throw new Error(name);
  });
  const batch = (start, count) => Array.from({ length: count }, (_, index) => ({ id: start + index, title: `Record ${start + index}`, slug: `record-${start + index}`, legalArea: 'Rad', legalArea_en: 'Work' }));
  responseFor = (url) => {
    const start = Number(url.searchParams.get('start'));
    // Mirror the actual custom public controller: flat records, meta: {},
    // EntityService start/limit, and no support for nested REST pagination.
    // A configured 25-record cap must still return all 173.
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(url.searchParams.has('pagination[page]'), false);
    return { data: batch(start + 1, Math.max(0, Math.min(25, 173 - start))), meta: {} };
  };
  let fetched = await helpers.fetchLegalResources('en');
  assert.equal(fetched.length, 173); assert.equal(calls.length, 8);
  assert.equal(new URL(calls[7], 'https://cms.avangarda.media').searchParams.get('start'), '173');
  assert.equal(fetched[0].legalAreaKey, 'Rad'); assert.equal(fetched[0].legalArea, 'Work');
  assert.ok(calls.every((url) => url.includes('sort[3]=id:asc') && url.includes('publicationState=live')));
  calls = [];
  responseFor = (url) => ({ data: Number(url.searchParams.get('start')) === 0 ? batch(1, 2) : [], meta: {} });
  fetched = await helpers.fetchLegalResources('sr');
  assert.equal(fetched.length, 2); assert.equal(calls.length, 2, 'Without metadata prove exhaustion with the following page');
  responseFor = () => ({ data: batch(1, 2), meta: { pagination: { pageCount: 2, total: 4 } } });
  await assert.rejects(helpers.fetchLegalResources('en'), /repeated a record/);
  responseFor = (url) => ({ data: Number(url.searchParams.get('start')) === 0 ? batch(1, 2) : [], meta: { pagination: { total: 5 } } });
  await assert.rejects(helpers.fetchLegalResources('en'), /incomplete/);
  responseFor = () => null;
  await assert.rejects(helpers.fetchLegalResources('en'), /unavailable/);
  responseFor = () => ({ data: [], meta: { pagination: { pageCount: 0, total: 0 } } });
  assert.equal((await helpers.fetchLegalResources('en')).length, 0);
  responseFor = () => ({ data: batch(1, 2), meta: { pagination: { total: 1 } } });
  await assert.rejects(helpers.fetchLegalResources('en'), /inconsistent total/);
  responseFor = () => ({ data: batch(1, 2), meta: { pagination: { total: 2 } } });
  calls = [];
  assert.equal((await helpers.fetchLegalResources('en')).length, 2);
  assert.equal(calls.length, 1, 'Trust a consistent explicit total when the source provides it');
}

sourcePaginationTests().then(() => console.log('PASS catalogue: 173 records beyond CMS cap; all 8 locale sorts; 12/page; full-set cascading counts; base-area identities/legacy aliases; normalization; empty sets; body search; preview-only payload; stable URL state; incomplete/repeated source rejection'))
  .catch((error) => { console.error(error); process.exitCode = 1; });
