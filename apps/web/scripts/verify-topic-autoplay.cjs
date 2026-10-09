"use strict";
// Offline hook/clock regression checks. Browser QA separately verifies native
// scrolling, touch inertia and the visually identical prefix-to-source rebase.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/components/topic-strip.tsx"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText;

function mount(dir = "ltr", layoutWidth = 720) {
  let now = 0, serial = 0, hookIndex = 0, dirty = true, tree, intersection, motionListener;
  let hooks = [], pendingEffects = [], sourceCards = [], copies = [], transitionCalls = [];
  const timers = new Map(), listeners = new Map(), documentListeners = new Map();
  const schedule = (fn, delay = 0) => { const id = ++serial; timers.set(id, { fn, at: now + delay }); return id; };
  const clear = id => timers.delete(id);
  const media = { matches: false, addEventListener(_type, fn) { motionListener = fn; }, removeEventListener() {} };
  const document = { visibilityState: "visible", addEventListener(type, fn) { documentListeners.set(type, fn); }, removeEventListener(type) { documentListeners.delete(type); } };
  const section = { contains: value => Boolean(value?.inside) };
  const viewport = {
    clientWidth: Math.round(layoutWidth), scrollLeft: 0, count: 1, dataset: {},
    getBoundingClientRect() { return { width: layoutWidth }; },
    style: { setProperty(_name, value) { viewport.count = Number(value); } },
    get scrollWidth() { return Math.round(Math.max(layoutWidth, (sourceCards.length + copies.length) * ((layoutWidth + 12) / this.count) - 12)); },
    scrollTo({ left, behavior }) {
      const limit = this.scrollWidth - this.clientWidth;
      this.scrollLeft = dir === "rtl" ? -Math.max(0, Math.min(limit, -left)) : Math.max(0, Math.min(limit, left));
      transitionCalls.push({ left: this.scrollLeft, behavior });
      for (const listener of listeners.get("scroll") || []) listener();
      schedule(() => { for (const listener of listeners.get("scrollend") || []) listener(); }, 1);
    },
    addEventListener(type, fn) { const values = listeners.get(type) || []; values.push(fn); listeners.set(type, values); },
    removeEventListener(type, fn) { listeners.set(type, (listeners.get(type) || []).filter(value => value !== fn)); },
    querySelector(selector) {
      if (selector === 'a[data-copy="false"]') return { getBoundingClientRect: () => ({ width: (layoutWidth + 12) / viewport.count - 12 }) };
      const index = Number(selector.match(/data-topic-index="(\d+)"/)?.[1]);
      const card = sourceCards[index];
      return card ? { focus() { tree.props.onFocusCapture(); card.props.onFocus(); } } : null;
    }
  };
  const window = { matchMedia: () => media, requestAnimationFrame: fn => schedule(() => fn(now), 16), cancelAnimationFrame: clear };
  const react = {
    useRef(value) { const slot = hookIndex++; return hooks[slot] ||= { current: value }; },
    useState(value) {
      const slot = hookIndex++;
      if (!hooks[slot]) hooks[slot] = { value };
      return [hooks[slot].value, next => {
        const value = typeof next === "function" ? next(hooks[slot].value) : next;
        if (!Object.is(value, hooks[slot].value)) { hooks[slot].value = value; dirty = true; }
      }];
    },
    useEffect(work, deps) {
      const slot = hookIndex++, previous = hooks[slot];
      if (!previous || deps.some((value, index) => !Object.is(value, previous.deps[index]))) {
        pendingEffects.push(() => { previous?.cleanup?.(); hooks[slot] = { deps, cleanup: work() }; });
      }
    }
  };
  const jsx = (type, props) => ({ type, props });
  class IntersectionObserver { constructor(fn) { intersection = fn; } observe() {} disconnect() {} }
  class ResizeObserver { observe() {} disconnect() {} }
  const imported = name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx }
    : name.endsWith(".css") ? { default: {} } : (() => { throw new Error(`Unexpected import ${name}`); })();
  const result = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "performance", "IntersectionObserver", "ResizeObserver", "setTimeout", "clearTimeout", code)(
    imported, result, result.exports, window, document, { now: () => now }, IntersectionObserver, ResizeObserver, schedule, clear);
  const props = { dir, lang: dir === "rtl" ? "ar" : "en", label: "Topics",
    items: Array.from({ length: 6 }, (_, id) => ({ id, href: `/topic/${id}`, label: `Topic ${id}`, headline: "Open topic" })) };
  const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === "object"
    ? [node, ...flatten(node.props.children)] : [];
  function flush() {
    let passes = 0;
    while (dirty) {
      assert.ok(++passes < 30, "Hook render loop must converge");
      dirty = false; hookIndex = 0; pendingEffects = [];
      tree = result.exports.TopicStrip(props);
      const nodes = flatten(tree);
      sourceCards = nodes.filter(node => node.type === "a" && node.props["data-copy"] === "false");
      copies = nodes.filter(node => node.type === "a" && node.props["data-copy"] === "true");
      for (const node of nodes) {
        if (node.props.ref) node.props.ref.current = node.type === "section" ? section : viewport;
        if (node.props.style?.["--topic-visible-count"]) viewport.count = node.props.style["--topic-visible-count"];
      }
      for (const effect of pendingEffects) effect();
    }
  }
  function advance(duration) {
    const end = now + duration;
    let turns = 0;
    while (true) {
      const next = [...timers].sort((a, b) => a[1].at - b[1].at).find(([, timer]) => timer.at <= end);
      if (!next) break;
      assert.ok(++turns < 1000, "Clock work must remain bounded");
      const [id, timer] = next; timers.delete(id); now = timer.at; timer.fn(); flush();
    }
    now = end; flush();
  }
  flush(); advance(20);
  return { exports: result.exports, viewport, advance,
    get tree() { return tree; }, get sourceCards() { return sourceCards; }, get copies() { return copies; },
    get smoothCalls() { return transitionCalls.filter(call => call.behavior === "smooth"); },
    visible(value) { intersection([{ isIntersecting: value, intersectionRatio: value ? 1 : 0 }]); flush(); },
    hidden(value) { document.visibilityState = value ? "hidden" : "visible"; documentListeners.get("visibilitychange")(); flush(); },
    reduced(value) { media.matches = value; motionListener(); flush(); },
    hover(value) { tree.props[value ? "onPointerEnter" : "onPointerLeave"]({ pointerType: "mouse" }); flush(); },
    focus() { tree.props.onFocusCapture(); flush(); },
    blur() { tree.props.onBlurCapture({ currentTarget: section, relatedTarget: null }); flush(); },
    togglePause() { flatten(tree).find(node => node.type === "button" && "aria-pressed" in node.props).props.onClick(); flush(); },
    next() { flatten(tree).find(node => node.type === "button" && node.props["aria-label"] === "Next topics").props.onClick(); flush(); },
    touch(start) {
      const node = flatten(tree).find(node => node.props.onTouchStart);
      if (start) node.props.onTouchStart({ touches: [{ clientX: 100, clientY: 100 }] });
      else node.props.onTouchEnd();
      flush();
    }
  };
}

