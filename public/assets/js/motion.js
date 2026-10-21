(() => {
 'use strict';
 if(window.AppMotion)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=new WeakMap();
 const enter=element=>{
  if(!element||reduce.matches)return;
  animations.get(element)?.cancel();
  const token=getComputedStyle(document.documentElement).getPropertyValue('--duration-normal').trim();
  const duration=token.endsWith('ms')?parseFloat(token):parseFloat(token)*1000;
  animations.set(element,element.animate([{opacity:.55,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:duration||200,easing:'ease-out'}));
 };
 window.AppMotion={enter,reduced:()=>reduce.matches};
 const dayContent=document.querySelector('[data-day-content]');
 if(dayContent)enter(dayContent);
 const reveal=Array.from(document.querySelectorAll('[data-reveal]'));
 const showAll=()=>reveal.forEach(el=>{el.removeAttribute('data-aos');el.classList.remove('aos-init','aos-animate');});
 if(window.AOS&&!reduce.matches&&reveal.length){
  try{
   reveal.forEach(el=>el.dataset.aos='app-reveal');
   AOS.init({duration:300,offset:24,delay:0,once:true,mirror:false,disableMutationObserver:true});
   // Swiper and fonts can shrink the preceding banner after AOS measures it.
   // Refresh positions after layout settles so visible recommendations never
   // stay hidden behind a stale, pre-slider trigger position.
   const refresh=()=>window.requestAnimationFrame?.(()=>AOS.refresh?.());
   window.addEventListener?.('load',refresh,{once:true});
   document.fonts?.ready.then(refresh);
  }catch{showAll();}
 }
 reduce.addEventListener('change',()=>{if(reduce.matches)showAll();});
 document.addEventListener('change',event=>{
  // Base UI provides the selected control state; animate only its page wrapper.
  const row=event.target.closest('.check-row');
  if(row&&event.target.matches('input[type="radio"]'))enter(row);
 });
 document.addEventListener('ui:open',event=>{
  if(reduce.matches)event.target.getAnimations().forEach(animation=>animation.cancel());
 });
})();
