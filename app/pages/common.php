<?php
function notFound(): void {http_response_code(404);emptyState('페이지를 찾을 수 없어요','주소가 바뀌었거나 현재 공개되지 않은 내용이에요.','circle-alert','<a class="button button--weak" href="/finance">홈으로 이동</a>');}
function searchPage(): void {global $mode,$repo;$labels=['finance'=>'재테크 정보','journal'=>'나의 매매일지','campaigns'=>'체험단'];$q=trim($_GET['q']??'');pageTitle($labels[$mode].' 검색');?><div class="content-section" data-section-inset><form class="mb-16"><?=hidden('mode',$mode)?><label class="input-wrap"><input class="input" name="q" value="<?=e($q)?>" aria-label="검색어" placeholder="궁금한 키워드를 입력하세요" autofocus><button class="icon-button" aria-label="검색 실행"><?=icon('arrow-right')?></button></label></form></div><?php if(!$q){searchEntrypoints($mode);return;}$rows=match($mode){'journal'=>filtered($repo->mine('journals'),['stockName','reason']),'campaigns'=>filtered(array_filter($repo->all('campaigns'),fn($c)=>$repo->visibleCampaign($c)),['title','brand']),default=>filtered(array_filter($repo->all('articles'),fn($a)=>$repo->visibleArticle($a)),['title','summary'])};contentStart();echo '<p class="type-label-2 muted my-16">검색 결과 <strong class="text-brand">'.count($rows).'</strong>개</p>';contentEnd();if(!$rows){emptyState('검색 결과가 없어요','조건을 지우거나 다른 서비스에서 찾아보세요.','search','<a class="button button--weak" href="/search?mode='.e($mode).'">검색 초기화</a>');searchEntrypoints($mode);}if($mode==='campaigns')contentStart();foreach($rows as $r)match($mode){'journal'=>journalRow($r),'campaigns'=>campaignCard($r),default=>articleRow($r)};if($mode==='campaigns')contentEnd();}
function myPage(): void {global $repo,$mode;$m=$repo->member();if(!$m){loginPage();return;}$points=array_sum(array_column($repo->mine('points'),'amount'));?>
<div class="group-section"><div class="card card--group"><div class="profile-summary"><span class="avatar avatar--lg"><?=e(mb_substr($m['nickname'],0,1))?></span><div class="grow"><span class="type-label-2 muted--on-alternative">오늘도 나만의 속도로</span><h1 class="type-fixed-title-2"><?=e($m['nickname'])?>님</h1><a href="/mypage/badges?mode=<?=e($mode)?>" class="text-button">Lv. 3 · 꾸준한 새싹 <?=icon('chevron-right')?></a></div></div></div></div><div class="content-section" data-section-inset><div class="points-panel"><a class="card card--group card--interactive" href="/mypage/points?mode=<?=e($mode)?>"><div class="points-summary"><span class="type-label-2">나의 포인트</span><span class="points-value"><strong class="type-fixed-title-1"><?=number_format($points)?> P</strong><?=icon('chevron-right')?></span><span class="type-caption-1">실제 지급이 없는 데모 잔액</span></div></a></div></div>
<section class="group-section"><div class="card card--group"><?php sectionHead('나의 활동');?><?php $items=$mode==='journal'?[['/journal/entries','나의 매매일지','notebook-pen',count($repo->mine('journals')).'건'],['/applications','내 응모 현황','gift',count($repo->mine('applications')).'건']]:[['/applications','내 응모 현황','gift',count($repo->mine('applications')).'건'],['/journal/entries','나의 매매일지','notebook-pen',count($repo->mine('journals')).'건']];foreach($items as $i)echo menuRow(...$i);echo menuRow('/finance/saved','저장한 정보','bookmark');echo menuRow('/mypage/missions?mode='.$mode,'진행 중인 미션','clipboard-check');echo menuRow('/mypage/posts?mode='.$mode,'내가 쓴 글','messages-square');?></div></section><section class="group-section"><div class="card card--group"><?php sectionHead('주부테크와 함께');?><?=menuRow('/notices?mode='.$mode,'공지사항','megaphone')?><?=menuRow('/inquiries?mode='.$mode,'문의하기','message-circle')?><?=menuRow('/about?mode='.$mode,'서비스 소개·제휴 문의','sprout')?><?=menuRow('/mypage/settings?mode='.$mode,'설정','settings')?></div></section><div class="content-section" data-section-inset><p class="type-caption-2 muted--on-alternative mt-24 text-center">가상 계정 · 데이터는 이 브라우저의 임시 데모 세션에 저장돼요.</p></div><?php }
function mySubpage(string $type): void {global $repo,$mode;switch($type){case 'points':pageTitle('나의 포인트','원화 수익과 별도로 관리하는 데모 포인트예요.');contentStart();echo '<div class="type-fixed-display-2 weight-bold my-24">'.number_format(array_sum(array_column($repo->mine('points'),'amount'))).' <small>P</small></div><a class="button button--weak button--full" href="/rewards">기프티콘 교환 둘러보기</a>';contentEnd();sectionHead('포인트 내역');foreach(array_reverse($repo->mine('points')) as $p)echo '<div class="list-row list-row--lg"><div><strong>'.e($p['reason']).'</strong><small>'.dateLabel($p['createdAt'],'Y.m.d').'</small></div><b class="'.($p['amount']>0?'text-brand':'').'">'.($p['amount']>0?'+':'').number_format($p['amount']).' P</b></div>';contentStart();echo '<p class="help">적립·교환 규칙은 데모 예시이며 운영 정책이 확정되지 않았어요.</p>';contentEnd();break;
case 'missions':myMissionsPage();break;
case 'badges':pageTitle('꾸준히 쌓아가는 나의 활동','레벨과 배지는 데모 활동 예시예요.');foreach([['sprout','꾸준한 새싹','Lv. 3 · 내 속도로 시작하기'],['award','첫 수익 기록','작은 경험을 함께 나눴어요'],['receipt','영수증 30일','꾸준히 남긴 일상의 습관'],['notebook-pen','매매일지 10회','나의 판단을 돌아보는 시간']] as [$ic,$t,$d])echo '<div class="list-row list-row--lg"><span>'.icon($ic).'</span><div><h2 class="type-fixed-heading-2">'.e($t).'</h2><p>'.e($d).'</p></div></div>';break;
case 'posts':myPostsPage();break;
case 'settings':mySettingsPage();break;}}
function notificationsPage(): void {
 global $repo,$mode;
 $unread=($_GET['status']??'')==='unread';
 $rows=array_reverse(array_filter($repo->mine('notifications'),fn($n)=>!$unread||!$n['read']));
 ?>
 <h1 class="sr-only">알림</h1>
 <section class="group-section" aria-label="알림 목록">
  <div class="card card--group">
   <div class="list-header">
    <form method="get" action="/notifications" class="row gap-8" aria-label="알림 필터">
     <?=hidden('mode',$mode)?>
     <button class="chip" name="status" value="" aria-pressed="<?=$unread?'false':'true'?>">전체</button>
     <button class="chip" name="status" value="unread" aria-pressed="<?=$unread?'true':'false'?>">미확인</button>
    </form>
    <?=actionForm('read_all',['return'=>$_SERVER['REQUEST_URI']],'모두 읽음','text-button')?>
   </div>
   <?php if($rows): ?>
   <ul class="list">
    <?php foreach($rows as $n):
     $when=dateLabel($n['createdAt'],'Y-m-d')===$repo->now()->format('Y-m-d')?'오늘':dateLabel($n['createdAt'],'n월 j일');
     $notificationIcon=match($n['mode']){'campaigns'=>'gift','journal'=>'notebook-pen',default=>'wallet'};
    ?>
    <li>
     <form method="post" action="/actions">
      <?=csrf().hidden('action','read_notification').hidden('id',$n['id'])?>
      <button type="submit" class="list-row list-row--lg list-row--top">
       <span class="list-row__left"><?=icon($notificationIcon)?></span>
       <span class="list-row__body">
        <strong class="list-row__title type-body-1 weight-semibold"><?=e($n['title'])?></strong>
        <span class="list-row__description"><?=e($n['body'])?></span>
       </span>
       <span class="list-row__right list-row__right--top column gap-8">
        <time class="type-caption-1 muted" datetime="<?=e($n['createdAt'])?>" title="<?=dateLabel($n['createdAt'],'Y.m.d')?>"><?=$when?></time>
        <?php if(!$n['read']): ?><?=badge('미확인')?><?php else: ?><span class="type-caption-1 muted">읽음</span><?php endif;?>
       </span>
      </button>
     </form>
    </li>
    <?php endforeach; ?>
   </ul>
   <?php else: ?>
    <?php emptyState('모든 소식을 확인했어요','새로운 소식이 도착하면 알려드릴게요.','bell'); ?>
   <?php endif; ?>
  </div>
 </section>
 <?php
}
function postRow(array $p): void {global $repo;$member=$repo->find('members',$p['memberId']);$comments=count(array_filter($repo->all('comments'),fn($c)=>$c['postId']===$p['id']&&$c['status']==='published'));contentStart();echo '<article class="community-feed"><a class="column gap-8" href="/community/'.e($p['id']).'"><span class="row">'.badge($p['topic']).'</span><h2 class="type-headline-1">'.e($p['title']).'</h2><p class="community-excerpt">'.e($p['body']).'</p><div class="between gap-16 type-caption-1 muted"><span>'.e($member['nickname']??'탈퇴 회원').' · '.dateLabel($p['createdAt'],'m.d').'</span><span>공감 <strong class="text-brand">'.count($p['likes']).'</strong> · 댓글 <strong class="text-brand">'.$comments.'</strong></span></div></a></article>';contentEnd();}
function communityList(): void {global $repo;pageTitle('함께 나누는 이야기');$topic=$_GET['topic']??'';?><?php chipSliderStart(); ?><?php foreach(['','수익인증','부업후기','지원금제보','주식·재테크','공구/쇼핑','자유'] as $t):?><div class="chip-slider-item swiper-slide" data-chip-slide><button type="button" class="chip" aria-pressed="<?=$topic===$t?'true':'false'?>" data-chip-url="<?=e(queryUrl(['topic'=>$t,'page'=>1]))?>"><?=e($t?:'전체')?></button></div><?php endforeach;?><?php chipSliderEnd(); ?><?php $rows=array_values(array_filter($repo->all('posts'),fn($p)=>$p['status']==='published'&&(!$topic||$p['topic']===$topic)));[$items,$p,$ps]=paginate($rows);foreach($items as $post)postRow($post);if(!$items)emptyState('첫 이야기를 기다리고 있어요','나의 작은 경험을 나눠보세요.','messages-square');pagination($p,$ps);?><div class="community-write" data-hide-on-keyboard><a class="button button--floating" href="/community/new"><?=icon('pencil')?> 글쓰기</a></div><?php }
function communityForm(string $id=''): void {global $repo;$postReturn=accountPostsReturn($_GET['return']??'');$p=$id?$repo->find('posts',$id):[];if($id&&(!$p||$p['memberId']!==($_SESSION['member']??'')||$p['status']!=='published')){notFound();return;}pageTitle($id?'이야기 수정':'어떤 이야기를 나눌까요?');contentStart();formStart('save_post',['id'=>$id,'return'=>$postReturn],'class="stack" data-dirty-form');echo selectField('topic','주제',array_combine(['수익인증','부업후기','지원금제보','주식·재테크','공구/쇼핑','자유'],['수익인증','부업후기','지원금제보','주식·재테크','공구/쇼핑','자유']),$p['topic']??'자유');echo field('title','제목',$p['title']??'','text',['required'=>'required','maxlength'=>120]);echo field('body','내용',$p['body']??'','textarea',['required'=>'required','rows'=>8]);echo '<div class="message"><div class="message__body"><strong>전체 공개 게시글</strong><p>제목·본문·닉네임이 커뮤니티에 공개됩니다. 원본 매매일지와 금액은 공개하지 않아요.</p></div></div><p class="help">수익 인증은 작성자의 이야기이며 플랫폼이 검증한 수익이 아니에요.</p><div class="bottom-cta bottom-cta--fixed bottom-cta--app" data-cta-space data-above-keyboard><button class="button button--full">'.($id?'수정 저장':'이야기 게시').'</button></div></form>';contentEnd();}
function communityDetail(string $id): void {
 global $repo;
 $p=$repo->find('posts',$id);
 if(!$p||$p['status']!=='published'){notFound();return;}
 $ownsPost=$p['memberId']===($_SESSION['member']??'');
 ?>
 <div class="content-section" data-section-inset>
  <article class="column gap-16 py-16">
   <div class="content-item-heading"><span class="row"><?=badge($p['topic'])?></span><?php if($ownsPost)echo contentActionsButton('post-actions','글 더 보기');?></div>
   <h1 class="type-fixed-title-2"><?=e($p['title'])?></h1>
   <p class="type-label-2 muted"><?=e($repo->find('members',$p['memberId'])['nickname'])?> · <?=dateLabel($p['createdAt'],'Y.m.d')?></p>
   <div class="post post--flush"><?=proseParagraphs($p['body'])?></div>
   <div class="two-actions">
    <?=actionForm('like_post',['id'=>$id,'return'=>'/community/'.$id],icon('heart').' 공감 <strong class="text-brand">'.count($p['likes']).'</strong>','button button--weak','',['aria-pressed'=>in_array($_SESSION['member']??'',$p['likes'])?'true':'false'])?>
    <button class="button button--neutral" data-share><?=icon('share-2')?> 공유</button>
   </div>
  </article>
 </div>
 <?php if($ownsPost)contentActionsSheet('post-actions','글 관리',[
  ['label'=>'글 수정','icon'=>'pencil','href'=>'/community/'.$id.'/edit'],
  ['label'=>'글 삭제','icon'=>'trash','danger'=>true,'action'=>'delete_post','data'=>['id'=>$id,'return'=>'/community'],'confirm'=>'공개된 글을 삭제할까요? 데모 세션에서 되돌릴 수 있어요.']
 ]);?>
 <section class="mt-24">
  <?php sectionHead('함께 나눈 이야기');contentStart();
  foreach($repo->all('comments') as $c)if($c['postId']===$id&&$c['status']==='published'):
   $ownsComment=$c['memberId']===($_SESSION['member']??'');
   $commentName=$repo->find('members',$c['memberId'])['nickname'];
   $commentSheetId='comment-actions-'.$c['id'];
  ?>
   <div class="column gap-8 my-16">
    <div class="content-item-heading"><strong class="content-item-author"><?=e($commentName)?></strong><?php if($ownsComment)echo contentActionsButton($commentSheetId,$commentName.' 댓글 더 보기');?></div>
    <p><?=nl2br(e($c['body']))?></p>
    <small><?=dateLabel($c['createdAt'],'m.d')?></small>
   </div>
   <?php if($ownsComment)contentActionsSheet($commentSheetId,'댓글 관리',[
    ['label'=>'댓글 삭제','icon'=>'trash','danger'=>true,'action'=>'delete_comment','data'=>['id'=>$c['id'],'return'=>'/community/'.$id],'confirm'=>'이 댓글을 삭제할까요?']
   ]);?>
  <?php endif;
  formStart('comment',['id'=>$id,'return'=>'/community/'.$id],'class="stack"');
  echo field('body','댓글','','textarea',['required'=>'required','placeholder'=>'서로를 존중하는 이야기를 남겨주세요.']);
  ?><button class="button">댓글 남기기</button></form>
  <?php contentEnd();?>
 </section>
 <div class="content-section" data-section-inset>
  <details class="accordion"><summary>이 게시글 신고</summary><div class="accordion__body"><?php
   formStart('report_post',['id'=>$id,'return'=>'/community/'.$id],'class="stack"');
   echo field('body','신고 사유','','textarea',['required'=>'required']);
  ?><button class="button button--neutral">신고 접수</button></form></div></details>
 </div>
 <?php
}
function rewardsPage(): void {global $repo;pageTitle('작은 즐거움으로 바꿔요','교환 흐름을 확인하는 데모예요.');foreach($repo->all('rewards') as $r)echo '<a class="list-row list-row--lg" href="/rewards/'.e($r['id']).'"><span>'.icon('coffee').'</span><div><h2 class="type-fixed-heading-2">'.e($r['title']).'</h2><p>예시 '.number_format($r['points']).' P</p></div>'.icon('chevron-right').'</a>';}
function rewardDetail(string $id): void {global $repo;$r=$repo->find('rewards',$id);if(!$r){notFound();return;}pageTitle($r['title']);contentStart();echo '<div class="thumbnail">'.icon('coffee').'</div><p class="box column gap-8 my-24">'.e($r['description']).'</p>';echo actionForm('exchange',['id'=>$id,'return'=>'/rewards/'.$id],number_format($r['points']).' P로 데모 교환','button button--full','데모 포인트를 차감하고 교환 내역을 남깁니다. 실제 쿠폰은 발급되지 않습니다.');contentEnd();}
function legalPage(string $type): void {pageTitle(($type==='terms'?'이용약관':'개인정보 처리 문안').' · 검토용');contentStart();echo '<div class="post post--flush"><p>이 문안은 화면 검토를 위한 초안이며 실제 서비스 운영에 적용되지 않습니다.</p><h2>데모 데이터의 범위</h2><p>가상 회원과 예시 콘텐츠를 사용하며 입력 내용은 현재 브라우저의 PHP 세션에 임시로 저장됩니다. 실제 이름, 연락처, 배송지를 입력하지 마세요.</p><h2>응모 정보</h2><p>데모 응모는 닉네임, 연락처, 활동 채널, 신청 사유와 동의 여부를 기록합니다. 실제 개인정보의 수집 목적, 보유 기간, 처리 주체, 파기·권리 절차는 운영 전 별도 확정이 필요합니다.</p><h2>서비스 연결 전 검토</h2><p>실제 인증, 파일 업로드, 배송, 포인트 지급과 알림 발송은 연결되어 있지 않습니다.</p></div>';contentEnd();}
function loginPage(): void {global $repo;pageTitle('가볍게 둘러보세요','가상 계정을 골라 주부테크 데모를 시작해요.');contentStart();echo '<p class="box column gap-8 my-24">실제 회원가입이나 인증이 아니에요. 세션이 끝나면 기록이 사라질 수 있어요.</p>';contentEnd();foreach($repo->all('members') as $m)echo actionForm('login',['id'=>$m['id']],'<span class="avatar avatar--lg">'.e(mb_substr($m['nickname'],0,1)).'</span><span>'.e($m['nickname']).'</span>'.icon('arrow-right'),'list-row list-row--lg');}
function statePreview(): void {$state=$_GET['state']??'empty';pageTitle('개발용 상태 미리보기');chipSliderStart();foreach(['loading'=>'로딩','empty'=>'빈 목록','error'=>'오류','auth'=>'로그인 필요','denied'=>'접근 불가','buttons'=>'버튼 상태'] as $v=>$l)echo '<div class="chip-slider-item swiper-slide" data-chip-slide><button type="button" class="chip" data-chip-url="/dev/states?state='.$v.'">'.$l.'</button></div>';chipSliderEnd();contentStart();switch($state){case 'buttons':
    echo '<section class="stack mt-24" aria-label="Base UI 버튼 상태"><p class="muted">기존 Base UI 클래스만 사용합니다. 버튼을 누르는 동안의 반응과 선택 상태, 키보드 포커스를 확인할 수 있어요. 사용자 앱에는 hover 효과가 없어요.</p>';
    foreach(['primary'=>'','weak'=>'button--weak','secondary'=>'button--secondary','neutral'=>'button--neutral','outline'=>'button--outline','ghost'=>'button--ghost','light'=>'button--light','dark'=>'button--dark','danger'=>'button--danger','weak dark'=>'button--weak button--dark','weak danger'=>'button--danger'] as $name=>$variant) {
        echo '<div class="column gap-8"><span class="type-label-2">'.e($name).'</span><div class="between"><button type="button" class="button '.e($variant).'" data-variant="'.e($name).'">'.icon('check').' '.e($name).'</button><button type="button" class="button '.e($variant).'" disabled aria-label="'.e($name).' 비활성">비활성</button></div></div>';
    }
    echo '<div class="between"><button type="button" class="button button--secondary" aria-disabled="true">ARIA 비활성</button><button type="button" class="button button--secondary" aria-busy="true">처리 중</button></div></section>';
    break;
case 'loading':echo '<div class="column gap-16 mt-24" aria-label="콘텐츠 불러오는 중" role="status"><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text"></div></div>';break;case 'error':emptyState('정보를 불러오지 못했어요','잠시 후 다시 시도해 주세요.','circle-alert','<a class="button" href="/finance">다시 시도</a>');break;case 'auth':emptyState('데모 계정을 선택해 주세요','기록과 응모를 이용하려면 가상 계정이 필요해요.','lock-keyhole','<a class="button" href="/login">계정 선택</a>');break;case 'denied':emptyState('접근할 수 없는 기록이에요','이 기록은 작성자만 볼 수 있어요.','shield-check');break;default:emptyState('아직 기록이 없어요','첫 번째 기록을 남겨보세요.','notebook-pen');}contentEnd();}

