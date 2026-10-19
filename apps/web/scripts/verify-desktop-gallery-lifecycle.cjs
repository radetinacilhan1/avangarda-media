"use strict";
// Real component and gallery query, controlled browser events/clock and public
// response fixtures. This script makes no network, CMS or image requests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const sourceRoot = path.resolve(__dirname, "../src");
const compile = file => ts.transpileModule(fs.readFileSync(path.join(sourceRoot, file), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText;
const componentCode = compile("components/desktop-gallery-preview.tsx");
const languages = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const heading = { sr: "Galerije", en: "Galleries", tr: "Galeriler", fr: "Galeries", de: "Galerien", es: "Galerías", el: "Συλλογές φωτογραφιών", ar: "معارض الصور" };
const localizedTitles = {
  sr: "Objavljene fotografije sa terena", en: "Published photographs from the field", tr: "Sahadan yayımlanan fotoğraflar",
  fr: "Photographies publiées sur le terrain", de: "Veröffentlichte Fotografien von der Feldrecherche",
  es: "Fotografías publicadas desde el terreno", el: "Δημοσιευμένες φωτογραφίες από την έρευνα στο πεδίο", ar: "صور منشورة من البحث الميداني"
};
const suppliedGalleries = [
  { id: 34, title: "A published gallery", imageUrl: "/medium-gallery-34.jpg", slug: "gallery-34" },
  { id: 28, title: "The second gallery with a significantly longer unchanged title to reserve caption height", imageUrl: "/medium-gallery-28.jpg", slug: "gallery-28" },
  { id: 25, title: "Third gallery", imageUrl: "/small-gallery-25.jpg", slug: "gallery-25" }
];

function mount({ wide = false, reduced = false, lang = "en", galleries = suppliedGalleries, observerAvailable = true, background = false } = {}) {
  let cursor = 0, dirty = true, tree, observer, unmounted = false, now = 0, timerId = 0;
  const slots = [], documentEvents = new Map(), observerHistory = [], timers = new Map(), renderHistory = [];
  let pending = [];
  const section = {};
  function media(initial) {
    const events = new Set();
    return { matches: initial, events,
      addEventListener(type, callback) { assert.equal(type, "change"); events.add(callback); },
      removeEventListener(type, callback) { assert.equal(type, "change"); assert(events.delete(callback), "The same listener is removed"); },
      change(value) { this.matches = value; for (const callback of events) callback(); flush(); }
    };
  }
  const desktopMedia = media(wide), motionMedia = media(reduced);
  const document = { visibilityState: background ? "hidden" : "visible",
    addEventListener(type, callback) { assert.equal(documentEvents.has(type), false); documentEvents.set(type, callback); },
    removeEventListener(type, callback) { assert.equal(documentEvents.get(type), callback); documentEvents.delete(type); }
  };
  const window = {
    matchMedia(query) {
      assert.ok(query === "(min-width: 1101px)" || query === "(prefers-reduced-motion: reduce)");
      return query === "(min-width: 1101px)" ? desktopMedia : motionMedia;
    },
    setInterval(callback, delay) {
      assert.equal(delay, 6000, "Rotation uses approximately six seconds");
      assert.equal(timers.size, 0, "A second interval cannot accumulate across state or viewport changes");
      const id = ++timerId; timers.set(id, { callback, delay, at: now + delay }); return id;
    },
    clearInterval(id) { assert(timers.delete(id), "Each running interval is cleaned up exactly once"); }
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
    useState(initial) {
      const index = cursor++;
      slots[index] ||= { value: typeof initial === "function" ? initial() : initial };
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
    : name === "@/lib/i18n" ? { withLang: (href, language) => `/${language}${href}` }
    : name.endsWith(".css") ? { default: new Proxy({}, { get: (_, property) => property }) }
    : (() => { throw new Error(`Unexpected runtime import: ${name}`); })();
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", "document", "IntersectionObserver", componentCode)(
    imported, module, module.exports, window, document, observerAvailable ? IntersectionObserver : undefined);
  const props = { lang, galleries };
  const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === "object"
    ? [node, ...flatten(node.props.children)] : [];
  function flush() {
    let renders = 0;
    while (dirty) {
      assert.ok(++renders < 20, "Lifecycle updates must converge");
      dirty = false; cursor = 0; pending = [];
      for (const slot of slots) if (slot && "current" in slot) slot.current = null;
      tree = module.exports.DesktopGalleryPreview(props);
      renderHistory.push(tree);
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
  function control(name) { const button = flatten(tree).find(node => node.type === "button" && node.props.className === name); assert(button, `${name} control exists`); button.props.onClick(); flush(); }
  flush();
  return {
    get tree() { return tree; }, get nodes() { return flatten(tree); }, desktopMedia, motionMedia, timers,
    get observer() { return observer; }, documentEvents, observerHistory, renderHistory, advance,
    get selected() { return tree?.props["data-active-id"]; },
    intersect(value) { assert(observer && !observer.disconnected); observer.callback([{ isIntersecting: value }]); flush(); },
    background(value) { document.visibilityState = value ? "hidden" : "visible"; documentEvents.get("visibilitychange")(); flush(); },
    pause() { control("pause"); }, previous() { control("previous"); }, next() { control("next"); },
    hover(value) { tree.props[value ? "onPointerEnter" : "onPointerLeave"](); flush(); },
    focus(value, remainsInside = false) {
      if (value) tree.props.onFocusCapture();
      else tree.props.onBlurCapture({ currentTarget: { contains: () => remainsInside }, relatedTarget: remainsInside ? {} : null });
      flush();
    },
    replaceGalleries(value) { props.galleries = value; dirty = true; flush(); },
    unmount() { for (const slot of slots) slot?.cleanup?.(); unmounted = true; }
  };
}

function checkMatching(state, galleries = suppliedGalleries, lang = "en") {
  const selected = galleries.find(gallery => gallery.id === state.selected);
  assert(selected, "The active identity belongs to a supplied published gallery");
  const images = state.nodes.filter(node => node.type === "img");
  assert.equal(images.length, 1, "Only the active gallery photograph can be requested by the browser");
  assert.equal(images[0].props.src, selected.imageUrl);
  assert.equal(images[0].props.alt, selected.title);
  assert.equal(images[0].props.loading, "lazy");
  assert.equal(images[0].props.decoding, "async");
  assert.equal(images[0].props.width, "640"); assert.equal(images[0].props.height, "480");
  const photoLink = state.nodes.find(node => node.props.className === "photograph");
  assert.equal(photoLink.props.href, `/${lang}/galerije/${selected.slug}`);
  const captions = state.nodes.filter(node => node.props.className === "caption");
  assert.equal(captions.length, galleries.length, "Every caption reserves its own height in the shared CSS grid stack");
  for (let index = 0; index < captions.length; index++) {
    const caption = captions[index], active = galleries[index].id === selected.id;
    assert.equal(caption.props["data-active"], active);
    assert.equal(caption.props["aria-hidden"], !active);
    const links = caption.props.children;
    assert.equal(links[0].props.children, galleries[index].title);
    assert(links.every(link => link.props.href === `/${lang}/galerije/${galleries[index].slug}`));
    assert(links.every(link => active ? link.props.tabIndex === undefined : link.props.tabIndex === -1), "Inactive links never enter the keyboard sequence");
  }
  assert.equal(captions.filter(caption => caption.props["data-active"]).length, 1);
}

function lifecycleChecks() {
  const empty = mount({ wide: true, galleries: [] });
  assert.equal(empty.tree, null); assert.equal(empty.timers.size, 0); assert.equal(empty.observerHistory.length, 0); empty.unmount();
  const state = mount();
  assert.equal(state.renderHistory[0], null, "SSR/first render omits desktop-only photographs");
  assert.equal(state.tree, null, "Mobile has no card, heading, controls, images or reserved caption area");
  assert.equal(state.observerHistory.length, 0); assert.equal(state.timers.size, 0);
  state.advance(60000); assert.equal(state.tree, null);
  state.desktopMedia.change(true);
  assert.equal(state.tree.type, "section"); assert.equal(state.tree.props["data-playing"], false); assert.equal(state.timers.size, 0);
  checkMatching(state);
  state.intersect(true); assert.equal(state.timers.size, 1);
  state.advance(5999); assert.equal(state.selected, 34);
  state.advance(1); assert.equal(state.selected, 28); checkMatching(state);
  state.advance(6000); assert.equal(state.selected, 25); checkMatching(state);
  state.advance(6000); assert.equal(state.selected, 34); checkMatching(state);
  state.intersect(false); state.advance(60000); assert.equal(state.selected, 34); assert.equal(state.timers.size, 0);
  state.intersect(true); state.background(true); state.advance(60000); assert.equal(state.selected, 34); assert.equal(state.timers.size, 0);
  state.background(false); state.advance(6000); assert.equal(state.selected, 28);
  state.pause(); state.intersect(false); state.intersect(true); state.background(true); state.background(false);
  state.advance(60000); assert.equal(state.selected, 28); assert.equal(state.timers.size, 0, "Explicit pause survives visibility changes");
  state.pause(); state.hover(true); state.advance(60000); assert.equal(state.selected, 28); assert.equal(state.timers.size, 0);
  state.hover(false); state.focus(true); state.advance(60000); assert.equal(state.selected, 28); assert.equal(state.timers.size, 0);
  state.focus(false, true); assert.equal(state.timers.size, 0, "Focus moving inside the card does not resume rotation");
  state.focus(false); state.advance(6000); assert.equal(state.selected, 25);
  state.next(); assert.equal(state.selected, 34); checkMatching(state);
  assert.equal(state.nodes.find(node => node.props.className === "pause").props["aria-pressed"], true);
  state.advance(60000); assert.equal(state.selected, 34, "Manual next pauses rotation");
  state.previous(); assert.equal(state.selected, 25, "Previous wraps around the first item"); checkMatching(state);
  state.pause(); state.motionMedia.change(true); state.advance(60000); assert.equal(state.selected, 25); assert.equal(state.timers.size, 0);
  assert.equal(state.nodes.some(node => node.props.className === "pause"), false);
  state.next(); assert.equal(state.selected, 34, "Reduced motion retains manual navigation");
  state.motionMedia.change(false); state.pause();
  const firstObserver = state.observer;
  state.desktopMedia.change(false); state.advance(60000);
  assert.equal(state.tree, null); assert.equal(state.nodes.length, 0); assert.equal(firstObserver.disconnected, true); assert.equal(state.timers.size, 0);
  for (let iteration = 0; iteration < 3; iteration++) {
    state.desktopMedia.change(true); checkMatching(state); state.intersect(true); assert.equal(state.timers.size, 1);
    state.desktopMedia.change(false); assert.equal(state.tree, null); assert.equal(state.timers.size, 0);
  }
  state.desktopMedia.change(true); state.intersect(true); assert.equal(state.timers.size, 1); state.unmount();
  assert.equal(state.timers.size, 0); assert.equal(state.desktopMedia.events.size, 0); assert.equal(state.motionMedia.events.size, 0); assert.equal(state.documentEvents.size, 0);
  assert(state.observerHistory.every(instance => instance.disconnected), "Resize and unmount disconnect every observer");

  const single = mount({ wide: true, galleries: suppliedGalleries.slice(0, 1) }); single.intersect(true); single.advance(60000);
  assert.equal(single.selected, 34); assert.equal(single.timers.size, 0); assert.equal(single.nodes.some(node => node.type === "button"), false); checkMatching(single, suppliedGalleries.slice(0, 1)); single.unmount();
  const reduced = mount({ wide: true, reduced: true }); reduced.intersect(true); reduced.advance(60000);
  assert.equal(reduced.selected, 34); assert.equal(reduced.timers.size, 0); reduced.unmount();
  const hidden = mount({ wide: true, background: true }); hidden.intersect(true); hidden.advance(60000);
  assert.equal(hidden.timers.size, 0); hidden.background(false); assert.equal(hidden.timers.size, 1); hidden.unmount();
  const responsiveInteraction = mount({ wide: true }); responsiveInteraction.intersect(true);
  responsiveInteraction.focus(true); responsiveInteraction.hover(true); assert.equal(responsiveInteraction.timers.size, 0);
  responsiveInteraction.desktopMedia.change(false); assert.equal(responsiveInteraction.tree, null);
  responsiveInteraction.desktopMedia.change(true); responsiveInteraction.intersect(true);
  assert.equal(responsiveInteraction.timers.size, 1, "Removing the desktop card clears its transient focus/hover state so it can resume after resize");
  responsiveInteraction.unmount();
  const unsupported = mount({ wide: true, observerAvailable: false }); unsupported.advance(60000);
  assert.equal(unsupported.selected, 34); assert.equal(unsupported.timers.size, 0); unsupported.unmount();
  const invalid = mount({ wide: true, galleries: [{ id: 1, title: "Missing image", slug: "missing", imageUrl: "" }] });
  assert.equal(invalid.tree, null); invalid.replaceGalleries(suppliedGalleries); invalid.intersect(true); checkMatching(invalid);
  invalid.next(); invalid.replaceGalleries(suppliedGalleries.slice(0, 1)); checkMatching(invalid, suppliedGalleries.slice(0, 1)); assert.equal(invalid.timers.size, 0);
  invalid.replaceGalleries([]); assert.equal(invalid.tree, null); assert.equal(invalid.timers.size, 0); invalid.unmount();
  for (const lang of languages) {
    const galleries = suppliedGalleries.map((gallery, index) => ({ ...gallery, title: `${localizedTitles[lang]} ${index + 1}` }));
    const localized = mount({ wide: true, lang, galleries });
    assert.equal(localized.tree.props.dir, lang === "ar" ? "rtl" : "ltr");
    assert.equal(localized.tree.props["aria-label"], heading[lang]);
    checkMatching(localized, galleries, lang);
    const pauseLabel = localized.nodes.find(node => node.props.className === "pause").props["aria-label"];
    localized.pause(); assert.notEqual(localized.nodes.find(node => node.props.className === "pause").props["aria-label"], pauseLabel);
    localized.next(); checkMatching(localized, galleries, lang);
    assert.equal(localized.nodes.find(node => node.props.className === "next").props.children.props.children, lang === "ar" ? "←" : "→");
    assert.equal(localized.nodes.find(node => node.props.className === "previous").props.children.props.children, lang === "ar" ? "→" : "←");
    localized.unmount();
  }
}

async function queryChecks() {
  const calls = [];
  let response = { data: [], meta: {} };
  const unwrapSingle = value => {
    const row = value?.data ?? value;
    return row ? { ...(row.attributes || row), ...(row.id != null ? { id: row.id } : {}) } : null;
  };
  const strapi = {
    strapiGet: async url => {
      calls.push(url);
      if (typeof response === "function") return response(url);
      const params = new URL(url, "https://cms.example.test").searchParams;
      const start = Number(params.get("start") || 0), limit = Number(params.get("limit") || 100);
      return { ...response, data: Array.isArray(response.data) ? response.data.slice(start, start + limit) : response.data };
    },
    unwrapStrapiCollection: value => { const rows = value?.data ?? value ?? []; return Array.isArray(rows) ? rows.map(unwrapSingle) : []; },
    unwrapStrapiSingle: unwrapSingle,
    getStrapiMediaUrl: url => url.startsWith("/") ? `https://cms.example.test${url}` : url
  };
  const unused = new Proxy({}, { get: (_, property) => () => { throw new Error(`Preview query must not use unrelated normalization: ${String(property)}`); } });
  const module = { exports: {} };
  new Function("require", "module", "exports", "URLSearchParams", compile("lib/galleries.ts"))(
    name => name === "@/lib/strapi" ? strapi : name === "@/lib/content" || name === "@/lib/image-credits" ? unused : (() => { throw new Error(`Unexpected query import: ${name}`); })(),
    module, module.exports, URLSearchParams);
  const fetchPreviews = module.exports.fetchHomepageGalleryPreviews;
  const media = name => ({ data: { id: 99, attributes: { url: `/${name}-original.jpg`, formats: { medium: { url: `/${name}-medium.jpg` }, small: { url: `/${name}-small.jpg` } } } } });
  const record = (id, updates = {}) => ({ id, attributes: { slug: `gallery-${id}`, publishedAt: "2026-10-01T00:00:00.000Z", title: `Base ${id}`, ...Object.fromEntries(languages.filter(lang => lang !== "sr").map(lang => [`title_${lang}`, `${localizedTitles[lang]} ${id}`])), images: [{ id: id * 100, image: media(`photo-${id}`) }], ...updates } });

  for (const lang of languages) {
    calls.length = 0;
    response = { data: [record(1), record(2, { images: [], shareImage: media("share") }), record(3, { images: [{ image: { data: { attributes: { url: "/small-original.jpg", formats: { small: { url: "/small-only.jpg" } } } } } }] })], meta: { pagination: { pageCount: 1 } } };
    const previews = await fetchPreviews(lang);
    assert.equal(calls.length, 2, "The public collection and its explicit empty tail use the existing cached strapiGet path");
    assert.deepEqual(Array.from(previews, preview => preview.id), [1, 2, 3]);
    assert.deepEqual(Array.from(previews, preview => preview.imageUrl), ["https://cms.example.test/photo-1-medium.jpg", "https://cms.example.test/share-medium.jpg", "https://cms.example.test/small-only.jpg"]);
    assert.equal(previews[0].title, lang === "sr" ? "Base 1" : `${localizedTitles[lang]} 1`);
    assert(previews.every(preview => Object.keys(preview).sort().join() === "id,imageUrl,slug,title"), "Only overview props reach the client component");
    const query = new URL(calls[0], "https://cms.example.test").searchParams;
    const fields = Array.from(query).filter(([key]) => /^fields\[/.test(key)).map(([, value]) => value).sort();
    assert.deepEqual(fields, ["publishedAt", "slug", "title", ...(lang === "sr" ? [] : [`title_${lang}`])].sort(), "Projection uses base plus requested title, never every translation");
    assert.equal(query.get("filters[publishedAt][$notNull]"), "true");
    assert.equal(query.get("limit"), "100"); assert.equal(query.get("start"), "0");
    assert.equal(Array.from(query).some(([key]) => key.startsWith("pagination[")), false, "The actual custom entityService controller consumes flat start/limit");
    assert.equal(query.get("sort[0]"), "order:asc"); assert.equal(query.get("sort[1]"), "galleryDate:desc"); assert.equal(query.get("sort[2]"), "id:asc");
    assert(!Array.from(query).some(([key, value]) => value === "*" || /description|caption|body|content|relatedArticles|authors|locations|topics|seo/i.test(key + value)), "No full articles, metadata collections, captions or gallery bodies are requested");
  }
  response = { data: [record(1, { title_en: "" })], meta: {} };
  assert.equal((await fetchPreviews("en"))[0].title, "Base 1", "Blank translation keeps the existing base-title fallback");
  calls.length = 0; response = { data: [], meta: {} };
  assert.equal((await fetchPreviews("en")).length, 0, "No published gallery means no decorative/demo fallback"); assert.equal(calls.length, 1);
  response = { data: [record(1, { publishedAt: null }), record(2, { slug: "" }), record(3, { title: "", title_ar: "" }), record(4, { images: [], shareImage: null })], meta: {} };
  assert.equal((await fetchPreviews("ar")).length, 0, "Drafts, unavailable titles, missing destinations and missing photographs cannot create previews");
  calls.length = 0;
  response = url => {
    const start = Number(new URL(url, "https://cms.example.test").searchParams.get("start"));
    return { data: start === 0 ? [record(1), record(2)] : start === 2 ? [record(3)] : [], meta: { pagination: { pageCount: 1 } } };
  };
  assert.deepEqual(Array.from(await fetchPreviews("en"), item => item.id), [1, 2, 3], "Offset follows records actually returned, even when the endpoint returns a short page and misleading metadata");
  assert.equal(calls.length, 3);
  calls.length = 0;
  response = url => ({ data: new URL(url, "https://cms.example.test").searchParams.get("start") === "0" ? Array.from({ length: 100 }, (_, index) => record(index + 1)) : [], meta: {} });
  assert.equal((await fetchPreviews("sr")).length, 100); assert.equal(calls.length, 2, "Full pages without pagination metadata probe the next page instead of silently truncating");
  const cappedRecords = Array.from({ length: 61 }, (_, index) => { const item = record(index + 1); return { id: item.id, ...item.attributes }; });
  calls.length = 0;
  response = url => { const start = Number(new URL(url, "https://cms.example.test").searchParams.get("start")); return { data: cappedRecords.slice(start, start + 25), meta: {} }; };
  assert.equal((await fetchPreviews("en")).length, 61, "The real flat/meta-empty controller can cap responses at25 without omitting the remaining galleries");
  assert.deepEqual(calls.map(url => Number(new URL(url, "https://cms.example.test").searchParams.get("start"))), [0, 25, 50, 61]);
  calls.length = 0; response = () => ({ data: [record(1)], meta: {} });
  await assert.rejects(fetchPreviews("en"), /repeated record/); assert.equal(calls.length, 2, "A broken repeated page fails instead of rendering duplicates");
  response = () => { throw new Error("fixture CMS unavailable"); };
  await assert.rejects(fetchPreviews("en"), /CMS unavailable/, "CMS errors propagate to the caller's existing optional-module fallback without dummy media");
  response = { data: [record(1, { images: [{ image: { data: { id: 100, attributes: {} } } }], shareImage: media("usable-share") })], meta: {} };
  assert.equal((await fetchPreviews("en"))[0]?.imageUrl, "https://cms.example.test/usable-share-medium.jpg", "An unusable first-image object must not hide a valid existing share photograph");
}

async function main() {
  lifecycleChecks(); await queryChecks();
  console.log("Desktop gallery checks passed: 0/1/many; one active lazy photograph; six-second circular cycle; mobile/SSR omission and repeated resize cleanup; manual/focus/hover/visibility/reduced pause; listeners/observer cleanup; eight-language titles/links/RTL; caption reservation and inactive focus exclusion; published projected source pagination and optimized-media fallbacks.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
