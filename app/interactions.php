<?php
/** Screen features are derived from rendered content; admin never loads these libraries. */
function interactionAssets(string $content,string $path): void {
 // Development-only failure injection: render usable content with all libraries absent.
 $libraries=!(($_GET['qa']??'')==='1'&&($_GET['libraries']??'')==='off');
 $swiper=(bool)preg_match('/data-slide-count="(?:[2-9]|\d{2,})"/',$content)||str_contains($content,'data-chip-slider');
 $aos=str_contains($content,'data-reveal');
 $lenis=$path==='/'||(bool)preg_match('#^/(finance(?:/(?:categories|saved|articles/[^/]+))?|campaigns(?:/explore|/[^/]+)?)$#',$path);
 if($libraries&&$swiper)echo '<link rel="stylesheet" href="/assets/vendor/swiper-12.0.3/swiper-bundle.min.css"><script src="/assets/vendor/swiper-12.0.3/swiper-bundle.min.js" defer></script>';
 if($libraries&&$aos)echo '<script src="/assets/vendor/aos-2.3.4/aos.js" defer></script>';
 if($libraries&&$lenis)echo '<link rel="stylesheet" href="/assets/vendor/lenis-1.3.27/lenis.css"><script src="/assets/vendor/lenis-1.3.27/lenis.min.js" defer></script>';
 echo '<script src="/assets/js/motion.js" defer></script><script src="/assets/js/scroll.js" defer></script>';
 if($swiper&&(str_contains($content,'data-carousel=')||str_contains($content,'data-chip-slider')))echo '<script src="/assets/js/sliders.js" defer></script>';
 if(str_contains($content,'data-banner-slider'))echo '<script src="/assets/js/banner-slider.js" defer></script>';
 echo '<script src="/assets/js/navigation-state.js" defer></script><script src="/assets/js/media.js" defer></script><script src="/assets/js/form-steps.js" defer></script>';
 if(str_contains($content,'data-campaign-detail'))echo '<script src="'.e(assetUrl('/assets/js/campaign-detail.js')).'" defer></script>';
}
function carouselStart(string $kind,string $label,int $count,string $attributes=''): void {
 echo '<div class="app-carousel" data-carousel="'.e($kind).'" data-slide-count="'.$count.'" '.$attributes.' role="region" aria-roledescription="슬라이드" aria-label="'.e($label).'"><div class="swiper" data-carousel-window><div class="swiper-wrapper">';
}
function carouselEnd(int $count): void {
 echo '</div></div>';
 if($count>1)echo '<div class="carousel-controls" data-carousel-controls hidden><button type="button" class="icon-button" data-carousel-prev aria-label="이전 슬라이드">'.icon('chevron-left').'</button><span class="type-caption-1 muted--on-alternative" data-carousel-status aria-live="polite">1 / '.$count.'</span><button type="button" class="icon-button" data-carousel-next aria-label="다음 슬라이드">'.icon('chevron-right').'</button></div>';
 echo '</div>';
}
