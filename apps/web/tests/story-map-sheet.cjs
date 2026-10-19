/* Offline modal interaction checks: node apps/web/tests/story-map-sheet.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const listeners = new Map();
const body = { style: { position: "relative", top: "", left: "", right: "", width: "", overflow: "auto", overscrollBehavior: "", paddingInlineEnd: "4px" } };
const html = { style: { overflow: "", overscrollBehavior: "", scrollBehavior: "smooth" }, clientWidth: 375 };
const initialBody = { ...body.style };
const scrolls = [];
const document = {
  body, documentElement: html, activeElement: null,
  addEventListener: (type, fn) => listeners.set(type, fn),
  removeEventListener: (type, fn) => { if (listeners.get(type) === fn) listeners.delete(type); },
};
class Element {
  isConnected = true;
  focus() { document.activeElement = this; }
  getClientRects() { return [{}]; }
  closest() { return null; }
}
const trigger = new Element();
const close = new Element();
const last = new Element();
const hidden = new Element();
hidden.getClientRects = () => [];
const dialog = { querySelectorAll: () => [close, hidden, last], contains: (element) => [close, hidden, last].includes(element) };
document.activeElement = trigger;
const moduleShim = { exports: {} };
const filename = path.resolve(__dirname, "../src/components/story-map-sheet-accessibility.ts");
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  module: moduleShim, exports: moduleShim.exports, HTMLElement: Element, document,
  window: { scrollX: 0, scrollY: 547, innerWidth: 390, scrollTo: (x, y) => scrolls.push([x, y]) },
  getComputedStyle: () => ({ paddingInlineEnd: "4px" }),
}, { filename });
let closed = 0;
const activate = () => moduleShim.exports.activateStoryMapSheet(dialog, close, () => { closed += 1; });
const key = (value, shiftKey = false) => {
  let prevented = false;
  listeners.get("keydown")({ key: value, shiftKey, defaultPrevented: false, preventDefault: () => { prevented = true; } });
  return prevented;
};
const cleanup = activate();
assert.equal(body.style.position, "fixed");
assert.equal(body.style.top, "-547px");
assert.equal(body.style.paddingInlineEnd, "19px", "locking compensates for the existing scrollbar without discarding padding");
assert.equal(html.style.overflow, "hidden");
assert.equal(document.activeElement, close);
assert.equal(key("Tab", true), true);
assert.equal(document.activeElement, last, "Shift+Tab wraps to the final story link");
assert.equal(key("Tab"), true);
assert.equal(document.activeElement, close, "Tab wraps to close instead of focusing the map behind the sheet");
trigger.focus();
key("Tab");
assert.equal(document.activeElement, close, "keyboard focus outside the modal is brought back");
assert.equal(key("Escape"), true);
assert.equal(closed, 1);
cleanup();
assert.deepEqual(body.style, initialBody, "all previous inline document styles are restored");
assert.equal(html.style.overflow, "");
assert.equal(html.style.scrollBehavior, "smooth");
assert.deepEqual(scrolls, [[0, 547]], "closing restores the exact map page scroll position");
assert.equal(document.activeElement, trigger);
assert.equal(listeners.size, 0);
const secondCleanup = activate();
assert.equal(document.activeElement, close, "a sheet can be reopened after closing");
secondCleanup();
assert.equal(listeners.size, 0, "reopening does not duplicate keyboard listeners");
console.log("story-map-sheet: page lock, scroll/focus restoration, final-link keyboard access, Escape and reopening passed");
