<?php
/** Account and support screens share the existing Base UI surfaces and controls. */
function accountUrl(string $url): string {
 global $mode;
 return $url.(str_contains($url,'?')?'&':'?').'mode='.rawurlencode($mode);
}

function accountHeading(string $title,string $description,string $eyebrow='나의 활동',string $action=''): void { ?>
 <div class="content-section" data-section-inset>
  <header class="account-heading">
   <p class="type-label-2 text-secondary"><?=e($eyebrow)?></p>
   <div class="account-heading-title"><h1 class="type-fixed-title-2"><?=e($title)?></h1><?=$action?></div>
   <p class="type-body-2 text-secondary"><?=e($description)?></p>
  </header>
 </div>
<?php }

function accountNote(string $title,string $body,string $symbol='circle-alert'): void { ?>
 <div class="account-note">
  <?=icon($symbol,'muted')?><div class="column gap-8"><strong class="type-label-1"><?=e($title)?></strong><p class="type-label-2 text-secondary"><?=e($body)?></p></div>
 </div>
<?php }

function myMissionsPage(): void {
 global $repo;
 $rows=array_values(array_filter($repo->mine('applications'),function($a)use($repo){
  if($a['selectionStatus']!=='selected'||!$repo->find('campaigns',$a['campaignId']))return false;
  $review=$repo->review($a['id']);
  return !$review||!in_array($review['reviewStatus'],['approved','rejected']);
 }));
 usort($rows,fn($a,$b)=>strcmp($repo->find('campaigns',$a['campaignId'])['reviewDueAt'],$repo->find('campaigns',$b['campaignId'])['reviewDueAt']));
 $waiting=count(array_filter($rows,fn($a)=>($repo->review($a['id'])['reviewStatus']??'')==='pending'));
 accountHeading('진행 중인 미션','체험부터 후기까지, 다음 할 일을 확인해요.'); ?>
 <div class="group-section">
  <div class="card card--group"><div class="account-stats" aria-label="미션 현황">
   <div class="account-stat"><span class="type-label-2 muted">할 일 있는 미션</span><div class="account-stat-value"><strong class="type-fixed-title-1"><?=count($rows)-$waiting?></strong><small class="type-label-2 muted">건</small></div></div>
   <div class="account-stat"><span class="type-label-2 muted">후기 검토 중</span><div class="account-stat-value"><strong class="type-fixed-title-1"><?=$waiting?></strong><small class="type-label-2 muted">건</small></div></div>
  </div></div>
 </div>
 <div class="content-section" data-section-inset><div class="account-section-heading"><h2 class="type-headline-2 weight-semibold">나의 미션 <span class="text-brand-strong"><?=count($rows)?></span></h2><a class="text-button text-button--touch" href="/applications">내 응모 전체 <?=icon('chevron-right')?></a></div></div>
 <?php if(!$rows): ?>
 <div class="group-section"><div class="card card--group"><?php emptyState('진행 중인 미션이 없어요','선정된 체험의 미션이 이곳에 표시돼요.','clipboard-check','<a class="button button--weak" href="/campaigns/explore">체험단 둘러보기</a>');?></div></div>
 <?php endif;
 foreach($rows as $a):
  $c=$repo->find('campaigns',$a['campaignId']);$r=$repo->review($a['id']);
  $submitted=$r&&$r['reviewStatus']==='pending';$revision=$r&&$r['reviewStatus']==='revision';
  $needsShipping=!$r&&$c['shipping']&&!$a['shipping'];
  $days=(int)$repo->now()->setTime(0,0)->diff((new DateTimeImmutable($c['reviewDueAt']))->setTime(0,0))->format('%r%a');
  $deadline=$days<0?'제출 기한 지남':($days===0?'오늘까지':'D-'.$days);
  $next=$submitted?'제출한 후기를 확인하고 있어요.':($revision?($r['feedback']?:'요청된 내용을 확인하고 후기를 보완해 주세요.'):($needsShipping?'체험을 받을 배송 정보를 먼저 입력해 주세요.':'직접 사용한 경험을 후기로 남겨주세요.'));
  $button=$submitted?'제출 내역 확인':($revision?'후기 보완하기':($needsShipping?'배송 정보 입력':'후기 작성하기'));
  $url='/applications/'.$a['id'].(!$submitted&&!$needsShipping?'/review':''); ?>
 <section class="group-section" aria-label="<?=e($c['title'])?> 미션">
  <div class="card card--group"><div class="account-mission">
   <div class="account-mission-heading"><span class="row gap-8"><?=badge($submitted?'검토 중':($revision?'보완 요청':'진행 중'),$submitted?'neutral':'brand-strong')?></span><?php if(!$submitted):?><span class="type-label-2 weight-semibold text-brand-strong"><?=e($deadline)?></span><?php endif;?></div>
   <a class="account-mission-product" href="/applications/<?=e($a['id'])?>"><span class="application-thumbnail"><?=campaignImage($c)?></span><div class="column gap-8"><span class="type-caption-1 muted"><?=e($c['brand'])?></span><h2 class="type-headline-2 weight-semibold"><?=e($c['title'])?></h2><span class="type-caption-1 muted">후기 기한 <?=dateLabel($c['reviewDueAt'],'Y.m.d')?></span></div></a>
   <ol class="account-mission-steps" aria-label="미션 진행 단계">
    <li class="account-mission-step account-step-complete"><?=icon('circle-check')?><span>체험 선정<span class="sr-only"> 완료</span></span></li>
    <li class="account-mission-step<?=$submitted?' account-step-complete':' account-step-current'?>" <?=$submitted?'':'aria-current="step"'?>><?=icon($submitted?'circle-check':'pencil')?><span>후기 제출<?=$submitted?' 완료':''?></span></li>
    <li class="account-mission-step<?=$submitted?' account-step-current':''?>" <?=$submitted?'aria-current="step"':''?>><?=icon('shield-check')?><span>운영팀 검토</span></li>
   </ol>
   <p class="type-body-2 muted"><?=e($next)?></p>
   <a class="button <?=$submitted?'button--neutral':'button--weak'?> button--full" href="<?=e($url)?>"><?=e($button)?><?=icon('arrow-right')?></a>
  </div></div>
 </section>
 <?php endforeach;
}

