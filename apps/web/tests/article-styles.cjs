const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleRecord = { exports: {} };
const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/article-style.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { module: moduleRecord, exports: moduleRecord.exports });
const { localizeArticleStyle } = moduleRecord.exports;
const expected = {
  sr: ['Esej', 'Komentar'], en: ['Essay', 'Commentary'],
  tr: ['Deneme', 'Yorum'], fr: ['Essai', 'Commentaire'],
  de: ['Essay', 'Kommentar'], es: ['Ensayo', 'Comentario'],
  el: ['Δοκίμιο', 'Σχόλιο'], ar: ['مقالة', 'تعليق'],
};
for (const [lang, [essay, commentary]] of Object.entries(expected)) {
  for (const input of ['esej', 'essay', ' ESEJ ']) assert.equal(localizeArticleStyle(input, lang), essay);
  for (const input of ['komentar', 'commentary', 'comment', ' KOMENTAR ']) assert.equal(localizeArticleStyle(input, lang), commentary);
  assert.equal(localizeArticleStyle(undefined, lang), '');
  assert.equal(localizeArticleStyle('', lang), '');
  assert.equal(localizeArticleStyle('Legacy custom style', lang), 'Legacy custom style');
}
assert.equal(localizeArticleStyle('kolumna', 'sr'), 'Kolumna');
assert.equal(localizeArticleStyle('reportaža', 'en'), 'Reportage');
console.log('PASS Esej/Komentar in all eight languages, aliases, existing styles and empty/custom fallback');
