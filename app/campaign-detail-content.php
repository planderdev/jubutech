<?php
declare(strict_types=1);

function campaignPublicReviews(array $campaign): array {
 global $repo;
 $examples=require APP_PATH.'/data/campaign-reviews.php';
 $reviews=array_map(fn($review)=>$review+['example'=>true],$examples[$campaign['id']]??[]);
 foreach($repo->all('reviews') as $review){
  if(($review['reviewStatus']??'')!=='approved'||trim($review['content']??'')==='')continue;
  $application=$repo->find('applications',$review['applicationId']??'');
  if(!$application||$application['campaignId']!==$campaign['id'])continue;
  $member=$repo->find('members',$application['memberId']);
  $reviews[]=['id'=>$review['id'],'nickname'=>mb_substr($member['nickname']??'회원',0,1).'**','rating'=>max(0,min(5,(int)($review['rating']??0))),'date'=>$review['submittedAt'],'content'=>$review['content'],'image'=>'','example'=>false];
 }
 usort($reviews,fn($left,$right)=>strcmp($right['date'],$left['date']));
 return $reviews;
}

function campaignReviewStars(float $rating): string {
 static $sequence=0;
 $label=rtrim(rtrim(number_format($rating,1),'0'),'.');
 $stars='<span class="campaign-review-stars" role="img" aria-label="5점 만점에 '.$label.'점">';
 $path='m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9Z';
 for($index=0;$index<5;$index++){
  $id='campaign-star-'.(++$sequence);
  $width=max(0,min(1,$rating-$index))*24;
  $stars.='<svg class="campaign-review-star" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><defs><clipPath id="'.$id.'"><rect width="'.$width.'" height="24"/></clipPath></defs><path class="campaign-review-star-track" d="'.$path.'"/><path clip-path="url(#'.$id.')" d="'.$path.'"/></svg>';
 }
 return $stars.'</span>';
}

function campaignReviewCard(array $review): void { ?>
 <article id="campaign-review-<?=e($review['id'])?>" class="campaign-review-card">
  <header class="campaign-review-meta">
   <?php if($review['rating']):?><?=campaignReviewStars($review['rating'])?><?php endif;?>
   <strong class="type-label-1 weight-semibold"><?=e($review['nickname'])?></strong>
   <time class="type-caption-1 muted" datetime="<?=e(substr($review['date'],0,10))?>"><?=dateLabel($review['date'],'Y.m.d')?></time>
   <?php if($review['example']):?><span class="type-caption-1 muted">예시</span><?php endif;?>
  </header>
  <div class="campaign-review-content<?=$review['image']?'':' campaign-review-content--text'?>">
   <?php if($review['image']):?><div class="campaign-review-photo"><?=mediaImage($review['image'],'음식 체험을 표현한 리뷰 참고 사진')?></div><?php endif;?>
   <p class="type-body-2"><?=nl2br(e($review['content']))?></p>
  </div>
 </article>
<?php }

function campaignReviews(array $campaign): void {
 $reviews=campaignPublicReviews($campaign);
 $rated=array_values(array_filter($reviews,fn($review)=>$review['rating']>0));
 $average=$rated?array_sum(array_column($rated,'rating'))/count($rated):null;
 ?>
 <section class="campaign-overview-block" aria-labelledby="campaign-reviews-title" data-campaign-reviews>
  <div class="campaign-block-heading"><h3 id="campaign-reviews-title" class="type-headline-1 weight-bold">리뷰 <span class="text-brand"><?=count($reviews)?></span></h3><?php if(array_filter($reviews,fn($review)=>$review['example'])):?><span class="type-caption-1 muted">예시 리뷰 포함</span><?php endif;?></div>
  <?php if($reviews):?>
   <div class="campaign-review-overview">
    <?php if($average!==null):?><div class="campaign-review-score"><?=campaignReviewStars(round($average,1))?><strong class="type-fixed-title-1"><?=number_format($average,1)?></strong><span class="type-label-2 muted">/ 5</span></div><?php endif;?>
    <p class="type-label-2 muted"><?=count($reviews)?>개의 이야기를 만나보세요</p>
   </div>
   <div class="campaign-review-photos" aria-label="사진 리뷰">
    <?php foreach(array_slice($reviews,0,3) as $review):if(!$review['image'])continue;?><a href="#campaign-review-<?=e($review['id'])?>" class="campaign-review-photo-link" aria-label="<?=e($review['nickname'])?>님의 사진 리뷰 보기"><?=mediaImage($review['image'],'음식 체험 리뷰 참고 사진')?></a><?php endforeach;?>
   </div>
   <div class="campaign-review-list"><?php foreach(array_slice($reviews,0,3) as $review)campaignReviewCard($review);?></div>
   <?php if(count($reviews)>3):?><details class="campaign-review-more"><summary class="campaign-expand-control"><span class="campaign-expand-closed">리뷰 <?=count($reviews)?>개 모두 보기</span><span class="campaign-expand-open">리뷰 접기</span><?=icon('chevron-down')?></summary><div class="campaign-review-list"><?php foreach(array_slice($reviews,3) as $review)campaignReviewCard($review);?></div></details><?php endif;?>
  <?php else:?><p class="campaign-empty-reviews type-body-2 muted">아직 등록된 리뷰가 없어요.<br>체험을 마친 분들의 이야기가 이곳에 모여요.</p><?php endif;?>
 </section>
<?php }

