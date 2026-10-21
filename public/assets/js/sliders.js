(() => {
 'use strict';
 if(!window.Swiper)return; // All slides and chips remain available without the library.
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const instances=[];
 // Resolve the existing responsive spacing token through an ordinary content
 // section. No custom properties, inline gutters or negative margins are added.
 const foundation=getComputedStyle(document.documentElement);
 const spacing=name=>parseFloat(foundation.getPropertyValue(name))||0;
 const inset=()=>parseFloat(getComputedStyle(document.querySelector('[data-section-inset]')||document.querySelector('.top-nav')).paddingLeft)||0;
 const geometry=kind=>{
  const gutter=kind==='gallery'?0:inset();
  const gap=kind==='gallery'?0:kind==='week'?gutter*2:spacing(kind==='chips'?'--space-8':'--space-16');
  return {slidesOffsetBefore:gutter,slidesOffsetAfter:gutter,spaceBetween:gap,
   // Pinned Swiper 12 subtracts both offsets before sizing numeric slides.
   slidesPerView:kind==='chips'?'auto':1};
 };
 const options={loop:false,autoplay:false,speed:reduce.matches?0:200,threshold:8,focusableElements:'input,select,textarea,video,label,[contenteditable="true"]',touchAngle:35,touchStartPreventDefault:false,passiveListeners:true,preventClicks:true,preventClicksPropagation:true,watchOverflow:true,resizeObserver:true,a11y:{prevSlideMessage:'이전 슬라이드',nextSlideMessage:'다음 슬라이드',firstSlideMessage:'첫 슬라이드',lastSlideMessage:'마지막 슬라이드',slideLabelMessage:'{{index}} / {{slidesLength}}'}};
 document.querySelectorAll('[data-chip-slider]').forEach(root=>{
  const viewport=root.querySelector('[data-chip-window]');
  if(viewport.swiper)return;
  const swiper=new Swiper(viewport,{...options,...geometry('chips'),freeMode:{enabled:true,sticky:true,momentum:false},
   on:{beforeResize(instance){Object.assign(instance.params,geometry('chips'));}}
  });
  instances.push(swiper);
  const chips=Array.from(root.querySelectorAll('[data-chip-slide]'));
  const selected=chips.findIndex(el=>el.querySelector('[aria-pressed="true"]'));
  const reveal=(index,speed)=>{const chip=chips[index];if(!chip)return;const rect=chip.getBoundingClientRect(),frame=viewport.getBoundingClientRect(),gutter=inset();if(rect.left<frame.left+gutter-1||rect.right>frame.right-gutter+1)swiper.slideTo(index,speed);};
  if(selected>0)reveal(selected,0);
  root.addEventListener('focusin',e=>{if(!e.target.matches(':focus-visible'))return;reveal(chips.indexOf(e.target.closest('[data-chip-slide]')));});
  root.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const index=chips.indexOf(e.target.closest('[data-chip-slide]'));if(index<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?chips.length-1:Math.max(0,Math.min(chips.length-1,index+(e.key==='ArrowRight'?1:-1)));chips[next].querySelector('button,a')?.focus({preventScroll:true});});
 });
 document.querySelectorAll('[data-carousel]').forEach(root=>{
  const viewport=root.querySelector('[data-carousel-window]');
  const slides=viewport.querySelectorAll('.swiper-slide');
  if(viewport.swiper||slides.length<2)return;
  const week=root.dataset.carousel==='week';
  const swiper=new Swiper(viewport,{...options,...geometry(root.dataset.carousel),initialSlide:week?1:0,
   navigation:{prevEl:root.querySelector('[data-carousel-prev]'),nextEl:root.querySelector('[data-carousel-next]')},
   on:{beforeResize(instance){Object.assign(instance.params,geometry(root.dataset.carousel));},slideChangeTransitionEnd(instance){if(week&&instance.activeIndex!==1){const url=slides[instance.activeIndex].dataset.weekUrl;window.AppNavigation?.go(url,{restore:true})??location.assign(url);}}}
  });
  instances.push(swiper);
  const expose=()=>slides.forEach((slide,index)=>{slide.inert=index!==swiper.activeIndex;});expose();swiper.on('slideChange',expose);
  root.addEventListener('dragstart',event=>event.preventDefault());
  const controls=root.querySelector('[data-carousel-controls]'),status=root.querySelector('[data-carousel-status]');
  if(controls)controls.hidden=false;
  const announce=()=>{if(status)status.textContent=`${swiper.activeIndex+1} / ${slides.length}`;};
  announce();swiper.on('slideChange',announce);
 });
 // Capture before link/button handlers, including chip URL navigation.
 document.addEventListener('click',e=>{const swiper=e.target.closest('.swiper')?.swiper;if(swiper&&!swiper.allowClick){e.preventDefault();e.stopImmediatePropagation();}},true);
 // Auto-width chips must be measured again when the local font is ready.
 document.fonts?.ready.then(()=>instances.forEach(swiper=>{if(!swiper.destroyed)swiper.update();}));
 reduce.addEventListener('change',()=>instances.forEach(swiper=>swiper.params.speed=reduce.matches?0:200));
})();
