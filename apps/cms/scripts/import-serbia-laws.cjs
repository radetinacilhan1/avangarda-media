"use strict";
// Uses the existing authenticated Content Manager API. This repository runs
// Strapi 4.26.1; it has public GET-only legal-resource routes. No database access,
// migration, permission change, dependency install or bulk media upload occurs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const UID = 'api::legal-resource.legal-resource';
const LANGS = ['sr','en','tr','fr','de','es','el','ar'];
const TEXT_FIELDS = ['title','legalArea','shortDescription','body','whatIsThisFor','whoCanUseIt','whenToUseIt','sourceName','fileLabel'];
const RELATIONS = ['tags','relatedHumanRights','relatedArticles','relatedTopics','relatedLocations'];
const CORRECTABLE = new Set(['officialSourceUrl','dateUpdated','countryOrFramework','type', ...LANGS.map(l=>l==='sr'?'sourceName':'sourceName_'+l)]);
const schema = JSON.parse(fs.readFileSync(path.join(__dirname,'../src/api/legal-resource/content-types/legal-resource/schema.json'),'utf8'));
const seoSchema = JSON.parse(fs.readFileSync(path.join(__dirname,'../src/components/shared/seo-meta.json'),'utf8'));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const empty = value => value == null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length);
const field = (name,lang) => lang==='sr'?name:name+'_'+lang;
function authorizedOrigin(origin,localQa=false) {
  const u=new URL(origin);
  const local=localQa && ['127.0.0.1','localhost','[::1]'].includes(u.hostname) && ['http:','https:'].includes(u.protocol);
  if(u.username||u.password||(!local && u.origin!=='https://cms.avangarda.media')) throw Error('CMS_ORIGIN_NOT_AUTHORIZED');
  return u.origin;
}
const relationIds = values => (values||[]).map(x=>typeof x==='object'?x.id:x).sort((a,b)=>a-b);
function normalizedTitle(value) {
  const cyr = {'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'dj','е':'e','ж':'z','з':'z','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'c','у':'u','ф':'f','х':'h','ц':'c','ч':'c','џ':'dz','ш':'s'};
  return String(value||'').toLowerCase().replace(/[а-яђјљњћџ]/gu,c=>cyr[c]||c).replace(/đ/g,'dj').normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function officialUrl(value) {
  try {
    const u = new URL(value);
    if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')) return false;
    const host = u.hostname.replace(/^www\./,'');
    return host.endsWith('.gov.rs') || ['pravno-informacioni-sistem.rs','poverenik.rs','ombudsman.rs','ustavni.sud.rs','vrh.sud.rs','acas.rs','nbs.rs','rfzo.rs','pio.rs'].some(h=>host===h||host.endsWith('.'+h));
  } catch { return false; }
}
function urlIdentity(value) {
  try { const u=new URL(value); return u.hostname.replace(/^www\./,'')+u.pathname.replace(/^\/SlGlasnikPortal/,'').replace(/\/$/,''); }
  catch { return ''; }
}
function findExisting(entry, records) {
  const names = [entry.requestedTitle,entry.data?.title,...(entry.aliases||[])].filter(Boolean).map(normalizedTitle);
  const slug = entry.data?.slug;
  return records.filter(r => names.includes(normalizedTitle(r.title)) || (slug && r.slug===slug));
}
function patchMissing(entry, existing) {
  const patch={};
  const data=entry.data||{};
  for(const [key,value] of Object.entries(data)) {
    if(key==='seo') {
      const previous=existing.seo||{};
      const additions=Object.fromEntries(Object.entries(value||{}).filter(([k,v])=>k!=='id' && empty(previous[k]) && !empty(v)));
      if(Object.keys(additions).length) patch.seo={...previous,...additions};
    } else if(key!=='slug' && key!=='isFeatured' && empty(existing[key]) && !empty(value)) patch[key]=value;
  }
  for(const [key,correction] of Object.entries(entry.corrections||{})) {
    if(!CORRECTABLE.has(key) || !correction.reason || !officialUrl(correction.evidenceUrl)) throw Error('INVALID_CORRECTION_'+key);
    if(JSON.stringify(existing[key])===JSON.stringify(correction.to)) continue;
    if(JSON.stringify(existing[key])!==JSON.stringify(correction.from)) throw Error('STALE_CORRECTION_'+key);
    patch[key]=correction.to;
  }
  for(const [key,correction] of Object.entries(entry.documentCorrections||{})) {
    // An independently reviewed superseded attachment may be disconnected.
    // The media asset is retained; this is never a file deletion or replacement.
    if(!['pdfFile','downloadableFile'].includes(key)||entry.verified!==true||correction.to!==null||
       !Number.isInteger(correction.fromId)||!correction.fromUrl||!correction.reason||
       !correction.supersededCitation||!correction.currentCitation||!/^[a-f0-9]{64}$/.test(correction.archivedSha256||'')||
       !officialUrl(correction.evidenceUrl)||!(entry.evidence||[]).some(e=>e.url===correction.evidenceUrl)) throw Error('INVALID_DOCUMENT_CORRECTION_'+key);
    if(empty(existing[key])) continue;
    if(existing[key].id!==correction.fromId||existing[key].url!==correction.fromUrl) throw Error('STALE_DOCUMENT_CORRECTION_'+key);
    patch[key]=null;
  }
  return patch;
}
function validate(entry, data, isNew) {
  const errors=[];
  if(typeof entry.verified!=='boolean') errors.push('VERIFICATION_BOOLEAN_REQUIRED');
  if(!Number.isInteger(entry.id)||entry.id<1||entry.id>66) errors.push('CATALOGUE_ID_OUT_OF_RANGE');
  for(const [key,value] of Object.entries(data)) {
    const attr=schema.attributes[key];
    if(!attr && !['id','createdAt','updatedAt','publishedAt','createdBy','updatedBy','localizations','locale'].includes(key)) errors.push('UNKNOWN_FIELD_'+key);
    if(attr?.enum && !attr.enum.includes(value)) errors.push('INVALID_ENUM_'+key);
  }
  if(data.type!=='law'||data.countryOrFramework!=='serbia') errors.push('NOT_SERBIAN_LAW');
  if(!data.slug||!data.title) errors.push('TITLE_SLUG_REQUIRED');
  if(!officialUrl(data.officialSourceUrl)) errors.push('OFFICIAL_HTTPS_SOURCE_REQUIRED');
  if(!(entry.evidence||[]).some(e=>officialUrl(e.url)&&urlIdentity(e.url)===urlIdentity(data.officialSourceUrl))) errors.push('SOURCE_NOT_IN_VERIFIED_EVIDENCE');
  if(!entry.checkedAt || Number.isNaN(Date.parse(entry.checkedAt))) errors.push('LEGAL_CHECK_DATE_REQUIRED');
  if(data.dateUpdated && (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateUpdated)||data.dateUpdated>entry.checkedAt.slice(0,10))) errors.push('INVALID_DOCUMENT_DATE');
  for(const lang of LANGS) {
    for(const name of TEXT_FIELDS) if(empty(data[field(name,lang)])) errors.push('MISSING_'+field(name,lang));
    for(const name of ['seoTitle','seoDescription']) if(empty(data.seo?.[field(name,lang)])) errors.push('MISSING_SEO_'+field(name,lang));
    if(isNew && String(data[field('body',lang)]||'').length<1000) errors.push('INSUFFICIENT_BODY_'+lang);
    if(isNew && lang!=='sr' && data[field('body',lang)]===data.body) errors.push('UNTRANSLATED_BODY_'+lang);
  }
  if(data.body_ar && !/[\u0600-\u06ff]/u.test(data.body_ar)) errors.push('ARABIC_SCRIPT_REQUIRED');
  if(data.body_el && !/[\u0370-\u03ff]/u.test(data.body_el)) errors.push('GREEK_SCRIPT_REQUIRED');
  for(const key of Object.keys(data.seo||{})) if(key!=='id' && !seoSchema.attributes[key]) errors.push('UNKNOWN_SEO_FIELD_'+key);
  for(const key of RELATIONS) if(Array.isArray(data[key]) && data[key].some(x=>!(Number.isInteger(typeof x==='object'?x.id:x)))) errors.push('INVALID_RELATION_'+key);
  if(!entry.verified && !entry.reviewReason) errors.push('REVIEW_REASON_REQUIRED');
  return errors;
}
function buildPlan(entries, records) {
  const seen=new Set();
  return entries.map(entry=>{
    const base={lawId:entry.id,title:entry.requestedTitle,checkedAt:entry.checkedAt};
    if(seen.has(entry.id)) return {...base,action:'error',errors:['DUPLICATE_CATALOGUE_ID']};
    seen.add(entry.id);
    const matches=findExisting(entry,records);
    if(matches.length>1) return {...base,action:'review',reason:'Multiple existing resources match; no write permitted',ids:matches.map(x=>x.id)};
    const existing=matches[0];
    try {
      if(!existing&&Object.keys(entry.documentCorrections||{}).length) throw Error('DOCUMENT_CORRECTION_REQUIRES_EXISTING_RESOURCE');
      if(Object.keys(entry.data||{}).some(k=>!schema.attributes[k])) throw Error('SYSTEM_OR_UNKNOWN_WRITE_FIELD');
      if(['pdfFile','downloadableFile'].some(k=>!empty(entry.data?.[k]))) throw Error('MEDIA_UPLOAD_REQUIRES_SEPARATE_VERIFIED_WORKFLOW');
      const patch=existing?patchMissing(entry,existing):{...entry.data,isFeatured:false};
      const merged=existing?{...existing,...patch}:patch;
      const errors=validate(entry,merged,!existing);
      if(errors.length) return {...base,action:'error',errors,existingId:existing?.id};
      return {...base,action:existing?(Object.keys(patch).length?'update':'skip'):'create',existingId:existing?.id,slug:merged.slug,
        publish:entry.verified===true && !existing?.publishedAt, reviewReason:entry.reviewReason||'', patch,
        beforeHash:existing?hash(existing):null, existingPublished:!!existing?.publishedAt, inputHash:hash(entry)};
    } catch(error) { return {...base,action:'error',errors:[error.message],existingId:existing?.id}; }
  });
}
class AdminClient {
  constructor(origin,token,{fetchImpl=fetch,sleep=ms=>new Promise(r=>setTimeout(r,ms)),localQa=false}={}) {
    const safeOrigin=authorizedOrigin(origin,localQa);
    if(!token) throw Error('ADMIN_AUTHENTICATION_REQUIRED');
    this.origin=safeOrigin;this.token=token;this.fetch=fetchImpl;this.sleep=sleep;
  }
  async request(endpoint,{method='GET',body,attempts=4}={}) {
    // Never blindly replay POST: a timeout may follow a committed creation.
    const retries=method==='POST'?1:attempts;
    for(let attempt=0;attempt<retries;attempt++) {
      try {
        const r=await this.fetch(this.origin+endpoint,{method,redirect:'error',headers:{Authorization:'Bearer '+this.token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
        if(!r.ok) throw Object.assign(Error('CMS_HTTP_'+r.status),{retry:r.status===429||r.status>=500,status:r.status});
        return await r.json();
      } catch(e) {
        if(attempt===retries-1||e.retry===false) throw Error(e.status?'CMS_HTTP_'+e.status:'CMS_REQUEST_UNCONFIRMED');
        await this.sleep(1000*2**attempt);
      }
    }
  }
  async list(model=UID) {
    const records=[];
    for(let page=1;page<=100;page++) {
      const result=await this.request('/content-manager/collection-types/'+model+'?page='+page+'&pageSize=20&sort=id:ASC');
      if(!Array.isArray(result.results)||!result.pagination) throw Error('UNEXPECTED_ADMIN_VERSION_OR_RESPONSE');
      records.push(...result.results);
      if(page>=result.pagination.pageCount) return records;
    }
    throw Error('INVENTORY_PAGINATION_LIMIT');
  }
  async one(id) {
    const record=await this.request('/content-manager/collection-types/'+UID+'/'+id);
    if(!Number.isInteger(record.id)||record.documentId) throw Error('CMS_VERSION_MISMATCH_EXPECTED_STRAPI4');
    for(const name of RELATIONS) {
      if(Array.isArray(record[name])) continue;
      if(!record[name]?.count) {record[name]=[];continue;}
      const relations=[];
      for(let page=1;page<=100;page++) {
        const result=await this.request('/content-manager/relations/'+UID+'/'+id+'/'+name+'?page='+page+'&pageSize=50');
        if(!Array.isArray(result.results)) throw Error('RELATION_EXPORT_FAILED_'+name);
        relations.push(...result.results);
        if(page>=(result.pagination?.pageCount||1)) break;
        if(page===100) throw Error('RELATION_PAGINATION_LIMIT');
      }
      if(relations.length!==record[name].count) throw Error('INCOMPLETE_RELATION_EXPORT_'+name);
      record[name]=relations;
    }
    return record;
  }
  async inventory() {
    const records=[];
    for(const row of await this.list()) records.push(await this.one(row.id));
    return records;
  }
  async checkSchema() {
    const {data}=await this.request('/content-manager/init');
    this.models=new Map((data?.contentTypes||[]).map(x=>[x.uid,x]));
    const model=data?.contentTypes?.find(x=>x.uid===UID);
    const seo=data?.components?.find(x=>x.uid==='shared.seo-meta');
    if(!model?.options?.draftAndPublish||!model.attributes?.id||model.attributes.documentId||!seo) throw Error('CMS_SCHEMA_OR_VERSION_MISMATCH');
    for(const [name,attr] of Object.entries(schema.attributes)) {
      const current=model.attributes[name];
      if(!current||current.type!==attr.type||current.target!==attr.target||current.component!==attr.component||
        (attr.enum && JSON.stringify(current.enum)!==JSON.stringify(attr.enum))) throw Error('CMS_SCHEMA_MISMATCH_'+name);
    }
    for(const [name,attr] of Object.entries(seoSchema.attributes)) if(seo.attributes?.[name]?.type!==attr.type) throw Error('CMS_SEO_SCHEMA_MISMATCH_'+name);
  }
  async checkRelations(plan) {
    for(const name of RELATIONS) {
      const ids=new Set(plan.flatMap(p=>relationIds(p.patch?.[name])));
      if(!ids.size) continue;
      const target=schema.attributes[name].target;
      const model=this.models?.get(target);
      if(!model) throw Error('RELATION_SCHEMA_REQUIRED_'+name);
      const allowed=new Set((await this.list(target)).filter(x=>!model.options?.draftAndPublish||x.publishedAt).map(x=>x.id));
      for(const id of ids) if(!allowed.has(id)) throw Error('MISSING_OR_UNPUBLISHED_RELATION_'+name+'_'+id);
    }
  }
}
function logResult(stateDir,result) {
  fs.mkdirSync(stateDir,{recursive:true});
  fs.appendFileSync(path.join(stateDir,'journal.jsonl'),JSON.stringify({...result,at:new Date().toISOString()})+'\n');
  const progressPath=path.join(stateDir,'progress.json');
  const progress=fs.existsSync(progressPath)?JSON.parse(fs.readFileSync(progressPath,'utf8')):{};
  progress[result.lawId]=result;
  const temporary=progressPath+'.tmp';fs.writeFileSync(temporary,JSON.stringify(progress,null,2));fs.renameSync(temporary,progressPath);
}
async function execute(client,entries,plan,records,stateDir,batchSize=3) {
  if(!Number.isInteger(batchSize)||batchSize<1||batchSize>5) throw Error('BATCH_SIZE_MUST_BE_1_TO_5');
  if(plan.some(p=>p.action==='error')) throw Error('DRY_RUN_VALIDATION_FAILED');
  await client.checkSchema();
  await client.checkRelations(plan);
  fs.mkdirSync(path.join(stateDir,'backups'),{recursive:true});
  // Complete, authenticated pre-write export, including draft relations/media.
  fs.writeFileSync(path.join(stateDir,'inventory-before-'+Date.now()+'.private.json'),JSON.stringify({authenticated:true,checkedAt:new Date().toISOString(),records},null,2));
  const results=[];
  for(let index=0;index<plan.length;index++) {
    const item=plan[index];
    if(['skip','review'].includes(item.action) && !item.publish) {const result={...item,patch:undefined,status:item.action};results.push(result);logResult(stateDir,result);continue;}
    try {
      let id=item.existingId;
      let before;
      if(id) {
        const fresh=await client.one(id);
        if(hash(fresh)!==item.beforeHash) throw Error('CONCURRENT_EDITORIAL_CHANGE');
        before=fresh;
        const backupPath=path.join(stateDir,'backups',id+'-'+hash(fresh)+'.private.json');
        if(!fs.existsSync(backupPath)) fs.writeFileSync(backupPath,JSON.stringify(fresh,null,2),{flag:'wx'});
        else if(hash(JSON.parse(fs.readFileSync(backupPath,'utf8')))!==hash(fresh)) throw Error('BACKUP_INTEGRITY_FAILURE');
        if(item.action==='update') await client.request('/content-manager/collection-types/'+UID+'/'+id,{method:'PUT',body:item.patch});
      } else {
        // Recheck immediately before POST and recover ambiguous responses by
        // inventory instead of submitting the same creation twice.
        const entry=entries.find(e=>e.id===item.lawId);
        if(findExisting(entry,await client.list()).length) throw Error('NEW_MATCH_SINCE_DRY_RUN');
        try {
          const created=await client.request('/content-manager/collection-types/'+UID,{method:'POST',body:item.patch});
          id=created.id;
          if(!Number.isInteger(id)) throw Error('CREATE_ID_UNCONFIRMED');
        } catch(error) {
          const recovered=findExisting(entry,await client.list());
          if(recovered.length!==1) throw Error('CREATE_UNCONFIRMED_RESUME_WITH_FRESH_INVENTORY');
          id=recovered[0].id;
          const recoverRecord=await client.one(id);
          const requested=Object.fromEntries(Object.entries(item.patch).filter(([k])=>!RELATIONS.includes(k)&&k!=='seo'));
          if(Object.entries(requested).some(([k,v])=>JSON.stringify(recoverRecord[k])!==JSON.stringify(v))) throw Error('CREATE_RECOVERY_CONFLICT');
        }
      }
      // Verify all proposed scalar/component fields before publishing.
      const saved=await client.one(id);
      const expected=entries.find(e=>e.id===item.lawId);
      const errors=validate(expected,saved,false);
      if(errors.length) throw Error('POST_WRITE_VALIDATION_'+errors.join(','));
      for(const [key,value] of Object.entries(item.patch)) {
        if(RELATIONS.includes(key)) {if(JSON.stringify(relationIds(saved[key]))!==JSON.stringify(relationIds(value))) throw Error('SAVE_MISMATCH_RELATION_'+key);continue;}
        if(key==='seo') {for(const [k,v] of Object.entries(value)) if(k!=='id'&&saved.seo?.[k]!==v) throw Error('SAVE_MISMATCH_SEO_'+k);}
        else if(JSON.stringify(saved[key])!==JSON.stringify(value)) throw Error('SAVE_MISMATCH_'+key);
      }
      if(before) {
        for(const key of Object.keys(schema.attributes)) {
          if(key in item.patch) continue;
          if(RELATIONS.includes(key)) {if(JSON.stringify(relationIds(saved[key]))!==JSON.stringify(relationIds(before[key]))) throw Error('PRESERVATION_MISMATCH_'+key);}
          else if(['pdfFile','downloadableFile'].includes(key)) {if(saved[key]?.id!==before[key]?.id) throw Error('PRESERVATION_MISMATCH_'+key);}
          else if(JSON.stringify(saved[key]??null)!==JSON.stringify(before[key]??null)) throw Error('PRESERVATION_MISMATCH_'+key);
        }
      }
      if(item.publish && !saved.publishedAt) {
        try {await client.request('/content-manager/collection-types/'+UID+'/'+id+'/actions/publish',{method:'POST',body:{}});}
        catch(error) {if(!(await client.one(id)).publishedAt) throw error;}
      }
      const verified=await client.one(id);
      if(item.publish&&!verified.publishedAt) throw Error('PUBLICATION_NOT_CONFIRMED');
      if(!expected.verified&&!item.existingPublished&&verified.publishedAt) throw Error('UNVALIDATED_PUBLICATION');
      const result={lawId:item.lawId,id,slug:verified.slug,inputHash:item.inputHash,action:item.action,status:verified.publishedAt?'published':'draft',reviewReason:item.reviewReason,verifiedAt:new Date().toISOString()};
      results.push(result);logResult(stateDir,result);
    } catch(error) {
      const result={lawId:item.lawId,existingId:item.existingId,action:item.action,status:'failed',reason:error.message};
      results.push(result);logResult(stateDir,result);
      // Abort this run to avoid compounding an unconfirmed write or permission failure.
      break;
    }
    await client.sleep((index+1)%batchSize===0?2000:300);
  }
  return results;
}
function argumentsOf(argv) {
  const args={};
  for(let i=0;i<argv.length;i++) {if(!argv[i].startsWith('--')) throw Error('UNKNOWN_ARGUMENT');const key=argv[i].slice(2);args[key]=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true;}
  return args;
}
async function main() {
  const args=argumentsOf(process.argv.slice(2));
  const mode=args.mode||'dry-run';
  if(!['inventory','dry-run','apply'].includes(mode)) throw Error('INVALID_MODE');
  const stateDir=path.resolve(args['state-dir']||'.legal-import');
  fs.mkdirSync(stateDir,{recursive:true});
  let client,records,authenticated=false;
  if(args.credentials||process.env.AVANGARDA_CMS_ADMIN_TOKEN) {
    const credentials=args.credentials?JSON.parse(fs.readFileSync(path.resolve(args.credentials),'utf8')):{origin:'https://cms.avangarda.media',token:process.env.AVANGARDA_CMS_ADMIN_TOKEN};
    const origin=authorizedOrigin(credentials.origin||'https://cms.avangarda.media',!!args['local-qa']);
    let token=credentials.token;
    if(!token && credentials.email && credentials.password) {
      const response=await fetch(new URL('/admin/login',origin),{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:credentials.email,password:credentials.password}),signal:AbortSignal.timeout(45000)});
      if(!response.ok) throw Error('ADMIN_LOGIN_FAILED_'+response.status);
      token=(await response.json()).data?.token;
    }
    client=new AdminClient(origin,token,{localQa:!!args['local-qa']});
    await client.checkSchema();
    records=await client.inventory();authenticated=true;
  } else if(mode==='dry-run' && args['inventory-file']) {
    const imported=JSON.parse(fs.readFileSync(path.resolve(args['inventory-file']),'utf8'));
    records=imported.records||imported.response?.data;
    if(!Array.isArray(records)) throw Error('INVALID_OFFLINE_INVENTORY');
  } else throw Error('PRODUCTION_ADMIN_AUTH_REQUIRED');
  fs.writeFileSync(path.join(stateDir,'inventory-'+(authenticated?'authenticated':'public-provisional')+'.private.json'),JSON.stringify({authenticated,checkedAt:new Date().toISOString(),records},null,2));
  if(mode==='inventory') {console.log(JSON.stringify({mode,authenticated,records:records.length}));return;}
  if(!args.catalogue) throw Error('CATALOGUE_REQUIRED');
  const catalogue=JSON.parse(fs.readFileSync(path.resolve(args.catalogue),'utf8'));
  const entries=Array.isArray(catalogue)?catalogue:catalogue.records;
  if(!Array.isArray(entries)) throw Error('INVALID_CATALOGUE');
  const plan=buildPlan(entries,records);
  fs.writeFileSync(path.join(stateDir,'dry-run.json'),JSON.stringify({authenticated,provisional:!authenticated,checkedAt:new Date().toISOString(),plan},null,2));
  console.log(JSON.stringify({mode,authenticated,provisional:!authenticated,counts:plan.reduce((out,p)=>(out[p.action]=(out[p.action]||0)+1,out),{})}));
  if(mode==='apply') {
    if(!authenticated) throw Error('AUTHENTICATED_FULL_INVENTORY_REQUIRED');
    const results=await execute(client,entries,plan,records,stateDir,Number(args['batch-size']||3));
    console.log(JSON.stringify({processed:results.length,failed:results.filter(r=>r.status==='failed').length}));
    if(results.some(r=>r.status==='failed')) process.exitCode=1;
  }
}
module.exports={normalizedTitle,officialUrl,authorizedOrigin,findExisting,patchMissing,validate,buildPlan,AdminClient,execute,LANGS,TEXT_FIELDS};
if(require.main===module) main().catch(error=>{console.error(error.message);process.exitCode=1;});