function campaignProductInformation(array $campaign): void {
 $images=campaignGalleryImages($campaign);
 ?>
 <section class="campaign-overview-block campaign-product-information" aria-labelledby="campaign-product-title" data-campaign-product>
  <h3 id="campaign-product-title" class="sr-only">상품정보</h3>
  <div id="campaign-product-images" class="campaign-product-images" data-product-images>
   <?php if($images):foreach($images as $index=>$image):?><div class="campaign-product-image"><?=mediaImage($image,$campaign['title'].' 상품정보 참고 이미지 '.($index+1))?></div><?php endforeach;else:?><div class="campaign-product-image"><?=campaignImage($campaign)?></div><?php endif;?>
  </div>
  <?php if(count($images)>1):?><div class="campaign-product-toggle-area" data-product-toggle-area hidden><button type="button" class="campaign-expand-control" aria-expanded="false" aria-controls="campaign-product-images" data-product-toggle><span data-product-toggle-label>상품정보 펼쳐보기</span><?=icon('chevron-down')?></button></div><?php endif;?>
 </section>
<?php }

function campaignRecommendationRows(array $campaign): array {
 global $repo;
 $rows=array_values(array_filter($repo->all('campaigns'),fn($row)=>$row['id']!==$campaign['id']&&$repo->visibleCampaign($row)&&$repo->campaignState($row)!=='closed'));
 $priority=['open'=>0,'upcoming'=>1];
 usort($rows,fn($left,$right)=>[$left['categoryId']!==$campaign['categoryId'],$priority[$repo->campaignState($left)],$left['id']]<=>[$right['categoryId']!==$campaign['categoryId'],$priority[$repo->campaignState($right)],$right['id']]);
 return $rows;
}

function campaignRecommendationPage(array $campaign,string $after='',bool $cumulative=false): array {
 $rows=campaignRecommendationRows($campaign);
 $offset=0;
 if($after!==''){
  $index=array_search($after,array_column($rows,'id'),true);
  if($index===false)throw new InvalidArgumentException('다음 상품의 위치를 확인할 수 없어요.');
  $offset=$index+1;
 }
 $end=min(count($rows),$offset+2);
 $items=array_slice($rows,$cumulative?0:$offset,$cumulative?$end:2);
 $cursor=$end<count($rows)?$rows[$end-1]['id']:null;
 $base='/campaigns/'.rawurlencode($campaign['id']);
 return ['items'=>$items,'total'=>count($rows),'next'=>$cursor?$base.'/recommendations?after='.rawurlencode($cursor):null,'page'=>$cursor?$base.'?relatedAfter='.rawurlencode($cursor).'#campaign-recommendations':null];
}

function campaignRecommendationCards(array $items): void {
 foreach($items as $item){echo '<div class="campaign-recommendation-item" data-recommendation-id="'.e($item['id']).'">';campaignCard($item,3);echo '</div>';}
}

function campaignRecommendations(array $campaign,bool $preview=false): void {
 $after=is_string($_GET['relatedAfter']??null)?$_GET['relatedAfter']:'';
 try{$page=campaignRecommendationPage($campaign,$after,true);}catch(InvalidArgumentException){$page=campaignRecommendationPage($campaign,'',true);}
 if($preview){$page['items']=campaignRecommendationRows($campaign);$page['next']=null;}
 ?>
 <section id="campaign-recommendations" class="campaign-related-products" aria-labelledby="campaign-related-title" data-campaign-recommendations data-next="<?=e($page['next']??'')?>">
  <h2 id="campaign-related-title" class="type-headline-1 weight-bold">관심 있을 만한 상품</h2>
  <div class="campaign-grid" data-recommendation-grid><?php campaignRecommendationCards($page['items']);?></div>
  <div class="campaign-related-footer" data-recommendation-sentinel>
   <p class="type-label-2 muted" role="status" aria-live="polite" data-recommendation-status><?=$page['items']?($page['next']?'아래로 내리면 다른 상품을 더 보여드려요.':'추천 상품을 모두 확인했어요.'):'지금은 추천할 상품이 없어요.'?></p>
   <?php if($page['next']):?><a class="button button--neutral button--full" href="<?=e($page['page'])?>" data-recommendation-more>상품 더 보기</a><?php endif;?>
  </div>
 </section>
<?php }

function campaignRecommendationsResponse(string $id): void {
 global $repo;
 header('Content-Type: application/json; charset=utf-8');
 $campaign=$repo->find('campaigns',$id);
 if(!$campaign||!$repo->visibleCampaign($campaign)){http_response_code(404);echo json_encode(['error'=>'체험단을 찾을 수 없어요.'],JSON_UNESCAPED_UNICODE);return;}
 $after=$_GET['after']??'';
 if(!is_string($after)){http_response_code(400);echo json_encode(['error'=>'잘못된 조회 조건입니다.'],JSON_UNESCAPED_UNICODE);return;}
 try{$page=campaignRecommendationPage($campaign,$after);}catch(InvalidArgumentException $error){http_response_code(400);echo json_encode(['error'=>$error->getMessage()],JSON_UNESCAPED_UNICODE);return;}
 ob_start();campaignRecommendationCards($page['items']);$html=ob_get_clean();
 echo json_encode(['html'=>$html,'next'=>$page['next'],'page'=>$page['page'],'count'=>count($page['items']),'total'=>$page['total']],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
}
