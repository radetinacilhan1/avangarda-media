const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function compile(file, mocks = {}, globals = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require: (name) => {
    if (name in mocks) return mocks[name];
    throw new Error(`Unmocked runtime dependency: ${name}`);
  }, URLSearchParams, Intl, Set, Map, ...globals });
  return module.exports;
}
const catalogue = compile('src/lib/legal-catalogue.ts');
const copy = {
  searchResourcesLabel: 'Search', searchResourcesPlaceholder: 'Find a law', resourceTypeLabel: 'Type', legalAreaLabel: 'Area', frameworkLabel: 'Framework', connectedRightsLabel: 'Rights',
  allTypesLabel: 'All types', allAreasLabel: 'All areas', allFrameworksLabel: 'All frameworks', allRightsLabel: 'All rights', clearFiltersLabel: 'Clear filters', openResourceLabel: 'Open', noResultsTitle: 'No results', noResultsCopy: 'Try another search',
};
const catalogueCopy = { results: 'Results: {total}', range: 'Showing {from}–{to} of {total}', page: 'Page {page} of {pages}', previous: 'Previous', next: 'Next', pagination: 'Pages', active: 'Active filters', remove: 'Remove filter', cleared: 'Incompatible filters cleared:', loading: 'Loading', error: 'Unavailable', retry: 'Retry' };
const empty = { q: '', type: '', area: '', framework: '', right: '', page: 1 };
const labels = { types: { law: 'Law', guide: 'Guide' }, frameworks: { serbia: 'Serbia' } };
const records = Array.from({ length: 27 }, (_, index) => ({ id: index + 1, slug: `law-${index + 1}`, title: `Law ${index + 1}`, shortDescription: 'Preview', legalArea: 'Work', legalAreaKey: 'Rad', countryOrFramework: 'serbia', type: index < 25 ? 'law' : 'guide', body: 'body secret', sourceName: '', whatIsThisFor: '', whoCanUseIt: '', whenToUseIt: '', relatedHumanRights: [], tags: [] }));
const initial = catalogue.buildLegalCatalogue(records, 'en', empty, labels);

// A small deterministic hook/render harness exercises the real component's
// asynchronous event handlers. Visual/focus behavior is checked in a browser.
const hooks = [];
let hookIndex = 0;
let effects = [];
let location = new URL('https://avangarda.media/en/pravni-kompas');
const listeners = new Map();
const history = [];
const pendingRequests = [];
const timers = new Map();
let timerId = 0;
const depsEqual = (left, right) => left && right && left.length === right.length && left.every((entry, index) => entry === right[index]);
const react = {
  useState(value) { const index = hookIndex++; if (!(index in hooks)) hooks[index] = typeof value === 'function' ? value() : value; return [hooks[index], (next) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }]; },
  useRef(value) { const index = hookIndex++; if (!(index in hooks)) hooks[index] = { current: value }; return hooks[index]; },
  useCallback(callback, deps) { const index = hookIndex++; if (!hooks[index] || !depsEqual(hooks[index].deps, deps)) hooks[index] = { callback, deps }; return hooks[index].callback; },
  useEffect(effect, deps) { const index = hookIndex++; if (!hooks[index] || !depsEqual(hooks[index].deps, deps)) { effects.push(() => { hooks[index]?.cleanup?.(); hooks[index] = { deps, cleanup: effect() }; }); } },
};
const jsx = (type, props) => ({ type, props });
const { LegalCatalogue } = compile('src/components/legal-catalogue.tsx', {
  react, 'react/jsx-runtime': { jsx, jsxs: jsx }, '@/lib/legal-catalogue': catalogue,
  './legal-catalogue.module.css': { default: new Proxy({}, { get: (_, key) => String(key) }) },
}, {
  AbortController,
  setTimeout: (callback) => { const id = ++timerId; timers.set(id, callback); return id; },
  clearTimeout: (id) => timers.delete(id),
  window: {
    get location() { return location; },
    history: { pushState(_, __, href) { history.push(['push', href]); location = new URL(href, location); }, replaceState(_, __, href) { history.push(['replace', href]); location = new URL(href, location); } },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  },
  fetch: (url, options) => new Promise((resolve, reject) => pendingRequests.push({ url, options, resolve, reject })),
});
let tree;
function render() { hookIndex = 0; tree = LegalCatalogue({ lang: 'en', initial, copy, catalogueCopy }); const next = effects; effects = []; next.forEach((effect) => effect()); return tree; }
function nodes(node, output = []) {
  if (arguments.length === 0) node = tree;
  if (!node || typeof node !== 'object') return output;
  if (Array.isArray(node)) { node.forEach((entry) => nodes(entry, output)); return output; }
  output.push(node); nodes(node.props?.children, output); return output;
}
function find(predicate) { const match = nodes().find(predicate); assert.ok(match, 'Expected rendered control'); return match; }
function input() { return find((node) => node.type === 'input' && node.props.name === 'q'); }
function flushTimers() { const queued = [...timers.values()]; timers.clear(); queued.forEach((callback) => callback()); }
async function settle() { await new Promise(setImmediate); }
function response(request, data) { request.resolve({ ok: true, json: async () => data }); }
const event = (extra = {}) => ({ button: 0, preventDefault() { this.prevented = true; }, ...extra });

