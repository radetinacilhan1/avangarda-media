"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const langs = ['sr','en','tr','fr','de','es','el','ar'];
let fixture;
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = {exports:{}};
  modules.set(file,module);
  const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}
  }).outputText;
  const imported = name => {
    if (name === '@/lib/strapi') return {
      strapiGet: async()=>({data:[fixture]}),
      unwrapStrapiCollection: response=>Array.isArray(response)?response:(response?.data||[]),
      unwrapStrapiSingle: response=>response?.data||null,
      getStrapiMediaUrl: value=>value
    };
    if (name === '@/lib/legal-document-source' || name.startsWith('@/components/')) return {};
    if (name.startsWith('@/lib/')) return load(name.slice(2)+'.ts');
    return require(name);
  };
  new Function('require','module','exports',code)(imported,module,module.exports);
  return module.exports;
}
async function main() {
  fixture={id:1,title:'Test sr',slug:'metadata-test',type:'law',countryOrFramework:'serbia',seo:{}};
  for(const lang of langs) {
    const suffix=lang==='sr'?'':'_'+lang;
    fixture['title'+suffix]='Title '+lang;
    fixture['shortDescription'+suffix]='Resource description '+lang;
    fixture.seo['seoTitle'+suffix]='Editorial metadata '+lang;
    fixture.seo['seoDescription'+suffix]='Unique editorial description '+lang;
  }
  const {generateMetadata}=load('app/(legacy)/pravni-kompas/[slug]/page.tsx');
  for(const lang of langs) {
    const metadata=await generateMetadata({params:{slug:fixture.slug},searchParams:{lang}});
    assert.equal(metadata.title,'Editorial metadata '+lang);
    assert.equal(metadata.description,'Unique editorial description '+lang);
    assert.equal(metadata.openGraph.title,metadata.title);
    assert.equal(metadata.twitter.description,metadata.description);
    assert.equal(metadata.alternates.canonical,'https://avangarda.media/'+lang+'/pravni-kompas/metadata-test');
    for(const code of langs) assert.equal(metadata.alternates.languages[code],'https://avangarda.media/'+code+'/pravni-kompas/metadata-test');
    assert.equal(metadata.alternates.languages['x-default'],'https://avangarda.media/pravni-kompas/metadata-test');
  }
  fixture.seo=null;
  for(const lang of langs) {
    const metadata=await generateMetadata({params:{slug:fixture.slug},searchParams:{lang}});
    assert.ok(metadata.title.startsWith('Title '+lang+' |'));
    assert.equal(metadata.description,'Resource description '+lang);
  }
  console.log('Legal metadata: all eight CMS SEO translations, social metadata, canonical/hreflang and existing-content fallback passed.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
