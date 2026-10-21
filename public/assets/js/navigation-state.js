(() => {
 'use strict';
 if(window.AppNavigation)return;
 const prefix='jubutech.navigation.';
 const read=key=>{try{return JSON.parse(sessionStorage.getItem(prefix+key));}catch{return null;}};
 const write=(key,value)=>{try{sessionStorage.setItem(prefix+key,JSON.stringify(value));}catch{}};
 const url=location.pathname+location.search;
 const pending=read('pending');
 const submitted=read('formContext');
 let state=history.state?.appNavigation;
 if(!state){state={key:pending?.url===url&&pending.key?pending.key:crypto.randomUUID(),url,from:pending?.url===url?pending.from:submitted?.url===url?submitted.from:null};history.replaceState({...history.state,appNavigation:state},'');}
 write('formContext',null);
 const save=()=>write(state.key,{url,y:scrollY,from:state.from,time:Date.now()});
 const prepare=(target,restore=false,back=false)=>{
  const next=new URL(target,location.href);if(next.origin!==location.origin)return;
  save();const ancestor=back&&state.from?read(state.from.key):null;write('pending',{url:next.pathname+next.search,from:back?ancestor?.from||null:{key:state.key,url},key:back?state.from?.key:null,y:back?ancestor?.y||0:restore?scrollY:null});
 };
 const go=(target,{restore=false,back=false}={})=>{prepare(target,restore,back);location.assign(target);return true;};
 window.AppNavigation={go,save};
 const back=document.querySelector('[data-app-back]');
 const safeFrom=state.from&&/^\/(finance|journal|campaigns|applications|community|mypage|notices|inquiries|rewards|search|notifications)([/?]|$)/.test(state.from.url);
 if(back&&safeFrom){
  back.href=state.from.url;
  // Follow the known parent URL even after a POST redirect. The pending entry
  // restores its earlier position and parent instead of creating a back-link loop.
 }
 document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link||e.defaultPrevented||link.target||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;prepare(link.href,location.pathname==='/journal'&&new URL(link.href).pathname==='/journal',link.hasAttribute('data-app-back'));});
 document.addEventListener('submit',event=>{if(event.defaultPrevented)return;save();if(event.target.method.toLowerCase()==='post')write('formContext',{url,from:state.from});});
 window.addEventListener('pagehide',save);
 window.addEventListener('pageshow',event=>{
  const nav=performance.getEntriesByType('navigation')[0]?.type;
  const previous=read(state.key);
  const y=event.persisted||nav==='back_forward'||nav==='reload'?previous?.y:pending?.url===url?pending.y:null;
  if(y!=null)requestAnimationFrame(()=>window.AppScroll?.scrollTo(y));
  write('pending',null);
  // POST submitters must be usable again after browser back/forward cache restores.
  document.querySelectorAll('button[aria-busy="true"]').forEach(button=>{button.disabled=false;button.removeAttribute('aria-busy');});
 });
 // Cap history-only metadata; form values and financial records are never stored here.
 try{Object.keys(sessionStorage).filter(k=>k.startsWith(prefix)&&k!==prefix+'pending').map(k=>[k,JSON.parse(sessionStorage.getItem(k))]).sort((a,b)=>(b[1]?.time||0)-(a[1]?.time||0)).slice(60).forEach(([k])=>sessionStorage.removeItem(k));}catch{}
})();
