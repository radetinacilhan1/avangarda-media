/* Offline: node apps/web/tests/reader-cards.cjs. No CMS or vote requests are sent. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
const source = path.resolve(__dirname, "../src");
const langs = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const styles = new Proxy({}, { get: (_, key) => String(key) });

function loader(overrides = {}) {
  const cache = new Map();
  return function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.join(source, file), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports, ...overrides,
      require: (name) => name.endsWith(".module.css") ? { __esModule: true, default: styles }
        : name === "react" && overrides.react ? overrides.react
        : name === "@/lib/i18n" ? { withLang: (href, lang) => `/${lang}${href}` }
        : name === "@/lib/strapi" ? { formatDisplayDate: (value) => value }
        : name.startsWith("@/") ? load(`${name.slice(2)}${name.includes("components/") ? ".tsx" : ".ts"}`)
        : require(name),
    }, { filename: file });
    cache.set(file, module.exports);
    return module.exports;
  };
}

const load = loader();
const { splitSignalValue, signalNumberFit } = load("lib/signal-value.ts");
const values = {
  sr: "1.107.827 objava", en: "1,107,827 posts", tr: "1.107.827 paylaşım", fr: "1\u202f107\u202f827 publications",
  de: "1.107.827 Veröffentlichungen", es: "1.107.827 publicaciones", el: "1.107.827 αναρτήσεις", ar: "١٬١٠٧٬٨٢٧ منشورات",
};
for (const value of [...Object.values(values), "90,1%", "+2,3 °C", "1 000 000 inhabitants", "−0.0001 ppm"]) {
  const parts = splitSignalValue(value);
  assert(parts, `A numeric prefix should be recognized: ${value}`);
  assert.equal(parts.number + parts.separator + parts.unit, value, "No precision, punctuation, grouping or translation changes");
  assert(Number.parseFloat(signalNumberFit(parts.number)) * Array.from(parts.number).length <= 150.000001);
}
for (const value of ["1–2", "1/3", "1.2e6", "about 1 million", "circa 2026", "", "12:30"]) {
  assert.equal(splitSignalValue(value), null, "Ambiguous/range/scientific/time text must not be reinterpreted as a unit");
}
const { SignalCard } = load("components/signal-card.tsx");
for (const lang of langs) {
  for (const variant of ["homepage", "section", "article"]) {
    const signal = {
      id: "fixture", value: values[lang], title: `Title ${lang}`, description: `Description ${lang}`,
      source: "Official source", sourceUrl: "https://example.test/source", date: "2026-10-01", region: "Region",
      topicLabel: "Topic", href: "/a/context", relatedAnalysis: { slug: "context" }, methodNote: "Method", editorialNote: "Note",
    };
    const html = renderToStaticMarkup(SignalCard({ signal, lang, variant, ctaLabel: "Context" }));
    const valueHtml = html.match(/<div class="signal-card__value value">(.*?)<\/div>/s)[1];
    assert.equal(valueHtml.replace(/<[^>]*>/g, ""), values[lang], "Visible numeric and unit text remains byte-identical");
    assert(html.includes(`Title ${lang}`) && html.includes(`Description ${lang}`));
    assert(html.includes("Official source") && html.includes("2026-10-01"));
    assert.equal((html.match(/href="https:\/\/example.test\/source"/g) || []).length, variant === "section" ? 0 : 1);
    assert.equal((html.match(new RegExp(`href="/${lang}/a/context"`, "g")) || []).length, variant === "article" ? 0 : 1);
    assert(!/<a\s[^>]*>(?:(?!<\/a>).)*<a\s/s.test(html), "Cards do not introduce nested interactive links");
  }
}
for (const value of ["1–2", "1.2e6", "about 12345678901234567890 units"]) {
  const html = renderToStaticMarkup(SignalCard({ signal: { value, title: "Title", description: "Copy", source: "Source" }, lang: "en", ctaLabel: "Open" }));
  assert(html.includes("white-space") === false, "Whitespace rules stay in the scoped stylesheet");
  assert(html.includes("<bdi"), "Fallback numeric tokens also stay whole");
}

function elements(node, predicate) {
  if (!node || typeof node !== "object") return [];
  return [ ...(predicate(node) ? [node] : []), ...[].concat(node.props?.children || []).flatMap((child) => Array.isArray(child) ? child.flatMap((item) => elements(item, predicate)) : elements(child, predicate)) ];
}
function text(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  return [].concat(node.props?.children || []).map((item) => Array.isArray(item) ? item.map(text).join("") : text(item)).join("");
}
function questionHarness(storage, fetcher) {
  const states = [];
  let cursor = 0;
  let effectKey;
  let nextEffects = [];
  const react = {
    useState(initial) { const index = cursor++; if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial; return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useMemo: (fn) => fn(),
    useEffect(fn, deps) { const key = JSON.stringify(deps); if (effectKey !== key) { effectKey = key; nextEffects.push(fn); } },
  };
  const localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
  const { DailyQuestionCard } = loader({ react, window: { localStorage }, fetch: fetcher })("components/daily-question-card.tsx");
  return (question, lang) => { cursor = 0; const element = DailyQuestionCard({ question, lang }); nextEffects.splice(0).forEach((fn) => fn()); return element; };
}

async function main() {
  for (const lang of langs) {
    const storage = new Map();
    const requests = [];
    let complete;
    const fetcher = (url, options) => { requests.push({ url, options }); return new Promise((resolve) => { complete = resolve; }); };
    const render = questionHarness(storage, fetcher);
    const question = { id: 23, voteRound: 4, label: `Question ${lang}`, question: `A long unchanged question ${lang}`, answerA: `Long answer A ${lang}`, answerB: `Long answer B ${lang}`, votesA: 3, votesB: 2 };
    let card = render(question, lang);
    assert.equal(text(elements(card, (node) => node.type === "h3")[0]), question.question);
    let buttons = elements(card, (node) => node.type === "button");
    assert.equal(buttons.length, 2);
    assert(buttons.every((button) => !button.props.disabled));
    const pending = buttons[0].props.onClick();
    card = render(question, lang);
    assert.equal(card.props["aria-busy"], true);
    assert(elements(card, (node) => node.type === "button").every((button) => button.props.disabled), "Both choices are disabled while the local mock request is pending");
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "/api/daily-question/vote");
    assert.equal(requests[0].options.method, "POST");
    assert.equal(requests[0].options.body, JSON.stringify({ answer: "A" }), "The existing vote request contract is unchanged");
    complete({ ok: true, json: async () => ({ data: { votesA: 4, votesB: 2, percentA: 67, percentB: 33, totalVotes: 6 } }) });
    await pending;
    card = render(question, lang);
    assert.equal(card.props["aria-busy"], false);
    assert.equal(elements(card, (node) => node.type === "button").length, 0);
    assert(text(card).includes("67%") && text(card).includes("33%"));
    assert(text(card).includes(question.answerA) && text(card).includes(question.answerB));
    assert.equal(storage.get("avangarda-daily-question-vote:23:4"), "A");
    const revisit = questionHarness(storage, () => { throw new Error("A stored vote must never be submitted"); });
    revisit(question, lang);
    const revisited = revisit(question, lang === "ar" ? "en" : "ar");
    assert.equal(elements(revisited, (node) => node.type === "button").length, 0, "Identity and duplicate protection are shared across translations");
    const nextRound = questionHarness(storage, fetcher);
    assert.equal(elements(nextRound({ ...question, voteRound: 5 }, lang), (node) => node.type === "button").length, 2);
    const inactive = questionHarness(new Map(), () => { throw new Error("Inactive questions cannot send votes"); });
    await elements(inactive({ ...question, isActive: false }, lang), (node) => node.type === "button")[0].props.onClick();
  }
  console.log("PASS 8-language/3-variant signal text, number precision, source/context links, conservative value splitting and local-only before/pending/after vote states with unchanged identity and duplicate protection.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