async function run() {
  render(); render();
  assert.equal(nodes().filter((node) => node.type === 'article').length, 12);
  assert.equal(find((node) => node.type === 'form').props.action, '/en/pravni-kompas');
  const page2 = find((node) => node.type === 'a' && node.props.rel === 'next');
  assert.equal(page2.props.href, '/en/pravni-kompas?page=2', 'Pagination is a crawlable ordinary link');
  const modified = event({ ctrlKey: true }); page2.props.onClick(modified);
  assert.equal(modified.prevented, undefined); assert.equal(pendingRequests.length, 0, 'Preserve modified-link browser behavior');

  input().props.onChange({ target: { value: 'first' } }); render();
  assert.equal(pendingRequests.length, 0, 'Search is debounced');
  assert.equal(timers.size, 1);
  flushTimers(); assert.equal(pendingRequests.length, 1);
  input().props.onChange({ target: { value: 'second' } }); render();
  assert.equal(pendingRequests[0].options.signal.aborted, true);
  response(pendingRequests[0], catalogue.buildLegalCatalogue(records, 'en', { ...empty, q: 'first' }, labels));
  await settle(); render();
  assert.equal(input().props.value, 'second'); assert.equal(history.length, 0, 'An old response cannot replace controls or push stale URL during debounce');
  flushTimers(); assert.equal(pendingRequests.length, 2);
  response(pendingRequests[1], catalogue.buildLegalCatalogue(records, 'en', { ...empty, q: 'second' }, labels));
  await settle(); render();
  assert.equal(location.search, '?q=second'); assert.equal(history.length, 1);
  assert.equal(nodes().filter((node) => node.type === 'article').length, 0);

  // Simulate a real Back/Forward popstate while a facet request is pending.
  find((node) => node.type === 'select' && node.props.name === 'type').props.onChange({ target: { value: 'law' } });
  assert.equal(pendingRequests.length, 3, 'Facet selection requests immediately without a submit click');
  location = new URL('https://avangarda.media/en/pravni-kompas?type=guide'); listeners.get('popstate')(); render();
  assert.equal(pendingRequests[2].options.signal.aborted, true);
  assert.equal(pendingRequests.length, 4);
  response(pendingRequests[2], catalogue.buildLegalCatalogue(records, 'en', { ...empty, type: 'law', q: 'second' }, labels));
  response(pendingRequests[3], catalogue.buildLegalCatalogue(records, 'en', { ...empty, type: 'guide' }, labels));
  await settle(); render();
  assert.equal(input().props.value, '');
  assert.equal(find((node) => node.type === 'select' && node.props.name === 'type').props.value, 'guide');
  assert.equal(nodes().filter((node) => node.type === 'article').length, 2);
  assert.equal(location.search, '?type=guide'); assert.equal(history.length, 1, 'History restoration must not create a fresh history entry');

  location = new URL('https://avangarda.media/en/pravni-kompas?page=2'); listeners.get('popstate')();
  response(pendingRequests[4], catalogue.buildLegalCatalogue(records, 'en', { ...empty, page: 2 }, labels));
  await settle(); render();
  assert.equal(nodes().filter((node) => node.type === 'article').length, 12);
  assert.equal(find((node) => node.type === 'a' && node.props['aria-current'] === 'page').props.children, 2);
  assert.equal(location.search, '?page=2');

  // Chips are ordinary shareable links and reset pagination when removing one.
  location = new URL('https://avangarda.media/en/pravni-kompas?type=law&page=2'); listeners.get('popstate')();
  response(pendingRequests[5], catalogue.buildLegalCatalogue(records, 'en', { ...empty, type: 'law', page: 2 }, labels));
  await settle(); render();
  const chip = find((node) => node.type === 'a' && node.props['aria-label']?.startsWith('Remove filter'));
  assert.equal(chip.props.href, '/en/pravni-kompas');
  chip.props.onClick(event()); response(pendingRequests[6], initial); await settle(); render();
  assert.equal(location.search, '');
  assert.equal(nodes().filter((node) => node.type === 'article').length, 12);
  assert.equal(find((node) => node.type === 'input').props.value, '');

  // Error responses preserve the current result and offer a retry.
  input().props.onChange({ target: { value: 'offline' } }); flushTimers();
  pendingRequests[7].resolve({ ok: false }); await settle(); render();
  assert.ok(find((node) => node.props?.role === 'alert'));
  assert.equal(nodes().filter((node) => node.type === 'article').length, 12);
  const beforeRetryHistory = history.length;
  find((node) => node.type === 'button' && node.props.children === 'Retry').props.onClick();
  response(pendingRequests.at(-1), catalogue.buildLegalCatalogue(records, 'en', { ...empty, q: 'offline' }, labels));
  await settle(); render();
  assert.equal(history.length, beforeRetryHistory + 1);
  assert.deepEqual(history.at(-1), ['push', '/en/pravni-kompas?q=offline'], 'Retry preserves the failed search history intent so Back can restore the previous view');

  location = new URL('https://avangarda.media/en/pravni-kompas'); listeners.get('popstate')();
  response(pendingRequests.at(-1), initial); await settle(); render();
  input().props.onChange({ target: { value: 'Law ' } }); render();
  const pendingNext = find((node) => node.type === 'a' && node.props.rel === 'next');
  assert.equal(pendingNext.props['aria-disabled'], true);
  const beforeBlockedNavigation = pendingRequests.length;
  const pendingPageClick = event(); pendingNext.props.onClick(pendingPageClick);
  assert.equal(pendingPageClick.prevented, true);
  assert.equal(pendingRequests.length, beforeBlockedNavigation, 'Pending pagination cannot cancel or overwrite the newer search intent');
  assert.equal(timers.size, 1, 'The search debounce remains scheduled after blocked stale pagination');
  flushTimers();
  response(pendingRequests.at(-1), catalogue.buildLegalCatalogue(records, 'en', { ...empty, q: 'Law' }, labels));
  await settle(); render();
  assert.equal(input().props.value, 'Law ', 'A successful normalized search must retain the raw trailing separator in the input');
  assert.equal(location.search, '?q=Law', 'Applied URL remains normalized');
  input().props.onChange({ target: { value: `${input().props.value}2` } }); render(); flushTimers();
  assert.equal(new URL(pendingRequests.at(-1).url, location).searchParams.get('q'), 'Law 2', 'Typing after a debounce pause continues a multi-word query');
  response(pendingRequests.at(-1), catalogue.buildLegalCatalogue(records, 'en', { ...empty, q: 'Law 2' }, labels));
  await settle(); render();

  location = new URL('https://avangarda.media/en/pravni-kompas?type=law'); listeners.get('popstate')();
  response(pendingRequests.at(-1), catalogue.buildLegalCatalogue(records, 'en', { ...empty, type: 'law' }, labels));
  await settle(); render();
  input().props.onChange({ target: { value: 'new pending query' } }); render();
  const existingTypeChip = find((node) => node.type === 'a' && node.props['aria-label']?.startsWith('Remove filter: Type'));
  existingTypeChip.props.onClick(event());
  const chipRequest = new URL(pendingRequests.at(-1).url, location);
  assert.equal(chipRequest.searchParams.get('q'), 'new pending query', 'Removing a settled filter chip preserves the newest pending input');
  assert.equal(chipRequest.searchParams.has('type'), false);
  assert.equal(timers.size, 0, 'Chip mutation replaces the pending debounce with the combined current intent');
  response(pendingRequests.at(-1), catalogue.buildLegalCatalogue(records, 'en', { ...empty, q: 'new pending query' }, labels));
  await settle(); render();

  input().props.onChange({ target: { value: 'pending clear' } }); render();
  const clearDuringPending = find((node) => node.type === 'a' && node.props.children === 'Clear filters');
  clearDuringPending.props.onClick(event());
  const clearRequest = new URL(pendingRequests.at(-1).url, location);
  assert.equal(clearRequest.searchParams.has('q'), false);
  assert.equal(timers.size, 0);
  response(pendingRequests.at(-1), initial); await settle(); render();
  assert.equal(input().props.value, ''); assert.equal(location.search, '');
  console.log('PASS real catalogue client handlers: debounce + stale abort; immediate facets; URL Back/Forward and retry intent; crawlable links; pending pagination/chip/clear races; paused multi-word input; 12/page; empty and recoverable error states');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