function myPostsPage(): void {
 global $repo;
 $rows=array_values(array_filter($repo->mine('posts'),fn($p)=>$p['status']==='published'));
 accountHeading('내가 쓴 글','나눈 이야기를 모아 보고, 이어서 관리해요.','나의 활동','<a class="text-button text-button--touch" href="/community/new?return='.rawurlencode(accountUrl('/mypage/posts')).'">'.icon('plus').' 글쓰기</a>'); ?>
 <div class="content-section" data-section-inset><p class="account-list-caption"><span class="type-label-2 text-secondary">전체 <strong class="weight-semibold text-brand-strong"><?=count($rows)?></strong>개</span><span class="type-label-2 text-secondary">최신순</span></p></div>
 <?php if(!$rows): ?>
 <div class="group-section"><div class="card card--group"><?php emptyState('아직 쓴 글이 없어요','나의 작은 경험을 들려주세요.','messages-square','<a class="button button--weak" href="/community/new">첫 이야기 쓰기</a>');?></div></div>
 <?php endif;
 foreach($rows as $p):
  $sheet='my-post-actions-'.$p['id'];
  $comments=count(array_filter($repo->all('comments'),fn($c)=>$c['postId']===$p['id']&&$c['status']==='published')); ?>
 <div class="group-section"><article class="card card--group"><div class="account-post">
  <div class="content-item-heading"><div class="row gap-8"><?=badge($p['topic'],'neutral')?><time class="type-caption-1 muted" datetime="<?=e($p['createdAt'])?>"><?=dateLabel($p['createdAt'],'Y.m.d')?></time></div><?=contentActionsButton($sheet,$p['title'].' 글 더 보기')?></div>
  <a class="account-post-link" href="/community/<?=e($p['id'])?>"><h2 class="type-headline-1 weight-semibold"><?=e($p['title'])?></h2><p class="account-post-excerpt"><span class="type-body-2 muted"><?=e($p['body'])?></span></p><div class="account-post-meta"><span><?=icon('heart','icon--small')?>공감 <?=count($p['likes'])?></span><span><?=icon('message-circle','icon--small')?>댓글 <?=$comments?></span></div></a>
 </div></article></div>
 <?php contentActionsSheet($sheet,'글 관리',[
  ['label'=>'글 수정','icon'=>'pencil','href'=>'/community/'.$p['id'].'/edit?return='.rawurlencode(accountUrl('/mypage/posts'))],
  ['label'=>'글 삭제','icon'=>'trash','danger'=>true,'action'=>'delete_post','data'=>['id'=>$p['id'],'return'=>accountUrl('/mypage/posts')],'confirm'=>'이 글을 삭제할까요? 직전 삭제는 되돌릴 수 있어요.']
 ]);
 endforeach;
}

