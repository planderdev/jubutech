(() => {
 'use strict';
 const root=document.querySelector('[data-campaign-detail]');
 const nav=root?.querySelector('[data-campaign-nav]');
 if(!nav)return;
 const links=Array.from(nav.querySelectorAll('a[href^="#"]'));
 const sections=links.map(link=>root.querySelector(link.hash));
 const gutter=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--space-16'))||16;
 let pending=false;
 let requested=null;
 const update=()=>{
  pending=false;
  const edge=nav.getBoundingClientRect().bottom+gutter()+1;
  let current=0;
  sections.forEach((section,index)=>{if(section&&section.getBoundingClientRect().top<=edge)current=index;});
  const page=document.scrollingElement;
  if(page&&scrollY+innerHeight>=page.scrollHeight-1)current=sections.length-1;
  if(requested&&Math.abs(scrollY-requested.top)<=1)current=requested.index;
  else requested=null;
  links.forEach((link,index)=>{
   if(index===current)link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
 };
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
 nav.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(!link||!nav.contains(link)||event.defaultPrevented||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const section=sections[links.indexOf(link)];
  if(!section)return;
  event.preventDefault();
  const offset=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
  const navStart=root.querySelector('.campaign-detail-summary').getBoundingClientRect().bottom+scrollY;
  const headerHeight=document.querySelector('.app-header')?.getBoundingClientRect().height||0;
  const top=Math.max(0,navStart-headerHeight,section.getBoundingClientRect().top+scrollY-offset);
  requested={index:links.indexOf(link),top:Math.max(0,Math.min(top,document.scrollingElement.scrollHeight-innerHeight))};
  if(window.AppScroll)window.AppScroll.scrollTo(top);
  else window.scrollTo({top,behavior:'instant'});
  history.replaceState(history.state,'',link.hash);
  section.focus({preventScroll:true});
  schedule();
 });
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',()=>{requested=null;schedule();});
 window.addEventListener('pageshow',schedule);
 document.fonts?.ready.then(schedule);
 update();

 const product=root.querySelector('[data-campaign-product]');
 const productToggle=product?.querySelector('[data-product-toggle]');
 if(productToggle){
  const label=product.querySelector('[data-product-toggle-label]');
  product.dataset.productCollapsed='true';
  product.querySelector('[data-product-toggle-area]').hidden=false;
  productToggle.addEventListener('click',()=>{
   const expand=product.dataset.productCollapsed==='true';
   product.dataset.productCollapsed=String(!expand);
   productToggle.setAttribute('aria-expanded',String(expand));
   label.textContent=expand?'상품정보 접기':'상품정보 펼쳐보기';
   if(!expand&&product.getBoundingClientRect().top<0){
    const offset=parseFloat(getComputedStyle(product).scrollMarginTop)||0;
    const top=Math.max(0,product.getBoundingClientRect().top+scrollY-offset);
    if(window.AppScroll)window.AppScroll.scrollTo(top);
    else window.scrollTo({top,behavior:'instant'});
   }
   schedule();
  });
 }

 const recommendations=document.querySelector('[data-campaign-recommendations]');
 if(!recommendations)return;
 const grid=recommendations.querySelector('[data-recommendation-grid]');
 const more=recommendations.querySelector('[data-recommendation-more]');
 const status=recommendations.querySelector('[data-recommendation-status]');
 const sentinel=recommendations.querySelector('[data-recommendation-sentinel]');
 if(!grid||!more||!status||!sentinel)return;
 let next=recommendations.dataset.next;
 let loading=false;
 let observer;
 const seen=new Set(Array.from(grid.querySelectorAll('[data-recommendation-id]'),item=>item.dataset.recommendationId));
 const loadRecommendations=async(manual=false)=>{
  if(loading||!next)return;
  loading=true;
  grid.setAttribute('aria-busy','true');
  more.setAttribute('aria-disabled','true');
  more.textContent='상품을 불러오는 중이에요';
  status.textContent='다른 상품을 불러오고 있어요.';
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(next,{headers:{Accept:'application/json'},credentials:'same-origin',signal:controller.signal});
   if(!response.ok)throw new Error('recommendations');
   const page=await response.json();
   if(typeof page.html!=='string'||!(page.next===null||typeof page.next==='string')||!(page.page===null||typeof page.page==='string'))throw new Error('response');
   const template=document.createElement('template');
   template.innerHTML=page.html;
   const cards=Array.from(template.content.children).filter(item=>item.matches('[data-recommendation-id]')&&!seen.has(item.dataset.recommendationId));
   if(!cards.length&&page.next)throw new Error('empty page');
   cards.forEach(item=>seen.add(item.dataset.recommendationId));
   grid.append(...cards);
   next=page.next;
   recommendations.dataset.next=next||'';
   more.hidden=!next;
   if(page.page)more.href=page.page;
   more.textContent='상품 더 보기';
   status.textContent=next?`${seen.size}개의 상품을 확인했어요. 아래로 내리면 더 보여드려요.`:'추천 상품을 모두 확인했어요.';
   if(manual)cards[0]?.querySelector('a')?.focus({preventScroll:true});
   if(next)observer?.observe(sentinel);
   else observer?.disconnect();
  }catch{
   status.textContent='상품을 불러오지 못했어요. 다시 시도해 주세요.';
   more.textContent='다시 불러오기';
   observer?.disconnect();
  }finally{
   clearTimeout(timeout);
   loading=false;
   grid.setAttribute('aria-busy','false');
   more.removeAttribute('aria-disabled');
  }
 };
 more.addEventListener('click',event=>{
  if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  loadRecommendations(true);
 });
 if('IntersectionObserver' in window){
  observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){
    observer.unobserve(sentinel);
    loadRecommendations();
   }
  },{rootMargin:'320px 0px'});
  observer.observe(sentinel);
 }
})();
