const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('public/assets/js/banner-slider.js','utf8');
function setup(count=2){
 const handlers={},attrs={},current={},page={setAttribute(k,v){attrs[k]=v;}},links=[];
 const slides=Array.from({length:count>1?6:1},(_,i)=>({dataset:{bannerIndex:String(i%count)},setAttribute(){},querySelector(){return {click(){links.push(i%count);}};}}));
 const viewport={dataset:{}};
 const root={dataset:{slideCount:String(count)},querySelector(s){return s==='[data-banner-window]'?viewport:s==='[data-banner-current]'?current:page;},addEventListener(k,fn){handlers[k]=fn;},focus(){}};
 const motion={matches:false,addEventListener(_,fn){this.change=fn;}};
 const instances=[];
 class Swiper{constructor(el,params){this.slides=slides;this.activeIndex=0;this.params=params;this.allowClick=true;el.swiper=this;instances.push(this);params.on.init(this);}update(){}slideNext(){this.activeIndex=(this.activeIndex+1)%slides.length;this.params.on.slideChangeTransitionEnd(this);}slidePrev(){this.activeIndex=(this.activeIndex+slides.length-1)%slides.length;this.params.on.slideChangeTransitionEnd(this);}slideToLoop(i){this.activeIndex=i;this.params.on.slideChangeTransitionEnd(this);}}
 const UI={};const context={Swiper,matchMedia:()=>motion,window:{Swiper,UI},UI,document:{querySelectorAll:()=>[root],fonts:{ready:Promise.resolve()}}};
 vm.runInNewContext(source,context);return {root,current,attrs,viewport,handlers,slides,instances,motion,UI,links};
}
test('banner numbers describe the real records, including the repeated loop slides',()=>{
 const h=setup(),s=h.instances[0];assert.equal(h.current.textContent,'1');s.activeIndex=5;s.params.on.loopFix(s);
 assert.equal(h.current.textContent,'2');assert.equal(h.attrs['aria-label'],'2 / 2 배너');assert.equal(h.slides.filter(s=>!s.inert).length,1);
});
test('banner keyboard navigation wraps, Home/End use real indices, Enter opens once',()=>{
 const h=setup();const key=k=>h.handlers.keydown({key:k,target:{matches:()=>false,closest:()=>null},preventDefault(){}});
 key('End');assert.equal(h.current.textContent,'2');key('ArrowRight');assert.equal(h.current.textContent,'1');key('Home');key('Enter');assert.deepEqual(h.links,[0]);
});
test('single and repeated initialization stay static or reuse the existing instance',()=>{
 assert.equal(setup(1).instances.length,0);const h=setup();h.UI.BannerSlider.init(h.root);assert.equal(h.instances.length,1);
 assert.equal(h.instances[0].params.autoplay,false);assert.equal(h.instances[0].params.centeredSlides,true);assert.equal(h.instances[0].params.slidesPerView,'auto');
});
test('reduced motion changes live instances and drag release cannot open a card',()=>{
 const h=setup(),s=h.instances[0];h.motion.matches=true;h.motion.change();assert.equal(s.params.speed,0);
 let prevented=0,stopped=0;s.allowClick=false;h.handlers.click({preventDefault(){prevented++;},stopImmediatePropagation(){stopped++;}});assert.equal(prevented,1);assert.equal(stopped,1);
});
