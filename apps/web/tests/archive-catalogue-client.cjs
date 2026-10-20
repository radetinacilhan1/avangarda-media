/* Deterministic real-component event tests. No network or CMS writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = path.resolve(__dirname, '../src');
const styles = { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
let globals = {};
let react;
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.join(source, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, URLSearchParams, Intl, Set, Map, ...globals,
      require: (name) => name in overrides ? overrides[name] : name.endsWith('.module.css') ? styles : name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : name.startsWith('@/') ? load(name.slice(2) + (name.includes('components/') ? '.tsx' : '.ts')) : require(name),
    }, { filename: file });
    cache.set(file, module.exports); return module.exports;
  } return load;
}
const strapi = { unwrapStrapiCollection: (value) => Array.isArray(value) ? value : value?.data || [], getStrapiMediaUrl: (url) => url, formatDisplayDate: (date) => date || '' };
const overrides = { '@/lib/strapi': strapi, '@/lib/editorial': { getArticleYear: (article) => article.year || 2026 } };
const load = loader(overrides);
const state = load('lib/archive-catalogue-state.ts');
const { buildArchiveCatalogue } = load('lib/archive-catalogue.ts');
const empty = state.readArchiveState(new URLSearchParams());
const records = Array.from({ length: 27 }, (_, index) => ({ id: index + 1, slug: `story-${index + 1}`, title: `Story ${index + 1}`, subtitle: 'Preview', content: 'Server secret body', section: index < 25 ? 'analysis' : 'column', year: 2026, publishedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(), style: index < 25 ? 'analiza' : 'kolumna', topics: [], authors: [], locations: [] }));
const initial = buildArchiveCatalogue(records, 'en', empty);
const copy = { ...load('lib/archive-copy.ts').getArchiveCopy('en'), searchLabel: 'Search', sectionLabel: 'Section', clearFilters: 'Clear filters', remove: 'Remove filter', retry: 'Retry' };
const hooks = []; let hookIndex = 0; let effects = [];
const depsEqual = (left, right) => left && right && left.length === right.length && left.every((entry, index) => entry === right[index]);
react = {
  useState(value) { const index = hookIndex++; if (!(index in hooks)) hooks[index] = typeof value === 'function' ? value() : value; return [hooks[index], (next) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }]; },
  useRef(value) { const index = hookIndex++; if (!(index in hooks)) hooks[index] = { current: value }; return hooks[index]; },
  useCallback(callback, deps) { const index = hookIndex++; if (!hooks[index] || !depsEqual(hooks[index].deps, deps)) hooks[index] = { callback, deps }; return hooks[index].callback; },
  useEffect(effect, deps) { const index = hookIndex++; if (!hooks[index] || !depsEqual(hooks[index].deps, deps)) effects.push(() => { hooks[index]?.cleanup?.(); hooks[index] = { deps, cleanup: effect() }; }); },
};
function jsx(type, props) { return typeof type === 'function' ? type(props) : { type, props }; }
let location = new URL('https://avangarda.media/en/archive');
const listeners = new Map(); const history = []; const requests = []; const timers = new Map(); let timer = 0;
globals = { AbortController, setTimeout: (callback) => { const id = ++timer; timers.set(id, callback); return id; }, clearTimeout: (id) => timers.delete(id), window: {
  get location() { return location; }, history: { pushState(_, __, href) { history.push(['push', href]); location = new URL(href, location); }, replaceState(_, __, href) { history.push(['replace', href]); location = new URL(href, location); } },
  addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: (name) => listeners.delete(name),
}, fetch: (url, options) => new Promise((resolve, reject) => requests.push({ url, options, resolve, reject })) };
const { ArchiveCatalogue } = loader(overrides)('components/archive-catalogue.tsx');
let tree;
function render() { hookIndex = 0; tree = ArchiveCatalogue({ lang: 'en', initial, copy }); const next = effects; effects = []; next.forEach((effect) => effect()); return tree; }
function nodes(node, output = []) { if (arguments.length === 0) node = tree; if (!node || typeof node !== 'object') return output; if (Array.isArray(node)) { node.forEach((entry) => nodes(entry, output)); return output; } output.push(node); nodes(node.props?.children, output); return output; }
function find(predicate) { const match = nodes().find(predicate); assert.ok(match, 'Expected rendered control'); return match; }
const input = () => find((node) => node.type === 'input' && node.props.name === 'q');
const select = (key) => find((node) => node.type === 'select' && node.props.name === key);
const cards = () => nodes().filter((node) => node.props?.className === 'page-grid archive-grid').flatMap((node) => node.props.children);
const event = (extra = {}) => ({ button: 0, preventDefault() { this.prevented = true; }, ...extra });
function flush() { const queued = [...timers.values()]; timers.clear(); queued.forEach((callback) => callback()); }
async function settle() { await new Promise(setImmediate); }
function response(request, result) { request.resolve({ ok: true, json: async () => result }); }
const result = (next, changed) => buildArchiveCatalogue(records, 'en', { ...empty, ...next }, changed);

async function run() {
  render(); render(); assert.equal(cards().length, 12);
  assert.equal(select('sort').props.children[0].props.value, 'newest');
  const form = find((node) => node.type === 'form'); assert.equal(form.props.action, '/en/archive');
  assert.equal(select('sort').props.name, 'sort', 'Sorting has an independent labelled control');
  const next = find((node) => node.type === 'a' && node.props.rel === 'next'); assert.equal(next.props.href, '/en/archive?page=2');
  const modified = event({ ctrlKey: true }); next.props.onClick(modified); assert.equal(modified.prevented, undefined); assert.equal(requests.length, 0);

  input().props.onChange({ target: { value: 'first' } }); render(); assert.equal(requests.length, 0); assert.equal(timers.size, 1); flush();
  input().props.onChange({ target: { value: 'second' } }); render(); assert.equal(requests[0].options.signal.aborted, true);
  response(requests[0], result({ q: 'first' })); await settle(); render(); assert.equal(input().props.value, 'second'); assert.equal(history.length, 0);
  flush(); response(requests[1], result({ q: 'second' })); await settle(); render(); assert.equal(location.search, '?q=second'); assert.equal(cards().length, 0);
  assert.equal(nodes().filter((node) => node.props?.className === 'archive-spotlight').length, 0, 'Empty search has no unrelated featured stories');

  select('section').props.onChange({ target: { value: 'analysis' } }); assert.equal(requests.length, 3); assert.equal(new URL(requests[2].url, location).searchParams.get('changed'), 'section');
  location = new URL('https://avangarda.media/en/archive?section=column'); listeners.get('popstate')(); render(); assert.equal(requests[2].options.signal.aborted, true);
  response(requests[2], result({ q: 'second', section: 'analysis' })); response(requests[3], result({ section: 'column' })); await settle(); render();
  assert.equal(select('section').props.value, 'column'); assert.equal(input().props.value, ''); assert.equal(cards().length, 2); assert.equal(history.length, 1);
  assert.equal(select('style').props.children[1][0].props.value, 'kolumna', 'Dependent options update with the applied section');

  // New search intent survives an old chip click and stale page links.
  input().props.onChange({ target: { value: 'Story ' } }); render();
  const chip = find((node) => node.type === 'a' && node.props['aria-label']?.startsWith('Remove filter: Section'));
  chip.props.onClick(event()); assert.equal(timers.size, 0); assert.equal(new URL(requests.at(-1).url, location).searchParams.get('q'), 'Story ');
  response(requests.at(-1), result({ q: 'Story' })); await settle(); render(); assert.equal(input().props.value, 'Story '); assert.equal(location.search, '?q=Story');
  input().props.onChange({ target: { value: input().props.value + '2' } }); render();
  const pendingNext = find((node) => node.type === 'a' && node.props.rel === 'next'); assert.equal(pendingNext.props['aria-disabled'], true);
  const pendingClick = event(); const count = requests.length; pendingNext.props.onClick(pendingClick); assert.equal(pendingClick.prevented, true); assert.equal(requests.length, count); assert.equal(timers.size, 1);
  flush(); assert.equal(new URL(requests.at(-1).url, location).searchParams.get('q'), 'Story 2'); response(requests.at(-1), result({ q: 'Story 2' })); await settle(); render();
  assert.equal(input().props.value, 'Story 2');
  input().props.onChange({ target: { value: 'pending clear' } }); render();
  find((node) => node.type === 'a' && node.props.children === 'Clear filters').props.onClick(event()); assert.equal(timers.size, 0); assert.equal(new URL(requests.at(-1).url, location).searchParams.has('q'), false);
  response(requests.at(-1), initial); await settle(); render(); assert.equal(location.search, ''); assert.equal(cards().length, 12);

  location = new URL('https://avangarda.media/en/archive?page=2&sort=oldest'); listeners.get('popstate')(); response(requests.at(-1), result({ page: 2, sort: 'oldest' })); await settle(); render();
  assert.equal(select('sort').props.value, 'oldest'); assert.equal(find((node) => node.type === 'a' && node.props['aria-current'] === 'page').props.children, 2);
  select('section').props.onChange({ target: { value: 'analysis' } }); const facetRequest = new URL(requests.at(-1).url, location);
  assert.equal(facetRequest.searchParams.has('page'), false, 'Every filter resets the current page'); assert.equal(facetRequest.searchParams.get('sort'), 'oldest');
  response(requests.at(-1), result({ section: 'analysis', sort: 'oldest' })); await settle(); render(); assert.equal(cards()[0].props['data-archive-id'], '1');

  input().props.onChange({ target: { value: 'offline' } }); flush(); requests.at(-1).resolve({ ok: false }); await settle(); render(); assert.equal(cards().length, 12); assert(find((node) => node.props?.role === 'alert'));
  const beforeRetry = history.length; find((node) => node.type === 'button' && node.props.children === 'Retry').props.onClick(); response(requests.at(-1), result({ q: 'offline', section: 'analysis', sort: 'oldest' })); await settle(); render(); assert.equal(history.length, beforeRetry + 1);
  // Retrying failed Back restoration must not create a new history entry.
  location = new URL('https://avangarda.media/en/archive'); listeners.get('popstate')(); requests.at(-1).resolve({ ok: false }); await settle(); render();
  const historyBeforeBackRetry = history.length; find((node) => node.type === 'button' && node.props.children === 'Retry').props.onClick(); response(requests.at(-1), initial); await settle(); render(); assert.equal(history.length, historyBeforeBackRetry);

  const protocol = fs.readFileSync(path.join(source, 'lib/archive-catalogue-state.ts'), 'utf8');
  assert(!/from ["']@\/lib\/(editorial|content|strapi|fallback-content)["']/.test(protocol), 'Browser protocol does not import full article bodies or server source adapters');
  console.log('PASS real archive client: immediate dependent selects; separate sorting; 12/page links; debounce/abort/stale guard; Back/Forward and retry intent; pending chip/page/reset races; preserved multiword input; empty featured; labelled native controls; browser-safe projection boundary');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
