<?php
/** Only reviewed, local media may be rendered. Product photographs are never inferred. */
function mediaImage(string $src,string $alt,bool $eager=false): string {
 if(!preg_match('#^/assets/images/[a-zA-Z0-9_.-]+\.(?:webp|png|jpe?g)$#',$src)||!is_file(dirname(APP_PATH).'/public'.$src))return '<div class="media-placeholder"><p class="type-label-2 muted--on-alternative">이미지를 불러오지 못했어요. 아래 내용을 확인해 주세요.</p></div>';
 $size=getimagesize(dirname(APP_PATH).'/public'.$src);
 return '<img class="content-media-image" src="'.e($src).'" alt="'.e($alt).'" width="'.$size[0].'" height="'.$size[1].'" loading="'.($eager?'eager':'lazy').'" decoding="async"'.($eager?' fetchpriority="high"':'').'>';
}
function campaignGalleryImages(array $campaign): array {
 $defaults=require APP_PATH.'/data/campaign-galleries.php';
 $files=$campaign['gallery']??($defaults[$campaign['id']]??[]);
 return array_values(array_filter($files,fn($file)=>is_string($file)&&preg_match('#^/assets/images/[a-zA-Z0-9_.-]+\.(?:webp|png|jpe?g)$#',$file)&&is_file(dirname(APP_PATH).'/public'.$file)));
}
function campaignGallery(array $campaign): void {
 $images=campaignGalleryImages($campaign);
 if(!$images){
  carouselStart('gallery','체험단 이미지',1);
  echo '<div class="swiper-slide">'.campaignImage($campaign).'</div>';carouselEnd(1);return;
 }
 carouselStart('gallery','체험단 이미지',count($images));
 foreach($images as $i=>$file)echo '<div class="swiper-slide"><div class="campaign-visual" data-product="'.e($campaign['image']).'">'.mediaImage($file,$campaign['title'].' 체험 참고 사진 '.($i+1),$i===0).'</div></div>';
 carouselEnd(count($images));
}
function articleMedia(array $article): void {
 $media=$article['media']??($article['id']==='i2'?[
  'type'=>'video','src'=>'/assets/media/meal-prep.mp4','poster'=>'/assets/images/meal-prep-poster.webp',
  'title'=>'장본 재료를 한 끼 분량으로 준비하기',
  'description'=>'고기를 요리에 쓰기 좋은 크기로 준비하는 10초 예시예요. 장보기 목록을 만들 때 사용할 양도 함께 적어보세요.',
  'sourceUrl'=>'https://pixabay.com/videos/chopping-chopping-vegetables-111832/','credit'=>'ilkerkaraca26 / Pixabay'
 ]:null);
 if(!$media||!is_array($media))return;
 if(($media['type']??'')==='video'){
  $file=$media['src']??'';$poster=$media['poster']??'';
  if(!preg_match('#^/assets/media/[a-zA-Z0-9_.-]+\.(?:mp4|webm)$#',$file)||!is_file(dirname(APP_PATH).'/public'.$file)||!preg_match('#^/assets/images/[a-zA-Z0-9_.-]+\.webp$#',$poster))return;
  echo '<section><h2>'.e($media['title']??'설명 영상').'</h2><figure><video class="content-media-video" data-media controls playsinline preload="none" poster="'.e($poster).'" aria-label="'.e($media['title']??'설명 영상').'"><source src="'.e($file).'" type="'.(str_ends_with($file,'.mp4')?'video/mp4':'video/webm').'"></video><figcaption>'.e($media['description']??'');
  if(filter_var($media['sourceUrl']??'',FILTER_VALIDATE_URL)&&str_starts_with($media['sourceUrl'],'https://'))echo ' <a href="'.e($media['sourceUrl']).'" target="_blank" rel="noopener noreferrer">'.e($media['credit']??'영상 출처').'</a>';
  echo '</figcaption></figure></section>';
 }
}
function editorialMedia(array $article): void {
 if($article['id']!=='i2'||!is_file(dirname(APP_PATH).'/public/assets/images/groceries.webp'))return;
 echo '<figure><div class="media-frame">'.mediaImage('/assets/images/groceries.webp','장보기 전에 비교할 수 있는 채소 진열대').'</div><figcaption>장보기 참고 이미지 · <a href="https://unsplash.com/photos/bunch-of-vegetables-D6Tu_L3chLE" target="_blank" rel="noopener noreferrer">nrd / Unsplash</a></figcaption></figure>';
}
