/* Offline responsive fit checks: node apps/web/tests/site-header-sizing.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const filename = path.resolve(__dirname, "../src/components/site-header-sizing.ts");
const moduleShim = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { module: moduleShim, exports: moduleShim.exports }, { filename });
const fits = moduleShim.exports.desktopHeaderFits;
assert.equal(fits({ available: 970, navigation: 687.325, search: 254, gap: 14 }), true, "the observed Spanish desktop row has room for complete controls");
assert.equal(fits({ available: 850, navigation: 687.325, search: 254, gap: 14 }), false, "narrower layouts must move the entire nav, rather than wrap search alone");
assert.equal(fits({ available: 957, navigation: 687.325, search: 254, gap: 14 }), false, "fractional rounding needs spare space");
for (const navigation of [530, 575, 610, 650, 687.325, 715, 740, 780]) {
  assert.equal(fits({ available: navigation + 300, navigation, search: 275, gap: 14 }), true);
  assert.equal(fits({ available: navigation + 250, navigation, search: 275, gap: 14 }), false);
}
assert.equal(fits({ available: NaN, navigation: 600, search: 260, gap: 14 }), false);
assert.equal(fits({ available: 0, navigation: 600, search: 260, gap: 14 }), false);
assert.equal(fits({ available: 1000, navigation: 600, search: 260, gap: -14 }), false);
const boundary = { navigation: 600, search: 260, gap: 14 };
assert.equal(fits({ ...boundary, available: 877, wasCompact: false }), true);
assert.equal(fits({ ...boundary, available: 877, wasCompact: true }), false, "small measurement noise cannot repeatedly re-enter the inline layout");
assert.equal(fits({ ...boundary, available: 880, wasCompact: true }), true, "a real increase in available width restores the inline layout");

// Exercise the real component's ResizeObserver/font/language lifecycle with
// intrinsic dimensions; no browser/CMS access is needed for these checks.
let cursor = 0, dirty = true, tree, pending = [], renderCount = 0;
const slots = [], windowEvents = new Map(), fontEvents = new Map(), observers = [], frames = new Map();
let nextFrame = 0, desktop = true, fontReady;
const inner = { clientWidth: 1366, css: { columnGap: "22px", gridTemplateColumns: "248px 1096px" }, style: { setProperty() {} } };
const items = Array.from({ length: 6 }, () => ({ width: 100, getBoundingClientRect() { return { width: this.width }; } }));
const nav = { children: items, css: { columnGap: "4px", paddingInlineStart: "6px", paddingInlineEnd: "6px", borderInlineStartWidth: "1px", borderInlineEndWidth: "1px" } };
const button = { width: 100, getBoundingClientRect() { return { width: this.width }; } };
const search = { css: { columnGap: "10px" }, querySelector: () => button };
const bottomline = { css: { columnGap: "14px" } };
inner.querySelector = (selector) => selector === "[data-desktop-nav]" ? nav : selector === ".header-search" ? search : bottomline;
const document = { documentElement: { css: { fontSize: "16px" } }, fonts: {
  addEventListener(name, callback) { fontEvents.set(name, callback); },
  removeEventListener(name) { fontEvents.delete(name); },
  ready: { then(callback) { fontReady = callback; } },
} };
const react = {
  useRef(initial) { return slots[cursor++] ??= { current: initial }; },
  useState(initial) { const index = cursor++; slots[index] ??= { value: initial }; return [slots[index].value, (next) => {
    const value = typeof next === "function" ? next(slots[index].value) : next;
    if (slots[index].value !== value) { slots[index].value = value; dirty = true; }
  }]; },
  useEffect(effect, deps) { const index = cursor++, previous = slots[index]; if (!previous || deps.some((value, i) => value !== previous.deps[i])) pending.push(() => {
    previous?.cleanup?.(); slots[index] = { deps, cleanup: effect() };
  }); },
};
class ResizeObserver {
  constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
  observe(element) { this.observed.add(element); }
  disconnect() { this.observed.clear(); }
}
const window = { matchMedia: () => ({ matches: desktop }),
  addEventListener(name, callback) { windowEvents.set(name, callback); },
  removeEventListener(name) { windowEvents.delete(name); },
};
const requestFrame = (callback) => { const id = ++nextFrame; frames.set(id, callback); return id; };
const cancelFrame = (id) => frames.delete(id);
const layoutSource = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, "../src/components/site-header-layout.tsx"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const layoutModule = { exports: {} };
new Function("require", "module", "exports", "window", "document", "getComputedStyle", "ResizeObserver", "requestAnimationFrame", "cancelAnimationFrame", layoutSource)(
  (name) => name === "react" ? react : name === "react/jsx-runtime" ? { jsx: (type, props) => ({ type, props }) }
    : name === "./site-header-sizing" ? moduleShim.exports : { default: { inner: "inner" } },
  layoutModule, layoutModule.exports, window, document, (element) => element.css ?? {}, ResizeObserver, requestFrame, cancelFrame);
let children = "sr";
function flush() {
  let iterations = 0;
  while (dirty || frames.size) {
    assert.ok(++iterations < 15, "header resize measurements converge instead of oscillating");
    while (frames.size) { const [id, callback] = frames.entries().next().value; frames.delete(id); callback(); }
    if (dirty) { dirty = false; cursor = 0; pending = []; renderCount++; tree = layoutModule.exports.SiteHeaderLayout({ children }); tree.props.ref.current = inner; pending.forEach((effect) => effect()); }
  }
}
flush();
assert.equal(tree.props["data-header-compact"], "false");
inner.clientWidth = 1100; windowEvents.get("resize")(); flush();
assert.equal(tree.props["data-header-compact"], "true");
const unchangedCount = renderCount;
for (let i = 0; i < 10; i++) { observers.at(-1).callback(); flush(); }
assert.equal(renderCount, unchangedCount, "changing to full-width compact bottomline cannot change the measured inline budget");
inner.clientWidth = 1366; windowEvents.get("resize")(); flush();
assert.equal(tree.props["data-header-compact"], "false");
items.forEach((item) => { item.width = 150; }); fontEvents.get("loadingdone")(); flush();
assert.equal(tree.props["data-header-compact"], "true", "late font widths update the fit decision");
items.forEach((item) => { item.width = 100; }); children = "ar"; dirty = true; flush();
assert.equal(tree.props["data-header-compact"], "false", "new language children refresh intrinsic measurements");
assert.equal(observers[0].observed.size, 0, "previous language observer is cleaned up");
desktop = false; inner.clientWidth = 390; windowEvents.get("resize")(); flush();
assert.equal(tree.props["data-header-compact"], "false", "the existing mobile CSS/menu owns phone layouts");
slots.forEach((slot) => slot?.cleanup?.()); fontReady();
assert.equal(frames.size, 0, "a font promise resolving after unmount cannot schedule work");
assert.equal(windowEvents.size, 0); assert.equal(fontEvents.size, 0); assert.equal(observers.at(-1).observed.size, 0);
console.log("site-header-sizing: intrinsic whole-control fit, fractional-width hysteresis, resize convergence, late fonts, language changes and lifecycle cleanup passed");
