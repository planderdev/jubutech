/* Base UI BannerSlider: real-data pagination, centered previews and no autoplay. */
(() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const instances=new Set();
 const initialize=(root)=>{
  const viewport=root.querySelector('[data-banner-window]');
  if(!viewport||viewport.swiper||!window.Swiper||Number(root.dataset.slideCount)<2)return;
  const count=Number(root.dataset.slideCount),current=root.querySelector('[data-banner-current]'),pagination=root.querySelector('[data-banner-pagination]');
  const options={slidesPerView:'auto',centeredSlides:true,spaceBetween:8,slidesOffsetBefore:0,slidesOffsetAfter:0,loop:true,loopAdditionalSlides:1,autoplay:false,autoHeight:false,speed:reduce.matches?0:200,threshold:8,touchAngle:35,touchStartPreventDefault:false,passiveListeners:true,preventClicks:true,preventClicksPropagation:true,watchOverflow:true,resizeObserver:true,a11y:{slideLabelMessage:'배너',containerRoleDescriptionMessage:'배너 슬라이드'}};
  const update=instance=>{
   const active=instance.slides[instance.activeIndex];if(!active)return;
   const index=Number(active.dataset.bannerIndex)||0;
   instance.slides.forEach(slide=>{slide.inert=slide!==active;slide.setAttribute('aria-label',`${Number(slide.dataset.bannerIndex)+1} / ${count}`);});
   current.textContent=String(index+1);pagination.setAttribute('aria-label',`${index+1} / ${count} 배너`);root.dataset.bannerActive=String(index);
  };
  viewport.dataset.bannerReady='true';root.dataset.bannerReady='true';
  const swiper=new Swiper(viewport,{...options,on:{init(instance){viewport.dataset.bannerReady='true';update(instance);},slideChangeTransitionEnd:update,loopFix:update}});
  instances.add(swiper);update(swiper);
  root.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End','Enter'].includes(event.key))return;
   if(event.target.matches('input,textarea,select'))return;
   const focusedLink=event.target.closest('.banner-card');
   if(event.key==='Enter'){if(!focusedLink){event.preventDefault();swiper.slides[swiper.activeIndex]?.querySelector('a')?.click();}return;}
   event.preventDefault();const restore=!!focusedLink;
   if(event.key==='ArrowLeft')swiper.slidePrev();else if(event.key==='ArrowRight')swiper.slideNext();else swiper.slideToLoop(event.key==='Home'?0:count-1);
   if(restore)root.focus({preventScroll:true});
  });
  root.addEventListener('dragstart',event=>event.preventDefault());
  root.addEventListener('click',event=>{if(!swiper.allowClick){event.preventDefault();event.stopImmediatePropagation();}},true);
  return swiper;
 };
 if(window.UI)UI.BannerSlider={init:initialize};
 document.querySelectorAll('[data-banner-slider]').forEach(initialize);
 document.fonts?.ready.then(()=>instances.forEach(instance=>{if(!instance.destroyed)instance.update();}));
 reduce.addEventListener('change',()=>instances.forEach(instance=>instance.params.speed=reduce.matches?0:200));
})();
