/* Offline real mapping/component checks. No network, CMS writes or browser automation. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = path.resolve(__dirname, "../src");
const langs = ["sr", "en", "tr", "fr", "de", "es", "el", "ar"];
const compile = (input) => ts.transpileModule(input, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} }).outputText;

// Execute the actual homepage mapping without importing or executing its CMS loaders.
const pageText = fs.readFileSync(path.join(source, "app/(legacy)/page.tsx"), "utf8");
const pageAst = ts.createSourceFile("page.tsx", pageText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const mappingNode = pageAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "buildSignalItems");
assert(mappingNode, "The existing article-to-strip mapping remains available");
const mappingModule = { exports: {} };
const mediaRequests = [];
vm.runInNewContext(compile(`${mappingNode.getText(pageAst)}\nexports.buildSignalItems = buildSignalItems;`), {
  module: mappingModule, exports: mappingModule.exports,
  compareEditorialArticles: (a, b) => b.priority - a.priority,
  getEditorialBadges: (article, lang) => article.tone ? [{ key: article.tone, label: `${lang}:${article.tone}` }] : [],
  getSectionLabel: (section, lang) => `${lang}:${section}`,
  withLang: (href, lang) => `/${lang}${href}`,
  getStrapiMediaUrl: (url) => { mediaRequests.push(url); return `https://cms.example.test${url}`; },
  fetch: () => { throw new Error("Mapping must reuse the fetched article records"); },
}, { filename: "homepage-strip-mapping" });

function componentHarness() {
  const slots = [];
  let cursor = 0;
  const react = { useState(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
    return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
  } };
  const module = { exports: {} };
  vm.runInNewContext(compile(fs.readFileSync(path.join(source, "components/live-signal-strip.tsx"), "utf8")), {
    module, exports: module.exports, Set,
    require: (name) => name === "react" ? react : name.endsWith(".module.css")
      ? { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) }
      : require(name),
    fetch: () => { throw new Error("Rendering thumbnails must never issue a CMS request"); },
  }, { filename: "components/live-signal-strip.tsx" });
  return (props) => { cursor = 0; return module.exports.LiveSignalStrip(props); };
}
function nodes(node, output = []) {
  if (!node || typeof node !== "object") return output;
  if (Array.isArray(node)) { node.forEach((entry) => nodes(entry, output)); return output; }
  output.push(node); nodes(node.props?.children, output); return output;
}
const byType = (node, type) => nodes(node).filter((item) => item.type === type);
const plainText = (node) => node == null || typeof node === "boolean" ? ""
  : typeof node !== "object" ? String(node)
  : Array.isArray(node) ? node.map(plainText).join("") : plainText(node.props?.children);
const groups = (node) => nodes(node).filter((item) => item.props?.className === "live-strip__group");
const links = (node) => byType(node, "a");
const signature = (node) => links(node).map((link) => ({ href: link.props.href, className: link.props.className,
  text: plainText(link), images: byType(link, "img").map((image) => image.props.src) }));

for (const lang of langs) {
  const label = `${lang}:now`;
  const fixtures = Array.from({ length: 8 }, (_, index) => ({
    id: 900 + index, slug: `identity-${900 + index}`,
    title: index < 2 ? "Identical translated title" : `Title ${lang} ${index}`,
    signalText: index === 0 ? `  ${lang} very long signal `.repeat(35).trim() : "",
    focus: index === 1 ? ` Focus ${lang} ` : "", subtitle: `Subtitle ${lang} ${index}`,
    section: "analysis", priority: 100 - index,
    tone: ["featured", "breaking", "trending", null][index % 4],
    cover: index === 4 ? undefined : { url: `/uploads/original-${index}.jpg`, formats: {
      ...(index !== 2 && index !== 3 ? { thumbnail: { url: `/uploads/thumbnail-${index}.jpg` } } : {}),
      ...(index !== 3 ? { small: { url: `/uploads/small-${index}.jpg` } } : {}),
      medium: { url: `/uploads/medium-${index}.jpg` }, large: { url: `/uploads/large-${index}.jpg` },
    } },
  }));
  const originalIds = fixtures.map((article) => article.id).join(",");
  mediaRequests.length = 0;
  const items = mappingModule.exports.buildSignalItems(fixtures, lang);
  assert.equal(items.length, 6, "Existing item limit and editorial ordering are retained");
  assert.equal(fixtures.map((article) => article.id).join(","), originalIds, "The input article collection is not mutated");
  assert.equal(items[0].imageUrl, "https://cms.example.test/uploads/thumbnail-0.jpg");
  assert.equal(items[1].imageUrl, "https://cms.example.test/uploads/thumbnail-1.jpg", "Identical titles still use each distinct article's own cover");
  assert.equal(items[2].imageUrl, "https://cms.example.test/uploads/small-2.jpg", "The existing small derivative is used if thumbnail is absent");
  assert.equal(items[3].imageUrl, undefined, "An original-only cover is never downloaded as a tiny thumbnail");
  assert.equal(items[4].imageUrl, undefined, "An article with no cover keeps its text-only presentation");
  assert(mediaRequests.every((url) => /\/(?:thumbnail|small)-/.test(url)), "Only optimized derivatives reach media URL resolution");
  items.forEach((item, index) => {
    const article = fixtures[index];
    assert.equal(item.id, article.id); assert.equal(item.href, `/${lang}/a/${article.slug}`);
    assert.equal(item.text, (article.signalText.trim() || article.focus.trim() || article.subtitle || article.title).trim());
    assert.equal(item.label, article.tone ? `${lang}:${article.tone}` : `${lang}:analysis`);
    assert.equal(item.tone, article.tone);
  });

  const render = componentHarness();
  const props = { label, items, ariaLabel: `Signals ${lang}` };
  let tree = render(props);
  assert.equal(tree.type, "section"); assert.equal(tree.props["aria-label"], props.ariaLabel);
  assert.equal(groups(tree).length, 2, "The existing repeated group structure is retained");
  assert.equal(groups(tree)[0].props["aria-hidden"], false);
  assert.equal(groups(tree)[1].props["aria-hidden"], true);
  assert.deepEqual(signature(groups(tree)[0]), signature(groups(tree)[1]), "Both halves have identical text, hrefs and reserved images");
  assert.equal(links(tree).length, 12, "Thumbnails do not add links or change existing destinations");
  assert.equal(nodes(tree).filter((node) => ["button", "input", "select", "textarea"].includes(node.type)).length, 0);
  assert.equal(byType(tree, "img").length, 8);
  byType(tree, "img").forEach((image) => {
    assert.equal(image.props.alt, "", "The matching link text already describes the photograph");
    assert.equal(image.props.tabIndex, undefined, "Decorative photos add no focus stop");
    assert.equal(image.props.width, 28); assert.equal(image.props.height, 28);
    assert.equal(image.props.draggable, false);
    const imageParent = nodes(tree).find((node) => node.props?.children === image);
    assert.equal(imageParent.props["aria-hidden"], "true");
  });
  for (const index of [3, 4]) {
    links(tree).filter((link) => link.props.href === items[index].href).forEach((link) => {
      assert.equal(byType(link, "img").length, 0);
      assert.equal(nodes(link).filter((node) => node.props?.className === "thumbnail").length, 0, "Missing derivatives create no placeholder slot");
      assert(plainText(link).includes(items[index].text));
    });
  }
  const failedUrl = items[5].imageUrl;
  const firstFailure = byType(groups(tree)[0], "img").find((image) => image.props.src === failedUrl);
  const duplicateFailure = byType(groups(tree)[1], "img").find((image) => image.props.src === failedUrl);
  firstFailure.props.onError(); duplicateFailure.props.onError();
  tree = render(props);
  assert.equal(byType(tree, "img").filter((image) => image.props.src === failedUrl).length, 0, "A failed URL disappears from both loop halves together");
  assert.equal(links(tree).length, 12); assert.equal(byType(tree, "img").length, 6);
  assert.deepEqual(signature(groups(tree)[0]), signature(groups(tree)[1]), "Image failures cannot leave unequal repeated groups at the seam");
  assert(links(tree).filter((link) => link.props.href === items[5].href).every((link) => plainText(link).includes(items[5].text)), "Image errors retain both text links");
  const nextFailure = byType(tree, "img")[0]; nextFailure.props.onError(); tree = render(props);
  assert.equal(byType(tree, "img").length, 4, "Independent failed URLs accumulate without restoring earlier failures");
  assert.equal(render({ ...props, items: [] }), null);
  assert.equal(render({ ...props, items: [{ id: "empty", text: " ", href: "/valid", label: "Label", imageUrl: "/image.jpg" }, { id: "no-url", text: "Text", href: " ", label: "Label" }] }), null);
}
console.log("PASS live strip: 8-language real article-ID/cover mapping; thumbnail/small only with text fallback; unchanged limits/order/labels/destinations; decorative same-link images; identical repeated groups; synchronized idempotent error fallback without extra CMS requests or focus stops.");
