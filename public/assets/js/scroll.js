(() => {
 'use strict';
 if(window.AppScroll)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(hover: hover) and (pointer: fine)');
 let instance=null,lockedY=null;
 const hasDialog=()=>!!document.querySelector('dialog[open]');
 const sync=()=>{
  const enabled=!!window.Lenis&&desktop.matches&&!reduce.matches;
  if(!enabled&&instance){instance.destroy();instance=null;}
  if(enabled&&!instance){
   instance=new Lenis({autoRaf:true,smoothWheel:true,syncTouch:false,lerp:.16,
    prevent:node=>!!node.closest('dialog,[data-lenis-prevent],input,textarea,select,[contenteditable="true"]'),
    virtualScroll:({event})=>!hasDialog()&&!document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')&&Math.abs(event.deltaX)<=Math.abs(event.deltaY)
   });
  }
  if(hasDialog())instance?.stop();
 };
 const scrollTo=y=>instance?instance.scrollTo(y,{immediate:true,force:true}):window.scrollTo({top:y,behavior:'instant'});
 window.AppScroll={scrollTo,get instance(){return instance;},get locked(){return lockedY!==null;}};
 sync();reduce.addEventListener('change',sync);desktop.addEventListener('change',sync);
 // Base UI owns dialog overflow locking and focus. These events synchronize Lenis.
 document.addEventListener('ui:open',()=>{if(lockedY===null)lockedY=scrollY;instance?.stop();});
 const unlock=()=>requestAnimationFrame(()=>{if(hasDialog())return;if(lockedY!==null){const y=lockedY;lockedY=null;instance?.start();scrollTo(y);}});
 document.addEventListener('ui:close',unlock);
 document.addEventListener('close',unlock,true);
 // Native calendars also use dialog but do not always dispatch ui:open.
 const dialogs=new MutationObserver(()=>{if(hasDialog()){if(lockedY===null)lockedY=scrollY;instance?.stop();}else unlock();});
 dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('pagehide',()=>{instance?.destroy();instance=null;});
 window.addEventListener('pageshow',sync);
})();
