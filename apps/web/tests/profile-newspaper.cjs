/* node apps/web/tests/profile-newspaper.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise client behavior without a CMS, browser, timers or third-party requests.
const filename = path.resolve(__dirname, "../src/components/profile-newspaper.tsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const node = (type, props) => ({ type, props: props || {} });
const flatten = (value) => Array.isArray(value) ? value.flatMap(flatten) : value && typeof value === "object" ? [value, ...flatten(value.props?.children)] : [];
const nodes = (tree, type) => flatten(tree).filter(item => item.type === type);
const listeners = () => {
  const active = new Map();
  return {
    active,
    addEventListener: (name, handler) => { if (!active.has(name)) active.set(name, new Set()); active.get(name).add(handler); },
    removeEventListener: (name, handler) => active.get(name)?.delete(handler),
    emit: (name) => active.get(name)?.forEach(handler => handler()),
    count: () => [...active.values()].reduce((count, handlers) => count + handlers.size, 0),
  };
};

function harness({ reduced = false, storage = new Map(), storageThrows = false } = {}) {
  let cursor = 0;
  const hooks = [], effects = [], animations = [], resizeObservers = [], intersectionObservers = [];
  const media = { matches: reduced, ...listeners() };
  const header = { height: 117.25, getBoundingClientRect() { return { height: this.height }; } };
  const document = { hidden: false, querySelector: () => header, ...listeners() };
  const makeAnimation = (frames, options, target) => {
    const animation = { frames, options, target, paused: 0, played: 0, canceled: 0, pause() { this.paused++; }, play() { this.played++; }, cancel() { this.canceled++; } };
    animations.push(animation);
    return animation;
  };
  const section = { animate: (frames, options) => makeAnimation(frames, options, "section") };
  const sheet = { properties: new Map(), style: { setProperty: (name, value) => sheet.properties.set(name, value) }, animate: (frames, options) => makeAnimation(frames, options, "sheet"), querySelectorAll: () => [section] };
  const rail = { clientWidth: 420, calls: [], scrollBy(options) { this.calls.push(options); } };
  const react = {
    useRef: initial => { const index = cursor++; return hooks[index] ||= { current: initial }; },
    useState: initial => { const index = cursor++; if (!(index in hooks)) hooks[index] = initial; return [hooks[index], value => { hooks[index] = typeof value === "function" ? value(hooks[index]) : value; }]; },
    useEffect: effect => { effects.push(effect); },
  };
  class ResizeObserver {
    constructor(callback) { this.callback = callback; this.targets = new Set(); this.disconnected = false; resizeObservers.push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
  }
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = new Set(); this.disconnected = false; intersectionObservers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
  }
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, document, window: { matchMedia: () => media }, ResizeObserver, IntersectionObserver,
    sessionStorage: { getItem: key => { if (storageThrows) throw new Error("Storage unavailable"); return storage.get(key) || null; }, setItem: (key, value) => { if (storageThrows) throw new Error("Storage unavailable"); storage.set(key, value); } },
    setTimeout: () => { throw new Error("Newspaper must not schedule autoplay"); },
    setInterval: () => { throw new Error("Newspaper must not schedule autoplay"); },
    require: name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx: node, jsxs: node } : name.endsWith(".css") ? { default: new Proxy({}, { get: (_, key) => key }) } : require(name),
  }, { filename });
  const render = (component, props, refTarget) => {
    cursor = 0;
    const tree = module.exports[component](props);
    if (refTarget) flatten(tree).forEach(element => { if (element.props.ref) element.props.ref.current = refTarget; });
    return tree;
  };
  return { ...module.exports, render, sheet, section, rail, header, document, media, effects, animations, resizeObservers, intersectionObservers, storage };
}

const content = node("p", { children: "Original CMS biography" });
const session = new Map();
const first = harness({ storage: session });
const sheetTree = first.render("NewspaperSheet", { children: content, lang: "ar" }, first.sheet);
assert.equal(sheetTree.props.children, content, "Content is present before effects/entrance finish");
assert.equal(sheetTree.props.dir, "rtl");
assert.equal(sheetTree.props.lang, "ar");
const unmount = first.effects[0]();
assert.equal(first.sheet.properties.get("--profile-header-offset"), "118px", "Local navigation accounts for the actual header height");
first.header.height = 153;
first.resizeObservers[0].callback();
assert.equal(first.sheet.properties.get("--profile-header-offset"), "153px");
assert.equal(first.animations.length, 1, "First visit gets one non-blocking entrance");
assert(first.animations[0].options.duration < 1000);
assert(first.animations[0].frames.every(frame => frame.opacity == null && frame.visibility == null && frame.display == null), "Entrance never conceals the readable sheet");
const observer = first.intersectionObservers[0];
observer.callback([{ target: first.section, isIntersecting: false }]);
assert.equal(first.animations.length, 1, "Offscreen content does not start revealing");
observer.callback([{ target: first.section, isIntersecting: true }]);
assert.equal(first.animations.length, 2);
assert(!observer.targets.has(first.section), "A revealed section is not animated on every scroll");
first.document.hidden = true;
first.document.emit("visibilitychange");
assert(first.animations.every(animation => animation.paused === 1), "Background tabs pause in-flight motion");
first.document.hidden = false;
first.document.emit("visibilitychange");
assert(first.animations.every(animation => animation.played === 1));
first.animations[0].onfinish();
first.media.matches = true;
first.media.emit("change");
assert.equal(first.animations[0].canceled, 0, "Finished motion is no longer retained");
assert.equal(first.animations[1].canceled, 1, "Changing reduced-motion preference cancels active motion");
assert(observer.disconnected);
observer.callback([{ target: first.section, isIntersecting: true }]);
assert.equal(first.animations.length, 2, "An already queued observer callback cannot restart motion after the preference changes");
unmount();
assert(first.resizeObservers[0].disconnected);
assert.equal(first.media.count(), 0, "Unmount removes preference listeners");
assert.equal(first.document.count(), 0, "Unmount removes visibility listeners");

const revisit = harness({ storage: session });
revisit.render("NewspaperSheet", { children: content, lang: "sr" }, revisit.sheet);
revisit.effects[0]()();
assert.equal(revisit.animations.length, 0, "Returning to a portfolio in the session skips the introduction");
for (const options of [{ reduced: true }, { storageThrows: true }]) {
  const instance = harness(options);
  instance.render("NewspaperSheet", { children: content, lang: "sr" }, instance.sheet);
  const cleanup = instance.effects[0]();
  assert.equal(instance.animations.length, 0, "Reduced motion and unavailable session storage never force an entrance");
  if (options.reduced) assert.equal(instance.intersectionObservers.length, 0, "Reduced motion avoids reveal observers");
  cleanup();
}
const interrupted = harness();
interrupted.render("NewspaperSheet", { children: content, lang: "sr" }, interrupted.sheet);
const cleanupInterrupted = interrupted.effects[0]();
cleanupInterrupted();
assert(interrupted.animations.every(animation => animation.canceled === 1), "Unmount cancels unfinished motion");

const works = [
  { id: "a", title: "First real work", kind: "Article", href: "/sr/a/first", image: "/first.jpg", imageAlt: "Original cover" },
  { id: "b", title: "Second real work", kind: "Project", href: "https://example.test/project", external: true },
  { id: "c", title: "Third real work", kind: "Film", href: "#documentaries" },
];
for (const [lang, reduced, sign] of [["sr", false, 1], ["ar", false, -1], ["ar", true, -1]]) {
  const instance = harness({ reduced });
  const tree = instance.render("EditorialSelection", { items: works, label: "Selected work", previous: "Previous", next: "Next", lang }, instance.rail);
  assert.equal(nodes(tree, "a").length, 3, "Every real work remains directly accessible");
  const scroller = nodes(tree, "div").find(element => element.props.tabIndex === 0);
  assert(scroller, "The native scroll region can be reached from the keyboard");
  assert.equal(nodes(tree, "img").length, 1, "Works without photos get no fabricated image frame");
  const external = nodes(tree, "a").find(element => element.props.href === works[1].href);
  assert.equal(external.props.rel, "noopener noreferrer");
  const buttons = nodes(tree, "button");
  assert.equal(buttons[0].props["aria-label"], "Previous");
  assert.equal(buttons[1].props["aria-label"], "Next");
  assert.equal(instance.rail.calls.length, 0, "Selection never moves autonomously");
  buttons[1].props.onClick();
  assert.equal(instance.rail.calls[0].left, sign * 420 * 0.85, "Next follows reading direction");
  assert.equal(instance.rail.calls[0].behavior, reduced ? "auto" : "smooth");
  buttons[0].props.onClick();
  assert.equal(instance.rail.calls[1].left, -sign * 420 * 0.85);
}
const empty = harness();
assert.equal(empty.render("EditorialSelection", { items: [], label: "Selected", previous: "Previous", next: "Next", lang: "sr" }), null, "Empty portfolios do not show an empty selection");

const film = harness();
const filmProps = { title: "Real documentary", description: "Original description", embedUrl: "https://www.youtube.com/embed/verified?controls=1&autoplay=1", image: "/verified.jpg", watchHref: "https://www.youtube.com/watch?v=verified", watchLabel: "Watch", archiveHref: "/en/dokumentarci", archiveLabel: "All documentaries", details: [{ label: "Director", value: "Actual credited director" }] };
const poster = film.render("NewspaperFilm", filmProps);
assert.equal(nodes(poster, "iframe").length, 0, "Opening a profile does not load/play third-party video");
assert.equal(nodes(poster, "img")[0].props.loading, "lazy");
assert(nodes(poster, "a").some(element => element.props.href === filmProps.watchHref), "Watch link remains available independently of the embedded player");
assert(nodes(poster, "a").some(element => element.props.href === filmProps.archiveHref), "Documentary archive remains accessible");
const play = nodes(poster, "button")[0];
assert.equal(play.props["aria-label"], "Watch: Real documentary");
play.props.onClick();
const playerFocus = { calls: 0, focus() { this.calls++; } };
const player = nodes(film.render("NewspaperFilm", filmProps, playerFocus), "iframe")[0];
film.effects.at(-1)();
assert.equal(playerFocus.calls, 1, "Replacing the play button transfers keyboard focus to the player");
assert.equal(player.props.src, filmProps.embedUrl);
assert.equal(player.props.title, filmProps.title);
assert.equal(player.props.allowFullScreen, true);
assert(player.props.allow.includes("picture-in-picture"));
assert.equal(new URL(player.props.src).searchParams.get("controls"), "1", "Native video controls survive deferred loading");
const unavailable = harness().render("NewspaperFilm", { ...filmProps, embedUrl: undefined, image: undefined });
assert.equal(nodes(unavailable, "iframe").length + nodes(unavailable, "img").length + nodes(unavailable, "button").length, 0, "A film without media preserves its text and links without an empty fake player");
assert.equal(nodes(unavailable, "h3")[0].props.children, filmProps.title);

for (const name of ["Ada", "Aleksandra Konstantinović Petrović de Albuquerque", "إلهان راديتيناتس"]) {
  const tree = harness().render("ProfileMasthead", { name, label: "Portfolio" });
  assert.equal(nodes(tree, "h1").length, 1);
  assert.equal(nodes(tree, "h1")[0].props.children, name, "Names stay whole; Arabic letters are not fragmented by animation");
  assert.equal(nodes(tree, "img").length, 0);
}

console.log("PASS: newspaper motion lifecycle, session/reduced-motion access, native LTR/RTL selection, deferred video controls, sparse media and whole-name semantics.");
