/* Regression: custom publicFind returns a full filtered array with meta: {}. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const moduleUnderTest = { exports: {} };
let responses = [], requests = [];
const mocks = {
  '@/lib/content': {},
  '@/lib/fallback-content': {},
  '@/lib/runtime-content': { isDemoContentEnabled: () => false },
  '@/lib/sections': {},
  '@/lib/strapi': { strapiGet: async (url) => { requests.push(url); return responses.shift(); } }
};
const js = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/editorial.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
new Function('require', 'module', 'exports', js)(id => mocks[id] || require(id), moduleUnderTest, moduleUnderTest.exports);
const full = count => ({ data: Array.from({ length: count }, (_, id) => ({ id })), meta: {} });
const paginated = total => ({ data: [{ id: 1 }], meta: { pagination: { total } } });
async function check(input, expected) {
  responses = input; requests = [];
  const actual = await moduleUnderTest.exports.fetchHomepageImpactMetrics();
  assert.deepEqual(Object.values(actual), expected);
  assert.equal(requests.length, 4, 'reuse the four existing CMS requests');
  assert.ok(requests[3].includes('filters[publishedAt][$gte]='), 'recent count remains filtered');
}
(async () => {
  await check([full(25), full(23), full(10), full(0)], [25, 23, 10, 0]);
  await check([paginated(150), paginated(23), paginated(10), paginated(0)], [150, 23, 10, 0]);
  await check([null, full(0), {}, { error: { status: 503 } }], [null, 0, null, null]);
  await check([null, null, null, null], [null, null, null, null]);
  await check([
    { data: [{ id: 1 }], meta: { pagination: {} } },
    { data: [{ id: 1 }], meta: { pagination: { total: NaN } } },
    { data: { id: 1 }, meta: {} },
    { data: null, meta: {} }
  ], [null, null, null, null]);
  console.log('PASS: full custom CMS collections, official totals, empty vs unavailable, malformed pagination and unchanged request count.');
})().catch(error => { console.error(error); process.exitCode = 1; });
