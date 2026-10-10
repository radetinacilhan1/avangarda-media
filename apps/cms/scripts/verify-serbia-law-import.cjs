'use strict';
// Behavioral checks for the importer. The optional integration mode creates a
// new, marked local SQLite app and uses its real Strapi 4 Content Manager API.
// It never loads .env, production credentials or an existing database.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {AdminClient,buildPlan,execute,findExisting,normalizedTitle,officialUrl,authorizedOrigin,LANGS,TEXT_FIELDS}=require('./import-serbia-laws.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
const suffix=(name,l)=>l==='sr'?name:name+'_'+l;
const source='https://pravno-informacioni-sistem.rs/eli/rep/sgrs/skupstina/zakon/2009/22/1/reg';
function fixture(id,title='QA Law '+id) {
  const data={title,slug:'qa-law-'+id,type:'law',countryOrFramework:'serbia',isFeatured:false,officialSourceUrl:source,seo:{}};
  for(const lang of LANGS) {
    for(const name of TEXT_FIELDS) data[suffix(name,lang)]=name==='body'?((lang==='ar'?'بيانات اختبار ':lang==='el'?'Δοκιμαστικό κείμενο ':lang+' fixture ')+id+' ').repeat(120):name+' '+lang+' '+id;
    data.seo[suffix('seoTitle',lang)]='Test title '+lang+' '+id;
    data.seo[suffix('seoDescription',lang)]='Test description '+lang+' '+id;
  }
  data.title=title;
  return {id,requestedTitle:title,aliases:[],verified:true,evidence:[{url:source,note:'Isolated synthetic fixture; not production legal research.'}],checkedAt:'2026-10-10',data};
}
async function unit() {
  const entry=fixture(1,'Zakon o zaštiti građana');
  const existing={id:90,...clone(entry.data),slug:'published-slug-must-stay',isFeatured:true,publishedAt:'2026-01-01T00:00:00.000Z',relatedTopics:[{id:2}],pdfFile:{id:18},seo:{id:17,seoTitle:'Existing manual SEO'}};
  existing.body='Existing manually written body must stay.';
  const [plan]=buildPlan([entry],[existing]);
  assert.equal(plan.action,'update');assert.equal(plan.publish,false);assert.deepEqual(Object.keys(plan.patch),['seo']);
  assert.equal(plan.patch.seo.id,17);assert.equal(plan.patch.seo.seoTitle,'Existing manual SEO');
  assert.equal(normalizedTitle('Закон о ЗАШТИТИ грађана'),normalizedTitle(entry.requestedTitle));
  assert.equal(findExisting(entry,[{...existing,title:'Закон о заштити грађана'}]).length,1);
  assert.equal(buildPlan([entry],[existing,{...existing,id:91}])[0].action,'review');
  const complete={...existing,seo:{id:17,...entry.data.seo}};
  assert.equal(buildPlan([entry],[complete])[0].action,'skip');
  const withoutGreek=clone(entry);delete withoutGreek.data.body_el;
  assert.ok(buildPlan([withoutGreek],[])[0].errors.includes('MISSING_body_el'));
  const nonOfficial=clone(entry);nonOfficial.data.officialSourceUrl='https://example.test/law.pdf';
  assert.ok(buildPlan([nonOfficial],[])[0].errors.includes('OFFICIAL_HTTPS_SOURCE_REQUIRED'));
  const draft=clone(entry);draft.verified=false;draft.reviewReason='Official current status remains unresolved';
  assert.equal(buildPlan([draft],[])[0].publish,false);
  const future=clone(entry);future.data.dateUpdated='2027-01-01';
  assert.ok(buildPlan([future],[])[0].errors.includes('INVALID_DOCUMENT_DATE'));
  const overwrite=clone(entry);overwrite.corrections={officialSourceUrl:{from:'different',to:'https://parlament.gov.rs/law.pdf',reason:'Verified source correction',evidenceUrl:source}};
  assert.deepEqual(buildPlan([overwrite],[existing])[0].errors,['STALE_CORRECTION_officialSourceUrl']);
  const illegal=clone(entry);illegal.data.publishedAt='2026-01-01';
  assert.deepEqual(buildPlan([illegal],[])[0].errors,['SYSTEM_OR_UNKNOWN_WRITE_FIELD']);
  assert.equal(officialUrl('https://parlament.gov.rs.attacker.test/fake.pdf'),false);
  assert.equal(officialUrl('https://www.vrh.sud.rs/sites/default/files/law.pdf'),true);
  const documentEntry=clone(entry),withDocument={...complete,pdfFile:{id:18,url:'https://documents.gov.rs/old.pdf'}};
  documentEntry.documentCorrections={pdfFile:{fromId:18,fromUrl:withDocument.pdfFile.url,to:null,reason:'Synthetic fixture of a verified superseded edition',supersededCitation:'Fixture old edition',currentCitation:'Fixture current edition',archivedSha256:'a'.repeat(64),evidenceUrl:source}};
  assert.deepEqual(buildPlan([documentEntry],[withDocument])[0].patch,{pdfFile:null});
  documentEntry.documentCorrections.pdfFile.fromId=19;
  assert.deepEqual(buildPlan([documentEntry],[withDocument])[0].errors,['STALE_DOCUMENT_CORRECTION_pdfFile']);
  assert.throws(()=>authorizedOrigin('https://attacker.test',true),/NOT_AUTHORIZED/);
  assert.throws(()=>authorizedOrigin('https://password@cms.avangarda.media'),/NOT_AUTHORIZED/);
  let attempts=0;
  const client=new AdminClient('http://127.0.0.1:1357','test',{localQa:true,sleep:async()=>{},fetchImpl:async()=>{attempts++;return {ok:attempts===3,status:503,json:async()=>({ok:true})};}});
  await client.request('/test');assert.equal(attempts,3);
  attempts=0;await assert.rejects(client.request('/test',{method:'POST',body:{}}),/HTTP_503/);assert.equal(attempts,1);
  console.log('PASS planning: preserve fields/slug/media/SEO, Cyrillic deduplication, all languages, official sources, draft gate, stale correction and POST replay prevention');
}
async function integration(appDir,dependencies) {
  assert.ok(path.basename(appDir).startsWith('avangarda_legal_qa_'),'A dedicated QA directory is required');
  assert.equal(fs.existsSync(appDir),false,'Never reuse or reset an existing database');
  const cms=path.resolve(__dirname,'..');
  fs.mkdirSync(appDir,{recursive:true});
  for(const name of ['src','config','public']) if(fs.existsSync(path.join(cms,name))) fs.cpSync(path.join(cms,name),path.join(appDir,name),{recursive:true});
  fs.copyFileSync(path.join(cms,'package.json'),path.join(appDir,'package.json'));
  fs.writeFileSync(path.join(appDir,'isolated-legal-qa.marker'),'Disposable legal import integration test\n');
  fs.writeFileSync(path.join(appDir,'config/database.js'),"const path=require('node:path');module.exports=()=>({connection:{client:'sqlite',connection:{filename:path.join(__dirname,'../legal-qa.sqlite')},useNullAsDefault:true}});\n");
  fs.writeFileSync(path.join(appDir,'src/index.js'),"const {registerAvangardaCustomFields}=require('./custom-fields');module.exports={register({strapi}){registerAvangardaCustomFields(strapi);},bootstrap(){}};\n");
  fs.symlinkSync(path.resolve(dependencies),path.join(appDir,'node_modules'),'junction');
  process.chdir(appDir);
  Object.assign(process.env,{NODE_ENV:'production',STRAPI_TELEMETRY_DISABLED:'true',STRAPI_DISABLE_UPDATE_NOTIFICATION:'true',HOST:'127.0.0.1',PORT:'1357'});
  for(const name of ['ADMIN_JWT_SECRET','JWT_SECRET','API_TOKEN_SALT','TRANSFER_TOKEN_SALT']) process.env[name]=crypto.randomBytes(32).toString('hex');
  process.env.APP_KEYS=Array.from({length:4},()=>crypto.randomBytes(24).toString('hex')).join(',');
  for(const name of ['CLOUDINARY_NAME','CLOUDINARY_KEY','CLOUDINARY_SECRET','CMS_REVALIDATE_URL','FRONTEND_REVALIDATE_URL','CMS_REVALIDATE_SECRET','PUBLIC_URL']) delete process.env[name];
  const strapi=require(path.join(appDir,'node_modules/@strapi/strapi')).default;
  const app=await strapi({dir:appDir}).load();
  try {
    assert.equal(app.db.config.connection.client,'sqlite');
    const role=await app.admin.services.role.getSuperAdmin();
    const password=crypto.randomBytes(24).toString('hex');
    await app.admin.services.user.create({email:'qa.legal@example.test',firstname:'Legal',lastname:'QA',password,isActive:true,roles:[role.id]});
    const topic=await app.entityService.create('api::topic.topic',{data:{name:'QA Topic',slug:'qa-topic',publishedAt:new Date().toISOString()}});
    const media=await app.entityService.create('plugin::upload.file',{data:{name:'qa.pdf',hash:'legal-qa',ext:'.pdf',mime:'application/pdf',size:1,url:'/uploads/qa.pdf',provider:'local',folderPath:'/'}});
    const initial=fixture(1,'Zakon o zaštiti građana');
    const previous=await app.entityService.create('api::legal-resource.legal-resource',{data:{...initial.data,slug:'existing-published-slug',body:'Manual existing overview.',isFeatured:true,seo:{seoTitle:'Manual SEO'},relatedTopics:[topic.id],pdfFile:media.id,publishedAt:new Date().toISOString()}});
    // More than a page, with a draft matching a catalogue law in Cyrillic.
    const draftEntry=fixture(4,'Zakon o posebnoj zaštiti');
    await app.entityService.create('api::legal-resource.legal-resource',{data:{...draftEntry.data,title:'Закон о посебној заштити',slug:'existing-draft-slug',publishedAt:null}});
    for(let i=0;i<23;i++) await app.entityService.create('api::legal-resource.legal-resource',{data:{title:'Unrelated QA '+i,slug:'unrelated-qa-'+i,type:'guide',publishedAt:null}});
    await app.listen();
    const auth=await fetch('http://127.0.0.1:1357/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'qa.legal@example.test',password})});
    assert.equal(auth.status,200);const token=(await auth.json()).data.token;
    const client=new AdminClient('http://127.0.0.1:1357',token,{localQa:true,sleep:async()=>{}});
    await client.checkSchema();
    const inventory=await client.inventory();assert.equal(inventory.length,25,'Published and draft pagination is complete');
    const before=inventory.find(x=>x.id===previous.id);
    assert.deepEqual(before.relatedTopics.map(x=>x.id),[topic.id],'Actual Admin API relation count is exported fully');
    const created=fixture(2);created.data.relatedTopics=[topic.id];
    const review=fixture(3);review.verified=false;review.reviewReason='Synthetic unresolved legal evidence';
    const entries=[initial,created,review,draftEntry];
    const plan=buildPlan(entries,inventory);assert.ok(plan.every(p=>!p.errors),JSON.stringify(plan.filter(p=>p.errors)));
    const stateDir=path.join(appDir,'evidence');
    const results=await execute(client,entries,plan,inventory,stateDir);
    assert.ok(results.every(x=>x.status!=='failed'),JSON.stringify(results));assert.equal(results.length,4);
    const preserved=await client.one(previous.id);
    assert.equal(preserved.slug,before.slug);assert.equal(preserved.body,before.body);assert.equal(preserved.isFeatured,true);
    assert.equal(preserved.seo.id,before.seo.id);assert.equal(preserved.seo.seoTitle,'Manual SEO');
    assert.equal(preserved.pdfFile.id,media.id);assert.deepEqual(preserved.relatedTopics.map(x=>x.id),[topic.id]);
    assert.ok(preserved.publishedAt);assert.equal(results.find(x=>x.lawId===3).status,'draft');
    assert.equal(results.find(x=>x.lawId===4).slug,'existing-draft-slug','A pre-existing draft is published without duplication or slug replacement');
    assert.ok(fs.readdirSync(path.join(stateDir,'backups')).some(x=>x.startsWith(previous.id+'-')),'Full backup exists');
    const rerunInventory=await client.inventory(),rerunPlan=buildPlan(entries,rerunInventory);
    assert.ok(rerunPlan.every(x=>x.action==='skip'));const countBefore=rerunInventory.length;
    await execute(client,entries,rerunPlan,rerunInventory,stateDir);
    assert.equal((await client.inventory()).length,countBefore,'Rerun creates no duplicate');
    const uncertain=fixture(5);
    let creates=0;
    const lostResponse=new AdminClient(client.origin,token,{localQa:true,sleep:async()=>{},fetchImpl:async(url,options)=>{
      const response=await fetch(url,options);
      if(options.method==='POST'&&url.endsWith('/collection-types/api::legal-resource.legal-resource')) {creates++;await response.json();throw Error('Simulated lost creation response');}
      return response;
    }});
    const recoverInventory=await client.inventory();
    const recovered=await execute(lostResponse,[uncertain],buildPlan([uncertain],recoverInventory),recoverInventory,stateDir);
    assert.equal(creates,1);assert.equal(recovered[0].status,'published');
    assert.equal(findExisting(uncertain,await client.list()).length,1,'A lost POST response is recovered without a second creation');
    const retryEntry=clone(initial);retryEntry.data.dateUpdated='2020-01-01';
    const retryInventory=await client.inventory();const retryPlan=buildPlan([retryEntry],retryInventory);
    const failedPut=new AdminClient(client.origin,token,{localQa:true,sleep:async()=>{},fetchImpl:async(url,options)=>options.method==='PUT'?new Response('{}',{status:400}):fetch(url,options)});
    assert.equal((await execute(failedPut,[retryEntry],retryPlan,retryInventory,stateDir))[0].status,'failed');
    const retried=await execute(client,[retryEntry],retryPlan,retryInventory,stateDir);
    assert.equal(retried[0].status,'published','An existing identical backup does not block a safe retry');
    const currentInventory=await client.inventory();
    const changed=clone(initial);changed.data.seo.seoTitle_en='New suggestion which must not overwrite';
    const stalePlan=buildPlan([changed],currentInventory);stalePlan[0].action='update';stalePlan[0].patch={shortDescription_en:'Pending supplement'};
    await app.entityService.update('api::legal-resource.legal-resource',previous.id,{data:{shortDescription_en:'Another editor changed this'}});
    const conflict=await execute(client,[changed],stalePlan,currentInventory,stateDir);
    assert.equal(conflict[0].reason,'CONCURRENT_EDITORIAL_CHANGE');
    const invalidRelation=fixture(6);invalidRelation.data.relatedTopics=[99999];
    const now=await client.inventory();await assert.rejects(execute(client,[invalidRelation],buildPlan([invalidRelation],now),now,stateDir),/MISSING_OR_UNPUBLISHED_RELATION/);
    const correctedDocument=clone(initial);
    correctedDocument.documentCorrections={pdfFile:{fromId:media.id,fromUrl:before.pdfFile.url,to:null,reason:'Synthetic fixture of a verified superseded edition; retain media asset',supersededCitation:'Fixture old edition',currentCitation:'Fixture current edition',archivedSha256:'a'.repeat(64),evidenceUrl:source}};
    const documentInventory=await client.inventory();
    const documentResult=await execute(client,[correctedDocument],buildPlan([correctedDocument],documentInventory),documentInventory,stateDir);
    assert.equal(documentResult[0].status,'published');assert.equal((await client.one(previous.id)).pdfFile,null);
    assert.ok(await app.entityService.findOne('plugin::upload.file',media.id),'Disconnecting a superseded edition retains the original media asset');
    const documentRerun=await client.inventory();assert.equal(buildPlan([correctedDocument],documentRerun)[0].action,'skip');
    fs.writeFileSync(path.join(appDir,'checks.json'),JSON.stringify({passed:true,strapiVersion:require(path.join(dependencies,'@strapi/strapi/package.json')).version,checks:['authenticated draft/published pagination','real relation export','schema check','backup before update','manual text/slug/media/component ID preserved','create then explicit publish','unverified law remains draft','existing Cyrillic draft deduplication','idempotent rerun','lost create response recovered without replay','failed PUT retries with existing backup','concurrent editor protected','invalid relationship rejected','verified superseded attachment disconnected without deleting asset','document correction rerun is idempotent']},null,2));
    console.log('PASS real Strapi integration: inventory, relations, backup, preservation, draft/publish, idempotence and concurrent editor protection');
  } finally {await app.destroy();}
}
async function main() {
  await unit();
  const args=process.argv.slice(2);
  if(args.length) {assert.equal(args.length,2,'Pass a fresh QA directory and cached CMS node_modules directory');await integration(path.resolve(args[0]),path.resolve(args[1]));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
