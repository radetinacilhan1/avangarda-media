"use strict";
// Run the real client navigation components with controlled hooks and DOM
// lifecycle APIs: no browser automation, production network or CMS writes.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const langs = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const withLangPrefix = (input, lang) => {
  const [withoutHash, hash = ""] = input.split("#");
  const [pathname, query = ""] = withoutHash.split("?");
  const parts = pathname.split("/").filter(Boolean);
  if (langs.includes(parts[0])) parts.shift();
  const params = new URLSearchParams(query);
  params.delete("lang");
  const result = `/${lang}${parts.length ? `/${parts.join("/")}` : ""}${params.size ? `?${params}` : ""}`;
  return hash ? `${result}#${hash}` : result;
};

function mount(component, lang = "sr") {
  let cursor = 0, dirty = true, tree, pending = [], unmounted = false;
  const slots = [], nodesByPath = new Map(), docEvents = new Map(), windowEvents = new Map(), viewportEvents = new Map(), mediaEvents = new Set(), frames = [];
  const styleKeys = ["position", "top", "left", "right", "width", "overflow", "paddingInlineEnd"];

  class Element {
    constructor(type = "div", props = {}) {
      this.type = type; this.props = props; this.children = []; this.style = {}; this.dataset = {}; this.inert = false; this.isConnected = true;
    }
    focus() { document.activeElement = this; }
    contains(target) { return this === target || this.children.some((child) => child.contains(target)); }
    getClientRects() { return this.props.hidden ? [] : [{}]; }
    closest(selector) {
      let element = this;
      while (element) { if (matches(element, selector)) return element; element = element.parent; }
      return null;
    }
    matches(selector) { return selector === ":focus-visible" ? this.keyboardFocus : matches(this, selector); }
    querySelectorAll(selector) { return flattenElements(this).slice(1).filter((node) => matches(node, selector)); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  }
  function matches(node, selector) {
    if (selector.includes(",")) return selector.split(",").some((part) => matches(node, part.trim()));
    if (selector === "[data-nav-child]:focus") return node.props["data-nav-child"] !== undefined && node === document.activeElement;
    if (selector === "a[href]") return node.type === "a" && Boolean(node.props.href);
    if (selector === "button:not([disabled])") return node.type === "button" && !node.props.disabled;
    if (selector === "input:not([disabled])") return node.type === "input" && !node.props.disabled && node.props.type !== "hidden";
    if (selector.startsWith(".")) return (node.props.className ?? "").split(" ").includes(selector.slice(1));
    const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    return attribute ? Object.hasOwn(node.props, attribute[1]) && (attribute[2] === undefined || String(node.props[attribute[1]]) === attribute[2]) : false;
  }
  const flattenElements = (node) => [node, ...node.children.flatMap(flattenElements)];
  const background = new Element("main");
  const preexistingInert = new Element("aside"); preexistingInert.inert = true;
  const body = new Element("body");
  body.children = [background, preexistingInert];
  styleKeys.forEach((key) => { body.style[key] = ""; });
  body.style.paddingInlineEnd = "9px";
  const document = {
    body, activeElement: background,
    documentElement: { clientWidth: 375, style: { scrollBehavior: "smooth" } },
    addEventListener(name, callback) { const callbacks = docEvents.get(name) ?? new Set(); callbacks.add(callback); docEvents.set(name, callbacks); },
    removeEventListener(name, callback) { docEvents.get(name)?.delete(callback); }
  };
  const visualViewport = {
    height: 844, offsetTop: 0,
    addEventListener(name, callback) { const callbacks = viewportEvents.get(name) ?? new Set(); callbacks.add(callback); viewportEvents.set(name, callbacks); },
    removeEventListener(name, callback) { viewportEvents.get(name)?.delete(callback); }
  };
  const media = { matches: false,
    addEventListener(name, callback) { assert.equal(name, "change"); mediaEvents.add(callback); },
    removeEventListener(name, callback) { assert.equal(name, "change"); mediaEvents.delete(callback); }
  };
  const window = { scrollX: 7, scrollY: 987, innerWidth: 390, innerHeight: 844, visualViewport,
    matchMedia(query) { assert.equal(query, "(min-width: 769px)"); return media; },
    scrollTo(x, y) { assert.equal(document.documentElement.style.scrollBehavior, "auto"); this.scrollX = x; this.scrollY = y; },
    addEventListener(name, callback) { const callbacks = windowEvents.get(name) ?? new Set(); callbacks.add(callback); windowEvents.set(name, callbacks); },
    removeEventListener(name, callback) { windowEvents.get(name)?.delete(callback); }
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[index].value, (next) => {
        assert.equal(unmounted, false);
        const value = typeof next === "function" ? next(slots[index].value) : next;
        if (!Object.is(slots[index].value, value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useId() { const index = cursor++; return (slots[index] ??= { id: `navigation-${index}` }).id; },
    useMemo(work, deps) { const index = cursor++, old = slots[index]; if (!old || deps.some((dep, i) => !Object.is(dep, old.deps[i]))) slots[index] = { deps, value: work() }; return slots[index].value; },
    useEffect(work, deps) {
      const index = cursor++, old = slots[index];
      if (!old || deps.some((dep, i) => !Object.is(dep, old.deps[i]))) pending.push(() => { old?.cleanup?.(); slots[index] = { deps, cleanup: work() }; });
    }
  };
  const jsx = (type, props) => ({ type, props });
  const imported = (name) => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx }
    : name === "react-dom" ? { createPortal: (content) => ({ type: "portal", props: { children: content } }) }
    : name === "@/lib/i18n" ? { languages: langs.map((code) => ({ code, label: code })), resolveLang: (value) => value, getLanguageMeta: (code) => ({ code }), withLangPrefix }
    : name === "@/components/language-icon" ? { LanguageIcon: () => null, getLanguageDisplayCode: (code) => code.toUpperCase() }
    : name === "@/components/theme-switcher" ? { ThemeSwitcher: () => null }
    : name.endsWith(".css") ? { default: new Proxy({}, { get: (_, key) => key }) }
    : (() => { throw new Error(`Unexpected import ${name}`); })();
  const source = fs.readFileSync(path.join(__dirname, `../src/components/${component}.tsx`), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "HTMLElement", "getComputedStyle", "requestAnimationFrame", code)(
    imported, module, module.exports, window, document, Element, () => ({ paddingInlineEnd: "9px" }), (callback) => frames.push(callback));
  const items = [
    { key: "news", href: `/${lang}/section/front`, label: "Front", children: [{ key: "human-rights", href: `/${lang}/ljudska-prava`, label: "Human rights" }, { key: "interactive", href: `/${lang}/interaktivno`, label: "Interactive" }] },
    ...["analysis", "interview", "column"].map((key) => ({ key, href: `/${lang}/section/${key}`, label: key })),
    { key: "archive", href: `/${lang}/archive`, label: "Archive", children: [{ key: "archive-index", href: `/${lang}/archive`, label: "Archive" }, { key: "story-map", href: `/${lang}/mapa`, label: "Map" }] },
    { key: "about", href: `/${lang}/o-nama`, label: "About", children: [{ key: "team", href: `/${lang}/people`, label: "Team" }] }
  ];
  const props = { lang, items, currentPath: `/en/a/original?lang=en&q=rights#context`, activeLang: lang, activeNav: "news", searchPlaceholder: "Search", searchLabel: "Search", clock: null, socialLinks: null, languageSlot: null, themeSlot: null };
  const render = module.exports[component === "desktop-navigation" ? "DesktopNavigation" : "MobileHeaderMenu"];
  const flatten = (node) => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === "object" && node.props ? [node, ...flatten(node.props.children)] : [];
  let renderedElements = [];
  function toElement(node, key = "0", parent = null) {
    if (!node || typeof node !== "object" || !node.props) return null;
    const element = nodesByPath.get(key) ?? new Element(); nodesByPath.set(key, element);
    element.type = node.type; element.props = node.props; element.parent = parent; element.children = [];
    renderedElements.push(element);
    const children = Array.isArray(node.props.children) ? node.props.children.flat(Infinity) : [node.props.children];
    element.children = children.map((child, i) => toElement(child, `${key}.${i}`, element)).filter(Boolean);
    if (node.props.ref) node.props.ref.current = element;
    if (node.type === "portal") { body.children = [background, preexistingInert, ...element.children]; return null; }
    return element;
  }
  function flush() {
    let renders = 0;
    while (dirty) {
      assert.ok(++renders < 30, "Lifecycle updates converge"); dirty = false; cursor = 0; pending = []; renderedElements = [];
      body.children = [background, preexistingInert];
      tree = render(props); toElement(tree);
      pending.forEach((effect) => effect());
    }
    while (frames.length) frames.shift()();
  }
  flush();
  const event = (extra = {}) => ({ defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...extra });
  const click = (node) => { node.props.onClick(event()); flush(); };
  const findNode = (predicate) => flatten(tree).find(predicate);
  const findElement = (predicate) => renderedElements.find(predicate);
  return { items, props, document, window, body, media, mediaEvents, docEvents, viewportEvents, background, preexistingInert, event, click, flush,
    get nodes() { return flatten(tree); }, findNode, findElement,
    dispatch(name, extra) { const e = event(extra); for (const callback of docEvents.get(name) ?? []) callback(e); flush(); return e; },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); unmounted = true; }
  };
}

const desktop = mount("desktop-navigation");
const front = () => desktop.findNode((node) => node.props["data-nav-key"] === "news");
const disclosure = () => desktop.findNode((node) => node.props["data-nav-toggle"] !== undefined);
const parentAnchor = desktop.findNode((node) => node.type === "a" && node.props.href === "/sr/section/front");
assert.equal(parentAnchor.props.href, desktop.items[0].href, "Parent URL is preserved");
assert.ok(parentAnchor.props.children.some((child) => child?.type === "svg"), "Original parent chevron remains inside the navigating anchor");
front().props.onPointerEnter({ pointerType: "mouse" }); desktop.flush();
assert.equal(disclosure().props["aria-expanded"], true, "Hover opens immediately");
desktop.click(disclosure()); assert.equal(disclosure().props["aria-expanded"], true, "First click pins the hovered menu open");
desktop.click(disclosure()); assert.equal(disclosure().props["aria-expanded"], false, "Second pinned click closes");
desktop.click(disclosure()); assert.equal(disclosure().props["aria-expanded"], true);
desktop.dispatch("pointerdown", { target: desktop.background }); assert.equal(disclosure().props["aria-expanded"], false, "Outside pointer closes");
const frontElement = desktop.findElement((node) => node.props["data-nav-key"] === "news");
front().props.onKeyDown(desktop.event({ key: "ArrowDown", target: frontElement.querySelector("[data-nav-toggle]"), currentTarget: frontElement })); desktop.flush();
assert.equal(desktop.document.activeElement.props.href, "/sr/ljudska-prava", "ArrowDown opens and focuses first child");
front().props.onKeyDown(desktop.event({ key: "End", target: desktop.document.activeElement, currentTarget: frontElement })); desktop.flush();
assert.equal(desktop.document.activeElement.props.href, "/sr/interaktivno");
front().props.onKeyDown(desktop.event({ key: "Escape", target: desktop.document.activeElement, currentTarget: frontElement })); desktop.flush();
assert.equal(disclosure().props["aria-expanded"], false);
assert.equal(desktop.document.activeElement.props["data-nav-toggle"], true, "Escape restores disclosure focus without reopening");
desktop.unmount();
assert.ok(Array.from(desktop.docEvents.values()).every((callbacks) => callbacks.size === 0));

for (const lang of langs) {
  const mobile = mount("mobile-header-menu", lang);
  const trigger = () => mobile.findNode((node) => node.type === "button" && node.props["aria-haspopup"] === "dialog");
  const triggerElement = mobile.findElement((node) => node.props["aria-haspopup"] === "dialog"); triggerElement.focus();
  const beforeStyles = { ...mobile.body.style };
  mobile.click(trigger());
  const panel = mobile.findNode((node) => node.props["data-mobile-menu"] !== undefined);
  assert.equal(panel.props.dir, lang === "ar" ? "rtl" : "ltr");
  assert.equal(String(panel.props["aria-modal"]), "true");
  assert.equal(mobile.body.style.position, "fixed");
  assert.equal(mobile.body.style.top, "-987px");
  assert.equal(mobile.body.style.paddingInlineEnd, "24px", "Scrollbar compensation preserves previous padding");
  assert.equal(mobile.background.inert, true);
  assert.equal(mobile.preexistingInert.inert, true);
  assert.equal(mobile.body.dataset.mobileMenuOpen, "true");
  const overlay = mobile.findElement((node) => node.props["data-mobile-menu-overlay"] !== undefined);
  assert.equal(overlay.style.height, "844px");
  mobile.window.visualViewport.height = 390; mobile.window.visualViewport.offsetTop = 10;
  for (const callback of mobile.viewportEvents.get("resize")) callback();
  assert.equal(overlay.style.height, "390px", "Virtual keyboard viewport keeps panel bounded");
  assert.equal(overlay.style.top, "10px");
  const languageLinks = mobile.nodes.filter((node) => node.type === "a" && langs.includes(node.props["aria-label"]));
  assert.equal(languageLinks.length, 8);
  for (const language of langs) assert.equal(languageLinks.find((node) => node.props["aria-label"] === language).props.href, `/${language}/a/original?q=rights#context`, "Language retains current article, search context and fragment");
  assert.equal(mobile.nodes.filter((node) => node.type === "a" && mobile.items.some((item) => item.href === node.props.href)).length, 6, "All primary destination URLs remain directly available");
  const groupToggle = mobile.findNode((node) => node.type === "button" && node.props["aria-controls"]?.endsWith("-news"));
  mobile.click(groupToggle);
  assert.ok(mobile.nodes.some((node) => node.type === "a" && node.props.href === `/${lang}/ljudska-prava`));
  assert.equal(mobile.body.style.top, "-987px", "Accordion does not relock or reset the page");
  const panelElement = mobile.findElement((node) => node.props["data-mobile-menu"] !== undefined);
  const controls = panelElement.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]');
  controls[controls.length - 1].focus(); mobile.dispatch("keydown", { key: "Tab", shiftKey: false });
  assert.equal(mobile.document.activeElement, controls[0], "Tab wraps inside the modal");
  mobile.dispatch("keydown", { key: "Tab", shiftKey: true });
  assert.equal(mobile.document.activeElement, controls[controls.length - 1], "Shift+Tab wraps backwards");
  mobile.dispatch("keydown", { key: "Escape" });
  assert.equal(trigger().props["aria-expanded"], false);
  assert.deepEqual(mobile.body.style, beforeStyles, "Every overwritten body style is restored");
  assert.equal(mobile.window.scrollY, 987); assert.equal(mobile.window.scrollX, 7);
  assert.equal(mobile.document.documentElement.style.scrollBehavior, "smooth");
  assert.equal(mobile.background.inert, false); assert.equal(mobile.preexistingInert.inert, true);
  assert.equal(mobile.body.dataset.mobileMenuOpen, undefined);
  assert.equal(mobile.document.activeElement, triggerElement, "Original focus is restored");
  mobile.click(trigger());
  for (const callback of mobile.mediaEvents) callback({ matches: true }); mobile.flush();
  assert.equal(trigger().props["aria-expanded"], false, "Switching to desktop closes and unlocks");
  mobile.unmount();
  assert.equal(mobile.mediaEvents.size, 0);
  assert.ok(Array.from(mobile.docEvents.values()).every((callbacks) => callbacks.size === 0));
  assert.ok(Array.from(mobile.viewportEvents.values()).every((callbacks) => callbacks.size === 0));
}
const about = mount("mobile-header-menu");
about.props.currentPath = "/sr/o-nama";
about.props.items[5].children = ["ko-smo-mi", "urednicki-princip", "ljudi"].map((fragment) => ({ key: fragment, label: fragment, href: `/sr/o-nama#${fragment}` }));
about.click(about.findNode((node) => node.type === "button" && node.props["aria-haspopup"] === "dialog"));
assert.equal(about.nodes.filter((node) => node.type === "a" && node.props["aria-current"] === "page").length, 1, "About section fragments must not all claim to be the current page");
assert.equal(about.nodes.filter((node) => node.type === "a" && node.props.href?.includes("#ko-smo-mi")).length, 1, "About fragment routes remain available");
about.unmount();
assert.equal(about.body.style.position, "", "Unmounting an open modal also restores the page");
assert.equal(about.background.inert, false);
const search = mount("mobile-header-menu", "ar");
search.props.currentPath = "/search";
search.window.location = { pathname: "/search", search: "?lang=ar&q=Pobednik", hash: "#results" };
search.click(search.findNode((node) => node.type === "button" && node.props["aria-haspopup"] === "dialog"));
for (const language of langs) {
  const link = search.nodes.find((node) => node.type === "a" && node.props["aria-label"] === language);
  assert.equal(link.props.href, `/${language}/search?q=Pobednik#results`, "Actual browser search query and fragment survive pathname-only header props");
}
search.unmount();
console.log("Navigation lifecycle passed: original parent chevrons/URLs, hover pin/collapse, keyboard and outside close, eight-language destination/context preservation, portal scroll/style/inert/focus restoration, modal Tab trapping, keyboard viewport resizing and cleanup.");
