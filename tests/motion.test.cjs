const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const motion=fs.readFileSync('public/assets/js/motion.js','utf8');
const sliders=fs.readFileSync('public/assets/js/sliders.js','utf8');

test('reduced motion never initializes AOS or starts a content animation',()=>{
 let init=0,animate=0;
 const c={matchMedia:()=>({matches:true,addEventListener(){}}),document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},window:{AOS:{init(){init++;}}}};
 vm.createContext(c);vm.runInContext(motion,c);c.window.AppMotion.enter({animate(){animate++;}});
 assert.equal(init,0);assert.equal(animate,0);
});
test('AOS initialization failure removes every hiding hook',()=>{
 const removed=[];const element={dataset:{},removeAttribute(name){removed.push(name);},classList:{remove(...names){removed.push(...names);}}};
 const aos={init(){throw new Error('load failed');}};
 const c={matchMedia:()=>({matches:false,addEventListener(){}}),document:{querySelector:()=>null,querySelectorAll:()=>[element],addEventListener(){}},window:{AOS:aos},AOS:aos};
 vm.createContext(c);vm.runInContext(motion,c);
 assert.deepEqual(removed,['data-aos','aos-init','aos-animate']);
});
test('AOS refreshes after Swiper and font layout settle',async()=>{
 let refreshes=0;const events={};
 const el={dataset:{},classList:{remove(){}},removeAttribute(){}};
 const aos={init(){},refresh(){refreshes++;}};
 const c={matchMedia:()=>({matches:false,addEventListener(){}}),AOS:aos,
  document:{querySelector:()=>null,querySelectorAll:()=>[el],addEventListener(){},fonts:{ready:Promise.resolve()}},
  window:{AOS:aos,requestAnimationFrame(fn){fn();},addEventListener(name,fn){events[name]=fn;}}};
 vm.runInNewContext(motion,c);await Promise.resolve();assert.equal(refreshes,1);
 events.load();assert.equal(refreshes,2);
});
function sliderContext(kind,count){
 const instances=[],navigation=[];const reduce={matches:true,addEventListener(_,handler){this.change=handler;}};
 const slides=Array.from({length:count},(_,i)=>({dataset:{weekUrl:'/journal?date=2026-10-'+(14+i*7)}}));
 const viewport={clientWidth:373,querySelectorAll:()=>slides};
 const root={dataset:{carousel:kind},querySelector:selector=>selector==='[data-carousel-window]'?viewport:null,addEventListener(){}};
 class Swiper{constructor(el,options){this.activeIndex=options.initialSlide||0;this.params=options;this.on=()=>{};el.swiper=this;instances.push(this);}}
 const section={gutter:16};
 const c={Swiper,getComputedStyle:el=>({paddingLeft:String(el?.gutter||16),getPropertyValue:name=>name==='--space-8'?'8px':'16px'}),matchMedia:()=>reduce,document:{querySelector:()=>section,querySelectorAll:selector=>selector==='[data-carousel]'?[root]:[],addEventListener(){}},window:{Swiper,AppNavigation:{go(url){navigation.push(url);return true;}}},location:{assign(){throw new Error('double navigation');}}};
 vm.createContext(c);vm.runInContext(sliders,c);return{c,instances,reduce,navigation,viewport,section};
}
test('single gallery remains static and repeated init does not create another slider',()=>{
 assert.equal(sliderContext('gallery',1).instances.length,0);
 const h=sliderContext('gallery',2);vm.runInContext(sliders,h.c);assert.equal(h.instances.length,1);
});
test('reduced motion disables slider transitions; week swipe navigates exactly once',()=>{
 const h=sliderContext('week',3),swiper=h.instances[0];
 assert.equal(swiper.params.speed,0);assert.equal(swiper.params.loop,false);assert.equal(swiper.params.autoplay,false);
 swiper.activeIndex=2;swiper.params.on.slideChangeTransitionEnd(swiper);assert.deepEqual(h.navigation,['/journal?date=2026-10-28']);
 h.reduce.matches=false;h.reduce.change();assert.equal(swiper.params.speed,200);
});

test('gallery fills the viewport while other sliders retain their token gutters after resize',()=>{
 for(const kind of ['banner','recommendations','gallery','week']){
  const h=sliderContext(kind,3),swiper=h.instances[0];
  for(const [width,gutter] of [[373,16],[538,24],[343,16]]){
   h.viewport.clientWidth=width;h.section.gutter=gutter;
   swiper.params.on.beforeResize(swiper);
   const p=swiper.params;
   assert.equal(p.slidesPerView,1,'Swiper 12 already subtracts edge offsets');
   const expectedGutter=kind==='gallery'?0:gutter;
   assert.equal(p.slidesOffsetBefore,expectedGutter);assert.equal(p.slidesOffsetAfter,expectedGutter);
   if(kind==='gallery'){
    assert.equal(p.spaceBetween,0);
    assert.equal(width-p.slidesOffsetBefore-p.slidesOffsetAfter,width);
   }
   assert.equal(h.navigation.length,0,'Resize must not navigate');
  }
 }
});
