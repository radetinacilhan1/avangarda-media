/* Deterministic lifecycle tests, with real component code and simulated browser APIs. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, mocks = {}) {
  const module = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', js)(id => mocks[id] || require(id), module, module.exports);
  return module.exports;
}
const logic = load('src/lib/visible-counter.ts');
const values = new Map();
const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
assert.equal(logic.canAnimateCounter(storage, 'stories'), true);
logic.markCounterSeen(storage, 'stories');
assert.equal(logic.canAnimateCounter(storage, 'stories'), false);
assert.equal(logic.canAnimateCounter(storage, 'topics'), true);
assert.equal(logic.canAnimateCounter({ getItem() { throw Error('Denied'); } }, 'authors'), false);
assert.equal(logic.counterFrame(21, 0), 0);
assert.equal(logic.counterFrame(21, 1250), 21);
assert.equal(logic.counterFrame(0, 600), 0);
for (let ms = 0, previous = 0; ms <= 1300; ms += 10) { const n = logic.counterFrame(487, ms); assert.ok(n >= previous && n <= 487); previous = n; }

function mount(id, value, { reduced = false, denied = false } = {}) {
  let state = null, effect, observer, cleanup, now = 0, raf;
  const hooks = {
    useRef: () => ({ current: {} }),
    useState: () => [state, next => { state = next; }],
    useEffect: callback => { effect = callback; }
  };
  global.window = {
    get sessionStorage() { if (denied) throw Error('Denied'); return storage; },
    IntersectionObserver: class { constructor(callback) { observer = callback; } observe() {} disconnect() {} },
    matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} })
  };
  global.IntersectionObserver = window.IntersectionObserver;
  global.requestAnimationFrame = fn => { raf = fn; return 1; };
  global.cancelAnimationFrame = () => { raf = null; };
  Object.defineProperty(global, 'performance', { configurable: true, value: { now: () => now } });
  const { ImpactCounter } = load('src/components/impact-counter.tsx', { react: hooks, '@/lib/visible-counter': logic });
  const render = (nextValue = value, locale = 'sr-Latn-RS') => ImpactCounter({ id, value: nextValue, locale });
  const tree = render(); cleanup = effect();
  return {
    tree, render, state: () => state,
    update: nextValue => {
      cleanup?.();
      observer = undefined;
      value = nextValue;
      render();
      cleanup = effect();
      return render();
    },
    visible: () => observer?.([{ isIntersecting: true }]),
    hidden: () => observer?.([{ isIntersecting: false }]),
    tick: ms => { now = ms; raf?.(ms); },
    unmount: () => cleanup?.()
  };
}
values.clear();
let first = mount('stories', 21);
assert.equal(first.state(), null, 'SSR/final value until this counter is visible');
first.hidden(); assert.equal(first.state(), null);
first.visible(); assert.equal(first.state().value, 0);
first.tick(600); assert.ok(first.state().value > 0 && first.state().value < 21);
first.tick(1250); assert.equal(first.state(), null);
first.unmount();
for (const reason of ['return', 'refresh', 'language', 'theme']) {
  const again = mount('stories', 26); again.visible(); assert.equal(again.state(), null, reason + ': new exact value without replay'); again.unmount();
}
const changing = mount('changing', 21);
changing.visible(); changing.tick(400);
assert.ok(changing.state().value > 0 && changing.state().value < 21, 'update interrupts an active animation');
assert.equal(changing.update(26).props.children[2].props.children, '26', 'changed value is final immediately');
assert.equal(changing.update(21).props.children[2].props.children, '21', 'A -> B -> A cannot restore the interrupted intermediate frame');
changing.tick(900);
assert.equal(changing.render().props.children[2].props.children, '21', 'the cancelled frame cannot resume');
changing.unmount();
const below = mount('authors', 10); below.hidden(); assert.equal(below.state(), null); below.visible(); assert.equal(below.state().value, 0); below.unmount();
const zero = mount('zero', 0); zero.visible(); assert.equal(zero.state(), null); zero.unmount();
const missing = mount('missing', null); assert.equal(missing.tree.props.children[0].props.children, '—'); missing.unmount();
const staticCounter = mount('reduced', 12, { reduced: true }); staticCounter.visible(); assert.equal(staticCounter.state(), null); staticCounter.unmount();
const denied = mount('denied', 12, { denied: true }); denied.visible(); assert.equal(denied.state(), null); denied.unmount();
assert.equal(first.tree.props.children[0].props.children, '21', 'final value remains available to screen readers');
assert.equal(first.tree.props.children[2].props['aria-hidden'], 'true', 'intermediate values are silent');
const { localizeArticleStyle } = load('src/lib/article-style.ts');
for (const lang of ['sr','en','tr','fr','de','es','el','ar']) assert.ok(localizeArticleStyle('analiza', lang));
console.log('PASS: independent visibility, easing, session persistence, changed values during animation (A -> B -> A), zero/missing, reduced motion, denied storage, accessible SSR and eight style translations.');
