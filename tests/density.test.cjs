const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('public/assets/js/ds.js','utf8');
const offset = source.slice(source.indexOf('  function keyboardOffset() {'),source.indexOf('  keyboardOffset();'));
function viewport({height=844,top=0,tag='BODY',width=390}={}) {
 const values={}, local={};
 const root={dataset:{},style:{setProperty:(k,v)=>values[k]=v}};
 const cta={style:{setProperty:(k,v)=>local[k]=v},hasAttribute:()=>true,contains:()=>false};
 const document={documentElement:root,activeElement:{tagName:tag}};
 const window={innerHeight:844,innerWidth:width,visualViewport:{height,width,offsetTop:top}};
 const context={window,document,$:()=>({getBoundingClientRect:()=>({width:Math.min(width,450)})}),$$:()=>[cta]};
 vm.runInNewContext(offset+'keyboardOffset();',context);
 return {root,values,local};
}
test('focused mobile input hides global navigation and raises the task CTA',()=>{
 const r=viewport({height:500,tag:'TEXTAREA'});
 assert.equal(r.root.dataset.keyboardOpen,'true');
 assert.equal(r.local['--keyboard-offset'],'344px');
 assert.equal(r.values['--app-frame-width'],'390px');
});
test('keyboard dismissal restores navigation and the original CTA position',()=>{
 const r=viewport({height:844,tag:'BODY'});
 assert.equal(r.root.dataset.keyboardOpen,'false');
 assert.equal(r.local['--keyboard-offset'],'0px');
});
test('viewport toolbar changes do not hide navigation and desktop CTA stays in the app frame',()=>{
 const r=viewport({height:800,width:1440,tag:'INPUT'});
 assert.equal(r.root.dataset.keyboardOpen,'false');
 assert.equal(r.values['--app-frame-width'],'450px');
});