const strip = mount();
const e = strip.exports;
assert.equal(e.TOPIC_AUTOPLAY_INTERVAL, 6000);
assert.equal(e.topicAutoplayDelay(0, null), 6000);
assert.equal(e.topicAutoplayDelay(2000, 1000), 9000);
assert.equal(e.topicAutoplayDelay(20000, 1000), 6000);
assert.equal(e.nextTopicAutoplayIndex(5, 6), 6);
assert.equal(e.nextTopicAutoplayIndex(0, 1), 0);
for (const language of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
  const copy = e.TOPIC_PLAYBACK_LABELS[language];
  assert.ok(copy.pause && copy.resume && copy.shortPause && copy.shortResume);
  assert.notEqual(copy.pause, copy.resume);
}
assert.equal(strip.sourceCards.length, 6);
assert.equal(strip.copies.length, 4);
assert.ok(strip.copies.every(copy => copy.props["aria-hidden"] === true && copy.props.tabIndex === -1));
strip.advance(7000); assert.equal(strip.smoothCalls.length, 0, "Offscreen strip must not autoplay");
strip.visible(true);
strip.advance(5999); assert.equal(strip.smoothCalls.length, 0);
strip.advance(2); assert.equal(strip.smoothCalls.length, 1, "Autoplay starts at six seconds");
strip.hover(true); strip.advance(12000); assert.equal(strip.smoothCalls.length, 1, "Hover pauses");
strip.hover(false); strip.advance(6001); assert.equal(strip.smoothCalls.length, 2);
strip.focus(); strip.advance(12000); assert.equal(strip.smoothCalls.length, 2, "Focus pauses");
strip.togglePause(); strip.blur(); strip.advance(12000); assert.equal(strip.smoothCalls.length, 2, "Explicit pause survives blur");
strip.togglePause(); strip.focus(); strip.advance(12000); assert.equal(strip.smoothCalls.length, 2, "Resume still respects focus");
strip.blur(); strip.advance(6001); assert.equal(strip.smoothCalls.length, 3);
strip.next(); const manualCount = strip.smoothCalls.length;
strip.advance(9999); assert.equal(strip.smoothCalls.length, manualCount, "Manual selection gets ten seconds");
strip.advance(2); assert.equal(strip.smoothCalls.length, manualCount + 1);
strip.touch(true); const beforeTouch = strip.smoothCalls.length;
strip.advance(12000); assert.equal(strip.smoothCalls.length, beforeTouch, "Touch pauses");
strip.touch(false); strip.advance(9999); assert.equal(strip.smoothCalls.length, beforeTouch, "Cooldown starts at touch release");
strip.advance(2); assert.equal(strip.smoothCalls.length, beforeTouch + 1);
strip.hidden(true); const beforeHidden = strip.smoothCalls.length;
strip.advance(12000); assert.equal(strip.smoothCalls.length, beforeHidden, "Background tab pauses");
strip.hidden(false); strip.reduced(true); strip.advance(12000); assert.equal(strip.smoothCalls.length, beforeHidden, "Reduced motion is manual only");
strip.reduced(false); strip.visible(false); strip.advance(12000); assert.equal(strip.smoothCalls.length, beforeHidden, "Intersection pause persists");

const rtl = mount("rtl"); rtl.visible(true); rtl.advance(6002);
assert.ok(rtl.smoothCalls[0].left < 0, "RTL advances through negative native offsets");
for (let step = 0; step < 5; step++) rtl.advance(6002);
assert.equal(Math.abs(rtl.viewport.scrollLeft), 0, "Full copied prefix rebases to the identical source offset");
assert.equal(rtl.sourceCards.length, 6, "Wrapping never duplicates the keyboard source list");
for (const direction of ["ltr", "rtl"]) {
  for (const width of [720.4, 855.975, 338.65]) {
    const zoomed = mount(direction, width); zoomed.visible(true);
    for (let step = 0; step < 6; step++) zoomed.advance(6002);
    assert.equal(Math.abs(zoomed.viewport.scrollLeft), 0, `Fractional ${width}px ${direction} layout wraps fully without accumulating rounded-width error`);
  }
}
console.log("Topic autoplay passed: cadence, manual/touch cooldown, pause/resume, hover/focus, visibility, reduced motion, prefix/RTL and eight language labels.");
