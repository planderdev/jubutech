<?php
function campaignShortcuts(): void {?><section class="group-section"><div class="card card--group"><nav class="category-shortcuts" aria-label="체험 카테고리"><?php foreach(['식품'=>'food','육아'=>'baby','생활'=>'living','반려생활'=>'pet','방문'=>'visit'] as $label=>$image):?><a class="category-shortcut" href="/campaigns/explore?category=<?=e($label)?>"><span class="category-art"><img src="/assets/images/category/<?=e($image)?>.svg" alt="" width="64" height="64" decoding="async"></span><span><?=e($label)?></span></a><?php endforeach;?></nav></div></section><?php }
function campaignHome(): void {global $repo;$rows=array_values(array_filter($repo->all('campaigns'),fn($c)=>$repo->visibleCampaign($c)&&$repo->campaignState($c)==='open'));contentStart();?>
<h1 class="sr-only">체험단 홈</h1><form action="/campaigns/explore" class="my-8"><label class="input-wrap"><input class="input" name="q" aria-label="체험단 검색" placeholder="어떤 체험을 찾으세요?"><button class="icon-button" aria-label="검색 실행"><?=icon('search')?></button></label></form><?php contentEnd();
homeBannerSlider('campaigns');campaignShortcuts();?>
<section class="group-section reveal-block" data-reveal><div class="card card--group"><?php sectionHead('지금 참여할 수 있는 체험','/campaigns/explore');?><div class="group-content"><div class="campaign-grid"><?php foreach(array_slice($rows,0,4) as $c)campaignCard($c,3);?></div></div></div></section>
<?php modeBanner('campaigns');contentStart();?><p class="type-caption-2 muted--on-alternative my-24">데모 기준 2026.10.21 · 제공 내역과 보상은 예시예요.</p><?php contentEnd();}
function campaignExplore(): void {global $repo;$status=$_GET['state']??'';$category=$_GET['category']??'';echo '<h1 class="sr-only">체험단 탐색</h1>';?><div class="content-section" data-section-inset><form class="pt-16 mb-8"><label class="input-wrap"><input class="input" name="q" value="<?=e($_GET['q']??'')?>" aria-label="체험단 검색" placeholder="제품이나 브랜드를 검색하세요"><button class="icon-button" aria-label="검색 실행"><?=icon('arrow-right')?></button></label><?=hidden('state',$status)?><?=hidden('category',$category)?></form></div><?php chipSliderStart(); ?><?php foreach([''=>'전체','open'=>'모집 중','soon'=>'마감 임박','upcoming'=>'모집 예정','closed'=>'모집 종료'] as $v=>$l):?><div class="chip-slider-item swiper-slide" data-chip-slide><button type="button" class="chip" aria-pressed="<?=$v===$status?'true':'false'?>" data-chip-url="<?=e(queryUrl(['state'=>$v,'page'=>1]))?>"><?=$l?></button></div><?php endforeach;?><?php chipSliderEnd(); ?><div class="content-section" data-section-inset><div class="between my-8"><span class="type-label-2 muted--on-alternative"><?=e($category?:'모든 카테고리')?></span><button class="text-button" data-open="campaign-filter" aria-haspopup="dialog"><?=icon('sliders-horizontal')?> 필터</button></div></div><?php sheetStart('campaign-filter','체험 조건을 골라주세요'); ?><form id="campaign-filter-form"><fieldset class="column"><legend class="type-headline-2 mb-8">체험 분류</legend><?php foreach([''=>'전체','식품'=>'식품','육아'=>'육아','생활'=>'생활','반려생활'=>'반려생활','방문'=>'방문','설문'=>'설문'] as $value=>$label):?><label class="list-row list-row--choice"><span class="list-row__body"><?=$label?></span><span class="radio"><input type="radio" name="category" value="<?=e($value)?>" <?=$category===$value?'checked':''?>></span></label><?php endforeach;?></fieldset><?=hidden('state',$status)?><?=hidden('q',$_GET['q']??'')?></form><?php sheetEnd('<a class="button button--neutral" href="/campaigns/explore">필터 해제</a><button type="submit" class="button" form="campaign-filter-form">필터 적용</button>',true); ?><?php $rows=filtered(array_values(array_filter($repo->all('campaigns'),function($c)use($repo,$status,$category){$s=$repo->campaignState($c);$soon=$s==='open'&&(strtotime($c['recruitmentEndAt'])-$repo->now()->getTimestamp())<=7*86400;return $repo->visibleCampaign($c)&&(!$category||$c['categoryId']===$category)&&(!$status||($status==='soon'?$soon:$status===$s));})),['title','brand']);[$items,$p,$ps]=paginate($rows,6);echo '<section class="group-section"><div class="card card--group"><div class="group-content">';echo '<p class="sr-only">'.count($rows).'개의 체험</p><div class="campaign-grid">';foreach($items as $c)campaignCard($c);echo '</div>';if(!$items)emptyState('지금은 맞는 체험이 없어요','조건을 바꾸어 다른 체험을 만나보세요.','gift');pagination($p,$ps);echo '</div></div></section>';}
function campaignDetail(string $id,bool $preview=false): void {
 global $repo;
 $c=$repo->find('campaigns',$id);
 if(!$c||(!$preview&&!$repo->visibleCampaign($c))){notFound();return;}
 $state=$repo->campaignState($c);
 $a=$repo->application($id);
 $stateLabel=$state==='open'?'모집 중 · '.campaignDeadline($c):campaignDeadline($c);
 ?>
 <article class="campaign-detail" data-campaign-detail>
  <div class="campaign-hero">
   <?php campaignGallery($c); ?>
  </div>
  <header class="campaign-detail-summary">
   <div class="row gap-8"><?=badge($stateLabel,$state==='closed'?'neutral':'rose')?><?=badge($c['categoryId'],'neutral')?></div>
   <div class="campaign-detail-heading"><p class="type-label-2 muted"><?=e($c['brand'])?></p><h1 class="type-fixed-heading-1 weight-bold"><?=e($c['title'])?></h1></div>
   <div class="campaign-detail-offer"><span class="type-label-2 muted">이런 체험을 제공해요</span><strong class="campaign-benefit-value"><?=e($c['benefit'])?></strong></div>
   <dl class="campaign-key-facts">
    <div class="campaign-key-fact"><dt class="type-label-2 muted">모집 인원</dt><dd class="type-body-1 weight-semibold"><?=$c['capacity']?>명</dd></div>
    <div class="campaign-key-fact"><dt class="type-label-2 muted">후기 채널</dt><dd class="type-body-1 weight-semibold"><?=e($c['channel'])?></dd></div>
   </dl>
  </header>
  <div class="campaign-detail-nav<?=$preview?' campaign-detail-nav--preview':''?>">
   <nav class="tabs tabs--anchor" aria-label="체험 상세 구간" data-campaign-nav>
    <a href="#campaign-overview" aria-current="location">체험 소개</a><a href="#campaign-schedule">일정·미션</a><a href="#campaign-guide">참여 안내</a>
   </nav>
  </div>
  <div class="campaign-detail-body">
   <section id="campaign-overview" class="campaign-detail-section" data-campaign-section aria-labelledby="campaign-overview-title" tabindex="-1">
    <h2 id="campaign-overview-title" class="campaign-section-title type-headline-1">체험 소개</h2>
    <div class="post post--flush"><?=proseParagraphs($c['description'])?></div>
    <?php campaignReviews($c);campaignProductInformation($c); ?>
   </section>
   <section id="campaign-schedule" class="campaign-detail-section" data-campaign-section aria-labelledby="campaign-schedule-title" tabindex="-1">
    <h2 id="campaign-schedule-title" class="campaign-section-title type-headline-1">체험 일정</h2>
    <dl class="campaign-schedule-list">
     <div class="campaign-schedule-item"><dt class="type-label-1 muted">모집 기간</dt><dd class="type-body-2 weight-semibold"><?=dateLabel($c['recruitmentStartAt'],'m.d')?> ~ <?=dateLabel($c['recruitmentEndAt'],'m.d')?> 23:59</dd></div>
     <div class="campaign-schedule-item"><dt class="type-label-1 muted">선정 발표</dt><dd class="type-body-2 weight-semibold"><?=dateLabel($c['announcementAt'],'Y.m.d')?></dd></div>
     <div class="campaign-schedule-item"><dt class="type-label-1 muted">후기 마감</dt><dd class="type-body-2 weight-semibold"><?=dateLabel($c['reviewDueAt'],'Y.m.d')?></dd></div>
    </dl>
    <div class="campaign-mission-section"><h2 class="campaign-section-title type-headline-1">함께 해주실 미션</h2>
     <ul class="campaign-missions"><?php foreach($c['missions'] as $m):?><li class="campaign-mission"><span class="campaign-mission-marker" aria-hidden="true"><?=icon('check')?></span><span class="type-body-2"><?=e($m)?></span></li><?php endforeach;?></ul>
    </div>
   </section>
   <section id="campaign-guide" class="campaign-detail-section campaign-guide" data-campaign-section aria-labelledby="campaign-guide-title" tabindex="-1">
    <details class="accordion accordion--inset" open><summary id="campaign-guide-title">신청 조건과 유의사항</summary><div class="accordion__body"><div class="column gap-16"><div class="post post--flush"><?=proseParagraphs($c['conditions'])?></div><p class="type-label-2 muted">제품을 제공받는 체험 활동은 후기에서 제공 사실을 표시해 주세요. 보상과 일정은 검토용 예시이며 실제 지급·배송은 연결되어 있지 않습니다.</p></div></div></details>
   </section>
  </div>
 </article>
 <?php campaignRecommendations($c,$preview); ?>
 <?php if(!$preview):?>
  <div class="bottom-cta bottom-cta--fixed bottom-cta--app bottom-cta--fade" data-cta-space data-above-keyboard>
   <?php if($a):?><a class="button button--lg button--full" href="/applications/<?=e($a['id'])?>">내 응모 확인</a><?php elseif($state==='open'):?><a class="button button--lg button--full" href="/campaigns/<?=e($id)?>/apply">응모하기</a><?php else:?><button class="button button--lg button--full" disabled><?=$state==='closed'?'모집 종료':'모집 예정'?></button><?php endif;?>
  </div>
 <?php endif;
}
function campaignApply(string $id): void {global $repo;$c=$repo->find('campaigns',$id);if(!$c||!$repo->visibleCampaign($c)){notFound();return;}if($a=$repo->application($id)){emptyState('이미 응모한 체험이에요','내 응모에서 진행 상태를 확인해 주세요.','circle-check','<a class="button" href="/applications/'.e($a['id']).'">내 응모 확인</a>');return;}if($repo->campaignState($c)!=='open'){emptyState('지금은 응모할 수 없어요','모집 기간을 확인해 주세요.','clock');return;}pageTitle('나의 이야기를 들려주세요', $c['title']);contentStart();formStart('apply',['id'=>$id],'class="stack" data-dirty-form data-compact-wizard');?><p class="box column gap-8 type-label-2">화면 확인용 데모입니다. 실제 연락처 대신 가상 정보를 입력해 주세요.</p><section data-form-step><h2 class="type-headline-1 mb-16" tabindex="-1">기본 정보를 확인해 주세요</h2><div class="stack"><?=field('nickname','닉네임',$repo->member()['nickname']??'','text',['required'=>'required'])?><?=field('contact','연락처','010-0000-0000','tel',['required'=>'required','autocomplete'=>'off'])?><?php if($c['channel']!=='설문')echo field('channelUrl','활동 채널 URL','','url',['placeholder'=>'https://example.com/my-channel','required'=>'required']);?></div></section><section data-form-step><h2 class="type-headline-1 mb-16" tabindex="-1">체험하고 싶은 이유를 알려주세요</h2><div class="stack"><?=field('reason','신청 사유','','textarea',['required'=>'required','placeholder'=>'나만의 체험 이야기를 들려주세요.'])?><?php foreach($c['questions'] as $i=>$q)echo field('extra['.$i.']',$q,'','textarea',['required'=>'required']);?></div></section><section data-form-step><h2 class="type-headline-1 mb-16" tabindex="-1">동의 후 응모를 마무리해요</h2><div class="column gap-16"><label class="checkbox"><input type="checkbox" name="requiredConsent" value="1" required><span>[필수] 응모 정보 수집·이용 동의<small>검토용 문안 · 닉네임, 연락처, 채널, 신청 사유</small></span></label><label class="checkbox"><input type="checkbox" name="optionalConsent" value="1"><span>[선택] 새로운 체험 소식 수신<small>선택하지 않아도 응모할 수 있어요.</small></span></label><a href="/legal/privacy" class="text-button">동의 내용 읽기</a><span class="help help--error"><?=e($GLOBALS['errors']['requiredConsent']??'')?></span></div><p class="help">배송형 체험의 주소는 선정된 후 입력해요.</p></section><div class="bottom-cta bottom-cta--fixed bottom-cta--app" data-cta-space data-above-keyboard><div class="column gap-8" data-form-controls hidden><p class="type-label-2 muted text-center" data-form-status aria-live="polite"></p><div class="bottom-cta__buttons"><button type="button" class="button button--neutral" data-form-prev>이전</button><button type="button" class="button" data-form-next>다음</button></div></div><button class="button button--full" data-form-submit>응모하기</button></div></form><?php contentEnd(); }
function applicationList(): void {
 global $repo;
 pageTitle('내 응모');
 $status=$_GET['status']??'';
 chipSliderStart();
 foreach([''=>'전체','신청 완료'=>'신청 완료','선정'=>'선정','미선정'=>'미선정','후기 제출'=>'후기 제출','보완 요청'=>'보완 요청','완료'=>'완료','반려'=>'반려'] as $v=>$l):?>
  <div class="chip-slider-item swiper-slide" data-chip-slide><button type="button" class="chip" aria-pressed="<?=$v===$status?'true':'false'?>" data-chip-url="<?=e(queryUrl(['status'=>$v]))?>"><?=$l?></button></div>
 <?php endforeach;
 chipSliderEnd();
 $rows=array_filter($repo->mine('applications'),fn($a)=>!$status||appStatus($a)===$status);
 if(!$rows)emptyState('아직 응모 내역이 없어요','나에게 맞는 체험을 찾아보세요.','gift','<a href="/campaigns/explore" class="button button--weak">체험 둘러보기</a>');
 foreach($rows as $a):
  $c=$repo->find('campaigns',$a['campaignId']);
  $label=appStatus($a);
  $needsAction=in_array($label,['선정','보완 요청'],true);
 ?>
  <div class="group-section"><a class="card card--group card--interactive" href="/applications/<?=e($a['id'])?>">
   <div class="group-content application-layout">
    <span class="application-thumbnail"><?=campaignImage($c)?></span>
    <div class="application-content">
     <?=badge($label,$a['selectionStatus']==='not_selected'?'neutral':'rose',$label==='신청 완료')?>
     <h2 class="type-headline-2 weight-bold"><?=e($c['title']??'종료된 체험')?></h2>
     <p class="type-caption-1 muted"><?=e($c['brand']??'')?> · <?=dateLabel($a['appliedAt'],'m.d')?> 신청</p>
    </div>
   </div>
   <div class="application-next<?=$needsAction?' application-next--action':''?>"><span><?=e(applicationNext($a,$c))?></span><?=icon('chevron-right')?></div>
  </a></div>
 <?php endforeach;
}
function applicationDetail(string $id): void {
 global $repo;
 $a=$repo->find('applications',$id);
 if(!$a||$a['memberId']!==($_SESSION['member']??'')){notFound();return;}
 $c=$repo->find('campaigns',$a['campaignId']);
 $r=$repo->review($id);
 $state=$repo->campaignState($c);
 $label=appStatus($a);
 $statusTitle=$r?match($r['reviewStatus']){
  'revision'=>'후기 보완이 필요해요',
  'approved'=>'체험을 마쳤어요',
  'rejected'=>'후기 검토 결과를 확인해 주세요',
  default=>'후기를 확인하고 있어요'
 }:match($a['selectionStatus']){
  'selected'=>'체험단에 선정됐어요',
  'not_selected'=>'다음 체험에서 만나요',
  'cancelled'=>'응모가 취소됐어요',
  default=>'선정 결과를 기다리고 있어요'
 };
 $complete=isset($_GET['complete']);
 ?>
 <div class="application-detail-heading">
  <?=badge($label,in_array($a['selectionStatus'],['not_selected','cancelled'])?'neutral':'rose',$label==='신청 완료')?>
  <h1 class="type-fixed-title-2"><?=e($complete?'응모를 완료했어요':$statusTitle)?></h1>
  <p class="type-body-2 muted"><?=e($complete?'결과가 나오면 여기에서 확인할 수 있어요.':applicationNext($a,$c))?></p>
 </div>

 <section class="group-section" aria-label="응모한 체험">
  <a class="card card--group card--interactive" href="/campaigns/<?=e($c['id'])?>">
   <div class="group-content application-layout">
    <span class="application-thumbnail"><?=campaignImage($c)?></span>
    <div class="application-content">
     <p class="type-caption-1 muted"><?=e($c['brand'])?></p>
     <h2 class="type-headline-2 weight-bold"><?=e($c['title'])?></h2>
    </div>
   </div>
   <div class="application-next"><span>체험 상세보기</span><?=icon('chevron-right')?></div>
  </a>
 </section>

 <section class="group-section" aria-labelledby="application-schedule-title">
  <div class="card card--group group-content">
   <div class="application-detail-section-heading">
    <h2 id="application-schedule-title" class="type-headline-2 weight-bold">참여 일정</h2>
    <?=badge(['open'=>'모집 중','upcoming'=>'모집 예정','closed'=>'모집 종료'][$state],'neutral')?>
   </div>
   <dl class="application-detail-dates">
    <div class="application-detail-date"><dt>신청일</dt><dd><?=dateLabel($a['appliedAt'],'Y.m.d')?></dd></div>
    <div class="application-detail-date<?=$a['selectionStatus']==='applied'?' application-detail-date--next':''?>"><dt>선정 발표</dt><dd><?=dateLabel($c['announcementAt'],'Y.m.d')?></dd></div>
    <div class="application-detail-date<?=$a['selectionStatus']==='selected'&&!$r?' application-detail-date--next':''?>"><dt>후기 기한</dt><dd><?=dateLabel($c['reviewDueAt'],'Y.m.d')?></dd></div>
   </dl>
  </div>
 </section>

 <div class="group-section">
  <div class="card card--group group-content">
   <details class="accordion">
    <summary>내 신청 내용</summary>
    <div class="accordion__body"><div class="post post--flush">
     <h3 class="type-headline-2">신청 사유</h3>
     <p><?=nl2br(e($a['answers']['reason']))?></p>
     <p class="type-caption-1 muted">필수 동의: 동의함 · 선택 동의: <?=$a['consentRecords']['optional']?'동의함':'동의하지 않음'?></p>
    </div></div>
   </details>
  </div>
 </div>

 <?php if($r):?>
 <section class="group-section" aria-labelledby="application-review-title">
  <div class="card card--group group-content column gap-8">
   <h2 id="application-review-title" class="type-headline-2 weight-bold">후기 검토: <?=e(['pending'=>'검토 대기','revision'=>'보완 요청','approved'=>'승인 완료','rejected'=>'반려'][$r['reviewStatus']])?></h2>
   <p class="type-body-2 muted"><?=e($r['feedback']?:'제출해 주신 후기를 확인하고 있어요.')?></p>
   <?php if($r['url']):?><a class="text-button" href="<?=e($r['url'])?>" target="_blank" rel="noopener noreferrer">내 후기 보기 <?=icon('external-link')?></a><?php endif;?>
  </div>
 </section>
 <?php endif;?>

 <?php if($a['selectionStatus']==='selected'&&$c['shipping']):?>
 <div class="group-section">
  <div class="card card--group group-content">
   <details class="accordion">
    <summary>배송 정보 <?=$a['shipping']?'저장됨':'입력'?></summary>
    <div class="accordion__body"><?php
     formStart('save_shipping',['id'=>$id,'return'=>'/applications/'.$id],'class="stack"');
     echo '<p class="help">가상 배송지로 데모 흐름을 확인하세요. 실제 배송은 진행하지 않아요.</p>';
     echo field('recipient','수령인',$a['shipping']['recipient']??'','text',['required'=>'required']);
     echo field('address','배송지',$a['shipping']['address']??'','text',['required'=>'required']);
    ?><button class="button button--weak">배송 정보 저장</button></form></div>
   </details>
  </div>
 </div>
 <?php endif;?>

 <div class="group-section application-detail-actions">
  <?php if($a['selectionStatus']==='selected'&&(!$r||$r['reviewStatus']==='revision')):?>
   <a href="/applications/<?=e($id)?>/review" class="button button--full"><?=$r?'보완 후기 제출':'후기 제출하기'?></a>
  <?php endif;?>
  <a href="/applications" class="button button--neutral button--full">내 응모 목록</a>
  <?php if($a['selectionStatus']==='applied'&&$state==='open')
   echo actionForm('cancel_application',['id'=>$id,'return'=>'/applications/'.$id],'응모 취소','button button--weak button--danger','이 체험의 응모를 취소할까요? 모집 기간 중에는 다시 응모할 수 있어요.');
  ?>
 </div>
 <?php
}
function reviewForm(string $id): void {global $repo;$a=$repo->find('applications',$id);if(!$a||$a['memberId']!==($_SESSION['member']??'')||$a['selectionStatus']!=='selected'){notFound();return;}$r=$repo->review($id);if($r&&in_array($r['reviewStatus'],['approved','rejected'])){emptyState($r['reviewStatus']==='approved'?'승인된 후기예요':'반려된 후기예요',$r['reviewStatus']==='rejected'?($r['feedback']?:'문의에서 검토 사유를 확인해 주세요.'):'제출한 후기는 내 응모에서 확인해 주세요.','circle-check','<a class="button button--weak" href="/applications/'.e($id).'">내 응모 확인</a>');return;}pageTitle('솔직한 경험을 나눠주세요','후기 링크 또는 내용을 입력하면 돼요.');contentStart();if($r&&$r['feedback'])echo '<p class="box column gap-8 my-24">'.e($r['feedback']).'</p>';formStart('submit_review',['id'=>$id,'return'=>'/applications/'.$id],'class="stack" data-dirty-form');echo field('url','후기 URL',$r['url']??'','url',['placeholder'=>'https://example.com/my-review']);echo field('content','후기 내용',$r['content']??'','textarea');?><div class="bottom-cta bottom-cta--fixed bottom-cta--app" data-cta-space data-above-keyboard><button class="button button--full">후기 제출</button></div></form><?php contentEnd(); }
