const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('public/assets/js/ds.js','utf8');
const setup=source.slice(source.indexOf('function contentTables(root)'),source.indexOf('\nregisterInitializer(contentTables);'));
function harness({existing=false,label=''}={}){
 const attrs={};if(label)attrs['aria-label']=label;
 const region={className:existing?'table-wrap':'post',classList:{contains:name=>existing&&name==='table-wrap'},setAttribute:(n,v)=>attrs[n]=v,hasAttribute:n=>n in attrs,append(table){this.child=table;table.parentElement=this;this.classList={contains:n=>n==='table-wrap'};}};
 const table={parentElement:region,caption:{textContent:'  요일별 계획  '},before(node){this.created=node;}};
 const document={createElement:()=>region};
 const c={document,$$:()=>[table]};vm.createContext(c);vm.runInContext(setup,c);
 return {c,table,region,attrs};
}
test('content tables retain the table node in one named keyboard scroll region',()=>{
 const h=harness();h.c.contentTables({});assert.equal(h.region.child,h.table);
 assert.equal(h.region.tabIndex,0);assert.equal(h.attrs.role,'region');assert.equal(h.attrs['aria-label'],'요일별 계획');
 const wrapper=h.table.parentElement;h.c.contentTables({});assert.equal(h.table.parentElement,wrapper);
});
test('existing table region and accessible label are preserved',()=>{
 const h=harness({existing:true,label:'준비 항목 비교'});h.c.contentTables({});
 assert.equal(h.table.created,undefined);assert.equal(h.attrs['aria-label'],'준비 항목 비교');assert.equal(h.region.tabIndex,0);
});
