const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('public/assets/js/scroll.js','utf8');
function setup({reduced=false,desktop=true,library=true}={}){
 const events={},windowEvents={},created=[],native=[];
 const reduce={matches:reduced,addEventListener(_,cb){this.change=cb;}};
 const mouse={matches:desktop,addEventListener(_,cb){this.change=cb;}};
 let open=false,observer;
 const context={scrollY:417,requestAnimationFrame:cb=>cb(),matchMedia:q=>q.includes('reduced')?reduce:mouse,
  document:{body:{},activeElement:null,querySelector:()=>open?{}:null,addEventListener:(name,cb)=>events[name]=cb},
  MutationObserver:class{constructor(cb){observer=cb;}observe(){}},
  window:{addEventListener:(name,cb)=>windowEvents[name]=cb,scrollTo:options=>native.push(options.top)},
 };
 if(library){context.Lenis=class{constructor(options){this.options=options;this.stopped=false;this.destroyed=false;this.targets=[];created.push(this);}destroy(){this.destroyed=true;}stop(){this.stopped=true;}start(){this.stopped=false;}scrollTo(y){this.targets.push(y);}};context.window.Lenis=context.Lenis;}
 vm.createContext(context);vm.runInContext(source,context);
 return {context,events,windowEvents,created,native,reduce,mouse,setOpen(value){open=value;observer();}};
}
test('mobile, reduced motion and library failure retain native scroll',()=>{
 for(const options of [{desktop:false},{reduced:true},{library:false}]){const h=setup(options);assert.equal(h.created.length,0);h.context.window.AppScroll.scrollTo(88);assert.deepEqual(h.native,[88]);}
});
test('one auto RAF instance survives repeated init/pageshow and destroys on pagehide',()=>{
 const h=setup();vm.runInContext(source,h.context);h.windowEvents.pageshow();h.windowEvents.pageshow();assert.equal(h.created.length,1);assert.equal(h.created[0].options.autoRaf,true);assert.equal(h.created[0].options.syncTouch,false);h.windowEvents.pagehide();assert.equal(h.created[0].destroyed,true);h.windowEvents.pageshow();assert.equal(h.created.length,2);
});
test('nested dialogs stay locked and final close restores the original position',()=>{
 const h=setup();h.setOpen(true);h.events['ui:open']();h.context.scrollY=99;h.events['ui:close']();assert.equal(h.created[0].stopped,true);h.setOpen(false);assert.equal(h.created[0].stopped,false);assert.deepEqual(h.created[0].targets,[417]);
});
test('reduced motion changes destroy and recreate without duplicate instances',()=>{
 const h=setup();h.reduce.matches=true;h.reduce.change();assert.equal(h.created[0].destroyed,true);assert.equal(h.context.window.AppScroll.instance,null);h.reduce.matches=false;h.reduce.change();h.reduce.change();assert.equal(h.created.length,2);
});
test('horizontal wheel and focused input bypass Lenis',()=>{
 const h=setup(),allow=h.created[0].options.virtualScroll;assert.equal(allow({event:{deltaX:80,deltaY:10}}),false);assert.equal(allow({event:{deltaX:0,deltaY:100}}),true);h.context.document.activeElement={matches:()=>true};assert.equal(allow({event:{deltaX:0,deltaY:100}}),false);
});
