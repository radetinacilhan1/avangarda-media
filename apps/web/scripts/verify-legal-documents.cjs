'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'../src');
let item,responseBytes,responseType='application/octet-stream',fetches=0;
const docxUrl='https://documents.gov.rs/current-law.docx';
function docxFixture() {
  // Minimal stored ZIP containing a real OOXML document; no remote dependency.
  const entries=[['[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],['word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Legal fixture</w:t></w:r></w:p></w:body></w:document>']];
  const local=[],central=[];let offset=0;
  const crc32=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
  for(const [filename,contents] of entries){
    const name=Buffer.from(filename),data=Buffer.from(contents),crc=crc32(data);
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
    local.push(header,name,data);
    const directory=Buffer.alloc(46);directory.writeUInt32LE(0x02014b50);directory.writeUInt16LE(20,4);directory.writeUInt16LE(20,6);directory.writeUInt32LE(crc,16);directory.writeUInt32LE(data.length,20);directory.writeUInt32LE(data.length,24);directory.writeUInt16LE(name.length,28);directory.writeUInt32LE(offset,42);central.push(directory,name);offset+=header.length+name.length+data.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,directory,end]);
}
const modules=new Map();
function load(file){
  if(modules.has(file))return modules.get(file).exports;
  const module={exports:{}};modules.set(file,module);
  const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const imported=name=>{
    if(name==='server-only')return {};
    if(name==='node:dns/promises')return {lookup:async()=>[{address:'93.184.216.34',family:4}]};
    if(name==='@/lib/human-rights')return {fetchLegalResourceBySlug:async()=>item};
    if(name.startsWith('@/lib/'))return load(name.slice(2)+'.ts');
    return require(name);
  };
  const mockFetch=async url=>{fetches++;const response=new Response(responseBytes,{status:200,headers:{'Content-Type':responseType}});Object.defineProperty(response,'url',{value:String(url)});return response;};
  new Function('require','module','exports','fetch',code)(imported,module,module.exports,mockFetch);
  return module.exports;
}
async function main(){
  const documents=load('lib/legal-document-source.ts');
  responseBytes=docxFixture();
  item={slug:'current-law',title:'Current law',pdfUrl:docxUrl,downloadableUrl:docxUrl,officialSourceUrl:'https://documents.gov.rs/law'};
  const source=await documents.resolveLegalDocumentSource(item);assert.equal(source.kind,'docx');assert.equal(source.source,'pdfFile');
  const docx=await documents.fetchLegalDocx(source.url);assert.deepEqual(Buffer.from(docx.bytes),responseBytes);
  assert.equal(documents.sanitizeLegalDocxFilename('Zakon đ / test.docx'),'zakon-d-test.docx');
  const {GET}=load('app/api/legal-resource-download/route.ts');
  const response=await GET(new Request('https://avangarda.media/api/legal-resource-download?slug=current-law&locale=ar&mode=inline'));
  assert.equal(response.status,200);assert.match(response.headers.get('Content-Type'),/wordprocessingml/);assert.match(response.headers.get('Content-Disposition'),/^attachment;.*current-law\.docx/);assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),responseBytes);
  responseBytes=Buffer.from('PK\u0003\u0004generic zip');await assert.rejects(documents.fetchLegalDocx(docxUrl),/INVALID_DOCX_SIGNATURE/);
  responseBytes=Buffer.concat([docxFixture(),Buffer.from('word/vbaProject.bin')]);await assert.rejects(documents.fetchLegalDocx(docxUrl),/INVALID_DOCX_SIGNATURE/);
  const before=fetches;await assert.rejects(documents.fetchLegalDocx('https://127.0.0.1/law.docx'),/UNSAFE_DOCUMENT_IP/);assert.equal(fetches,before);
  responseBytes=Buffer.from('%PDF-1.7\nExisting PDF fixture');responseType='application/pdf';item={...item,pdfUrl:'https://documents.gov.rs/law.pdf',downloadableUrl:''};
  assert.equal((await documents.resolveLegalDocumentSource(item)).kind,'pdf');
  const pdfResponse=await GET(new Request('https://avangarda.media/api/legal-resource-download?slug=current-law&mode=inline'));
  assert.equal(pdfResponse.status,200);assert.equal(pdfResponse.headers.get('Content-Type'),'application/pdf');assert.match(pdfResponse.headers.get('Content-Disposition'),/^inline;.*current-law\.pdf/);
  item=null;assert.equal((await GET(new Request('https://avangarda.media/api/legal-resource-download?slug=missing-law'))).status,404);
  if(process.argv[2]){responseBytes=fs.readFileSync(path.resolve(process.argv[2]));responseType='application/octet-stream';assert.equal((await documents.fetchLegalDocx(docxUrl)).bytes.length,responseBytes.length);}
  console.log('PASS legal documents: existing PDF inline/download, DOCX attachment and filename, actual OOXML signatures, generic ZIP/macro/private-IP rejection, missing resource.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
