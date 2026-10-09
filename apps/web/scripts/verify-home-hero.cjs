// Run the actual hero component with a deterministic hook/clock harness. Native
// browser checks cover typography and the grid's intrinsic height reservation.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/components/home-hero-showcase.tsx"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText;

const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === "object"
  ? [node, ...flatten(node.props.children)] : [];

function mount(dir = "ltr") {
  let now = 0, serial = 0, hookIndex = 0, dirty = true, tree, intersection, motionListener, focusedId;
  const hooks = [], timers = new Map(), documentListeners = new Map();
  let pendingEffects = [];
  const schedule = (fn, delay = 0) => { const id = ++serial; timers.set(id, { fn, at: now + delay }); return id; };
  const clear = id => timers.delete(id);
  const media = { matches: false, addEventListener(_type, fn) { motionListener = fn; }, removeEventListener() {} };
  const section = { contains: value => Boolean(value?.inside) };
  const document = { visibilityState: "visible", addEventListener(type, fn) { documentListeners.set(type, fn); },
    removeEventListener(type) { documentListeners.delete(type); }, getElementById: id => ({ focus() { focusedId = id; } }) };
  const window = { matchMedia: () => media, setTimeout: schedule, clearTimeout: clear, addEventListener() {}, removeEventListener() {} };
  const react = {
    useRef(value) { const slot = hookIndex++; return hooks[slot] ||= { current: value }; },
    useMemo(work) { return work(); },
    useState(initial) {
      const slot = hookIndex++;
      if (!hooks[slot]) hooks[slot] = { value: initial };
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
  const imported = name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx }
    : name.endsWith(".css") ? { default: new Proxy({}, { get: (_target, key) => key }) }
    : name.endsWith("article-facts") ? { ArticleFacts: "ArticleFacts" }
    : name.endsWith("chevron-icon") ? { ChevronIcon: "ChevronIcon" }
    : (() => { throw new Error(`Unexpected import ${name}`); })();
  const result = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "IntersectionObserver", code)(
    imported, result, result.exports, window, document, IntersectionObserver);
  const props = {
    dir, lang: dir === "rtl" ? "ar" : "en", archiveHref: "/archive", searchHref: "/search",
    labels: { heroEyebrow: "Headlines", heroPrimary: "Read story", heroSecondary: "Explore themes", archive: "Archive",
      heroFocus: "Focus", heroDate: "Date", heroStyle: "Style", next: "Next story", previous: "Previous story",
      volumeUp: "Volume up", volumeDown: "Volume down", mute: "Mute", unmute: "Unmute", audioControls: "Audio", storyTabs: "Headline stories" },
    slides: [34, 9, 28, 25, 19].map((id, i) => ({ id, href: `/article/${id}`, title: `Full unchanged story ${id}`,
      subtitle: `Original subtitle ${id}`, imageUrl: `/photo/${id}.jpg`, sectionLabel: "Analyses", styleLabel: "Analysis",
      publishedLabel: "October 9, 2026", focusLabel: "Complete editorial focus", badges: i === 0 ? [{ key: "breaking", label: "Breaking" }] : [] }))
  };
  function flush() {
    let passes = 0;
    while (dirty) {
      assert.ok(++passes < 30, "Hook render loop must converge");
      dirty = false; hookIndex = 0; pendingEffects = [];
      tree = result.exports.HomeHeroShowcase(props);
      for (const node of flatten(tree)) if (node.type === "article" && node.props.ref) node.props.ref.current = section;
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
  flush();
  return {
    props, exports: result.exports, advance, get tree() { return tree; },
    get title() { return flatten(tree).find(node => node.type === "h1")?.props.children; },
    get selected() { return flatten(tree).find(node => node.type === "button" && node.props["aria-selected"] === true)?.props.id; },
    get focusedId() { return focusedId; },
    visible(value) { intersection([{ isIntersecting: value }]); flush(); },
    hidden(value) { document.visibilityState = value ? "hidden" : "visible"; documentListeners.get("visibilitychange")(); flush(); },
    reduced(value) { media.matches = value; motionListener(); flush(); },
    hover(value) { tree.props[value ? "onPointerEnter" : "onPointerLeave"]({ pointerType: "mouse" }); flush(); },
    focus() { tree.props.onFocusCapture(); flush(); },
    blur() { tree.props.onBlurCapture({ currentTarget: section, relatedTarget: null }); flush(); },
    togglePause() { flatten(tree).find(node => node.type === "button" && "aria-pressed" in node.props).props.onClick(); flush(); },
    next() { flatten(tree).find(node => node.type === "button" && node.props["aria-label"] === "Next story").props.onClick(); flush(); },
    tab(index, key, modifiers = {}) {
      const tabs = flatten(tree).filter(node => node.props.role === "tab");
      let prevented = false;
      if (key) tabs[index].props.onKeyDown({ key, ...modifiers, preventDefault() { prevented = true; } }); else tabs[index].props.onClick();
      flush();
      return prevented;
    }
  };
}

const hero = mount();
assert.equal(hero.title, "Full unchanged story 34");
assert.deepEqual(flatten(hero.tree).filter(node => node.props.role === "tab").map(node => node.props.id),
  [34, 9, 28, 25, 19].map(id => `home-hero-tab-${id}`), "Canonical published order must remain untouched");
const replicas = flatten(hero.tree).filter(node => node.props["aria-hidden"] === true && node.props.className?.includes("measure"));
assert.equal(replicas.length, 5);
assert.ok(replicas.every(node => !flatten(node).some(child => ["a", "button", "img", "iframe", "h1"].includes(child.type))),
  "Height reservation must add no focusable copies, duplicate headings or media requests");
assert.equal(flatten(hero.tree).filter(node => node.type === "img").length, 1);
assert.equal(flatten(hero.tree).filter(node => node.type === "h1").length, 1);
for (const language of ["sr", "en", "tr", "fr", "de", "es", "el", "ar"]) {
  const copy = hero.exports.HERO_PLAYBACK_LABELS[language];
  assert.ok(copy.pause && copy.resume);
  assert.notEqual(copy.pause, copy.resume);
}
hero.advance(45001); assert.equal(hero.title, "Full unchanged story 34", "Offscreen hero must remain still");
hero.visible(true); hero.advance(44999); assert.equal(hero.title, "Full unchanged story 34");
hero.advance(2); assert.equal(hero.title, "Full unchanged story 9", "The existing45second cadence must remain");
hero.hover(true); hero.advance(90000); assert.equal(hero.title, "Full unchanged story 9");
hero.hover(false); hero.focus(); hero.advance(45001); assert.equal(hero.title, "Full unchanged story 9");
hero.togglePause(); hero.blur(); hero.advance(90000); assert.equal(hero.title, "Full unchanged story 9", "Explicit pause survives blur");
hero.next(); assert.equal(hero.title, "Full unchanged story 28", "Manual navigation works during pause");
hero.togglePause(); hero.advance(44999); assert.equal(hero.title, "Full unchanged story 28");
hero.advance(2); assert.equal(hero.title, "Full unchanged story 25");
hero.hidden(true); hero.advance(90000); assert.equal(hero.title, "Full unchanged story 25");
hero.hidden(false); hero.reduced(true); hero.advance(90000); assert.equal(hero.title, "Full unchanged story 25");
hero.tab(4); assert.equal(hero.title, "Full unchanged story 19", "Reduced motion keeps manual selection available");
hero.reduced(false); hero.advance(44000); hero.next(); assert.equal(hero.title, "Full unchanged story 34");
hero.advance(2000); assert.equal(hero.title, "Full unchanged story 34", "Manual selection restarts a full interval");
hero.tab(0, "End"); assert.equal(hero.title, "Full unchanged story 19");
assert.equal(hero.focusedId, "home-hero-tab-19");
for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
  assert.equal(hero.tab(4, "Home", modifiers), false, "Modified navigation must preserve the browser shortcut");
  assert.equal(hero.title, "Full unchanged story 19", "Modified Home must not change the story");
  assert.equal(hero.focusedId, "home-hero-tab-19", "Modified Home must not move focus between tabs");
}
hero.tab(4, "ArrowRight"); assert.equal(hero.title, "Full unchanged story 34", "Keyboard traversal wraps");
const rtl = mount("rtl"); rtl.tab(0, "ArrowLeft"); assert.equal(rtl.title, "Full unchanged story 9");
rtl.tab(1, "ArrowRight"); assert.equal(rtl.title, "Full unchanged story 34");
console.log("Home hero passed: canonical order/full text, noninteractive intrinsic sizing copies, single media request, 45-second cadence, pause/resume, hover/focus, visibility, reduced motion, manual reset and RTL keyboard tabs.");