function noticeList(): void {
 global $repo;
 $rows=array_values(array_filter($repo->all('notices'),fn($n)=>$n['status']==='published'));
 accountHeading('공지사항','새로운 소식과 꼭 알아둘 안내를 전해요.','주부테크 소식'); ?>
 <div class="group-section"><section class="card card--group" aria-label="공지사항 목록">
 <?php if(!$rows)emptyState('새로운 소식을 준비하고 있어요','안내가 등록되면 이곳에서 확인할 수 있어요.','megaphone'); ?>
 <ul class="list"><?php foreach($rows as $i=>$n): ?><li>
  <a class="list-row list-row--lg list-row--top" href="<?=e(accountUrl('/notices/'.$n['id']))?>" <?=$i?'data-border="indented"':''?>>
   <div class="list-row__body"><div class="account-record-meta"><?php if($n['pinned']):?><?=badge('중요 안내','brand-strong')?><?php else:?><?=badge('서비스 소식','neutral')?><?php endif;?><time datetime="<?=e($n['createdAt'])?>"><?=dateLabel($n['createdAt'],'Y.m.d')?></time></div><h2 class="list-row__title"><?=e($n['title'])?></h2></div><?=icon('chevron-right')?>
  </a>
 </li><?php endforeach;?></ul>
 </section></div>
<?php }

function noticeDetail(string $id,bool $preview=false): void {
 global $repo;
 $n=$repo->find('notices',$id);if(!$n||(!$preview&&$n['status']!=='published')){notFound();return;} ?>
 <div class="group-section"><article class="card card--group"><div class="account-article">
  <header class="account-article-header"><div class="account-record-meta"><?=badge($n['pinned']?'중요 안내':'서비스 소식',$n['pinned']?'brand-strong':'neutral')?><time datetime="<?=e($n['createdAt'])?>"><?=dateLabel($n['createdAt'],'Y.m.d')?></time></div><h1 class="type-fixed-title-2"><?=e($n['title'])?></h1><p class="type-label-2 muted">주부테크 운영팀</p></header>
  <div class="post post--flush"><?=proseParagraphs($n['body'])?></div>
  <footer class="account-article-footer"><span class="asset asset--neutral asset--circle"><?=icon('sprout')?></span><p class="type-label-2 muted">더 나은 일상을 함께 만드는<br><strong class="weight-semibold">주부테크</strong></p></footer>
 </div></article></div>
 <div class="content-section" data-section-inset><a class="button button--neutral button--full" href="<?=e(accountUrl('/notices'))?>"><?=icon('list')?>공지 목록으로</a></div>
<?php }

function inquiryList(): void {
 global $repo,$mode;
 $all=$repo->mine('inquiries');usort($all,fn($a,$b)=>strcmp($b['createdAt'],$a['createdAt']));
 $status=in_array($_GET['status']??'',['pending','answered'],true)?$_GET['status']:'';
 $rows=array_values(array_filter($all,fn($q)=>!$status||$q['status']===$status));
 accountHeading('문의하기','내가 남긴 문의와 운영팀의 답변을 확인해요.','고객 지원'); ?>
 <div class="group-section"><div class="card card--group"><div class="account-support-intro"><span class="asset asset--circle"><?=icon('messages-square')?></span><div class="column gap-8"><h2 class="type-headline-2 weight-semibold">어떤 도움이 필요하세요?</h2><p class="type-body-2 muted">궁금한 점이나 불편했던 경험을 알려주세요.</p></div><div class="account-support-action"><a class="button button--weak button--full" href="<?=e(accountUrl('/inquiries/new'))?>"><?=icon('pencil')?>문의 작성</a></div></div></div></div>
 <div class="content-section" data-section-inset><form class="account-filters" method="get" action="/inquiries" aria-label="문의 상태 필터"><?=hidden('mode',$mode)?><?php foreach([''=>'전체','pending'=>'답변 대기','answered'=>'답변 완료'] as $value=>$label):$count=$value?count(array_filter($all,fn($q)=>$q['status']===$value)):count($all);?><button class="chip chip--solid chip--touch chip--brand-strong" name="status" value="<?=e($value)?>" aria-pressed="<?=$status===$value?'true':'false'?>"><?=e($label)?> <?=$count?></button><?php endforeach;?></form></div>
 <?php if(!$rows): ?><div class="group-section"><div class="card card--group"><?php emptyState($status?'해당하는 문의가 없어요':'아직 남긴 문의가 없어요',$status?'다른 상태의 문의를 확인해 보세요.':'궁금한 점이 있다면 편하게 남겨주세요.','message-circle');?></div></div><?php endif;
 foreach($rows as $q):$answered=$q['status']==='answered'; ?>
 <div class="group-section"><a class="card card--group card--interactive" href="<?=e(accountUrl('/inquiries/'.$q['id']))?>"><div class="account-inquiry"><div class="account-record-meta"><?=badge($answered?'답변 완료':'답변 대기',$answered?'green':'neutral')?><time datetime="<?=e($q['createdAt'])?>"><?=dateLabel($q['createdAt'],'Y.m.d')?></time></div><h2 class="type-headline-2 weight-semibold"><?=e($q['title'])?></h2><p class="account-post-excerpt"><span class="type-body-2 muted"><?=e($q['body'])?></span></p><div class="account-inquiry-footer"><span class="type-label-2 <?=$answered?'text-brand-strong':'muted'?>"><?=$answered?'운영팀 답변을 확인해 주세요':'문의 내용을 확인하고 있어요'?></span><?=icon('chevron-right')?></div></div></a></div>
 <?php endforeach; ?>
 <div class="content-section" data-section-inset><p class="account-privacy"><?=icon('lock-keyhole','icon--small muted')?><span class="type-caption-1 text-secondary">문의 내용은 나와 운영팀만 볼 수 있어요.</span></p></div>
<?php }

