<?php
function journalHome(): void {global $repo;$date=$_GET['date']??$repo->now()->format('Y-m-d');if(!validDate($date))$date=$repo->now()->format('Y-m-d');$dt=new DateTimeImmutable($date);$month=$dt->format('Y-m');$rows=array_values(array_filter($repo->mine('journals'),fn($j)=>str_starts_with($j['tradeDate'],$month)&&$j['draftStatus']==='complete'));$days=count(array_unique(array_column($rows,'tradeDate')));$goal=$repo->all('goals')[$_SESSION['member']??''][$month]??null;$daily=array_values(array_filter($repo->mine('journals'),fn($j)=>$j['tradeDate']===$date));$week=$dt->modify('monday this week');$allDays=array_column($repo->mine('journals'),'tradeDate');?>
<div class="journal-home">
<div class="content-section" data-section-inset><div class="card card--group"><section class="journal-summary" aria-labelledby="journal-summary-title">
 <div class="journal-month-heading"><div class="journal-date-picker" data-datepicker data-journal-date data-record-dates="<?=e(json_encode(array_values(array_unique($allDays))))?>"><div class="date-picker__control"><label class="sr-only" for="journal-date">기록 날짜</label><input class="sr-only" id="journal-date" type="date" value="<?=e($date)?>" required tabindex="-1" aria-hidden="true"><h1 id="journal-summary-title" class="type-headline-1"><button type="button" class="text-button px-0" data-journal-month aria-label="<?=$dt->format('Y년 n월')?>, 월 선택" aria-haspopup="dialog" aria-expanded="false"><?=icon('calendar-days')?><?=$dt->format('Y년 n월')?></button></h1></div></div><a href="/journal/analysis" class="button button--neutral" aria-label="월간 분석"><?=icon('chart-no-axes-combined')?>분석</a></div>
 <dl class="journal-metrics journal-metrics--summary"><div class="journal-metric"><dt class="type-label-2 muted">기록한 날</dt><dd><strong class="type-fixed-title-1"><?=$days?><span class="type-body-2 weight-medium muted">일</span></strong></dd></div><div class="journal-metric"><dt class="type-label-2 muted">작성한 일지</dt><dd><strong class="type-fixed-title-1"><?=count($rows)?><span class="type-body-2 weight-medium muted">건</span></strong></dd></div></dl>
 <div class="journal-goal"><div class="goal-caption"><div class="journal-goal-copy"><span class="type-caption-1 muted">이번 달 기록 목표</span><strong class="type-label-1"><?=$goal?$goal.'일 중 '.$days.'일 완료':'작은 목표부터 시작해요'?></strong></div><button class="button button--weak" data-open="goal-sheet" aria-haspopup="dialog"><?=$goal?'목표 수정':'목표 설정'?></button></div>
 <?php if($goal):?><div class="progress-bar" data-goal-progress="<?=min($days/$goal,1)?>" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="<?=round(min($days/$goal,1)*100)?>" aria-label="이번 달 기록 목표 <?=$goal?>일 중 <?=$days?>일 완료"><span class="progress-bar__fill"></span></div><?php endif;?></div>
</section></div></div>
<div class="journal-timeline">
<section class="journal-calendar" aria-labelledby="journal-calendar-title">
 <div class="content-section" data-section-inset><div class="journal-calendar-heading"><h2 id="journal-calendar-title" class="type-headline-1">주간 기록</h2><div class="journal-calendar-actions"><a class="icon-button" href="/journal?date=<?=$dt->modify('-7 days')->format('Y-m-d')?>" aria-label="이전 주"><?=icon('chevron-left')?></a><button class="icon-button" data-journal-calendar aria-haspopup="dialog" aria-expanded="false" aria-label="월간 달력 열기"><?=icon('calendar-days')?></button><a href="/journal" class="button button--outline button--sm">오늘</a><a class="icon-button" href="/journal?date=<?=$dt->modify('+7 days')->format('Y-m-d')?>" aria-label="다음 주"><?=icon('chevron-right')?></a></div></div></div>
 <?php carouselStart('week','주간 투자 캘린더',3);for($offset=-1;$offset<=1;$offset++):$slideWeek=$week->modify(($offset*7).' days');$weekDate=$dt->modify(($offset*7).' days')->format('Y-m-d');?><div class="swiper-slide" data-week-url="/journal?date=<?=$weekDate?>"><table class="calendar__grid" role="grid" aria-label="주간 날짜 선택"><thead><tr><?php $weekNames=['월','화','수','목','금','토','일'];foreach($weekNames as $name)echo '<th scope="col">'.$name.'</th>';?></tr></thead><tbody><tr><?php for($i=0;$i<7;$i++):$d=$slideWeek->modify('+'.$i.' days');$key=$d->format('Y-m-d');$has=in_array($key,$allDays);?><td role="gridcell" aria-selected="<?=$key===$date?'true':'false'?>"><div class="week-day"><button type="button" class="calendar__day" data-journal-day="<?=$key?>" aria-label="<?=$d->format('j')?>, <?=$d->format('n월 j일')?><?=$has?', 기록 있음':''?>" <?=$key===$repo->now()->format('Y-m-d')?'aria-current="date"':''?>><?=$d->format('j')?></button><i class="record-dot" <?=$has?'':'data-empty'?> aria-hidden="true"></i></div></td><?php endfor;?></tr></tbody></table></div><?php endfor;carouselEnd(1); ?>

</section>
<hr>
<section data-day-content><?php sectionHead($date===$repo->now()->format('Y-m-d')?'오늘의 기록':$dt->format('n월 j일').'의 기록','/journal/entries',count($daily).'건');if(!$daily)emptyState('아직 남긴 기록이 없어요','오늘의 판단을 짧게라도 기록해 보세요.','notebook-pen');else {foreach($daily as $j)journalRow($j);}?></section>
</div>
<div class="content-section" data-section-inset><div class="journal-compose"><a class="button button--full" href="/journal/entries/new?date=<?=e($date)?>"><?=icon('plus')?> 매매 기록하기</a><p class="center gap-8 type-caption-1 muted--on-alternative"><?=icon('lock-keyhole')?> 나의 매매일지는 나만 볼 수 있어요</p></div></div>

</div>
<?php sheetStart('goal-sheet','작은 목표부터 시작해요');?><p class="type-body-2 muted mb-16"><?=$dt->format('n월')?>은 1~<?=$dt->format('t')?>일로 설정할 수 있어요. 임시 저장은 집계에서 제외해요.</p><?php formStart('save_goal',['return'=>'/journal?date='.$date,'month'=>$month],'id="goal-form" class="stack"');echo field('target','이번 달 목표 기록 일수',$goal??12,'number',['min'=>1,'max'=>(int)$dt->format('t'),'required'=>'required']);?></form><?php sheetEnd('<button type="submit" class="button" form="goal-form">기록 목표 저장</button>');}
function journalList(): void {global $repo;pageTitle('나의 투자 기록','숫자 뒤에 있는 생각을 돌아봐요.');?><div class="content-section" data-section-inset><div class="between mb-16"><span class="type-label-2 muted--on-alternative"><?=e(($_GET['date']??'')?:'모든 날짜')?> · <?=e(['buy'=>'매수','sell'=>'매도'][$_GET['side']??'']??'전체 거래')?></span><button class="button button--outline button--sm" data-open="journal-filter" aria-haspopup="dialog"><?=icon('sliders-horizontal')?> 검색·필터</button></div></div><?php sheetStart('journal-filter','기록 검색·필터'); ?><form id="journal-filter-form" class="stack"><label class="input-wrap"><input class="input" name="q" placeholder="종목명 또는 메모 검색" value="<?=e($_GET['q']??'')?>" aria-label="일지 검색"><button class="icon-button" aria-label="검색 실행"><?=icon('arrow-right')?></button></label><div class="filter-grid"><div class="full-span"><?=field('date','거래일',$_GET['date']??'','date')?></div><?=selectField('side','거래 구분',[''=>'전체','buy'=>'매수','sell'=>'매도'],$_GET['side']??'')?><?=selectField('market','시장',[''=>'전체 시장','KR'=>'국내주식'],$_GET['market']??'')?></div></form><?php sheetEnd('<a class="button button--neutral" href="/journal/entries">필터 해제</a><button type="submit" class="button" form="journal-filter-form">기록 찾기</button>',true); ?><?php $rows=filtered($repo->mine('journals'),['stockName','reason']);$rows=array_values(array_filter($rows,fn($j)=>(!($_GET['date']??'')||$j['tradeDate']===$_GET['date'])&&(!($_GET['side']??'')||$j['side']===$_GET['side'])&&(!($_GET['market']??'')||$j['market']===$_GET['market'])));[$items,$p,$ps]=paginate($rows,6);echo '<section class="group-section"><div class="card card--group">';$last='';foreach($items as $j){if($last!==$j['tradeDate'])sectionHead(dateLabel($j['tradeDate'],'n월 j일'));journalRow($j);$last=$j['tradeDate'];}if(!$items)emptyState('기록이 없어요','조건을 바꾸거나 새로운 기록을 남겨보세요.','notebook-pen');echo '</div></section>';pagination($p,$ps,true);contentStart();echo '<a href="/journal/entries/new" class="button button--full">'.icon('plus').' 매매 기록하기</a>';contentEnd();}
function journalForm(string $id=''): void {global $repo,$old;$j=$id?$repo->find('journals',$id):[];if($id&&(!$j||$j['memberId']!==($_SESSION['member']??''))){notFound();return;}$j=array_merge(['tradeDate'=>$_GET['date']??$repo->now()->format('Y-m-d'),'market'=>'KR','stockName'=>'','side'=>'buy','quantity'=>'','unitPrice'=>'','fee'=>0,'tax'=>0],$j??[],$old);$checklist=$j['checklistSnapshot']??array_filter($repo->all('checklist'),fn($c)=>$c['enabled']);?>
<div class="content-section" data-section-inset><div class="wizard-progress"><span id="step-label">기본 거래</span><span><b id="step-number">1</b> / 5</span><div class="progress-bar progress-bar--light w-full" id="step-progress" role="progressbar" aria-label="일지 작성 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="20"><span class="progress-bar__fill"></span></div></div></div>
<?php contentStart();formStart('save_journal',['id'=>$id],'id="journal-form"  data-dirty-form novalidate'); ?>
<section data-step="0"><div class="page-title"><h1 class="type-fixed-title-2">어떤 거래를<br>기록할까요?</h1><p>먼저 기본 거래 정보를 알려주세요.</p></div><div class="segmented mb-16" role="group" aria-label="거래 구분"><?php foreach(['buy'=>'매수 기록','sell'=>'매도·청산 기록'] as $v=>$l):?><label class="segmented__item segmented__item--<?=journalTone($v)?>"><input type="radio" name="side" value="<?=$v?>" <?=$j['side']===$v?'checked':''?>><span><?=$l?></span></label><?php endforeach;?></div><div class="stack"><?=field('tradeDate','거래일',$j['tradeDate'],'date',['required'=>'required'])?><?=hidden('market','KR')?><p class="type-label-2 muted">국내주식 · 원화 기준</p><?=field('stockName','종목명',$j['stockName'],'text',['required'=>'required','placeholder'=>'예: 삼성전자','maxlength'=>80])?><?=field('symbol','종목 코드 (선택)',$j['symbol']??'','text',['placeholder'=>'예: 005930'])?><div class="form-grid"><?=field('unitPrice','거래 단가 (원)',$j['unitPrice'],'number',['min'=>'0.01','step'=>'any','required'=>'required','inputmode'=>'decimal'])?><?=field('quantity','수량 (주)',$j['quantity'],'number',['min'=>'0.0001','step'=>'any','required'=>'required','inputmode'=>'decimal'])?></div><div class="box row between"><span>총 거래금액</span><strong id="trade-total" class="text-<?=journalTone($j['side'])?>">0원</strong><small>단가 × 수량 · 손익이 아닌 거래금액이에요</small></div><details class="accordion"><summary>수수료·거래세 입력 (선택)</summary><div class="accordion__body"><div class="form-grid"><?=field('fee','수수료 (원)',$j['fee'],'number',['min'=>0])?><?=field('tax','거래세 (원)',$j['tax'],'number',['min'=>0])?></div></div></details></div></section>
<section data-step="1" hidden><div class="page-title"><h1 class="type-fixed-title-2">나의 기준을<br>점검해 볼까요?</h1><p>확인한 항목만 기록해도 괜찮아요.</p></div><div class="box type-label-1 text-center mb-16" id="check-summary" aria-live="polite">0/6 충족 · 0/6 점검 완료</div><?php foreach($checklist as $i=>$c):$ans=$j['checklistAnswers'][$c['id']]??'unreviewed';?><div class="check-row"><details class="accordion accordion--compact"><summary><span><?=e($c['title'])?></span></summary><div class="accordion__body"><p><?=e($c['help'])?></p></div></details><div class="segmented segmented--small mt-8" role="group" aria-label="<?=e($c['title'])?>"><?php foreach(['unreviewed'=>'미점검','yes'=>'충족','no'=>'미충족'] as $v=>$l):?><label class="segmented__item"><input type="radio" name="checklistAnswers[<?=e($c['id'])?>]" value="<?=$v?>" <?=$ans===$v?'checked':''?>><span><?=$l?></span></label><?php endforeach;?></div></div><?php endforeach;?><p class="help">체크 결과는 나의 기준을 점검하는 기록이며 투자 추천 점수가 아니에요.</p></section>
<section data-step="2" hidden><div class="page-title"><h1 class="type-fixed-title-2">추세와 리스크를<br>차분히 살펴봐요</h1><p>선택 항목은 건너뛰어도 괜찮아요.</p></div><h2 class="type-headline-1 mt-24 mb-16">이평선 추세</h2><div class="journal-trends"><?php foreach([5,10,20,60,120,224,448] as $day):?><div class="journal-trend-row"><span class="type-label-2"><?=$day?>일선</span><div class="segmented segmented--small" role="group" aria-label="<?=$day?>일선 추세"><?php foreach(['unreviewed'=>'미점검','up'=>'상승','down'=>'하락','flat'=>'횡보'] as $v=>$label):?><label class="segmented__item <?=journalTone($v)?'segmented__item--'.journalTone($v):''?>"><input type="radio" name="trendChecks[<?=$day?>]" value="<?=$v?>" <?=($j['trendChecks'][$day]??'unreviewed')===$v?'checked':''?>><span><?=$label?></span></label><?php endforeach;?></div></div><?php endforeach;?></div><h2 class="type-headline-1 mt-24 mb-16">리스크 관리</h2><div class="stack"><div class="form-grid"><?=field('targetPrice','목표가 (원)',$j['targetPrice']??'','number',['min'=>0])?><?=field('stopLossPrice','손절선 (원)',$j['stopLossPrice']??'','number',['min'=>0])?></div><?=field('supportNote','지지선 메모',$j['supportNote']??'')?><?=field('resistanceNote','저항선 메모',$j['resistanceNote']??'')?></div></section>
<section data-step="3" hidden><div class="page-title"><h1 class="type-fixed-title-2">그때의 생각을<br>짧게 남겨보세요</h1><p>미래의 내가 다시 읽어볼 이야기예요.</p></div><div class="stack"><?=field('reason','매매 이유',$j['reason']??'','textarea',['placeholder'=>'어떤 기준으로 결정했나요?'])?><div data-sell-field><?=field('sellReview','매도·청산 근거',$j['sellReview']??'','textarea')?></div><?=field('reflection','복기 메모',$j['reflection']??'','textarea',['placeholder'=>'잘한 점, 다음에 바꾸고 싶은 점'])?><?=selectField('emotion','거래할 때의 감정',[''=>'선택 안 함','차분함'=>'차분함','기대감'=>'기대감','조급함'=>'조급함','아쉬움'=>'아쉬움'],$j['emotion']??'')?><details class="accordion"><summary>장중 대응과 시장 메모</summary><div class="accordion__body"><div class="stack"><?=field('intraday','장중 대응',$j['intraday']??'','textarea')?><?=field('volumeNote','5분봉·거래량',$j['volumeNote']??'','textarea')?><?=field('indexNote','지수 연동',$j['indexNote']??'','textarea')?></div></div></details><div class="field"><label class="label" for="journal-images">이미지 미리보기 (선택)</label><input class="input" id="journal-images" type="file" accept="image/png,image/jpeg,image/webp" multiple><span class="help">최대 4장 · 이미지당 2MB 이하 · 이 화면에서만 미리보며 서버에는 업로드하지 않아요.</span><div id="image-previews" class="image-previews"></div></div></div></section>
<section data-step="4" hidden><div class="page-title"><h1 class="type-fixed-title-2">오늘의 기록을<br>저장할 준비가 됐어요</h1><p>입력한 내용을 한 번 더 확인해 주세요.</p></div><div id="journal-confirm" class="journal-confirm"></div><div class="row gap-16 my-24"><?=icon('lock-keyhole')?><div><strong>나만 볼 수 있는 비공개 일지</strong><p>커뮤니티 공유는 저장 후 공개할 항목을 직접 고를 수 있어요.</p></div></div></section>
<div class="bottom-cta bottom-cta--fixed bottom-cta--app bottom-cta--double bottom-cta--fade" data-cta-space data-above-keyboard>
 <div class="bottom-cta__tools">
  <button type="button" class="text-button px-0" id="step-prev" hidden><?=icon('chevron-left')?>이전</button>
  <button type="button" class="text-button px-0" id="step-skip" hidden>이 단계 건너뛰기</button>
 </div>
 <div class="bottom-cta__buttons">
  <button type="submit" name="saveAs" value="draft" class="button button--neutral" formnovalidate>임시 저장</button>
  <button type="button" class="button bottom-cta__primary" id="step-next">다음</button>
  <button type="submit" class="button bottom-cta__primary" name="saveAs" value="complete" id="journal-submit" hidden>일지 저장</button>
 </div>
</div></form><?php contentEnd(); }
function journalDetail(string $id): void {
 global $repo;
 $j=$repo->find('journals',$id);
 if(!$j||$j['memberId']!==($_SESSION['member']??'')){notFound();return;}
 $total=$j['unitPrice']*$j['quantity'];
 $cost=$j['fee']+$j['tax'];
 $tone=$j['draftStatus']==='draft'?'neutral':journalTone($j['side']);
 $color=$tone==='neutral'?'':'text-'.$tone;
 $answers=$j['checklistAnswers']??[];
 $yes=count(array_filter($answers,fn($v)=>$v==='yes'));
 $done=count(array_filter($answers,fn($v)=>$v!=='unreviewed'));
 $checks=count($answers);
 $notes=[];
 foreach(['reason'=>'매매 이유','reflection'=>'복기 메모','sellReview'=>'매도 근거','intraday'=>'장중 대응','volumeNote'=>'5분봉·거래량','indexNote'=>'지수 연동','emotion'=>'감정'] as $key=>$label)if($j[$key]??'')$notes[$key]=$label;
 ?>
 <article class="journal-detail">
  <section class="group-section"><div class="card card--group"><div class="journal-detail-summary">
   <header class="journal-detail-heading">
    <div class="content-item-heading"><?=badge($j['draftStatus']==='draft'?'임시 저장':($j['side']==='buy'?'매수 기록':'매도 기록'),$tone)?><div class="row gap-8"><span class="type-label-2 muted"><?=dateLabel($j['tradeDate'],'Y.m.d')?></span><?=contentActionsButton('journal-actions','기록 더 보기')?></div></div>
    <div><h1 class="type-fixed-title-2 weight-bold"><?=e($j['stockName']?:'작성 중인 일지')?></h1><p class="type-label-2 muted"><?=e(implode(' · ',array_filter(['국내주식',$j['side']==='buy'?'매수':'매도',trim($j['symbol']??'')],fn($value)=>$value!=='')))?></p></div>
   </header>
   <div class="journal-detail-amount"><span class="type-label-2 muted">총 거래금액</span><strong class="type-fixed-title-1 journal-detail-number <?=$color?>"><?=number_format($total)?><span class="type-body-1 weight-medium">원</span></strong><p class="type-label-2 muted"><?=money($j['unitPrice'])?> × <?=number_format($j['quantity'])?>주</p></div>
   <dl class="journal-detail-facts">
    <div class="journal-detail-fact"><dt class="type-label-1 muted">수수료 + 거래세</dt><dd class="type-body-2 journal-detail-numeric"><?=money($cost)?></dd></div>
    <div class="journal-detail-fact"><dt class="type-label-1 muted"><?=$j['side']==='buy'?'매수 지출액':'매도 수령액'?></dt><dd class="type-body-1 weight-semibold journal-detail-numeric <?=$color?>"><?=money($j['side']==='buy'?$total+$cost:$total-$cost)?></dd></div>
   </dl>
   <p class="type-caption-1 muted">거래금액과 지출·수령액은 실현 손익이 아닙니다.</p>
  </div></div></section>
  <?php if($notes):?><section class="group-section"><div class="card card--group"><div class="journal-detail-fold">
   <details class="accordion" open><summary><h2 class="type-headline-1 weight-bold">이유와 복기</h2></summary><div class="accordion__body"><dl class="journal-reflection-list">
    <?php foreach($notes as $key=>$label):?><div class="journal-reflection-item"><dt class="type-label-2 weight-semibold muted"><?=e($label)?></dt><dd><?php if($key==='emotion')echo badge($j[$key],'neutral');else echo '<div class="post post--flush type-body-2">'.proseParagraphs($j[$key]).'</div>';?></dd></div><?php endforeach;?>
   </dl></div></details>
  </div></div></section><?php endif;?>
  <section class="group-section"><div class="card card--group">
   <?php sectionHead('나의 기준 점검'); ?>
   <div class="journal-review-overview">
    <dl class="journal-metrics journal-metrics--summary">
     <div class="journal-metric"><dt class="type-label-2 muted">충족</dt><dd><strong class="type-fixed-title-2 journal-detail-number"><?=$yes?><span class="type-body-2 weight-medium muted">/ <?=$checks?></span></strong></dd></div>
     <div class="journal-metric"><dt class="type-label-2 muted">점검 완료</dt><dd><strong class="type-fixed-title-2 journal-detail-number"><?=$done?><span class="type-body-2 weight-medium muted">/ <?=$checks?></span></strong></dd></div>
    </dl>
    <?php if($checks):?><progress class="progress progress--bold w-full" value="<?=$done?>" max="<?=$checks?>" aria-label="기준 점검 완료" aria-valuetext="<?=$checks?>개 중 <?=$done?>개 점검 완료"></progress><?php endif;?>
   </div>
   <ul class="journal-checklist"><?php foreach($j['checklistSnapshot'] as $c):$answer=$answers[$c['id']]??'unreviewed';?><li class="journal-checklist-item"><span class="type-body-2"><?=e($c['title'])?></span><?=badge(['yes'=>'충족','no'=>'미충족','unreviewed'=>'미점검'][$answer],$answer==='yes'?'green':'neutral')?></li><?php endforeach;?></ul>
  </div></section>
  <section class="group-section"><div class="card card--group"><div class="journal-detail-fold">
   <details class="accordion"><summary><h2 class="type-headline-1 weight-bold">이평선 추세</h2></summary><div class="accordion__body"><dl class="journal-trend-grid"><?php foreach($j['trendChecks'] as $days=>$value):$trendTone=journalTone($value);?><div class="journal-trend-cell"><dt class="type-caption-1 muted"><?=$days?>일선</dt><dd class="type-label-1 weight-semibold <?=$trendTone?'text-'.$trendTone:''?>"><?=e(['up'=>'상승','down'=>'하락','flat'=>'횡보','unreviewed'=>'미점검'][$value])?></dd></div><?php endforeach;?></dl></div></details>
   <details class="accordion"><summary><h2 class="type-headline-1 weight-bold">리스크 관리</h2></summary><div class="accordion__body"><dl class="journal-detail-risk"><?php foreach(['targetPrice'=>'목표가','stopLossPrice'=>'손절선','supportNote'=>'지지선','resistanceNote'=>'저항선'] as $key=>$label):?><div class="journal-detail-fact"><dt class="type-label-1 muted"><?=$label?></dt><dd class="type-body-2"><?=e($j[$key]?:'기록하지 않음')?></dd></div><?php endforeach;?></dl></div></details>
  </div></div></section>
  <div class="content-section" data-section-inset><p class="center gap-8 type-caption-1 muted"><?=icon('lock-keyhole')?> 비공개 · 템플릿 v<?=$j['checklistTemplateVersion']?></p></div>
 </article>
 <div class="bottom-cta bottom-cta--fixed bottom-cta--app bottom-cta--fade" data-cta-space data-above-keyboard><a href="/journal/entries/<?=e($id)?>/share" class="button button--neutral button--full">복기 공유</a></div>
 <?php contentActionsSheet('journal-actions','기록 관리',[
  ['label'=>'기록 수정','icon'=>'pencil','href'=>'/journal/entries/'.$id.'/edit'],
  ['label'=>'기록 삭제','icon'=>'trash','danger'=>true,'action'=>'delete_journal','data'=>['id'=>$id],'confirm'=>'이 매매 기록을 삭제할까요? 삭제 후 되돌릴 수 있어요.']
 ]);
}
function journalAnalysis(): void {
 global $repo;
 $month=$_GET['month']??$repo->now()->format('Y-m');
 if(!validDate($month.'-01'))$month=$repo->now()->format('Y-m');
 $rows=array_values(array_filter($repo->mine('journals'),fn($j)=>str_starts_with($j['tradeDate'],$month)&&$j['draftStatus']==='complete'));
 $total=count($rows);
 $days=count(array_unique(array_column($rows,'tradeDate')));
 $buys=count(array_filter($rows,fn($j)=>$j['side']==='buy'));
 $sells=count(array_filter($rows,fn($j)=>$j['side']==='sell'));
 $counts=array_count_values(array_column($rows,'stockName'));
 arsort($counts);
 pageTitle('월간 기록 분석','최종 저장한 일지만 집계해요. 임시 저장은 제외해요.');
 ?>
 <section class="group-section"><div class="card card--group">
  <form class="analysis-period" action="/journal/analysis" aria-label="분석 기간 선택">
   <?=field('month','분석 월',$month,'month')?>
   <button class="button button--neutral">기간 적용</button>
  </form>
  <div class="analysis-summary">
   <dl class="journal-metrics journal-metrics--summary">
    <div class="journal-metric"><dt class="type-label-2 muted">이번 달 작성한 일지</dt><dd><strong class="type-fixed-title-1 analysis-value"><?=$total?><span class="type-body-2 weight-medium muted">건</span></strong></dd></div>
    <div class="journal-metric"><dt class="type-label-2 muted">기록한 날</dt><dd><strong class="type-fixed-title-1 analysis-value"><?=$days?><span class="type-body-2 weight-medium muted">일</span></strong></dd></div>
   </dl>
   <div class="analysis-trades">
    <dl class="analysis-trade-counts">
     <div class="analysis-trade-stat"><dt class="analysis-trade-name text-financial-up"><i class="analysis-trade-dot" aria-hidden="true"></i>매수 기록</dt><dd class="analysis-count weight-semibold text-financial-up"><?=$buys?>건</dd></div>
     <div class="analysis-trade-stat"><dt class="analysis-trade-name text-financial-down"><i class="analysis-trade-dot" aria-hidden="true"></i>매도 기록</dt><dd class="analysis-count weight-semibold text-financial-down"><?=$sells?>건</dd></div>
    </dl>
    <?php if($total):?><progress class="progress progress--bold progress--trades w-full" value="<?=$buys?>" max="<?=$total?>" aria-label="매수·매도 기록 비중" aria-valuetext="매수 <?=$buys?>건, 매도 <?=$sells?>건"></progress><?php endif;?>
   </div>
  </div>
  <div class="card__footer"><a class="text-button" href="/journal/entries">나의 일지 보기 <?=icon('chevron-right')?></a></div>
 </div></section>
 <section class="group-section"><div class="card card--group">
  <?php sectionHead('어떤 종목을 기록했나요?'); ?>
  <?php if($rows):?><ul class="analysis-stock-list">
   <?php foreach($counts as $name=>$count):?><li class="analysis-stock-row">
    <span class="type-body-2 weight-medium"><?=e($name)?></span><strong class="analysis-count type-label-1 text-brand"><?=$count?>건</strong>
    <progress class="progress progress--bold analysis-stock-bar" value="<?=$count?>" max="<?=$total?>" aria-label="<?=e($name)?> <?=$count?>건" aria-valuetext="전체 <?=$total?>건 중 <?=$count?>건"></progress>
   </li><?php endforeach;?>
  </ul><?php else: emptyState('아직 분석할 기록이 없어요','일지를 남기면 기록 습관을 함께 살펴볼 수 있어요.','chart-no-axes-combined'); endif;?>
 </div></section>
 <div class="content-section" data-section-inset><details class="accordion type-label-2">
  <summary>손익을 계산할 기록이 없어요</summary>
  <div class="accordion__body"><p>현재는 거래별 금액을 기록해요. 매입원가와 부분매도 연결 기준이 정해지면 실현 손익을 계산할 수 있어요.</p></div>
 </details></div>
 <?php
}
function shareJournal(string $id): void {global $repo;$j=$repo->find('journals',$id);if(!$j||$j['memberId']!==($_SESSION['member']??'')){notFound();return;}pageTitle('공유할 이야기만 골라요','원본 일지와 거래금액은 비공개로 유지돼요.');contentStart();formStart('save_post',['sourceJournalId'=>$id,'topic'=>'주식·재테크'],'class="stack" data-dirty-form id="share-form"');echo field('title','게시글 제목','','text',['required'=>'required']);echo field('body','함께 나눌 이야기','','textarea',['required'=>'required']);foreach(['includeStock'=>['종목명',$j['stockName']],'includeReason'=>['매매 이유',$j['reason']],'includeReflection'=>['복기 메모',$j['reflection']]] as $key=>[$label,$text]):?><label class="checkbox"><input type="checkbox" name="<?=$key?>" value="1" data-preview-text="<?=e($label.': '.$text)?>"><span><?=$label?> 포함<small><?=e($text?:'작성한 내용 없음')?></small></span></label><?php endforeach;?><details class="accordion" open><summary>공개 내용 미리보기</summary><div class="accordion__body"><div id="share-preview" class="post post--flush">선택한 항목과 직접 작성한 이야기만 공개됩니다.</div></div></details><div class="bottom-cta bottom-cta--fixed bottom-cta--app" data-cta-space data-above-keyboard><button class="button button--full">선택한 내용으로 게시</button></div></form><?php contentEnd(); }
