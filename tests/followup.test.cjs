const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ds=fs.readFileSync('public/assets/js/ds.js','utf8');
const shareSource=ds.slice(ds.indexOf('UI.shareLink ='),ds.indexOf('\nglobal.UI=UI;'));
function shareHarness(navigator, fastTimeout=false){
 const elements=new Map();
 function element(){return {listeners:{},value:'',textContent:'',setAttribute(){},addEventListener(event,fn){this.listeners[event]=fn;},focus(){this.focused=true;},select(){this.selected=true;}};}
 const input=element(),status=element(),copy=element();
 const dialog={...element(),querySelector:selector=>selector==='input'?input:selector==='[data-share-status]'?status:copy};
 const document={title:'공유 테스트',getElementById:id=>elements.get(id),createElement:()=>dialog,body:{append:node=>elements.set(node.id,node)}};
 const UI={openDialog(node){node.open=true;}};
 vm.runInNewContext(shareSource,{UI,navigator,document,setTimeout:fastTimeout?(fn=>setTimeout(fn,0)):setTimeout,clearTimeout,location:{href:'http://localhost/example'}});
 return {UI,input,status,copy,dialog,elements};
}
test('native sharing completes without an unnecessary clipboard write',async()=>{
 let writes=0;const h=shareHarness({share:async()=>{},clipboard:{writeText:async()=>writes++}});
 assert.equal(await h.UI.shareLink(),'shared');assert.equal(writes,0);assert.equal(h.elements.size,0);
});
test('native chooser cancellation remains cancelled, not copied',async()=>{
 const h=shareHarness({share:async()=>{throw Object.assign(new Error(),{name:'AbortError'});}});
 assert.equal(await h.UI.shareLink(),'cancelled');assert.equal(h.elements.size,0);
});
test('failed native sharing falls back to clipboard success',async()=>{
 let copied;const h=shareHarness({share:async()=>{throw new Error();},clipboard:{writeText:async value=>copied=value}});
 assert.equal(await h.UI.shareLink({url:'https://example.com/a'}),'copied');assert.equal(copied,'https://example.com/a');
});
test('clipboard denial exposes selectable URL and never reports success',async()=>{
 const h=shareHarness({clipboard:{writeText:async()=>{throw new Error('denied');}}});
 assert.equal(await h.UI.shareLink({url:'https://example.com/a'}),'displayed');
 assert.equal(h.input.value,'https://example.com/a');assert.equal(h.input.selected,true);assert.equal(h.input.focused,true);
 await h.copy.listeners.click();assert.match(h.status.textContent,/직접 복사/);assert.doesNotMatch(h.status.textContent,/복사했어요/);
 await h.UI.shareLink({url:'https://example.com/b'});assert.equal(h.elements.size,1);assert.equal(h.input.value,'https://example.com/b');
});
test('an unresponsive native share exposes the URL without an unsolicited clipboard write',async()=>{
 let writes=0;const h=shareHarness({share:()=>new Promise(()=>{}),clipboard:{writeText:async()=>writes++}},true);
 assert.equal(await h.UI.shareLink(),'displayed');assert.equal(writes,0);assert.equal(h.input.selected,true);assert.match(h.status.textContent,/응답이 늦어/);
});
test('an unresponsive clipboard offers manual selection without a false success',async()=>{
 const h=shareHarness({clipboard:{writeText:()=>new Promise(()=>{})}},true);
 assert.equal(await h.UI.shareLink(),'displayed');await h.copy.listeners.click();assert.match(h.status.textContent,/직접 복사/);
});
const navSource=fs.readFileSync('public/assets/js/navigation-state.js','utf8');
function navigation(url,storage,historyState=null){
 const events={},winEvents={},targets=[],scrolls=[];
 const location=new URL('http://localhost'+url);location.assign=target=>targets.push(target);
 const sessionStorage={getItem:key=>storage[key]||null,setItem:(key,v)=>storage[key]=v,removeItem:key=>delete storage[key]};
 const back={href:'/applications',hasAttribute:name=>name==='data-app-back'};
 const history={state:historyState,replaceState(state){this.state=state;}};
 const window={addEventListener:(name,fn)=>winEvents[name]=fn,AppScroll:{scrollTo:y=>scrolls.push(y)}};
 const document={querySelector:selector=>selector==='[data-app-back]'?back:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn};
 const context={window,document,history,location,sessionStorage,scrollY:260,crypto:{randomUUID:()=>url},URL,Date,performance:{getEntriesByType:()=>[{type:'navigate'}]},requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(navSource,context);return {context,events,winEvents,targets,back,history,scrolls};
}
test('POST validation and app back preserve detail parent and list scroll without a loop',()=>{
 const storage={};let list=navigation('/applications?status=selected',storage);
 list.context.window.AppNavigation.go('/applications/a1');
 let detail=navigation('/applications/a1',storage);detail.context.window.AppNavigation.go('/applications/a1/review');
 let edit=navigation('/applications/a1/review',storage);edit.winEvents.pageshow({persisted:false});edit.events.submit({defaultPrevented:false,target:{method:'post'}});
 let failed=navigation('/applications/a1/review',storage);assert.equal(failed.back.href,'/applications/a1');
 failed.context.window.AppNavigation.go('/applications/a1',{back:true});
 let returned=navigation('/applications/a1',storage);assert.equal(returned.back.href,'/applications?status=selected');
 returned.context.window.AppNavigation.go('/applications?status=selected',{back:true});
 let restored=navigation('/applications?status=selected',storage);restored.winEvents.pageshow({persisted:false});assert.deepEqual(restored.scrolls,[260]);
 assert.equal(restored.history.state.appNavigation.from,null);
});
test('prevented dirty navigation does not overwrite the pending return context',()=>{
 const storage={};const h=navigation('/journal/entries/new',storage);
 h.events.click({target:{closest:()=>h.back},defaultPrevented:true});assert.equal(storage['jubutech.navigation.pending'],undefined);
});