function inquiryForm(): void {
 global $mode;
 accountHeading('어떤 도움이 필요하세요?','궁금한 점을 자세히 남겨주시면 확인에 도움이 돼요.','문의 작성'); ?>
 <div class="group-section"><div class="card card--group"><div class="group-content">
 <?php formStart('inquiry',['mode'=>$mode],'class="stack" data-dirty-form');
 echo field('title','문의 제목','','text',['required'=>'required','maxlength'=>120,'placeholder'=>'무엇이 궁금하신가요?']);
 echo field('body','문의 내용','','textarea',['required'=>'required','rows'=>8,'placeholder'=>'이용 중인 서비스와 문의 내용을 알려주세요.']);
 accountNote('등록 전에 확인해 주세요','실제 개인정보를 넣지 마세요. 문의는 현재 데모 세션에만 저장됩니다.','shield-check'); ?>
 <div class="bottom-cta bottom-cta--fixed bottom-cta--app" data-cta-space data-above-keyboard><button class="button button--brand-strong button--full">문의 등록</button></div>
 </form></div></div></div>
<?php }

function inquiryDetail(string $id): void {
 global $repo;
 $q=$repo->find('inquiries',$id);if(!$q||$q['memberId']!==($_SESSION['member']??'')){notFound();return;}
 $answered=$q['status']==='answered'; ?>
 <div class="content-section" data-section-inset><header class="account-heading"><div class="account-record-meta"><?=badge($answered?'답변 완료':'답변 대기',$answered?'green':'neutral')?><time datetime="<?=e($q['createdAt'])?>"><?=dateLabel($q['createdAt'],'Y.m.d')?></time></div><h1 class="type-fixed-title-2"><?=e($q['title'])?></h1></header></div>
 <section class="group-section" aria-labelledby="inquiry-question-title"><div class="card card--group"><div class="account-conversation"><div class="account-conversation-heading"><span class="asset asset--neutral asset--circle"><?=icon('message-circle')?></span><h2 id="inquiry-question-title" class="type-headline-2 weight-semibold">내가 남긴 문의</h2></div><div class="post post--flush"><?=proseParagraphs($q['body'])?></div></div></div></section>
 <section class="group-section" aria-labelledby="inquiry-answer-title"><div class="card card--group"><div class="account-conversation"><div class="account-conversation-heading"><span class="asset asset--circle"><?=icon($answered?'circle-check':'clock')?></span><h2 id="inquiry-answer-title" class="type-headline-2 weight-semibold"><?=$answered?'운영팀 답변':'답변을 기다리고 있어요'?></h2></div><?php if($answered):?><div class="post post--flush"><?=proseParagraphs($q['answer'])?></div><?php else:?><p class="type-body-2 muted">문의가 접수되었어요. 운영팀에서 내용을 확인한 뒤 이곳에 답변을 남겨드려요.</p><?php endif;?></div></div></section>
 <div class="content-section" data-section-inset><a class="button button--neutral button--full" href="<?=e(accountUrl('/inquiries'))?>"><?=icon('list')?>내 문의 목록으로</a><p class="account-privacy"><?=icon('lock-keyhole','icon--small muted')?><span class="type-caption-1 text-secondary">문의 내용은 나와 운영팀만 볼 수 있어요.</span></p></div>
<?php }

