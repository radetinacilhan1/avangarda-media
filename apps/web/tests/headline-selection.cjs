const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
const root=path.resolve(__dirname,'../src');const cache=new Map();
const unwrap=v=>(v?.data??v??[]).map(row=>({...row.attributes||row,id:row.id}));
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};const compiled=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(compiled,{module:mod,exports:mod.exports,URL,URLSearchParams,Intl,process:{env:{}},require:name=>name==='@/lib/strapi'?{unwrapStrapiCollection:unwrap,unwrapStrapiSingle:v=>v?.data??v}:name.startsWith('@/')?load(name.slice(2)+'.ts'):require(name)});cache.set(file,mod.exports);return mod.exports;}
const {selectedHeadlineArticles}=load('lib/headline-selection.ts');
const langs=['sr','en','tr','fr','de','es','el','ar'];
const records=[1,2,3,4,5,6].map(id=>({id,title:`sr ${id}`,slug:`story-${id}`,publishedAt:'2026-10-01T00:00:00.000Z',section:'news',...Object.fromEntries(langs.filter(l=>l!=='sr').map(l=>[`title_${l}`,`${l} ${id}`]))}));
assert.equal(selectedHeadlineArticles(null,'sr'),null);
assert.equal(selectedHeadlineArticles({headlineSelection:{initialized:false}},'sr'),null);
assert.equal(selectedHeadlineArticles({headlineSelection:{initialized:true,articleIds:[]},headlineArticles:records},'sr').length,0,'Deliberate empty selection never falls back');
for(const lang of langs){const config={headlineSelection:{initialized:true,articleIds:[6,3,1,2,5]},headlineArticles:records};const selected=selectedHeadlineArticles(config,lang);assert.deepEqual(Array.from(selected,a=>a.id),[6,3,1,2,5]);assert.equal(selected[0].title,`${lang} 6`);assert.equal(selected[0].section,'front');}
const config={headlineSelection:{initialized:true,articleIds:[1,1,2,3,4]},headlineArticles:[records[0],{...records[1],publishedAt:null},{...records[2],slug:''},records[3]]};
assert.deepEqual(Array.from(selectedHeadlineArticles(config,'sr'),a=>a.id),[1,4],'Unavailable/draft records omitted and never duplicated');
assert.equal(selectedHeadlineArticles({headlineSelection:{initialized:true,articleIds:[5]},headlineArticles:{data:[{id:5,attributes:records[4]}]}},'ar')[0].title,'ar 5');
console.log('PASS canonical headline order, all8 languages, rolling fallback, empty/subfive selection, draft/availability filtering and stable identities');
