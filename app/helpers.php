<?php
declare(strict_types=1);
// mbstring is optional on the portable Windows PHP runtime.
if(!function_exists('mb_strtolower')) { function mb_strtolower(string $s): string {return strtolower($s);} }
if(!function_exists('mb_substr')) { function mb_substr(string $s,int $start,?int $length=null): string {return iconv_substr($s,$start,$length,'UTF-8');} }
function e(mixed $v): string { return htmlspecialchars((string)($v??''), ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
function assetUrl(string $path): string { $file=dirname(APP_PATH).'/public'.$path;return is_file($file)?$path.'?v='.substr(hash_file('sha256',$file),0,12):$path; }
function icon(string $name,string $class=''): string { if(!preg_match('/^[a-z0-9-]+$/',$name)) $name='circle-alert'; $p=dirname(APP_PATH).'/public/assets/icons/'.$name.'.svg'; if(!is_file($p)) $p=dirname(APP_PATH).'/public/assets/icons/circle-alert.svg'; return preg_replace('/<svg\b/', '<svg aria-hidden="true" class="icon '.e($class).'"',file_get_contents($p),1); }
function money(float|int $v): string { return number_format($v).'원'; }
function validDate(string $s): bool {$d=DateTimeImmutable::createFromFormat('!Y-m-d',$s);return (bool)preg_match('/^\d{4}-\d{2}-\d{2}$/',$s) && $d && $d->format('Y-m-d')===$s;}
function dateLabel(string $date,string $format='n월 j일'): string { try {return (new DateTimeImmutable($date))->format($format);} catch(Throwable) {return '날짜 없음';} }
/** D-day counts local calendar dates, not remaining 24-hour periods. */
function campaignDeadline(array $campaign): string {global $repo;$state=$repo->campaignState($campaign);if($state==='closed')return '모집 종료';if($state==='upcoming')return dateLabel($campaign['recruitmentStartAt'],'n.j').' 모집 시작';$zone=new DateTimeZone('Asia/Seoul');$today=$repo->now()->setTimezone($zone)->setTime(0,0);$end=(new DateTimeImmutable($campaign['recruitmentEndAt']))->setTimezone($zone)->setTime(0,0);$days=(int)$today->diff($end)->format('%r%a');return $days===0?'오늘 마감':'D-'.$days;}
function redirect(string $url): never { if(!str_starts_with($url,'/') || str_starts_with($url,'//') || preg_match('/[\r\n]/',$url)) $url='/finance'; if(!empty($_POST['_requestKey'])&&empty($GLOBALS['formFailed'])){$_SESSION['requests'][$_POST['_requestKey']]=$url;$_SESSION['requests']=array_slice($_SESSION['requests'],-200,null,true);}header('Location: '.$url, true,303); exit; }
function flash(string $message): void { $_SESSION['flash']=$message; }
function csrf(): string { return hidden('_requestKey',bin2hex(random_bytes(16))).'<input type="hidden" name="csrf" value="'.e($_SESSION['csrf']).'">'; }
function hidden(string $name,mixed $value): string {return '<input type="hidden" name="'.e($name).'" value="'.e($value).'">';}
function formContextMatches(): bool {global $old;return !isset($old['action'],$GLOBALS['formAction'])||$old['action']===$GLOBALS['formAction'];}
function oldValue(string $name,mixed $fallback): mixed {global $old;if(!formContextMatches())return $fallback;$parts=preg_split('/\[|\]/',$name,-1,PREG_SPLIT_NO_EMPTY);$value=$old;foreach($parts as $part){if(!is_array($value)||!array_key_exists($part,$value))return $fallback;$value=$value[$part];}return $value;}
function fieldId(string $name): string {static $used=[];$base='f-'.preg_replace('/[^a-z0-9-]/i','-',$name);$used[$base]=($used[$base]??0)+1;return $base.($used[$base]>1?'-'.$used[$base]:'');}
function actionForm(string $action,array $data,string $label,string $class='button button--weak',string $confirm='',array $attrs=[]): string { $class.=str_starts_with($class,'button')&&!str_contains($class,'button--full')?' button--full':''; $s='<form method="post" action="/actions" class="action-form"'.($confirm?' data-app-confirm="'.e($confirm).'"':'').'>'.csrf().hidden('action',$action);foreach($data as $k=>$v)$s.=hidden($k,$v);$extra='';foreach($attrs as $k=>$v)$extra.=' '.e($k).'="'.e($v).'"';return $s.'<button class="'.e($class).'" type="submit"'.$extra.'>'.$label.'</button></form>'; }
function field(string $name,string $label,mixed $value='',string $type='text',array $attrs=[]): string {
 global $errors,$old;$value=oldValue($name,$value);$id=fieldId($name);$extra='';
 foreach($attrs as $k=>$v)$extra.=' '.e($k).'="'.e($v).'"';
 $err=formContextMatches()?($errors[$name]??''):'';
 $picker=match($type){'date'=>' data-datepicker','month'=>' data-month-picker','datetime-local'=>' data-datetime-picker',default=>''};
 $s='<div class="field"'.$picker.'><label class="label" for="'.$id.'">'.e($label).'</label>';
 $a=' id="'.$id.'" name="'.e($name).'" aria-describedby="'.$id.'-help" aria-invalid="'.($err?'true':'false').'"'.$extra;
 if($type==='textarea')$s.='<textarea class="textarea"'.$a.'>'.e($value).'</textarea>';
 else {$input='<input class="input" type="'.e($type).'" value="'.e($value).'"'.$a.'>';$s.=$type==='date'?'<div class="date-picker__control">'.$input.'</div>':$input;}
 return $s.'<span id="'.$id.'-help" class="help'.($err?' help--error':'').'" data-field-error>'.e($err).'</span></div>';
}
function selectField(string $name,string $label,array $options,mixed $value='',array $attrs=[]): string {global $errors;$value=oldValue($name,$value);$id=fieldId($name);$err=formContextMatches()?($errors[$name]??''):'';$s='<div class="field"><label class="label" for="'.$id.'">'.e($label).'</label><select class="select" id="'.$id.'" name="'.e($name).'" aria-describedby="'.$id.'-help" aria-invalid="'.($err?'true':'false').'"';foreach($attrs as $k=>$v)$s.=' '.e($k).'="'.e($v).'"';$s.='>';foreach($options as $k=>$v)$s.='<option value="'.e($k).'"'.((string)$value===(string)$k?' selected':'').'>'.e($v).'</option>';return $s.'</select><span id="'.$id.'-help" class="help'.($err?' help--error':'').'" data-field-error>'.e($err).'</span></div>';}

function badge(string $label,string $tone='rose',bool $weak=false): string {$variant=match($tone){'brand-strong'=>' badge--brand-strong','neutral'=>' badge--neutral','green'=>' badge--success','financial-up'=>' badge--financial-up','financial-down'=>' badge--financial-down',default=>''};return '<span class="badge badge--small'.$variant.($weak?' badge--weak':'').'">'.e($label).'</span>';}
function journalTone(string $direction): string {return match($direction){'buy','up'=>'financial-up','sell','down'=>'financial-down',default=>''};}
function emptyState(string $title,string $text,string $symbol='inbox',string $action=''): void { echo '<div class="result"><span class="result__icon">'.icon($symbol).'</span><h3 class="type-headline-2">'.e($title).'</h3><p>'.e($text).'</p>'.$action.'</div>'; }
function sectionHead(string $title,string $href='',string $label='전체 보기'): void {echo '<div class="list-header"><h2 class="list-header__title">'.e($title).'</h2>'.($href?'<a class="text-button" href="'.e($href).'">'.e($label).icon('chevron-right').'</a>':'').'</div>';}
function menuRow(string $href,string $label,string $symbol,string $sub='',bool $accentSub=true): string {return '<a class="list-row" href="'.e($href).'">'.icon($symbol).'<span class="list-row__body"><span class="list-row__title">'.e($label).'</span></span>'.($sub?'<small class="list-row__right'.($accentSub?' text-brand':'').'">'.e($sub).'</small>':'').icon('chevron-right').'</a>';}
/** Only the owned-post list can be used as an alternate editor destination. */
function accountPostsReturn(mixed $url): string {return is_string($url)&&preg_match('#^/mypage/posts(?:\?mode=(?:finance|journal|campaigns))?$#D',$url)?$url:'';}
function sheetStart(string $id,string $title): void {echo '<dialog class="dialog dialog--sheet" id="'.e($id).'" data-lenis-prevent aria-labelledby="'.e($id).'-title"><div class="dialog__header"><h2 id="'.e($id).'-title">'.e($title).'</h2><button class="icon-button" data-close aria-label="닫기">'.icon('x').'</button></div><div class="dialog__body">';}
function sheetEnd(string $actions='',bool $double=false): void {echo '</div>';if($actions!=='')echo '<div class="bottom-cta'.($double?' bottom-cta--double':'').'"><div class="bottom-cta__buttons">'.$actions.'</div></div>';echo '</dialog>';}
function contentActionsButton(string $sheetId,string $label): string {
 return '<button type="button" class="icon-button icon-button--more" data-open="'.e($sheetId).'" aria-controls="'.e($sheetId).'" aria-haspopup="dialog" aria-expanded="false" aria-label="'.e($label).'">'.icon('ellipsis-vertical').'</button>';
}
/** Shared edit/delete sheet for content the current member owns. */
function contentActionsSheet(string $sheetId,string $title,array $items): void {
 sheetStart($sheetId,$title);
 echo '<div class="content-actions-list">';
 foreach($items as $item){
  $class='list-row list-row--action'.(!empty($item['danger'])?' list-row--danger':'');
  $label=icon($item['icon']).'<span class="list-row__body"><span class="list-row__title">'.e($item['label']).'</span></span>';
  if(isset($item['href']))echo '<a class="'.e($class).'" href="'.e($item['href']).'">'.$label.'</a>';
  else echo actionForm($item['action'],$item['data'],$label,$class,$item['confirm']??'');
 }
 echo '</div>';
 sheetEnd();
}
/** Explicit page sections, never a padded wrapper around an entire screen. */
function contentStart(): void {echo '<div class="content-section" data-section-inset>';}
function contentEnd(): void {echo '</div>';}
function pageTitle(string $title,string $sub=''): void {global $isAdmin;if(!$isAdmin)contentStart();echo '<div class="page-title"><h1 class="type-fixed-title-2">'.nl2br(e(str_replace('\\n', PHP_EOL, $title))).'</h1>'.($sub?'<p>'.e($sub).'</p>':'').'</div>';if(!$isAdmin)contentEnd();}
function queryUrl(array $replace=[]): string {global $path; $q=array_merge($_GET,$replace);return $path.'?'.http_build_query(array_filter($q,fn($v)=>$v!==''&&$v!==null));}
function chipSliderStart(string $label='필터'): void {echo '<div class="chip-slider" data-chip-slider role="group" aria-label="'.e($label).'"><div class="chip-slider-window swiper" data-chip-window><div class="chip-slider-track swiper-wrapper" data-chip-track>';}
function chipSliderEnd(): void {echo '</div></div></div>';}
function paginate(array $rows,int $per=8): array {$total=count($rows);$pages=max(1,(int)ceil($total/$per));$page=max(1,min($pages,(int)($_GET['page']??1)));return [array_slice($rows,($page-1)*$per,$per),$page,$pages,$total];}
function pagination(int $page,int $pages,bool $onAlternative=false): void {if($pages<=1)return;echo '<form method="get" class="center my-24">';foreach($_GET as $key=>$value)if($key!=='page'&&is_scalar($value))echo hidden($key,$value);echo '<nav class="pagination'.($onAlternative?' pagination--on-alternative':'').'" aria-label="페이지 선택">';for($i=1;$i<=$pages;$i++)echo '<button type="submit" name="page" value="'.$i.'"'.($i===$page?' aria-current="page"':'').'>'.$i.'</button>';echo '</nav></form>';}
function filtered(array $rows,array $searchFields=['title'],string $statusField='status'): array {
 $q=trim($_GET['q']??'');$status=$_GET['status']??'';
 $rows=array_filter($rows,function($r)use($q,$status,$searchFields,$statusField){$text=implode(' ',array_map(fn($f)=>(string)($r[$f]??''),$searchFields));return (!$q||str_contains(mb_strtolower($text),mb_strtolower($q)))&&(!$status||($r[$statusField]??'')===$status);});
 $date=fn($r)=>strtotime($r['tradeDate']??$r['publishedAt']??$r['createdAt']??$r['exposureStartAt']??'')?:0;
 usort($rows,fn($a,$b)=>$date($b)<=>$date($a));
 if(($_GET['sort']??'newest')==='oldest')$rows=array_reverse($rows);
 return array_values($rows);
}
function categoryName(string $id): string {global $repo; return $repo->find('categories',$id)['name']??$id;}
function appStatus(array $a): string {global $repo;$r=$repo->review($a['id']);return $r ? (['pending'=>'후기 제출','revision'=>'보완 요청','approved'=>'완료','rejected'=>'반려'][$r['reviewStatus']]??'후기 제출') : (['applied'=>'신청 완료','selected'=>'선정','not_selected'=>'미선정','cancelled'=>'취소'][$a['selectionStatus']]??'신청 완료');}
function contentThumb(array $a,string $size=''): string {if(!empty($a['thumbnail'])&&str_starts_with($a['thumbnail'],'/assets/images/'))return '<div class="asset asset--card '.e($size).'"><img src="'.e($a['thumbnail']).'" alt="" loading="lazy"></div>';return '<div class="asset asset--card '.e($size).'">'.icon($a['icon']??'book-open').'</div>';}
function articleRow(array $a): void {
 global $repo;$saved=in_array($a['id'],$repo->all('saved')[$_SESSION['member']??'']??[]);
 echo '<article class="content-list-item"><a class="list-row list-row--lg list-row--flush list-row--content" href="/finance/articles/'.e($a['id']).'"><div class="list-row__body"><span class="row">'.badge(categoryName($a['categoryId'])).'</span><h2 class="list-row__title">'.e($a['title']).'</h2><p class="list-row__description">'.dateLabel($a['publishedAt'],'m.d').' · 3분 읽기</p></div>';
 if(!empty($a['thumbnail'])&&str_starts_with($a['thumbnail'],'/assets/images/'))echo '<img class="list-row__thumbnail" src="'.e($a['thumbnail']).'" alt="" loading="lazy" decoding="async">';
  echo '</a><div class="content-list-item__action"><form method="post" action="/actions">'.csrf().hidden('action','save_article').hidden('id',$a['id']).hidden('return',$_SERVER['REQUEST_URI']).'<button type="submit" class="icon-button icon-button--plain" aria-pressed="'.($saved?'true':'false').'" aria-label="'.($saved?'저장 해제':'글 저장').'">'.icon('bookmark').'</button></form></div></article>';
}
function campaignImage(array $c,string $class=''): string {
 $file='/assets/images/'.$c['image'].'.webp';
 $content=is_file(dirname(APP_PATH).'/public'.$file)?'<img class="campaign-photo" src="'.e($file).'" alt="'.e($c['brand']).' 캠페인 분위기 이미지 · 실제 제품 사진 아님" width="1440" height="1024" loading="lazy" decoding="async">':'<div class="campaign-art" role="img" aria-label="'.e($c['categoryId']).' 체험을 표현한 그래픽 · 제품 사진 아님">'.objectArt($c['image']).'</div>';
 return '<div class="campaign-visual" data-product="'.e($c['image']).'">'.$content.'</div>';
}
function campaignCard(array $c,int $heading=2): void {global $repo;$state=$repo->campaignState($c);
 echo '<a class="card card--product card--interactive" href="/campaigns/'.e($c['id']).'">'.campaignImage($c).'<div class="card__body"><span>'.badge(campaignDeadline($c),$state==='closed'?'neutral':'rose').'</span><h'.$heading.' class="card__title">'.e($c['title']).'</h'.$heading.'><p class="card__benefit">'.e($c['benefit']).'</p><p class="card__meta">'.e($c['channel']).' · <strong class="text-brand">'.$c['capacity'].'</strong>명 모집</p></div></a>';
}

function applicationNext(array $a,array $c): string {global $repo;$r=$repo->review($a['id']);if($r)return match($r['reviewStatus']){'revision'=>'보완 요청 · '.($r['feedback']?:'후기 내용을 보완해 주세요'),'approved'=>'후기 승인 완료 · 참여해 주셔서 감사합니다','rejected'=>'후기 반려 · '.($r['feedback']?:'검토 사유를 확인해 주세요'),default=>'제출 완료 · 운영팀이 검토 중이에요'};return match($a['selectionStatus']){'selected'=>dateLabel($c['reviewDueAt'],'n.j').'까지 후기 제출'.($c['shipping']&&!$a['shipping']?' · 배송 정보 입력 필요':''),'not_selected'=>'이번 체험은 미선정 · 다른 체험을 둘러보세요','cancelled'=>'취소 완료 · 모집 중에는 다시 응모할 수 있어요',default=>dateLabel($c['announcementAt'],'n.j').' 선정 발표 예정'};}

function journalRow(array $j): void { $color=$j['draftStatus']==='draft'?'':'text-'.journalTone($j['side']); ?>
<div class="journal-record"><a class="list-row list-row--record" href="/journal/entries/<?=e($j['id'])?>">
 <span class="avatar"><?=e(mb_substr($j['stockName']?:'기록',0,1))?></span><div class="list-row__body"><span class="type-caption-1 muted">국내주식 · <span class="weight-semibold <?=$color?>"><?=$j['draftStatus']==='draft'?'임시 저장':($j['side']==='buy'?'매수':'매도')?></span></span><h3 class="list-row__title"><?=e($j['stockName']?:'작성 중인 일지')?></h3><p class="list-row__note"><?=e($j['reason']?:'매매 이유를 기록해 보세요')?></p></div><div class="list-row__right"><strong class="type-body-1 weight-semibold <?=$color?>"><?=money($j['unitPrice']*$j['quantity'])?></strong><p class="type-caption-1 muted"><?=number_format($j['quantity'])?>주 · 거래금액</p></div>
</a></div>
<?php }
function formStart(string $action,array $data=[],string $extra=''): void {$GLOBALS['formAction']=$action;echo '<form method="post" action="/actions" '.$extra.'>'.csrf().hidden('action',$action).hidden('_formContext',$_SERVER['REQUEST_URI']??'');foreach($data as $k=>$v)echo hidden($k,$v);}
function modeBanner(string $mode): void {
 if($mode!=='journal')return;
 global $repo;$now=$repo->now()->getTimestamp();
 $banners=array_values(array_filter($repo->all('banners'),fn($b)=>$b['enabled']&&$b['mode']===$mode&&strtotime($b['startAt'])<=$now&&strtotime($b['endAt'])>=$now));
 $typed=array_values(array_filter($banners,fn($row)=>isset($row['type'])));$banners=array_values(array_filter($banners,fn($row)=>!isset($row['type'])));if($typed)bannerSlider($typed,'매매일지 안내');
 if(!$banners)return;
 carouselStart('banner','주부테크 소식',count($banners));
 foreach($banners as $b)echo '<div class="swiper-slide"><a class="list-row list-row--xl" href="'.e($b['url']).'">'.(!empty($b['image'])&&str_starts_with($b['image'],'/assets/images/')?'<span class="asset"><img src="'.e($b['image']).'" alt="" loading="lazy" decoding="async"></span>':icon('megaphone')).'<span>'.e($b['title']).'</span>'.icon('chevron-right').'</a></div>';
 carouselEnd(count($banners));
}
function homeCategories(): array {global $repo;$rows=array_values(array_filter($repo->all('categories'),fn($c)=>$c['enabled']));$default=$repo->find('settings','site')['defaultCategory']??'';usort($rows,fn($a,$b)=>(($a['id']===$default?0:1)<=>($b['id']===$default?0:1))?:($a['order']<=>$b['order']));return $rows;}

function rowVersion(array $row): string {return hash("sha256",json_encode($row));}

require_once __DIR__.'/artwork.php';