function mySettingsPage(): void {
 global $repo;
 $m=$repo->member();
 accountHeading('설정','계정과 서비스 이용 정보를 한곳에서 확인해요.','마이페이지'); ?>
 <div class="group-section"><div class="card card--group"><div class="account-settings-profile"><span class="avatar avatar--lg"><?=e(mb_substr($m['nickname']??'나',0,1))?></span><div class="account-settings-identity"><strong class="type-headline-1 weight-semibold"><?=e($m['nickname']??'게스트')?></strong><span class="type-label-2 muted"><?=$m?'가상 계정으로 이용 중':'데모 계정을 선택해 주세요'?></span></div><?=badge('데모','neutral')?></div></div></div>
 <section class="group-section" aria-label="계정 설정"><div class="card card--group"><?php sectionHead('계정');echo menuRow('/login','데모 계정 변경','user-round');if(getenv('JUBUTECH_SHOW_ADMIN_LINK')==='1')echo menuRow('/admin','관리자 데모 열기','layout-dashboard');?></div></section>
 <section class="group-section" aria-label="서비스 정보"><div class="card card--group"><?php sectionHead('서비스 정보');echo menuRow(accountUrl('/legal/terms'),'이용약관','file-text','검토용',false);echo menuRow(accountUrl('/legal/privacy'),'개인정보 처리 문안','shield-check','검토용',false);echo menuRow(accountUrl('/about'),'서비스 소개','sprout');?></div></section>
 <section class="group-section" aria-label="고객 지원"><div class="card card--group"><?php sectionHead('고객 지원');echo menuRow(accountUrl('/notices'),'공지사항','megaphone');echo menuRow(accountUrl('/inquiries'),'문의하기','message-circle');?></div></section>
 <div class="content-section" data-section-inset><div class="account-settings-footer"><?php accountNote('데모 이용 안내','실제 로그인이나 인증은 제공하지 않아요. 입력한 기록은 현재 브라우저 세션에 임시 저장돼요. 실제 개인정보는 입력하지 마세요.','shield-check');echo actionForm('logout',[],icon('log-out').' 데모 로그아웃','button button--neutral button--full');?></div></div>
<?php }

function aboutPage(): void { ?>
 <div class="content-section" data-section-inset><header class="account-about-hero"><img class="account-about-logo" src="/assets/images/logo.svg" alt="주부테크" width="128" height="32"><p class="type-label-2 text-secondary">오늘의 작은 발견, 내일의 새로운 가능성</p><h1 class="type-fixed-title-1">작은 일상이 모여,<br><span class="text-brand-strong">더 나은 내일</span></h1><p class="type-body-2 text-secondary">생활에 도움이 되는 정보부터 나만의 기록까지.<br>주부테크가 당신의 일상과 함께해요.</p></header></div>
 <section class="group-section" aria-labelledby="about-services-title"><div class="card card--group"><div class="list-header"><h2 id="about-services-title" class="list-header__title">주부테크에서 만나는 세 가지 일상</h2></div>
 <?php foreach([['/finance','wallet','재테크 정보','생활에 필요한 돈 이야기를 쉽고 가깝게'],['/journal','notebook-pen','주식매매일지','나의 판단을 기록하고 투자 과정을 돌아봐요'],['/campaigns','gift','체험단','관심 있는 제품을 만나고 솔직한 경험을 나눠요']] as [$url,$ic,$name,$desc]):?>
 <a class="list-row list-row--lg" href="<?=e($url)?>"><span class="asset asset--neutral asset--circle"><?=icon($ic)?></span><span class="list-row__body"><strong class="list-row__title"><?=e($name)?></strong><span class="list-row__description"><?=e($desc)?></span></span><?=icon('chevron-right')?></a>
 <?php endforeach;?></div></section>
 <section class="group-section" aria-labelledby="about-partner-title"><div class="card card--group"><div class="account-partnership"><span class="asset asset--circle"><?=icon('mail')?></span><h2 id="about-partner-title" class="type-fixed-heading-2">함께 만들 더 많은 가능성</h2><p class="type-body-2 muted">브랜드와 주부테크를 연결할<br>광고·제휴 제안을 기다려요.</p><a class="button button--weak button--full" href="<?=e(accountUrl('/inquiries/new'))?>">광고·제휴 문의 남기기 <?=icon('arrow-right')?></a><p class="type-caption-1 muted">현재 제안은 데모 세션에만 저장됩니다.</p></div></div></section>
 <?php $credits=bannerImageCredits();if($credits): ?>
 <div class="content-section" data-section-inset><details class="accordion"><summary>이미지 출처</summary><div class="accordion__body"><ul class="account-image-credits"><?php foreach($credits as $url=>$credit):?><li><a href="<?=e($url)?>" target="_blank" rel="noopener noreferrer"><?=e($credit)?></a></li><?php endforeach;?></ul></div></details></div>
 <?php endif;
}
