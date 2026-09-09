/* Read-only regression tests: no CMS writes, network calls or database fixtures. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const loaded = new Map();

function loadSource(filename, extraExports = "") {
  const resolved = path.resolve(filename);
  if (loaded.has(resolved)) return loaded.get(resolved).exports;
  const mod = { exports: {} };
  loaded.set(resolved, mod);
  const nativeRequire = Module.createRequire(resolved);
  const localRequire = (id) => id.startsWith("@/")
    ? loadSource(path.join(root, "src", `${id.slice(2)}.ts`))
    : nativeRequire(id);
  const source = fs.readFileSync(resolved, "utf8") + extraExports;
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: resolved,
  });
  new Function("require", "module", "exports", "__filename", "__dirname", result.outputText)(
    localRequire, mod, mod.exports, resolved, path.dirname(resolved)
  );
  return mod.exports;
}

const { getRichTextHtml } = loadSource(path.join(root, "src/lib/richtext.ts"));
const { getYouTubeVideoId } = loadSource(path.join(root, "src/lib/video.ts"));
const { buildSeoMetadata } = loadSource(path.join(root, "src/lib/seo.ts"));
const { withLang } = loadSource(path.join(root, "src/lib/i18n.ts"));
const legacy = '## Naslov\n\n**Bold**, *italic*, <u>underline</u>, ~~strike~~, `code`.\n\n- prva\n- druga\n\n1. jedan\n2. dva\n\n> citat\n\n---\n\n```js\nconst x = 1;\n```\n\n[Arhiva](/archive)\n\n![Opis](https://res.cloudinary.com/test/image/upload/photo_one_two.jpg "Caption")';
const html = getRichTextHtml(legacy, { lang: "ar" });
for (const tag of ["h2", "strong", "em", "u", "s", "code", "ul", "ol", "blockquote", "hr", "pre", "img"]) {
  assert.match(html, new RegExp(`<${tag}\\b`), `Legacy markup: ${tag}`);
}
assert.match(html, /href="\/ar\/archive"/);
assert.match(html, /photo_one_two\.jpg/);
assert.match(html, /alt="Opis"/);
assert.match(html, /Caption/);
assert.match(html, /article-media__caption/);
const unsafe = getRichTextHtml('<script>alert(1)</script><iframe src="https://evil.example"></iframe><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">link</a>');
assert.doesNotMatch(unsafe, /<script|<iframe|onerror|javascript:/i);
for (const url of ['https://youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ', 'https://vimeo.com/123456', 'https://res.cloudinary.com/test/video/upload/clip.mp4']) {
  const video = getRichTextHtml(`@[video](${url} "Opis <video>")`);
  assert.match(video, /article-video-embed/);
  assert.match(video, /Opis &lt;video&gt;/);
  assert.doesNotMatch(video, /autoplay="|autoplay=1/);
  assert.match(video, /loading="lazy"|controls preload="metadata"/);
}
for (const url of ['https://evil.example/watch?v=dQw4w9WgXcQ', 'https://notyoutube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be.evil.example/dQw4w9WgXcQ', 'javascript:alert(1)', 'https://evil.example/file.mp4']) {
  assert.doesNotMatch(getRichTextHtml(`@[video](${url} "Unsafe")`), /<iframe|<video\b/);
  assert.equal(getYouTubeVideoId(url), null);
}
const codeVideo = getRichTextHtml('```\n@[video](https://youtu.be/dQw4w9WgXcQ "Example")\n```');
assert.match(codeVideo, /@\[video\]/);
assert.doesNotMatch(codeVideo, /<iframe|AVANGARDAVIDEO/);
assert.equal(withLang('/ar/people/test?lang=ar#bio', 'en'), '/en/people/test#bio');
for (const lang of ['sr', 'en', 'ar']) {
  const seo = buildSeoMetadata({ lang, pathname: '/a/test' });
  assert.equal(seo.alternates.canonical, `https://avangarda.media/${lang}/a/test`);
  assert.equal(Object.keys(seo.alternates.languages).length, 9);
  assert.equal(seo.openGraph.url, seo.alternates.canonical);
}
global.window = { location: { origin: 'http://localhost:1337', hostname: 'localhost' } };
const editor = loadSource(path.join(root, '../cms/src/admin/richtext-editor-enhancements.js'), '\nexports.__verify = { renderPreview, normalizeVideoUrl, findMoreButton, runHistoryCommand };').__verify;
const preview = editor.renderPreview(legacy);
assert.match(preview, /photo_one_two\.jpg/);
assert.match(preview, /<strong>Bold<\/strong>/);
assert.match(preview, /<em>italic<\/em>/);
assert.equal(editor.normalizeVideoUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ'), null);
const labelledMore = { textContent: 'More', getAttribute: (name) => name === 'aria-labelledby' ? 'native-tooltip' : null };
assert.equal(editor.findMoreButton({ querySelectorAll: () => [labelledMore] }), labelledMore, 'Native aria-labelledby More button must be supported');
const historyCalls = [];
editor.runHistoryCommand({ focus: () => historyCalls.push('focus'), execCommand: (command) => historyCalls.push(command) }, 'redo');
assert.deepEqual(historyCalls, ['focus', 'redo'], 'Focus must precede the history command so Strapi preserves redo');
delete global.window;
async function verifyProfileRelations() {
  const strapi = loadSource(path.join(root, 'src/lib/strapi.ts'));
  const originalGet = strapi.strapiGet;
  const queries = [];
  strapi.strapiGet = async (query) => {
    queries.push(query);
    if (query.startsWith('/api/team-members?')) return { data: [{
      id: 42, fullName: 'Test profile', slug: 'test-profile', role: 'Writer', shortBio: 'Test bio',
      isActive: true, portfolioEnabled: true,
      relatedArticles: [{ id: 99, title: 'Stale curated relation', slug: 'stale-curated' }],
    }] };
    assert.match(query, /filters\[authors\]\[publicProfile\]\[id\]\[\$eq\]=42/);
    return { data: [
      { id: 1, title: 'Prvi', title_en: 'First', title_ar: 'الأول', slug: 'first', publishedAt: '2026-09-01T00:00:00Z' },
      { id: 2, title: 'Drugi', title_en: 'Second', title_ar: 'الثاني', slug: 'second', publishedAt: '2026-09-02T00:00:00Z' },
    ] };
  };
  try {
    const about = loadSource(path.join(root, 'src/lib/about.ts'));
    for (const lang of ['sr', 'en', 'ar']) {
      const member = await about.fetchTeamMemberBySlug('test-profile', lang);
      assert.deepEqual(member.relatedArticles.map(article => article.id), [1, 2], 'Use canonical authored articles, not the stale curated relation');
      assert.equal(member.relatedArticles[0].title, { sr: 'Prvi', en: 'First', ar: 'الأول' }[lang]);
    }
    assert.equal(queries.length, 6);
    assert.ok(about.getAboutNavigationGroup('ar').children.every(link => link.href.startsWith('/ar/')));
  } finally {
    strapi.strapiGet = originalGet;
  }
}

verifyProfileRelations().then(() => {
  console.log('PASS: legacy rich text, safe video, editor preview/history, canonical/hreflang, profile authorship and Arabic links. No network/CMS/database writes.');
}).catch(error => { console.error(error); process.exitCode = 1; });
const { canonicalAuthorSlug } = loadSource(path.join(root, 'src/lib/author-aliases.ts'));
assert.equal(canonicalAuthorSlug('author-1'), 'berina-skrijelj');
assert.equal(canonicalAuthorSlug('author-5'), 'emir-bihorac');
for (const slug of ['author-2', 'unknown', '__proto__', 'constructor', 'toString']) assert.equal(canonicalAuthorSlug(slug), slug);
console.log('PASS: only historically verified author aliases are canonicalized.');
const { getArticleLanguages, getArticleCanonicalLanguage } = loadSource(path.join(root, 'src/lib/article-languages.ts'));
const original = { title: 'Izvorni naslov', content: 'Izvorni tekst' };
assert.deepEqual(getArticleLanguages(original), ['sr']);
assert.equal(getArticleCanonicalLanguage(original, 'ar'), 'sr');
const translated = {...original, title_en: 'Translated title', content_en: 'Translated body'};
assert.deepEqual(getArticleLanguages(translated), ['sr','en']);
assert.equal(getArticleCanonicalLanguage(translated, 'en'), 'en');
assert.equal(getArticleCanonicalLanguage({...original, title_ar: 'عنوان'}, 'ar'), 'ar');
assert.deepEqual(getArticleLanguages({...original, title_en: 'Title', content_en: original.content}), ['sr']);
const metadata = buildSeoMetadata({lang:'ar', pathname:'/a/test', canonicalLang:'sr', availableLanguages:['sr','en']});
assert.equal(metadata.alternates.canonical, 'https://avangarda.media/sr/a/test');
assert.equal(metadata.alternates.languages.ar, undefined);
assert.equal(metadata.alternates.languages.en, 'https://avangarda.media/en/a/test');
const {readerPageCopy} = loadSource(path.join(root,'src/lib/reader-page-copy.ts'));
assert.equal(Object.keys(readerPageCopy).length,8);
for (const copy of Object.values(readerPageCopy)) assert.ok(copy.empty && copy.archive && copy.search);
console.log('PASS: translated, partial and fallback article canonical/hreflang; eight reader dictionaries.');
