"use strict";
// Execute the real component against browser lifecycle events and a controlled
// clock: no browser, network, CMS writes or extra image requests are required.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const source = fs.readFileSync(path.join(__dirname, "../src/components/editorial-frames.tsx"), "utf8");
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX
} }).outputText;
const suppliedStories = [
  { id: 34, title: "A title with a photograph", imageUrl: "/already-loaded-34.jpg", href: "/en/a/story-34" },
  { id: 28, title: "The second published story", imageUrl: "/already-loaded-28.jpg", href: "/en/a/story-28" },
  { id: 25, title: "A longer third title that retains its own photo and article link", imageUrl: "/already-loaded-25.jpg", href: "/en/a/story-25" }
];

function mount({ wide = false, reduced = false, lang = "en", stories = suppliedStories, observerAvailable = true } = {}) {
  let cursor = 0, dirty = true, tree, observer, unmounted = false, now = 0, timerId = 0;
  const slots = [], documentEvents = new Map(), observerHistory = [], timers = new Map();
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
  const window = {
    matchMedia(query) {
      assert.ok(query === "(min-width: 1101px)" || query === "(prefers-reduced-motion: reduce)");
      return query === "(min-width: 1101px)" ? desktopMedia : motionMedia;
    },
    setInterval(callback, delay) { assert.equal(delay, 9000, "The photograph cycle remains slow"); const id = ++timerId; timers.set(id, { callback, delay, at: now + delay }); return id; },
    clearInterval(id) { timers.delete(id); }
  };
  class IntersectionObserver {
    constructor(callback, options) {
      this.callback = callback; this.disconnected = false;
      assert.equal(options.threshold, 0.12);
      observer = this; observerHistory.push(this);
    }
    observe(value) { assert.equal(value, section); }
    disconnect() { this.disconnected = true; }
  }
  const react = {
    useRef(value) { const index = cursor++; return slots[index] ||= { current: value }; },
    useState(value) {
      const index = cursor++;
      slots[index] ||= { value };
      return [slots[index].value, next => {
        assert.equal(unmounted, false, "Unmounted components cannot receive state updates");
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
    : name.endsWith(".css") ? { default: new Proxy({}, { get: (_, property) => property }) }
    : (() => { throw new Error(`Unexpected runtime import: ${name}`); })();
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "IntersectionObserver", code)(
    imported, module, module.exports, window, document, observerAvailable ? IntersectionObserver : undefined);
  const props = { lang, stories };
  const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === "object"
    ? [node, ...flatten(node.props.children)] : [];
  function flush() {
    let renders = 0;
    while (dirty) {
      assert.ok(++renders < 20, "Lifecycle updates must converge");
      dirty = false; cursor = 0; pending = [];
      for (const slot of slots) if (slot && "current" in slot) slot.current = null;
      tree = module.exports.EditorialFrames(props);
      for (const node of flatten(tree)) if (node.props.ref) node.props.ref.current = section;
      for (const effect of pending) effect();
    }
  }
  function advance(duration) {
    const until = now + duration;
    while (true) {
      const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > until) break;
      now = next[1].at; next[1].at += next[1].delay; next[1].callback(); flush();
    }
    now = until;
  }
  flush();
  return {
    get tree() { return tree; }, get nodes() { return flatten(tree); }, desktopMedia, motionMedia, timers,
    get observer() { return observer; }, documentEvents, observerHistory, advance,
    get selected() { return tree?.props["data-active-id"]; },
    get caption() { return flatten(tree).find(node => node.props.className === "caption" && node.props["data-active"]); },
    intersect(value) { observer.callback([{ isIntersecting: value }]); flush(); },
    background(value) { document.visibilityState = value ? "hidden" : "visible"; documentEvents.get("visibilitychange")(); flush(); },
    pause() { flatten(tree).find(node => node.props.className === "control").props.onClick(); flush(); },
    choose(index) { flatten(tree).filter(node => node.props.className === "frame")[index].props.onClick(); flush(); },
    hover(value) { tree.props[value ? "onPointerEnter" : "onPointerLeave"](); flush(); },
    focus(value, remainsInside = false) {
      if (value) tree.props.onFocusCapture();
      else tree.props.onBlurCapture({ currentTarget: { contains: () => remainsInside }, relatedTarget: remainsInside ? {} : null });
      flush();
    },
    replaceStories(value) { props.stories = value; dirty = true; flush(); },
    unmount() { for (const slot of slots) slot?.cleanup?.(); unmounted = true; }
  };
}

function checkMatching(state, stories = suppliedStories) {
  const selected = stories.find(story => story.id === state.selected);
  const links = state.caption.props.children;
  assert.equal(links[0].props.children, selected.title, "Displayed title belongs to the selected photograph");
  assert.ok(links.every(link => link.props.href === selected.href), "Title and read links lead to the selected article");
  const activePhoto = state.nodes.find(node => node.props.className === "frame" && node.props["data-active"]);
  const image = activePhoto.props.children.props.children[0];
  assert.equal(image.props.src, selected.imageUrl, "The highlighted photo belongs to the displayed title");
  for (const caption of state.nodes.filter(node => node.props.className === "caption" && !node.props["data-active"])) {
    assert.equal(caption.props["aria-hidden"], true);
    assert.ok(caption.props.children.every(link => link.props.tabIndex === -1), "Inactive article links never enter keyboard focus");
  }
}

const state = mount();
assert.equal(state.tree, null, "Mobile omits the panel and every photo node");
assert.equal(state.observerHistory.length, 0);
assert.equal(state.timers.size, 0);
state.desktopMedia.change(true);
assert.equal(state.tree.type, "section");
assert.equal(state.tree.props["data-playing"], false);
assert.equal(state.timers.size, 0, "Nothing cycles before the desktop panel becomes visible");
assert.deepEqual(state.nodes.filter(node => node.type === "img").map(node => node.props.src), suppliedStories.map(story => story.imageUrl));
assert.ok(state.nodes.filter(node => node.type === "img").every(node => node.props.loading === "lazy" && node.props.alt === ""));
checkMatching(state);
state.intersect(true); assert.equal(state.timers.size, 1);
state.advance(8999); assert.equal(state.selected, 34);
state.advance(1); assert.equal(state.selected, 28); checkMatching(state);
state.advance(9000); assert.equal(state.selected, 25); checkMatching(state);
state.advance(9000); assert.equal(state.selected, 34); checkMatching(state);
state.intersect(false); state.advance(90000); assert.equal(state.selected, 34); assert.equal(state.timers.size, 0);
state.intersect(true); state.background(true); state.advance(90000); assert.equal(state.selected, 34); assert.equal(state.timers.size, 0);
state.background(false); state.advance(9000); assert.equal(state.selected, 28); checkMatching(state);
state.pause(); state.intersect(false); state.intersect(true); state.background(true); state.background(false);
assert.equal(state.tree.props["data-playing"], false, "Manual pause survives page and panel visibility changes");
state.advance(90000); assert.equal(state.selected, 28);
state.pause(); state.hover(true); state.advance(90000); assert.equal(state.selected, 28);
state.hover(false); state.focus(true); state.advance(90000); assert.equal(state.selected, 28);
state.focus(false, true); assert.equal(state.tree.props["data-playing"], false, "Moving focus within the panel stays paused");
state.focus(false); state.advance(9000); assert.equal(state.selected, 25);
state.choose(0); state.advance(90000); assert.equal(state.selected, 34); checkMatching(state);
assert.equal(state.nodes.find(node => node.props.className === "control").props["aria-pressed"], true, "Manual photo selection pauses until the user resumes");
state.pause(); state.motionMedia.change(true); assert.equal(state.timers.size, 0);
state.advance(90000); assert.equal(state.selected, 34);
assert.equal(state.tree.props["data-reduced"], true);
assert.equal(state.nodes.some(node => node.props.className === "control"), false);
state.choose(1); checkMatching(state); assert.equal(state.selected, 28, "Static frames remain manually selectable");
state.motionMedia.change(false); state.pause();
const desktopObserver = state.observer;
state.desktopMedia.change(false);
assert.equal(state.tree, null); assert.equal(desktopObserver.disconnected, true); assert.equal(state.timers.size, 0);
state.unmount();
assert.equal(state.desktopMedia.events.size, 0); assert.equal(state.motionMedia.events.size, 0); assert.equal(state.documentEvents.size, 0);
assert.ok(state.observerHistory.every(instance => instance.disconnected));

const reduced = mount({ wide: true, reduced: true }); reduced.intersect(true); reduced.advance(90000);
assert.equal(reduced.selected, 34); assert.equal(reduced.tree.props["data-playing"], false); reduced.unmount();
const unsupported = mount({ wide: true, observerAvailable: false }); unsupported.advance(90000);
assert.equal(unsupported.selected, 34); assert.equal(unsupported.timers.size, 0); unsupported.unmount();
const invalid = mount({ wide: true, stories: [{ id: 2, title: "No article link", imageUrl: "/unlinked.jpg", href: "" }] });
assert.equal(invalid.tree, null); assert.equal(invalid.observerHistory.length, 0);
invalid.replaceStories(suppliedStories); assert.equal(invalid.tree.type, "section"); assert.equal(invalid.observerHistory.length, 1);
invalid.intersect(true); invalid.unmount(); assert.equal(invalid.timers.size, 0, "Unmount clears a running interval");
const single = mount({ wide: true, stories: suppliedStories.slice(0, 1) }); single.intersect(true);
assert.equal(single.timers.size, 0); assert.equal(single.nodes.some(node => node.props.className === "control"), false); single.unmount();
for (const language of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
  const translated = suppliedStories.map(story => ({ ...story, href: story.href.replace("/en/", `/${language}/`) }));
  const localized = mount({ wide: true, lang: language, stories: translated });
  assert.ok(localized.tree.props["aria-label"].length > 5);
  assert.equal(localized.tree.props.dir, language === "ar" ? "rtl" : "ltr");
  checkMatching(localized, translated);
  const before = localized.nodes.find(node => node.props.className === "control").props["aria-label"];
  localized.pause(); assert.notEqual(localized.nodes.find(node => node.props.className === "control").props["aria-label"], before);
  localized.choose(2); checkMatching(localized, translated); localized.unmount();
}
console.log("Frames lifecycle passed: supplied photo/title/link matching, 9-second cycle, mobile omission, visible/background/manual/focus/hover/reduced pause, cleanup, optional data and all eight languages.");
