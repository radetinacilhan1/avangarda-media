const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const source = path.resolve(__dirname, '../src');
const modules = new Map();
function load(file) {
  const filename = path.join(source, file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = {exports:{}}; modules.set(filename,module);
  const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const strapi={unwrapStrapiCollection:value=>(value?.data||value||[]).map(item=>({...item.attributes||item,id:item.id})),unwrapStrapiSingle:value=>value?.data||value};
  vm.runInNewContext(code,{module,exports:module.exports,process:{env:{}},URL,URLSearchParams,require:id=>id==='@/lib/strapi'?strapi:id.startsWith('@/')?load(id.slice(2)+'.ts'):require(id)});
  return module.exports;
}
const {rankMostReadArticles,mostReadQuery}=load('lib/most-read.ts');
const {articleReadingTime,articleLocations}=load('lib/article-metadata.ts');
const {localizeArticle}=load('lib/content.ts');
const articles=[
  {id:1,viewCount:8,publishedAt:'2026-09-01'}, {id:2,viewCount:15,publishedAt:'2026-09-01'},
  {id:3,viewCount:8,publishedAt:'2026-09-02'}, {id:4,viewCount:8,publishedAt:'2026-09-02'},
  {id:5,viewCount:0,publishedAt:'2026-09-03'}, {id:6,publishedAt:'2026-09-01'},
  {id:7,viewCount:900}, {id:2,viewCount:15,publishedAt:'2026-09-01'},
];
assert.deepEqual(Array.from(rankMostReadArticles(articles),a=>a.id),[2,4,3,1,5]);
assert.equal(rankMostReadArticles(articles.slice(0,2)).length,2);
for(const lang of ['sr','en','tr','fr','de','es','el','ar']) {
  const query=new URLSearchParams(mostReadQuery(lang).split('?')[1]);
  assert.equal(query.get('sort[0]'),'viewCount:desc'); assert.equal(query.get('sort[2]'),'id:desc');
  assert.equal(query.get('limit'),'5'); assert.equal(query.get('filters[publishedAt][$notNull]'),'true');
  assert.ok(articleReadingTime(6,lang));
  for(const value of [undefined,null,0,-1,NaN,Infinity,'6',1.5]) assert.equal(articleReadingTime(value,lang),'');
  const locations=articleLocations({data:[{id:1,attributes:{slug:'beograd',name:'Beograd',name_en:'Belgrade',latitude:44.8,longitude:20.4}},{id:1,attributes:{name:'Duplicate'}},{id:2,attributes:{name:'Unknown place'}}]},lang);
  assert.equal(locations.length,2); assert.equal(locations[0].name,lang==='en'?'Belgrade':'Beograd');
  assert.ok(locations[0].href.includes('/'+lang+'/mapa?location=beograd')); assert.equal(locations[1].href,undefined);
  assert.equal(articleLocations(null,lang).length,0);
  const article={focus:'Srpski fokus',...(lang==='sr'?{}:{['focus_'+lang]:'Translated focus'})};
  assert.equal(localizeArticle(article,lang).focus,lang==='sr'?'Srpski fokus':'Translated focus');
  assert.equal(localizeArticle({...article,['focus_'+lang]:'  '},lang).focus,'Srpski fokus');
}
console.log('PASS: distinct published ranking, stable ties, zero views, eight focus fallbacks, location relations and positive reading-time labels.');
