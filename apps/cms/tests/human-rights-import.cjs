'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {validate,plan,assertPreserved,dryRun,apply}=require('../scripts/import-human-rights.cjs');
const {entries,payload}=require('../data/human-rights/catalogue-20261022.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
async function run(){
 assert.deepEqual(validate(),{entries:22,languages:8,translatedFields:9});
 const old={id:1,slug:'existing-editorial-right',title:'Existing editorial right',title_ar:'حق تحريري قائم',body:'Keep this editorial text',publishedAt:'2026-01-01T00:00:00.000Z',relatedLegalResources:[{id:99}],relatedArticles:[{id:45}],relatedTopics:[{id:8}],relatedLocations:[]};
 assert.equal(plan([old],2).filter(x=>x.action==='create').length,22);
 assert.throws(()=>plan([old,{...payload(entries[0]),id:8,slug:'different-stable-slug'}],2),/POSSIBLE_DUPLICATE_TITLE/);
 assert.throws(()=>plan([old,{...payload(entries[0]),id:8,body:'New editorial revision',relatedLegalResources:[2]}],2),/MUST_NOT_BE_OVERWRITTEN/);
 assert.throws(()=>assertPreserved([old],[{...old,relatedArticles:[]}]),/EXISTING_RECORD_CHANGED/);
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'avangarda-rights-import-test-'));
 const state=[clone(old)],mutations=[];
 const client={schema:async()=>{},constitution:async()=>2,inventory:async()=>clone(state),one:async id=>clone(state.find(x=>x.id===id)),admin:{request:async(route,options)=>{
   mutations.push({route,method:options.method});
   if(route.endsWith('/actions/publish')){const id=Number(route.split('/').at(-3));const r=state.find(x=>x.id===id);r.publishedAt='2026-10-22T18:00:00.000Z';return clone(r);}
   assert.equal(options.method,'POST');assert(!state.some(x=>x.slug===options.body.slug));const record={id:state.length+1,...clone(options.body),publishedAt:null};state.push(record);return clone(record);
 }}};
 const ready=await dryRun(client,directory);assert.equal(mutations.length,0);assert.equal(ready.counts.create,22);assert(fs.existsSync(ready.exportFile));
 const first=await apply(client,ready.target,directory,{batchSize:2,publish:true,sleep:async()=>{}});
 assert.equal(first.created.length,22);assert.equal(first.published.length,22);assert.equal(state.length,23);assert.deepEqual(state[0],old);
 await new Promise(r=>setTimeout(r,2));
 const repeated=await apply(client,ready.target,directory,{batchSize:2,publish:true,sleep:async()=>{}});
 assert.equal(repeated.created.length,0);assert.equal(repeated.published.length,0);assert.equal(repeated.skipped.length,22);assert.equal(mutations.length,44);assert.deepEqual(state[0],old);
 const fresh=await dryRun(client,directory);assert.equal(fresh.counts.create,0);assert.equal(fresh.counts.skip,22);
 const draftState=[clone(old),{id:2,...payload(entries[0]),relatedLegalResources:[2],publishedAt:null}];
 const draftClient={...client,inventory:async()=>clone(draftState)};
 const draftDirectory=fs.mkdtempSync(path.join(os.tmpdir(),'avangarda-rights-draft-test-'));const draftPlan=await dryRun(draftClient,draftDirectory);
 await assert.rejects(()=>apply(draftClient,draftPlan.target,draftDirectory,{publish:true,sleep:async()=>{}}),/PREEXISTING_DRAFT_REQUIRES_EDITOR_REVIEW/);
 console.log('PASS: 22 rights × 8 languages × 9 fields; authenticated dry-run writes nothing; add-only publication; repeat import creates zero duplicates; existing texts and relations preserved; unrelated drafts cannot be published.');
}
run().catch(e=>{console.error(e.stack);process.exitCode=1});
