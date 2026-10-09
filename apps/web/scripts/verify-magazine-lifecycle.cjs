"use strict";
// Executes the real magazine component with controlled React hooks and browser
// lifecycle APIs. No browser, network, CMS writes or animation timers are used.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = fs.readFileSync(path.join(__dirname, "../src/components/editorial-magazine.tsx"), "utf8");
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX
} }).outputText;

function mount({ wide = false, reduced = false, lang = "en", stories } = {}) {
  let cursor = 0, dirty = true, tree, observer, unmounted = false;
  const slots = [], documentEvents = new Map(), observerHistory = [];
  let pending = [];
  const section = {};
  function media(initial) {
    const events = new Set();
    return { matches: initial, events,
      addEventListener(type, callback) { assert.equal(type, "change"); events.add(callback); },
      removeEventListener(type, callback) { assert.equal(type, "change"); events.delete(callback); },
      change(value) { this.matches = value; for (const callback of events) callback(); flush(); }
    };
  }
  const desktopMedia = media(wide), motionMedia = media(reduced);
  const document = { visibilityState: "visible",
    addEventListener(type, callback) { documentEvents.set(type, callback); },
    removeEventListener(type, callback) { assert.equal(documentEvents.get(type), callback); documentEvents.delete(type); }
  };
  const window = { matchMedia(query) {
    assert.ok(query === "(min-width: 1101px)" || query === "(prefers-reduced-motion: reduce)");
    return query === "(min-width: 1101px)" ? desktopMedia : motionMedia;
  } };
  class IntersectionObserver {
    constructor(callback, options) {
      this.callback = callback; this.disconnected = false; this.observed = null;
      assert.equal(options.threshold, 0.12);
      observer = this; observerHistory.push(this);
    }
    observe(value) { assert.equal(value, section); this.observed = value; }
    disconnect() { this.disconnected = true; }
  }
  const react = {
    useRef(value) { const index = cursor++; return slots[index] ||= { current: value }; },
    useState(value) {
      const index = cursor++;
      slots[index] ||= { value };
      return [slots[index].value, next => {
        assert.equal(unmounted, false, "Unmounted component must not receive state updates");
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useEffect(work, dependencies) {
      const index = cursor++, previous = slots[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pending.push(() => { previous?.cleanup?.(); slots[index] = { dependencies, cleanup: work() }; });
      }
    }
  };
  const jsx = (type, props) => ({ type, props });
  const imported = name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx }
    : name === "@/lib/i18n" ? { withLang: (url, language) => `/${language}${url}` }
    : name.endsWith(".css") ? { default: {} }
    : (() => { throw new Error(`Unexpected import: ${name}`); })();
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "IntersectionObserver", code)(
    imported, module, module.exports, window, document, IntersectionObserver);
  const props = { lang, stories: stories ?? Array.from({ length: 4 }, (_, id) => ({
    id, title: `Story ${id}`, imageUrl: `/already-loaded-${id}.jpg`
  })) };
  const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === "object"
    ? [node, ...flatten(node.props.children)] : [];
  function flush() {
    let renders = 0;
    while (dirty) {
      assert.ok(++renders < 20, "Lifecycle updates must converge");
      dirty = false; cursor = 0; pending = [];
      for (const slot of slots) if (slot && "current" in slot) slot.current = null;
      tree = module.exports.EditorialMagazine(props);
      for (const node of flatten(tree)) if (node.props.ref) node.props.ref.current = section;
      for (const effect of pending) effect();
    }
  }
  flush();
  return { get tree() { return tree; }, get nodes() { return flatten(tree); }, desktopMedia, motionMedia,
    get observer() { return observer; }, documentEvents, observerHistory,
    intersect(value) { observer.callback([{ isIntersecting: value }]); flush(); },
    background(value) { document.visibilityState = value ? "hidden" : "visible"; documentEvents.get("visibilitychange")(); flush(); },
    pause() { flatten(tree).find(node => node.type === "button").props.onClick(); flush(); },
    unmount() { for (const slot of slots) slot?.cleanup?.(); unmounted = true; }
  };
}

const mobile = mount();
assert.equal(mobile.tree, null, "Mobile must omit the entire magazine markup");
assert.equal(mobile.observerHistory.length, 0, "Mobile does not observe an absent decoration");
mobile.desktopMedia.change(true);
assert.equal(mobile.tree.type, "section");
assert.equal(mobile.tree.props["data-playing"], false, "Desktop starts paused until observed");
assert.equal(mobile.nodes.filter(node => node.type === "img").length, 3, "Use at most three supplied images");
assert.ok(mobile.nodes.filter(node => node.type === "img").every(node => node.props.loading === "lazy" && node.props.alt === ""));
mobile.intersect(true); assert.equal(mobile.tree.props["data-playing"], true);
mobile.intersect(false); assert.equal(mobile.tree.props["data-playing"], false);
mobile.intersect(true); mobile.background(true); assert.equal(mobile.tree.props["data-playing"], false);
mobile.background(false); assert.equal(mobile.tree.props["data-playing"], true);
mobile.pause(); assert.equal(mobile.tree.props["data-playing"], false);
assert.equal(mobile.nodes.find(node => node.type === "button").props["aria-pressed"], true);
mobile.intersect(false); mobile.intersect(true); assert.equal(mobile.tree.props["data-playing"], false, "User pause survives visibility changes");
mobile.pause(); assert.equal(mobile.tree.props["data-playing"], true);
mobile.motionMedia.change(true);
assert.equal(mobile.tree.props["data-playing"], false, "Reduced motion forbids animation");
assert.equal(mobile.tree.props["data-reduced"], true, "Reduced motion preserves the static composition");
assert.equal(mobile.nodes.some(node => node.type === "button"), false, "No misleading resume control under reduced motion");
mobile.motionMedia.change(false); assert.equal(mobile.tree.props["data-playing"], true);
const desktopObserver = mobile.observer;
mobile.desktopMedia.change(false);
assert.equal(mobile.tree, null); assert.equal(desktopObserver.disconnected, true);
mobile.unmount();
assert.equal(mobile.desktopMedia.events.size, 0);
assert.equal(mobile.motionMedia.events.size, 0);
assert.equal(mobile.documentEvents.size, 0, "Visibility listener is removed on unmount");
assert.ok(mobile.observerHistory.every(instance => instance.disconnected), "All desktop observers are disconnected");

const staticDesktop = mount({ wide: true, reduced: true });
staticDesktop.intersect(true);
assert.equal(staticDesktop.tree.props["data-playing"], false);
assert.equal(staticDesktop.tree.props["data-reduced"], true);
staticDesktop.unmount();
const noStories = mount({ wide: true, stories: [{ id: 1, title: "", imageUrl: "/invalid.jpg" }] });
assert.equal(noStories.tree, null, "Missing optional stories never reserve a decoration");
noStories.unmount();
for (const language of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
  const localized = mount({ wide: true, lang: language });
  const button = localized.nodes.find(node => node.type === "button");
  const before = button.props["aria-label"];
  assert.ok(before.length > 5);
  localized.pause();
  assert.notEqual(localized.nodes.find(node => node.type === "button").props["aria-label"], before);
  assert.equal(localized.nodes.find(node => node.type === "a").props.href, `/${language}/archive`);
  if (language === "ar") assert.ok(localized.nodes.filter(node => node.type === "strong" && node.props.dir).every(node => node.props.dir === "rtl"));
  localized.unmount();
}
console.log("Magazine lifecycle passed: mobile omission, desktop visibility, background/pause/reduced gating, static fallback, cleanup, supplied images and all eight languages.");