function searchEntrypoints(string $mode): void {
 global $repo;
 sectionHead('바로 찾아보기');contentStart();
 echo '<div class="row flex-wrap gap-8 my-16">';
 $terms=match($mode){'journal'=>array_slice(array_unique(array_column($repo->mine('journals'),'stockName')),0,5),'campaigns'=>['식품','생활','육아'],default=>['지원금','ETF','장보기','부업']};
 foreach($terms as $term)if($term!=='')echo '<a class="chip" href="/search?mode='.e($mode).'&q='.rawurlencode($term).'">'.e($term).'</a>';
 echo '</div><nav class="column gap-8 mb-16" aria-label="다른 서비스에서 검색">';
 foreach(['finance'=>['재테크 정보','wallet','asset--neutral'],'journal'=>['나의 매매일지','notebook-pen','asset--blue'],'campaigns'=>['체험단','gift','']] as $m=>[$label,$symbol,$tone]){
  if($m===$mode)continue;
  echo '<a class="list-row list-row--sm list-row--narrow list-row--choice" href="/search?mode='.$m.'"><span class="asset '.$tone.'">'.icon($symbol).'</span><span class="list-row__body"><span class="list-row__title">'.$label.'에서 검색</span></span>'.icon('chevron-right').'</a>';
 }
 echo '</nav>';contentEnd();
}
