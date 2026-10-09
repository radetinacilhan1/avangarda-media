// Actual custom-field rendering with the installed v4 RBAC/JSON-state contract.
// No browser, network or CMS writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/admin/components/HeadlinePositionInput/index.js'),'utf8'),{fileName:'HeadlinePositionInput.jsx',compilerOptions:{allowJs:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
async function run(canPublish){
  let index=0,dirty=true,tree,effects=[],hooks=[],calls=[],change;
  const proposal={position:2,baseRevision:3,operationId:'saved_operation_123'};
  const data={id:6,title:'Selected story',publishedAt:'2026-10-01',homepagePlacement:JSON.stringify(proposal)};
  const context={modifiedData:{...data},initialData:{...data},isCreatingEntry:false};
  const state={revision:3,articles:[1,2,3,4,5].map(id=>({id,title:`Story ${id}`})),appliedOperationIds:[]};
  const jsx=(type,props)=>({type,props});
  const react={forwardRef:f=>f,useState:initial=>{const slot=index++;hooks[slot]||={value:initial};return[hooks[slot].value,next=>{const value=typeof next==='function'?next(hooks[slot].value):next;if(!Object.is(hooks[slot].value,value)){hooks[slot].value=value;dirty=true;}}];},useEffect:(work,deps)=>{const slot=index++,previous=hooks[slot];if(!previous||deps.some((value,i)=>value!==previous.deps[i]))effects.push(()=>{hooks[slot]={deps};work();});}};
  const helper={useCMEditViewDataManager:()=>context,useRBAC:()=>({allowedActions:{canPublish}}),useFetchClient:()=>({get:async()=>({data:{data:state}}),post:async(url,body)=>{calls.push({url,body});state.appliedOperationIds.push(body.operationId);}})};
  const module={exports:{}};
  new Function('require','module','exports','window',code)(name=>name==='react'?react:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='styled-components'?{__esModule:true,default:{section:()=> 'section'}}:name==='@strapi/helper-plugin'?helper:(()=>{throw new Error(name)})(),module,module.exports,{crypto:{randomUUID:()=> '00000000-1234-1234-1234-000000000000'}});
  const props={name:'homepagePlacement',attribute:{type:'json'},value:data.homepagePlacement,onChange:event=>{change=event;props.value=event.target.value;dirty=true;}};
  async function flush(){for(let pass=0;pass<12;pass++){if(dirty){dirty=false;index=0;effects=[];tree=module.exports.default(props);effects.forEach(f=>f());}await Promise.resolve();if(!dirty&&pass>3)break;}}
  const flatten=node=>Array.isArray(node)?node.flatMap(flatten):node&&typeof node==='object'?[node,...flatten(node.props?.children)]:[];
  await flush();let button=flatten(tree).find(node=>node.type==='button'&&node.props.children==='Objavi raspored');
  assert.equal(Boolean(button),canPublish,'v4 returns allowedActions.canPublish; published editor must expose apply only with that permission');
  const select=flatten(tree).find(node=>node.type==='select');assert.equal(select.props.value,2,'Saved JSON strings are parsed');
  select.props.onChange({target:{value:'1'}});await flush();assert.equal(typeof change.target.value,'string','Native v4 Save parses a JSON string');
  const pending=JSON.parse(change.target.value);assert.equal(pending.position,1);assert.equal(pending.baseRevision,3);
  if(canPublish){button=flatten(tree).find(node=>node.type==='button'&&node.props.children==='Objavi raspored');assert.equal(button.props.disabled,true,'Unsaved proposal cannot apply');context.initialData.homepagePlacement=props.value;dirty=true;await flush();button=flatten(tree).find(node=>node.type==='button'&&node.props.children==='Objavi raspored');assert.equal(button.props.disabled,false);await button.props.onClick();await flush();assert.equal(calls.length,1);assert.equal(calls[0].body.operationId,pending.operationId);assert.equal(calls[0].url,'/content-manager/headline-selection/apply/6');button=flatten(tree).find(node=>node.type==='button'&&node.props.children==='Objavi raspored');assert.equal(button.props.disabled,true,'Applied operation cannot be replayed by the UI');}
}
Promise.all([run(true),run(false)]).then(()=>console.log('PASS native headline custom field: JSON string save contract, published apply RBAC, saved-only apply, operation replay disabled')).catch(error=>{console.error(error);process.exitCode=1;});
