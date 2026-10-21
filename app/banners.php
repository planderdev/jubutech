<?php
/** Base UI BannerSlider data adapter and shared server-rendered cards. */
function bannerDefaults(array $row): array {
 return $row+['type'=>'promotion','eyebrow'=>'','benefit'=>'','description'=>'','note'=>'','image'=>'','imageAlt'=>'','background'=>'sky','imagePreset'=>'promotion','imageSource'=>'','imageCredit'=>'','url'=>'/finance','enabled'=>true,'order'=>1];
}
function bannerImagePath(string $src): ?string {
 if(!preg_match('#^/assets/images/(?:[a-zA-Z0-9_-]+/)*[a-zA-Z0-9_.-]+\.(?:svg|png|webp)$#',$src))return null;
 $path=dirname(APP_PATH).'/public'.$src;
 return is_file($path)?$path:null;
}
function bannerHasAlpha(string $src): bool {
 $path=bannerImagePath($src);if(!$path)return false;$bytes=file_get_contents($path);
 if(str_ends_with(strtolower($src),'.png'))return substr($bytes,0,8)==="\x89PNG\r\n\x1a\n"&&(in_array(ord($bytes[25]??"\0"),[4,6],true)||str_contains($bytes,'tRNS'));
 if(str_ends_with(strtolower($src),'.webp'))return substr($bytes,0,4)==='RIFF'&&substr($bytes,8,4)==='WEBP'&&((substr($bytes,12,4)==='VP8X'&&(ord($bytes[20]??"\0")&16))||str_contains($bytes,'ALPH')||(substr($bytes,12,4)==='VP8L'&&(ord($bytes[24]??"\0")&16)));
 return false;
}
function visibleBanners(string $mode): array {
 global $repo;$now=$repo->now()->getTimestamp();
 return array_values(array_filter(array_map('bannerDefaults',$repo->all('banners')),fn($b)=>$b['enabled']&&($b['mode']??'')===$mode&&strtotime($b['startAt']??'1970-01-01')<=$now&&strtotime($b['endAt']??'2099-01-01')>=$now));
}
function bannerCard(array $row,bool $preview=false): void {
 $b=bannerDefaults($row);$detail=$b['type']==='detail';$src=$b['image'];$valid=bannerImagePath($src)&&(!$detail||bannerHasAlpha($src));
 $background=in_array($b['background'],['white','sky','mint','sand','rose'],true)?$b['background']:'white';
 $preset=in_array($b['imagePreset'],['promotion','tall','wide'],true)?$b['imagePreset']:'tall';
 $tag=$preview?'div':'a';echo '<'.$tag.' class="banner-card banner-card--'.($detail?'detail':'promotion').'" data-banner-background="'.e($background).'" data-banner-preset="'.e($preset).'"'.($preview?'':' href="'.e($b['url']).'"').'>';
 echo '<div class="banner-card__copy"><p class="banner-card__eyebrow" data-banner-text="eyebrow"'.(!$b['eyebrow']?' hidden':'').'>'.e($b['eyebrow']).'</p><div class="banner-card__heading"><h2 class="banner-card__title" data-banner-text="title">'.e($b['title']??'배너 제목').'</h2><strong class="banner-card__benefit" data-banner-text="benefit"'.(!$b['benefit']?' hidden':'').'>'.e($b['benefit']).'</strong></div><p class="banner-card__description" data-banner-text="description"'.(!$b['description']?' hidden':'').'>'.e($b['description']).'</p></div>';
 echo '<div class="banner-card__media" data-banner-media><img data-banner-image src="'.e($valid?$src:'/assets/images/banners/support-envelope.svg').'" alt="'.e($valid?$b['imageAlt']:'').'" width="800" height="800" decoding="async" draggable="false"'.(!$valid&&$detail?' hidden':'').'><span class="banner-card__image-fallback" data-banner-image-fallback'.($valid||!$detail?' hidden':'').'>상품 이미지를 준비하고 있어요</span></div>';
 echo '<p class="banner-card__note" data-banner-text="note"'.(!$b['note']?' hidden':'').'>'.e($b['note']).'</p></'.$tag.'>';
}
function bannerSlider(array $rows,string $label,bool $preview=false): void {
 if(!$rows)return;$rows=array_values($rows);$count=count($rows);
 // Six physical slides make a two-item loop stable in pinned Swiper 12.
 // Each repetition keeps its original data index; counts never include copies.
 $physical=$count>1?$count*(int)ceil(6/$count):1;
 echo '<section class="banner-slider" data-banner-slider data-slide-count="'.$count.'" role="region" aria-roledescription="슬라이드" aria-label="'.e($label).'"'.($count>1?' tabindex="0"':'').'>'.($count>1?'<p class="sr-only">좌우 방향키로 배너를 바꾸고 Enter로 선택한 배너를 열 수 있어요.</p>':'').'<div class="swiper banner-slider__viewport" data-banner-window><div class="swiper-wrapper banner-slider__track">';
 for($i=0;$i<$physical;$i++){$index=$i%$count;echo '<div class="swiper-slide banner-slider__slide" data-banner-index="'.$index.'"'.($i>=$count?' data-banner-copy':'').'>';bannerCard($rows[$index],$preview);echo '</div>';}
 echo '</div></div>';
 if($count>1)echo '<span class="banner-slider__pagination" data-banner-pagination aria-live="polite" aria-atomic="true" aria-label="1 / '.$count.' 배너"><span data-banner-current>1</span><span aria-hidden="true">|</span><span>'.$count.'</span></span>';
 echo '</section>';
}
function homeBannerSlider(string $mode): void {bannerSlider(visibleBanners($mode),$mode==='finance'?'생활에 도움이 되는 정보':'새로운 체험 안내');}
function bannerImageCredits(): array {
 global $repo;$credits=[];
 $add=function(string $url,string $credit)use(&$credits){if($credit&&filter_var($url,FILTER_VALIDATE_URL)&&in_array(parse_url($url,PHP_URL_SCHEME),['https','http'],true))$credits[$url]=$credit;};
 foreach($repo->all('banners') as $row)$add($row['imageSource']??'',$row['imageCredit']??'');
 $manifest=dirname(APP_PATH).'/public/assets/images/banners/sources.json';
 foreach(json_decode(file_get_contents($manifest),true)??[] as $asset)if(isset($asset['author'],$asset['provider']))$add($asset['source'],'Photo: '.$asset['author'].' / '.$asset['provider']);
 return $credits;
}
