(() => {
 'use strict';
 const qs=(s,c=document)=>c.querySelector(s), all=(s,c=document)=>Array.from(c.querySelectorAll(s));
 all('[data-journal-day]').forEach(button=>button.addEventListener('click',()=>{window.AppNavigation.go('/journal?date='+encodeURIComponent(button.dataset.journalDay),{restore:true});}));
 let dirty=false, bypass=false, pendingForm=null, pendingSubmitter=null, nextUrl='',nextBack=false;
 const toast=(text)=>window.AppFeedback.show(text);
 const form=qs('[data-dirty-form]');
 if(form){form.addEventListener('input',()=>dirty=true);form.addEventListener('change',()=>dirty=true);}
 const header=qs('[data-app-header]');
 const updateHeader=()=>{if(header)header.dataset.scrolled=String(window.scrollY>8);};
 updateHeader();window.addEventListener('scroll',updateHeader,{passive:true});
 const mode=document.body.dataset.mode;
 try {
  const last=localStorage.getItem('jubutech.mode');
  if(document.body.dataset.entry==='true'&&['journal','campaigns'].includes(last)){location.replace('/'+last);return;}
  const explicitMode=new URLSearchParams(location.search).get('mode');
  const servicePath=/^\/(finance|journal|campaigns|applications|community)(\/|$)/.test(location.pathname);
  if(mode&&!servicePath&&location.pathname!=='/'&&!['finance','journal','campaigns'].includes(explicitMode)&&['finance','journal','campaigns'].includes(last)&&last!==mode){const url=new URL(location.href);url.searchParams.set('mode',last);location.replace(url.href);return;}
  if(mode)localStorage.setItem('jubutech.mode',mode);
 } catch{}
 const navigate=url=>{bypass=true;if(window.AppNavigation)window.AppNavigation.go(url,{back:nextBack});else location.href=url;};
 document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){close.closest('dialog')?.close();return;}
  const open=e.target.closest('[data-open]');if(open){open.setAttribute('aria-expanded','true');const d=document.getElementById(open.dataset.open);d?.addEventListener('close',()=>open.setAttribute('aria-expanded','false'),{once:true});return;}
  const link=e.target.closest('a[href]');if(link&&dirty&&!bypass&&!link.target&&!e.metaKey&&!e.ctrlKey){e.preventDefault();nextUrl=link.href;nextBack=link.hasAttribute('data-app-back');all('dialog[open]').forEach(dialog=>dialog.close());UI.openDialog('leave-dialog');}
 });
 qs('#leave-proceed')?.addEventListener('click',()=>navigate(nextUrl));
 window.addEventListener('beforeunload',e=>{if(dirty&&!bypass){e.preventDefault();e.returnValue='';}});
 document.addEventListener('submit',e=>{
  const f=e.target;
  if(f.matches('[data-app-confirm]')&&!f.dataset.confirmed){e.preventDefault();pendingForm=f;pendingSubmitter=e.submitter;qs('#confirm-copy').textContent=f.dataset.appConfirm;qs('#confirm-proceed').textContent=pendingSubmitter?.textContent.trim()||'확인';UI.openDialog('confirm-dialog');return;}
  if(e.defaultPrevented)return;
  if(f===form)bypass=true;
  if(f.method.toLowerCase()==='post'){const b=e.submitter;if(b){setTimeout(()=>{b.disabled=true;b.setAttribute('aria-busy','true');},0);}}
 });
 qs('#confirm-proceed')?.addEventListener('click',()=>{if(!pendingForm)return;const target=pendingForm,submitter=pendingSubmitter;pendingForm=null;pendingSubmitter=null;target.dataset.confirmed='true';qs('#confirm-dialog').close();try{target.requestSubmit(submitter||undefined);}finally{delete target.dataset.confirmed;}});
 qs('#confirm-dialog')?.addEventListener('close',()=>{pendingForm=null;pendingSubmitter=null;});
 all('[data-submit-change]').forEach(el=>el.addEventListener('change',()=>el.form.requestSubmit()));
 all('[data-share]').forEach(b=>b.addEventListener('click',async()=>{if(b.getAttribute('aria-busy')==='true')return;b.setAttribute('aria-busy','true');try{const result=await UI.shareLink({title:document.title,url:location.href,onProgress:phase=>{if(new URLSearchParams(location.search).get('qa')==='1')b.dataset.sharePhase=phase;}});if(new URLSearchParams(location.search).get('qa')==='1')b.dataset.shareResult=result;if(result==='copied')toast('링크를 복사했어요.');}finally{b.removeAttribute('aria-busy');}}));
 qs('[data-toggle-sidebar]')?.addEventListener('click',e=>{const side=qs('#admin-sidebar');side.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(side.classList.contains('open')));});
 all('[data-mode-choice]').forEach((a,i,arr)=>a.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowDown')n=(i+1)%arr.length;else if(e.key==='ArrowUp')n=(i-1+arr.length)%arr.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=arr.length-1;else return;e.preventDefault();arr[n].focus();}));
 all('[data-chip-url]').forEach(chip=>chip.addEventListener('click',event=>{if(event.defaultPrevented)return;all('[data-chip-url]',chip.closest('[data-chip-slider]')).forEach(item=>item.setAttribute('aria-pressed',String(item===chip)));if(window.AppNavigation)window.AppNavigation.go(chip.dataset.chipUrl,{restore:true});else location.assign(chip.dataset.chipUrl);}));
 // Media failures are handled in media.js for both cached and late errors.
 const journal=qs('#journal-form');
 if(journal){
  let step=0;const steps=all('[data-step]',journal),names=['기본 거래','진입 전 점검','추세·리스크','이유·복기','확인·저장'];
  const val=n=>journal.elements.namedItem(n)?.value??'';
  const num=n=>Number(val(n))||0;
  const won=v=>new Intl.NumberFormat('ko-KR').format(v)+'원';
  const directionClass=value=>({buy:'text-financial-up',up:'text-financial-up',sell:'text-financial-down',down:'text-financial-down'})[value]||'';
  const validateStep=(focus=true)=>window.AppFeedback.validate(steps[step],{focus});
  const refresh=()=>{
   qs('#trade-total').textContent=won(num('unitPrice')*num('quantity'));
   qs('#trade-total').className=directionClass(val('side'));
   const checks=all('input[name^="checklistAnswers"]:checked',journal);qs('#check-summary').textContent=`${checks.filter(e=>e.value==='yes').length}/${checks.length} 충족 · ${checks.filter(e=>e.value!=='unreviewed').length}/${checks.length} 점검 완료`;
   all('[data-sell-field]',journal).forEach(el=>el.hidden=val('side')!=='sell');
  };
  const confirm=()=>{
    const box=qs('#journal-confirm');box.replaceChildren();
    const total=num('unitPrice')*num('quantity'),cost=num('fee')+num('tax');
    const groups=[
      ['기본 거래',0,[[val('stockName')||'종목명 없음',val('tradeDate')+' · '+(val('side')==='buy'?'매수':'매도'),directionClass(val('side'))],['단가 · 수량',won(num('unitPrice'))+' × '+val('quantity')+'주'],['총 거래금액',won(total),directionClass(val('side'))],['수수료 · 거래세',won(cost)],[val('side')==='buy'?'매수 지출액':'매도 수령액',won(val('side')==='buy'?total+cost:total-cost),directionClass(val('side'))]]],
      ['기준 점검',1,[['점검 결과',qs('#check-summary').textContent],...all('.check-row',journal).map(row=>[qs('summary',row).textContent.trim(),({yes:'충족',no:'미충족',unreviewed:'미점검'})[qs('input:checked',row)?.value]||'미점검'])]],
      ['추세와 리스크',2,[...all('.journal-trend-row',journal).map(row=>[row.firstElementChild.textContent,({up:'상승',down:'하락',flat:'횡보',unreviewed:'미점검'})[qs('input:checked',row)?.value]||'미점검',directionClass(qs('input:checked',row)?.value)]),['목표가',num('targetPrice')?won(num('targetPrice')):'입력하지 않음'],['손절선',num('stopLossPrice')?won(num('stopLossPrice')):'입력하지 않음'],['지지선',val('supportNote')||'입력하지 않음'],['저항선',val('resistanceNote')||'입력하지 않음']]],
      ['이유와 복기',3,[['매매 이유',val('reason')||'입력하지 않음'],...(val('side')==='sell'?[['매도·청산 근거',val('sellReview')||'입력하지 않음']]:[]),['복기',val('reflection')||'입력하지 않음'],['감정',val('emotion')||'선택 안 함'],['장중 대응',val('intraday')||'입력하지 않음'],['5분봉·거래량',val('volumeNote')||'입력하지 않음'],['지수 연동',val('indexNote')||'입력하지 않음']]]
    ];
    for(const [title,index,rows] of groups){
      const panel=document.createElement('section');panel.className='card';
      const wrap=document.createElement('div');wrap.className='review-summary';
      const head=document.createElement('div');head.className='between';
      const h=document.createElement('h2');h.className='type-headline-1';h.textContent=title;
      const edit=document.createElement('button');edit.type='button';edit.className='button button--weak button--sm';edit.textContent='수정';edit.setAttribute('aria-label',title+' 수정');edit.addEventListener('click',()=>show(index));head.append(h,edit);wrap.append(head);
      for(const [label,value,color=''] of rows){const dl=document.createElement('dl'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dd.className=color;dl.append(dt,dd);wrap.append(dl);}
      panel.append(wrap);box.append(panel);
    }
  };
   const show=(n,focus=true)=>{step=n;steps.forEach((el,i)=>{el.hidden=i!==step;el.inert=i!==step;});qs('#step-number').textContent=String(step+1);qs('#step-label').textContent=names[step];UI.setProgress(qs('#step-progress'),(step+1)/5);qs('#step-prev').hidden=step===0;qs('#step-next').hidden=step===4;qs('#journal-submit').hidden=step!==4;qs('#step-skip').hidden=step===0||step===4;if(step===4)confirm();if(focus){window.AppMotion?.enter(steps[step]);window.scrollTo({top:0,behavior:'instant'});const title=qs('h1',steps[step]);title.tabIndex=-1;title.focus({preventScroll:true});}};
  qs('#step-next').addEventListener('click',()=>{if(validateStep())show(Math.min(4,step+1));});qs('#step-prev').addEventListener('click',()=>show(Math.max(0,step-1)));qs('#step-skip').addEventListener('click',()=>show(Math.min(4,step+1)));
  journal.addEventListener('input',refresh);journal.addEventListener('change',refresh);
  journal.addEventListener('submit',e=>{if(e.submitter?.value==='draft')return;for(let i=0;i<steps.length;i++){step=i;if(!validateStep(false)){e.preventDefault();bypass=false;show(i,false);window.AppFeedback.focus(qs('[aria-invalid="true"]',steps[i]));return;}}});
  let previewRequest=0;qs('#journal-images').addEventListener('change',e=>{const request=++previewRequest;const wrap=qs('#image-previews');if(e.target.files.length>4)toast('이미지는 최대 4장까지 미리볼 수 있어요.');wrap.replaceChildren();for(const file of Array.from(e.target.files).slice(0,4)){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){toast('PNG, JPG, WebP 이미지 2MB 이하만 미리볼 수 있어요.');continue;}const reader=new FileReader();reader.onload=()=>{if(request!==previewRequest)return;const tile=document.createElement('div');tile.className='image-preview';const img=document.createElement('img');img.addEventListener('error',()=>{tile.remove();toast('이 이미지를 미리볼 수 없어요. 다른 파일을 선택해 주세요.');});img.src=reader.result;img.alt=file.name+' 로컬 미리보기';const b=document.createElement('button');b.type='button';b.className='button button--neutral button--sm button--full';b.textContent='삭제';b.setAttribute('aria-label',file.name+' 미리보기 삭제');b.addEventListener('click',()=>tile.remove());const thumb=document.createElement('div');thumb.className='thumbnail thumbnail--square';thumb.append(img);tile.append(thumb,b);wrap.append(tile);};reader.onerror=()=>toast('이미지를 읽지 못했어요. 다시 선택해 주세요.');reader.readAsDataURL(file);}});
  refresh();const invalid=qs('[aria-invalid="true"]',journal);if(invalid){const s=invalid.closest('[data-step]');show(Number(s.dataset.step),false);invalid.focus();}else show(0,false);
 }
 const share=qs('#share-form');if(share){const preview=()=>{const box=qs('#share-preview');box.replaceChildren();const lines=[share.elements.namedItem('title').value,share.elements.namedItem('body').value,...all('[data-preview-text]:checked',share).map(x=>x.dataset.previewText)];for(const line of lines){const p=document.createElement('p');p.textContent=line;box.append(p);}};share.addEventListener('input',preview);preview();}
 if(new URLSearchParams(location.search).get('qa')==='1'){
  // Native input diagnostics, enabled only during development QA.
  // Observe CSS pseudo-states without setting pressed classes or synthesizing clicks.
  const pointerSamples=[];
  const samplePointer=(phase,el,pointerType)=>{
   if(!el.isConnected)return;
   const computed=getComputedStyle(el);
   pointerSamples.push({phase,pointerType,label:el.getAttribute('aria-label')||el.textContent.trim(),active:el.matches(':active'),hover:el.matches(':hover'),focusVisible:el.matches(':focus-visible'),background:computed.backgroundColor,color:computed.color,opacity:computed.opacity,transform:computed.transform,shadow:computed.boxShadow,outline:computed.outlineStyle});
   document.documentElement.dataset.pointerSamples=JSON.stringify(pointerSamples.slice(-24));
  };
  const pointerTarget=event=>event.target.closest('.button,.icon-button,.text-button,.card--interactive,.list-row,.chip,.calendar__day');
  document.addEventListener('pointerdown',event=>{
   const el=pointerTarget(event);if(!el)return;
   samplePointer('down',el,event.pointerType);
   setTimeout(()=>{if(el.matches(':active'))samplePointer('held',el,event.pointerType);},80);
  },true);
  for(const kind of ['pointerup','pointercancel'])document.addEventListener(kind,event=>{
   const el=pointerTarget(event);if(el)setTimeout(()=>samplePointer(kind==='pointerup'?'released':'cancelled',el,event.pointerType),160);
  },true);
  document.addEventListener('click',event=>{const el=pointerTarget(event);if(el)samplePointer('click',el,event.pointerType||'keyboard');},true);
  // Also detect indirect overrides: an app class on the same node as a DS class.
  const styleRules=sheet=>Array.from(sheet.cssRules||[]).flatMap(rule=>rule.selectorText?[rule]:rule.cssRules?styleRules(rule):[]);
  const sheets=Array.from(document.styleSheets);
  const baseClasses=new Set(sheets.filter(sheet=>sheet.href?.includes('/assets/css/ds.css')).flatMap(styleRules).flatMap(rule=>Array.from(rule.selectorText.matchAll(/\.([A-Za-z_][\w-]*)/g),match=>match[1])));
  const componentOverrides=()=>sheets.filter(sheet=>sheet.href?.includes('/assets/css/app.css')).flatMap(styleRules).flatMap(rule=>all(rule.selectorText).filter(el=>Array.from(el.classList).some(name=>baseClasses.has(name))).map(el=>({selector:rule.selectorText,classes:el.getAttribute('class')})));
  // Measure rendered labels at the requested viewport, including open dialogs.
  const buttonLabels=()=>all('.button,.text-button,.chip').filter(el=>el.getClientRects().length).map(el=>{
   const tops=[],walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   for(let node;node=walker.nextNode();){
    if(!node.textContent.trim()||node.parentElement.closest('svg,.sr-only,[aria-hidden="true"]'))continue;
    const range=document.createRange();range.selectNodeContents(node);
    for(const rect of range.getClientRects())if(rect.width&&rect.height&&!tops.some(top=>Math.abs(top-rect.top)<2))tops.push(rect.top);
   }
   return {label:el.textContent.trim().replace(/\s+/g,' '),lines:tops.length,width:Math.round(el.getBoundingClientRect().width),clipped:el.scrollWidth>el.clientWidth+1};
  });
  const sliderLayout=main=>all('[data-chip-window],[data-carousel-window]').map(el=>{
   const bounds=el.getBoundingClientRect(),frame=main.getBoundingClientRect(),css=getComputedStyle(el),swiper=el.swiper;
   const slides=all('.swiper-slide',el),active=slides[swiper?.activeIndex||0]?.getBoundingClientRect();
   return {kind:el.closest('[data-carousel]')?.dataset.carousel||'chips',count:slides.length,initialized:!!swiper,fullBleed:Math.abs(bounds.left-frame.left)<1&&Math.abs(bounds.right-frame.right)<1,padding:[css.paddingLeft,css.paddingRight],insetAncestor:!!el.closest('[data-section-inset]'),offsetBefore:swiper?.params.slidesOffsetBefore,offsetAfter:swiper?.params.slidesOffsetAfter,activeIndex:swiper?.activeIndex,atStart:swiper?.isBeginning,atEnd:swiper?.isEnd,activeLeft:active?+(active.left-bounds.left).toFixed(2):null,activeRight:active?+(bounds.right-active.right).toFixed(2):null,lastRight:slides.length?+(bounds.right-slides.at(-1).getBoundingClientRect().right).toFixed(2):null};
  });
  const bannerLayout=()=>all('[data-banner-slider]').map(root=>{
   const viewport=qs('[data-banner-window]',root),swiper=viewport.swiper,slide=swiper?swiper.slides[swiper.activeIndex]:qs('[data-banner-index]',root),card=qs('.banner-card',slide),r=root.getBoundingClientRect(),c=card.getBoundingClientRect();
   const rect=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
   const image=qs('img',card),media=qs('[data-banner-media]',card),title=qs('.banner-card__title',card),copy=qs('.banner-card__copy',card),pagination=qs('[data-banner-pagination]',root);
   const textRects=[];for(const el of all('.banner-card__copy [data-banner-text]',card)){if(!el.getClientRects().length)continue;const range=document.createRange();range.selectNodeContents(el);for(const box of range.getClientRects())if(box.width)textRects.push(box);}
   const box=media.getBoundingClientRect();const overlap=textRects.some(t=>t.right>box.left+1&&t.left<box.right-1&&t.bottom>box.top+1&&t.top<box.bottom-1);
   return {count:Number(root.dataset.slideCount),active:Number(root.dataset.bannerActive||0),page:pagination?.textContent.replace(/\s+/g,' ').trim()||null,initialized:!!swiper,centered:swiper?.params.centeredSlides,perView:swiper?.params.slidesPerView,autoplay:swiper?.params.autoplay,loop:swiper?.params.loop,gap:swiper?.params.spaceBetween,speed:swiper?.params.speed,type:card.classList.contains('banner-card--detail')?'detail':'promotion',preset:card.dataset.bannerPreset,frame:rect(root),card:rect(card),leftInset:c.left-r.left,rightInset:r.right-c.right,ratio:c.width/c.height,titleLines:Math.round(title.offsetHeight/parseFloat(getComputedStyle(title).lineHeight)),textMediaOverlap:overlap,copyBottom:copy.getBoundingClientRect().bottom,clipped:copy.getBoundingClientRect().bottom>c.bottom-16,image:{loaded:image.complete&&image.naturalWidth>0,hidden:image.hidden,fit:getComputedStyle(image).objectFit,rect:rect(image)},pagination:pagination?rect(pagination):null,visibleCopies:all('[data-banner-index]',root).filter(el=>{const b=el.getBoundingClientRect();return b.right>r.left&&b.left<r.right;}).map(el=>Number(el.dataset.bannerIndex))};
  });
  const chromeLayout=()=>{
   const rect=el=>{if(!el)return null;const b=el.getBoundingClientRect(),c=getComputedStyle(el);return {x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom,position:c.position,background:c.backgroundColor,blur:c.backdropFilter,opacity:c.opacity,visibility:c.visibility};};
   const nav=qs('.app-nav-frame'),bar=qs('.bottom-cta--app'),header=qs('[data-app-header]');
   const containing=[];for(let el=nav?.parentElement;el;el=el.parentElement){const c=getComputedStyle(el);if(c.transform!=='none'||c.filter!=='none'||c.perspective!=='none')containing.push(el.className);}
   const controls=all('main a,main button,main input,main textarea,main select').filter(el=>el.getClientRects().length&&!el.closest('.bottom-cta')&&!el.closest('[inert]')&&!el.classList.contains('sr-only'));
   const last=controls.at(-1)?.getBoundingClientRect();
   return {header:rect(header),nav:rect(nav),navSurface:rect(nav?.querySelector('nav')),cta:rect(bar),navFixedAncestors:containing,selected:all('.bottom-nav [aria-current=page]').map(el=>el.textContent.trim()),keyboardOpen:document.documentElement.dataset.keyboardOpen,lastControl:last?{bottom:last.bottom,remaining:document.documentElement.scrollHeight-innerHeight-scrollY}:null,productColumns:qs('.campaign-grid')?getComputedStyle(qs('.campaign-grid')).gridTemplateColumns:null};
  };
  const spacingLayout=()=>{
   const invalid=[];let checked=0;
   for(const el of all('body *')){
    if(el.namespaceURI!=='http://www.w3.org/1999/xhtml'||!el.getClientRects().length||el.closest('[inert]')||el.classList.contains('sr-only'))continue;
    const c=getComputedStyle(el);
    for(const prop of ['paddingTop','paddingRight','paddingBottom','paddingLeft','rowGap','columnGap']){
     const value=parseFloat(c[prop]);if(!Number.isFinite(value)||value<=0)continue;checked++;
     // These values intentionally include the actual keyboard/safe-area/CTA height.
     if(prop==='paddingBottom'&&(el.matches('[data-has-cta-space],.bottom-cta,.sheet')||el.querySelector(':scope > [data-cta-space]')))continue;
     if(Math.abs(value/8-Math.round(value/8))>.01)invalid.push({element:el.className||el.tagName,property:prop,value});
    }
   }
   return {checked,invalid};
  };
  const contentLayout=()=>all('.post').map(post=>{
   const css=el=>{const c=getComputedStyle(el);return {marginTop:c.marginTop,marginBottom:c.marginBottom,padding:c.padding,fontSize:c.fontSize,lineHeight:c.lineHeight,color:c.color,decoration:c.textDecorationLine,display:c.display};};
   return {padding:getComputedStyle(post).padding,gap:getComputedStyle(post).gap,
    first:post.firstElementChild?css(post.firstElementChild):null,last:post.lastElementChild?css(post.lastElementChild):null,
    paragraphs:all('p',post).map(p=>({text:p.textContent.slice(0,30),...css(p),parentGap:getComputedStyle(p.parentElement).gap})),
    headings:all('h1,h2,h3,h4,h5,h6',post).map(h=>({tag:h.tagName,...css(h)})),
    lists:all('ul,ol',post).map(list=>({tag:list.tagName,classes:list.className,marker:getComputedStyle(list).listStyleType,inset:getComputedStyle(list).paddingInlineStart,marginTop:getComputedStyle(list).marginTop})),
    links:all('a',post).map(a=>({label:a.textContent.slice(0,40),classes:a.className,...css(a)})),
    figures:all('figure',post).map(f=>({margin:getComputedStyle(f).margin,captionGap:f.querySelector('figcaption')?.getBoundingClientRect().top-f.firstElementChild?.getBoundingClientRect().bottom})),
    images:all('img,video',post).map(el=>({tag:el.tagName,display:getComputedStyle(el).display,width:el.getBoundingClientRect().width,parentWidth:el.parentElement.getBoundingClientRect().width})),
    tables:all('table',post).map(table=>({display:getComputedStyle(table).display,wrapper:table.parentElement.className,role:table.parentElement.getAttribute('role'),label:table.parentElement.getAttribute('aria-label'),tabIndex:table.parentElement.tabIndex,width:table.parentElement.clientWidth,scrollWidth:table.parentElement.scrollWidth,rows:table.rows.length}))};
  });
  const report=()=>{const root=document.documentElement;const main=qs('main');const first=qs('.content-list-item .list-row__title')?.getBoundingClientRect(),nav=qs('.app-nav-frame')?.getBoundingClientRect();parent.postMessage({type:'jubutech-layout-qa',report:{path:location.pathname,viewport:innerWidth,viewportHeight:innerHeight,chrome:chromeLayout(),spacing:spacingLayout(),content:contentLayout(),reveals:all('[data-reveal]').map(el=>({top:el.getBoundingClientRect().top,classes:el.className,opacity:getComputedStyle(el).opacity})),firstArticle:first?{width:first.width,top:first.top,bottom:first.bottom,navTop:nav?.top}:null,libraries:{swiperInstances:all('.swiper-initialized').length,lenis:!!window.AppScroll?.instance,aosInitialized:all('[data-aos].aos-init').length,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches},scroll:{y:scrollY,locked:!!window.AppScroll?.locked,overflow: getComputedStyle(document.body).overflow},openDialogs:all('dialog[open]').map(d=>d.id),focused:document.activeElement?.id||document.activeElement?.getAttribute('aria-label')||document.activeElement?.tagName,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,overflow:root.scrollWidth>root.clientWidth,mainWidth:Math.round(main.getBoundingClientRect().width),mainPadding:getComputedStyle(main).padding,sectionNesting:all('[data-section-inset]').filter(el=>el.parentElement.closest('[data-section-inset]')).length,sliders:sliderLayout(main),banners:bannerLayout(),font:getComputedStyle(document.body).fontFamily,primary:getComputedStyle(root).getPropertyValue('--primary-normal').trim(),componentOverrides:componentOverrides(),buttons:buttonLabels()}},location.origin);};
  window.addEventListener('load',report);document.fonts.ready.then(()=>requestAnimationFrame(report));document.addEventListener('click',()=>requestAnimationFrame(report));
  window.addEventListener('resize',()=>requestAnimationFrame(report));window.addEventListener('scroll',()=>requestAnimationFrame(report),{passive:true});
  for(const eventName of ['ui:open','ui:close','close','keyup'])document.addEventListener(eventName,()=>requestAnimationFrame(()=>requestAnimationFrame(report)),true);
  document.addEventListener('pointerup',()=>setTimeout(report,260));
  document.addEventListener('transitionend',event=>{if(event.target.matches('.swiper-wrapper'))requestAnimationFrame(report);});
 }
})();
