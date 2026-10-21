<?php
declare(strict_types=1);
if($path!=='/actions') {http_response_code(405);exit('Method not allowed');}
if(!is_string($_POST['csrf']??null)||!hash_equals($_SESSION['csrf'],$_POST['csrf'])){http_response_code(403);exit('요청이 만료되었습니다. 페이지를 새로고침해 주세요.');}
$action=(string)($_POST['action']??'');$id=(string)($_POST['id']??'');$return=(string)($_POST['return']??'/finance');$memberId=$_SESSION['member']??'';
function failForm(array $errors,string $return): never {$GLOBALS['formFailed']=true;$_SESSION['errors']=$errors;$_SESSION['old']=$_POST;$context=(string)($_POST['_formContext']??'');if($context&&parse_url($context,PHP_URL_PATH)===parse_url($return,PHP_URL_PATH))$return=$context;redirect($return);}
function owned(string $table,string $id): array {global $repo,$memberId; $r=$repo->find($table,$id);if(!$r||($r['memberId']??'')!==$memberId){http_response_code(404);exit('기록을 찾을 수 없습니다.');}return $r;}
function safeUrl(string $url): bool {return !$url || (filter_var($url,FILTER_VALIDATE_URL)&&in_array(parse_url($url,PHP_URL_SCHEME),['https','http']));}
if($action==='login'){if($repo->find('members',$id)){$_SESSION['member']=$id;flash('가상 계정으로 데모를 시작했어요.');}redirect('/mypage');}
if($action==='logout'){unset($_SESSION['member']);redirect('/login');}
if($action==='admin_login'){$_SESSION['adminDemo']=true;redirect('/admin');}
if(str_starts_with($action,'admin_') || $action==='reset_demo'){if(empty($_SESSION['adminDemo']))redirect('/admin/login');}
elseif(!$repo->member()) {flash('가상 계정을 선택해 주세요.');redirect('/login');}
if(!empty($_POST['_requestKey'])&&isset($_SESSION['requests'][$_POST['_requestKey']]))redirect($_SESSION['requests'][$_POST['_requestKey']]);
if(str_starts_with($action,'admin_'))require APP_PATH.'/admin-actions.php';
switch($action){
 case 'save_article':
  $a=$repo->find('articles',$id);if(!$a||!$repo->visibleArticle($a))failForm(['general'=>'이 글을 저장할 수 없어요.'],$return);
  $saved=$repo->all('saved');$items=$saved[$memberId]??[];$had=in_array($id,$items);$saved[$memberId]=$had?array_values(array_diff($items,[$id])):array_merge($items,[$id]);$repo->set('saved',$saved);flash($had?'저장 목록에서 해제했어요.':'다시 읽을 글에 저장했어요.');break;
 case 'save_goal':
  $v=filter_var($_POST['target']??'',FILTER_VALIDATE_INT);$month=$_POST['month']??'';$validMonth=(bool)preg_match('/^\d{4}-(0[1-9]|1[0-2])$/',$month);$limit=$validMonth?(int)(new DateTimeImmutable($month.'-01'))->format('t'):31;if(!$v||$v<1||$v>$limit||!$validMonth)failForm(['target'=>'선택한 달의 목표는 1~'.$limit.'일로 입력해 주세요.'],$return);
  $goals=$repo->all('goals');$goals[$memberId][$month]=$v;$repo->set('goals',$goals);flash('이번 달 기록 목표를 저장했어요.');break;
 case 'save_journal':
  $existing=$id?owned('journals',$id):null;$draft=($_POST['saveAs']??'')==='draft';$errs=[];$r=[];
  foreach(['tradeDate','market','symbol','stockName','side','reason','reflection','emotion','supportNote','resistanceNote','sellReview','intraday','volumeNote','indexNote'] as $f)$r[$f]=trim((string)($_POST[$f]??''));
  if(!$draft){if(!validDate($r['tradeDate']))$errs['tradeDate']='올바른 거래일을 선택해 주세요.';if(!$r['stockName'])$errs['stockName']='종목명을 입력해 주세요.';}
  if($r['tradeDate']&&!validDate($r['tradeDate']))$errs['tradeDate']='올바른 거래일을 선택해 주세요.';
  if(!in_array($r['side'],['buy','sell']))$errs['side']='매수 또는 매도를 선택해 주세요.';
  if($r['market']!=='KR')$errs['market']='이번 데모는 국내주식·원화 기록을 지원해요.';
  foreach(['unitPrice','quantity','fee','tax','targetPrice','stopLossPrice'] as $f){$s=(string)($_POST[$f]??'0');$r[$f]=is_numeric($s)?(float)$s:0;$positive=in_array($f,['unitPrice','quantity']);if(($s!==''&&!is_numeric($s))||$r[$f]<0||(!$draft&&$positive&&$r[$f]<=0)||$r[$f]>1e12)$errs[$f]=$positive?'0보다 큰 숫자를 입력해 주세요.':'0 이상의 올바른 숫자를 입력해 주세요.';}
  if($r['side']==='sell'&&($r['fee']+$r['tax'])>($r['unitPrice']*$r['quantity'])&&!$draft)$errs['fee']='비용은 매도 거래금액보다 클 수 없어요.';
  if($errs)failForm($errs,$id?'/journal/entries/'.$id.'/edit':'/journal/entries/new');
  $r['id']=$id?:null;$r['memberId']=$memberId;$r['draftStatus']=$draft?'draft':'complete';$r['tradeDate']=$r['tradeDate']?:$repo->now()->format('Y-m-d');$r['checklistSnapshot']=$existing['checklistSnapshot']??array_values(array_filter($repo->all('checklist'),fn($c)=>$c['enabled']));$r['checklistTemplateVersion']=$existing['checklistTemplateVersion']??max(array_column($repo->all('checklist'),'version'));
  foreach($r['checklistSnapshot'] as $c){$v=$_POST['checklistAnswers'][$c['id']]??'unreviewed';$r['checklistAnswers'][$c['id']]=in_array($v,['yes','no','unreviewed'])?$v:'unreviewed';}
  foreach([5,10,20,60,120,224,448] as $d){$v=$_POST['trendChecks'][$d]??'unreviewed';$r['trendChecks'][(string)$d]=in_array($v,['up','down','flat','unreviewed'])?$v:'unreviewed';}
  $r['attachments']=$existing['attachments']??[];$r['positionId']=$existing['positionId']??null;$newId=$repo->put('journals',$r);flash($draft?'일지를 임시 저장했어요.':'나의 투자 기록을 저장했어요.');redirect('/journal/entries/'.$newId);
 case 'delete_journal':
  $r=owned('journals',$id);$_SESSION['undo']=['table'=>'journals','row'=>$r];$repo->remove('journals',$id);flash('일지를 삭제했어요. 알림에서 되돌릴 수 있어요.');redirect('/journal/entries');
 case 'apply':
  $c=$repo->find('campaigns',$id);if(!$c||!$repo->visibleCampaign($c)||$repo->campaignState($c)!=='open')failForm(['general'=>'현재 응모할 수 없는 캠페인이에요.'],'/campaigns');
  if($already=$repo->application($id)){flash('이미 응모한 캠페인이에요.');redirect('/applications/'.$already['id']);}
  $errs=[];foreach(['nickname'=>'닉네임','contact'=>'연락처','reason'=>'신청 사유'] as $k=>$l)if(!trim($_POST[$k]??''))$errs[$k]=$l.'을 입력해 주세요.';
  if(!preg_match('/^01[0-9][- ]?\d{3,4}[- ]?\d{4}$/',$_POST['contact']??''))$errs['contact']='연락처 형식을 확인해 주세요. 가상 번호를 사용하세요.';
  if($c['channel']!=='설문'&&(!safeUrl($_POST['channelUrl']??'')||!($_POST['channelUrl']??'')))$errs['channelUrl']='http 또는 https 채널 URL을 입력해 주세요.';
  if(empty($_POST['requiredConsent']))$errs['requiredConsent']='응모 정보 처리에 대한 필수 동의가 필요해요.';
  foreach($c['questions'] as $i=>$q)if(!trim($_POST['extra'][$i]??''))$errs['extra']='추가 질문에 답변해 주세요.';
  if($errs)failForm($errs,'/campaigns/'.$id.'/apply');
  $new=$repo->put('applications',['campaignId'=>$id,'memberId'=>$memberId,'answers'=>array_intersect_key($_POST,array_flip(['nickname','contact','channelUrl','reason','extra'])),'consentRecords'=>['required'=>true,'optional'=>!empty($_POST['optionalConsent']),'version'=>'review-draft-1','at'=>$repo->now()->format(DATE_ATOM)],'selectionStatus'=>'applied','appliedAt'=>$repo->now()->format(DATE_ATOM),'shipping'=>null]);$repo->log('새 체험단 응모');flash('체험단 응모를 완료했어요.');redirect('/applications/'.$new.'?complete=1');
 case 'cancel_application':
  $a=owned('applications',$id);$c=$repo->find('campaigns',$a['campaignId']);if($a['selectionStatus']!=='applied'||$repo->campaignState($c)!=='open')failForm(['general'=>'모집 중인 신청 완료 건만 취소할 수 있어요.'],$return);$a['selectionStatus']='cancelled';$repo->put('applications',$a);flash('응모를 취소했어요.');break;
 case 'save_shipping':
  $a=owned('applications',$id);$c=$repo->find('campaigns',$a['campaignId']);if($a['selectionStatus']!=='selected'||!$c['shipping'])failForm(['general'=>'배송 정보 입력 대상이 아니에요.'],$return);if(!trim($_POST['recipient']??'')||!trim($_POST['address']??''))failForm(['address'=>'가상 수령인과 배송지를 입력해 주세요.'],$return);$a['shipping']=['recipient'=>trim($_POST['recipient']),'address'=>trim($_POST['address'])];$repo->put('applications',$a);flash('데모 배송 정보를 저장했어요.');break;
 case 'submit_review':
  $a=owned('applications',$id);$r=$repo->review($id);if($a['selectionStatus']!=='selected'||($r&&in_array($r['reviewStatus'],['approved','rejected'])))failForm(['general'=>'후기 제출 대상이 아니에요.'],$return);
  $url=trim($_POST['url']??'');$content=trim($_POST['content']??'');if($r&&$r['reviewStatus']==='pending'&&$r['url']===$url&&$r['content']===$content){flash('이미 제출한 후기예요. 검토 결과를 기다려 주세요.');redirect('/applications/'.$id);}if((!$url&&!$content)||!safeUrl($url))failForm(['url'=>'올바른 후기 URL 또는 후기 내용을 입력해 주세요.'],'/applications/'.$id.'/review');
  $history=$r['history']??[];$history[]=['status'=>'pending','message'=>$r?'사용자 재제출':'최초 제출','at'=>$repo->now()->format(DATE_ATOM)];$repo->put('reviews',['history'=>$history,'id'=>$r['id']??null,'applicationId'=>$id,'url'=>$url,'content'=>$content,'reviewStatus'=>'pending','feedback'=>'','submittedAt'=>$repo->now()->format(DATE_ATOM)]);$repo->log('새 후기 제출');flash('후기를 제출했어요. 검토 결과를 기다려 주세요.');redirect('/applications/'.$id);
 case 'read_notification':
  $n=owned('notifications',$id);$n['read']=true;$repo->put('notifications',$n);redirect($n['url'].(str_contains($n['url'],'?')?'&':'?').'mode='.$n['mode']);
 case 'read_all':foreach($repo->mine('notifications') as $n){$n['read']=true;$repo->put('notifications',$n);}flash('모든 알림을 읽음 처리했어요.');break;
 case 'save_post':
  $postReturn=accountPostsReturn($_POST['return']??'');
  $existing=$id?owned('posts',$id):null;if($existing&&$existing['status']!=='published')failForm(['general'=>'수정할 수 없는 글이에요.'],'/community');$title=trim($_POST['title']??'');$body=trim($_POST['body']??'');if(!$title||!$body)failForm(['title'=>'제목과 내용을 입력해 주세요.'],!empty($_POST['sourceJournalId'])?'/journal/entries/'.$_POST['sourceJournalId'].'/share':($id?'/community/'.$id.'/edit':'/community/new').($postReturn?'?return='.rawurlencode($postReturn):''));$source=$existing['sourceJournalId']??null;
  if(!empty($_POST['sourceJournalId'])){$j=owned('journals',$_POST['sourceJournalId']);$source=$j['id'];$parts=[];if(!empty($_POST['includeReason']))$parts[]='매매 이유: '.$j['reason'];if(!empty($_POST['includeReflection']))$parts[]='복기: '.$j['reflection'];if(!empty($_POST['includeStock']))$parts[]='종목: '.$j['stockName'];$body=trim($_POST['body']).($parts?"\n\n".implode("\n",$parts):'');}
  $new=$repo->put('posts',['id'=>$id?:null,'memberId'=>$memberId,'topic'=>$_POST['topic']??'자유','title'=>$title,'body'=>$body,'status'=>'published','createdAt'=>$repo->now()->format(DATE_ATOM),'likes'=>$existing['likes']??[],'sourceJournalId'=>$source]);flash('커뮤니티에 글을 게시했어요.');redirect($postReturn?:'/community/'.$new);
 case 'delete_post':case 'delete_comment':
  $table=$action==='delete_post'?'posts':'comments';$r=owned($table,$id);$_SESSION['undo']=['table'=>$table,'row'=>$r,'owner'=>$memberId];$r['status']='deleted';$repo->put($table,$r);flash('삭제했어요. 직전 변경을 되돌릴 수 있어요.');break;
 case 'like_post':
  $p=$repo->find('posts',$id);if(!$p||$p['status']!=='published')break;$p['likes']=in_array($memberId,$p['likes'])?array_values(array_diff($p['likes'],[$memberId])):array_merge($p['likes'],[$memberId]);$repo->put('posts',$p);break;
 case 'comment':
  $p=$repo->find('posts',$id);if(!$p||$p['status']!=='published')break;$body=trim($_POST['body']??'');if(!$body)failForm(['body'=>'댓글을 입력해 주세요.'],$return);$repo->put('comments',['postId'=>$id,'memberId'=>$memberId,'body'=>$body,'status'=>'published','createdAt'=>$repo->now()->format(DATE_ATOM)]);flash('댓글을 남겼어요.');break;
 case 'report_post':if(!trim($_POST['body']??''))failForm(['body'=>'신고 사유를 입력해 주세요.'],$return);$p=$repo->find('posts',$id);if($p){$repo->put('reports',['postId'=>$id,'memberId'=>$memberId,'title'=>$p['title'],'body'=>trim($_POST['body']??'검토 요청'),'status'=>'pending','createdAt'=>$repo->now()->format(DATE_ATOM)]);flash('신고를 접수했어요.');}break;
 case 'inquiry':$inquiryMode=in_array($_POST['mode']??'',['finance','journal','campaigns'],true)?'?mode='.$_POST['mode']:'';if(!trim($_POST['title']??'')||!trim($_POST['body']??''))failForm(['title'=>'제목과 문의 내용을 입력해 주세요.'],'/inquiries/new'.$inquiryMode);$new=$repo->put('inquiries',['memberId'=>$memberId,'title'=>trim($_POST['title']),'body'=>trim($_POST['body']),'status'=>'pending','answer'=>'','createdAt'=>$repo->now()->format('Y-m-d')]);flash('문의가 등록되었어요.');redirect('/inquiries/'.$new.$inquiryMode);
 case 'exchange':$reward=$repo->find('rewards',$id);if(!$reward)break;$balance=array_sum(array_column($repo->mine('points'),'amount'));if($balance<$reward['points'])failForm(['general'=>'데모 포인트가 부족해요.'],$return);$exchangeId=$repo->put('exchanges',['points'=>$reward['points'],'memberId'=>$memberId,'title'=>$reward['title'],'status'=>'demo','createdAt'=>$repo->now()->format(DATE_ATOM)]);$repo->put('points',['memberId'=>$memberId,'amount'=>-$reward['points'],'exchangeId'=>$exchangeId,'reason'=>'교환 시뮬레이션 · '.$reward['title'],'createdAt'=>$repo->now()->format('Y-m-d')]);flash('데모 교환을 기록했어요. 실제 쿠폰은 발급되지 않아요.');redirect('/mypage/points');
 case 'admin_save':
  require APP_PATH.'/admin-schema.php';$table=$_POST['table']??'';if(!isset($adminSchemas[$table]['fields'])){http_response_code(400);exit('허용되지 않은 편집입니다.');}$schema=$adminSchemas[$table];$prev=$id?$repo->find($table,$id):null;if($id&&!$prev)failForm(['general'=>'대상이 없어졌어요.'],'/admin/'.$table);$row=$prev??[];$errs=[];if($prev&&isset($_POST['expected'])&&$_POST['expected']!==rowVersion($prev))failForm(['general'=>'다른 작업에서 내용이 변경됐어요. 최신 내용을 확인한 뒤 저장해 주세요.'],'/admin/'.$table.'/'.$id.'/edit');
  foreach($schema['fields'] as $f=>[$label,$type]){$value=$_POST[$f]??'';if($type==='boolean')$value=$value==='1';elseif($type==='number'){if(filter_var($value,FILTER_VALIDATE_INT)===false||(float)$value<0||(float)$value>999999)$errs[$f]=$label.'를 올바르게 입력해 주세요.';$value=(int)$value;}elseif($type==='datetime-local'){try{$parsed=new DateTimeImmutable($value);$issues=DateTimeImmutable::getLastErrors();if(!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/',$value)||($issues&&($issues['warning_count']||$issues['error_count']))||$parsed->format('Y-m-d\TH:i')!==substr($value,0,16))throw new InvalidArgumentException();$value=$parsed->format(DATE_ATOM);}catch(Throwable){$errs[$f]=$label.' 날짜를 확인해 주세요.';}if(!($_POST[$f]??''))$errs[$f]=$label.'를 입력해 주세요.';}else $value=trim((string)$value);if(is_array($type)&&!array_key_exists($value,$type))$errs[$f]='올바른 상태를 선택해 주세요.';$row[$f]=$value;}
  foreach($schema['fields'] as $field=>[$label,$type])if($type==='category'&&!$repo->find('categories',(string)$row[$field]))$errs[$field]='카테고리를 확인해 주세요.';
  if(isset($row['title'])&&!$row['title'])$errs['title']='제목을 입력해 주세요.';if(isset($row['name'])&&!$row['name'])$errs['name']='명칭을 입력해 주세요.';
  if(in_array($table,['articles','banners'])){try{$upload=adminUploadedImage('assetUpload');if($upload){$row[$table==='articles'?'thumbnail':'image']=$upload;$_POST[$table==='articles'?'thumbnail':'image']=$upload;}elseif(!empty($_POST['removeImage']))$row[$table==='articles'?'thumbnail':'image']='';}catch(DomainException $err){$errs[$table==='articles'?'thumbnail':'image']=$err->getMessage();}}
  if($table==='articles'){if(!$repo->find('categories',$row['categoryId']))$errs['categoryId']='카테고리를 확인해 주세요.';if(!safeUrl($row['sourceUrl']))$errs['sourceUrl']='올바른 링크를 입력해 주세요.';$row['bodyBlocks']=array_map(fn($t)=>['type'=>str_starts_with($t,'## ')?'heading':'paragraph','text'=>str_starts_with($t,'## ')?substr($t,3):$t],array_values(array_filter(explode("\n\n",$row['body']))));unset($row['body']);$row['icon']=$repo->find('categories',$row['categoryId'])['icon']??'book-open';}
  if($table==='campaigns'){foreach([['recruitmentStartAt','recruitmentEndAt'],['recruitmentEndAt','announcementAt'],['announcementAt','reviewDueAt'],['exposureStartAt','exposureEndAt']] as [$a,$b])if(strtotime($row[$a])>strtotime($row[$b]))$errs[$b]='일정의 순서를 확인해 주세요.';if($row['capacity']<1)$errs['capacity']='모집 인원은 1명 이상이어야 해요.';foreach(['missions','questions'] as $f)$row[$f]=array_values(array_filter(array_map('trim',explode("\n",$row[$f]))));$selected=count(array_filter($repo->all('applications'),fn($a)=>$a['campaignId']===$id&&$a['selectionStatus']==='selected'));if($row['capacity']<$selected)$errs['capacity']='선정 인원보다 모집 인원을 줄일 수 없어요.';}
  if($table==='banners'){
   if(!str_starts_with($row['url'],'/')||str_starts_with($row['url'],'//')||preg_match('/[\r\n]/',$row['url']))$errs['url']='앱 내부 경로를 입력해 주세요.';
   if(strtotime($row['startAt'])>strtotime($row['endAt']))$errs['endAt']='노출 종료는 시작 이후로 입력해 주세요.';
   if(!($row['image']===''&&!$row['enabled'])&&!bannerImagePath($row['image']))$errs['image']='에셋 폴더의 SVG·PNG·WebP 파일을 확인해 주세요.';
   elseif($row['image']!==''&&$row['type']==='detail'&&!bannerHasAlpha($row['image']))$errs['image']='상세형에는 투명 PNG·WebP 상품 사진을 사용해 주세요.';
   if(!$row['imageAlt'])$errs['imageAlt']='이미지 설명을 입력해 주세요.';
   if(!safeUrl($row['imageSource']))$errs['imageSource']='올바른 출처 URL을 입력해 주세요.';
   if($row['imageSource']&&!$row['imageCredit'])$errs['imageCredit']='이미지 저작자 표시를 입력해 주세요.';
   foreach(['title'=>40,'eyebrow'=>24,'benefit'=>24,'description'=>80,'note'=>32] as $field=>$limit)if(iconv_strlen($row[$field],'UTF-8')>$limit)$errs[$field]='문구를 '.$limit.'자 이내로 정리해 주세요.';
   if($row['type']==='promotion'){$row['benefit']='';$row['note']='';$row['imagePreset']='promotion';}
   elseif($row['imagePreset']==='promotion')$errs['imagePreset']='상세형은 세로형 또는 가로형 상품을 선택해 주세요.';
  }
  if($errs)failForm($errs,'/admin/'.$table.($id?'/'.$id.'/edit':'/new'));
  $row['updatedAt']=$repo->now()->format(DATE_ATOM);$row['adminRevision']=($prev['adminRevision']??0)+1;
  if($table==='checklist')$row['version']=max(array_column($repo->all('checklist'),'version'))+1;
  if($table==='categories')$row['icon']=$prev['icon']??'book-open';
  $row['id']=$id?:null;$row['createdAt']??=$repo->now()->format('Y-m-d');$new=$repo->put($table,$row);$_SESSION['undo']=$prev?['table'=>$table,'row'=>$prev]:['table'=>$table,'newId'=>$new];adminHistory($table,$new,$schema['title'].' 저장');flash('변경사항을 데모에 저장했어요.');redirect(adminPostedList($table));
 case 'admin_status':
  $table=(string)($_POST['table']??'');$row=$repo->find($table,$id);if(!$row)failForm(['general'=>'대상이 없습니다.'],$return);$op=match($_POST['status']??''){'published'=>'publish','hidden'=>'hide','active'=>'restore','suspended'=>'suspend',default=>''};try{adminMutate($table,$id,$op,trim((string)($_POST['reason']??'')),(string)($_POST['expected']??rowVersion($row)));}catch(DomainException $err){failForm(['general'=>$err->getMessage()],$return);}flash('상태를 변경했어요.');break;
 case 'admin_delete':
  $table=$_POST['table']??'';if(!in_array($table,['articles','campaigns','notices','banners']))break;$row=$repo->find($table,$id);if(!$row)break;if(isset($_POST['expected'])){try{adminAssertVersion($row,(string)$_POST['expected']);}catch(DomainException $err){failForm(['general'=>$err->getMessage()],$return);}}if($table==='campaigns'&&count(array_filter($repo->all('applications'),fn($a)=>$a['campaignId']===$id)))failForm(['general'=>'응모자가 있는 캠페인은 삭제할 수 없어요. 숨김 상태로 변경해 주세요.'],$return);$_SESSION['undo']=['table'=>$table,'row'=>$row];$repo->remove($table,$id);flash('삭제했어요. 되돌릴 수 있어요.');break;
 case 'admin_select':
  $a=$repo->find('applications',$id);if(!$a)break;$v=$_POST['selectionStatus']??'';if(!in_array($v,['selected','not_selected','applied']))break;if(($a['selectionStatus']??'')!==($_POST['expected']??''))failForm(['general'=>'다른 작업에서 상태가 변경됐어요. 새로고침 후 다시 시도해 주세요.'],$return);if($a['selectionStatus']==='cancelled'||$repo->review($id))failForm(['general'=>'취소되었거나 후기가 제출된 응모는 선정 상태를 바꿀 수 없어요.'],$return);if(isset($_POST['expectedVersion'])){try{adminAssertVersion($a,(string)$_POST['expectedVersion']);}catch(DomainException $err){failForm(['general'=>$err->getMessage()],$return);}}$c=$repo->find('campaigns',$a['campaignId']);$count=count(array_filter($repo->all('applications'),fn($x)=>$x['campaignId']===$c['id']&&$x['selectionStatus']==='selected'&&$x['id']!==$id));if($v==='selected'&&$count>=$c['capacity'])failForm(['general'=>'모집 인원을 초과해 선정할 수 없어요.'],$return);$_SESSION['undo']=['table'=>'applications','row'=>$a];$a['selectionStatus']=$v;$a['adminRevision']=($a['adminRevision']??0)+1;$repo->put('applications',$a);$repo->notify($a['memberId'],'체험단 응모 결과가 변경되었어요.','/applications/'.$id,'campaigns');adminHistory('applications',$id,'선정 결과 '.adminStatusLabel($v));flash('응모 결과를 변경했어요.');break;
 case 'admin_review':
  $r=$repo->find('reviews',$id);if(!$r)break;$v=$_POST['reviewStatus']??'';if(isset($_POST['expected'])&&$_POST['expected']!==rowVersion($r))failForm(['general'=>'다른 작업에서 후기가 변경됐어요. 최신 내용을 다시 확인해 주세요.'],$return);if(!in_array($v,['pending','revision','approved','rejected']))break;$feedback=trim($_POST['feedback']??'');if(in_array($v,['revision','rejected'])&&!$feedback)failForm(['feedback'=>$v==='revision'?'보완할 내용을 입력해 주세요.':'반려 사유를 입력해 주세요.'],$return);$_SESSION['undo']=['table'=>'reviews','row'=>$r];$r['reviewStatus']=$v;$r['feedback']=$feedback;$r['history'][]=['status'=>$v,'message'=>$feedback?:'운영 검토 상태 변경','at'=>$repo->now()->format(DATE_ATOM)];$repo->put('reviews',$r);adminHistory('reviews',$id,'검수 '.$v,$feedback);$a=$repo->find('applications',$r['applicationId']);$repo->notify($a['memberId'],'후기 검토 결과가 도착했어요.','/applications/'.$a['id'],'campaigns');flash('후기 검토 상태를 저장했어요.');break;
 case 'admin_report':
  $r=$repo->find('reports',$id);if(!$r)break;$result=trim($_POST['result']??'');if(!$result)failForm(['result'=>'검토 내용과 조치 결과를 입력해 주세요.'],$return);if(isset($_POST['expected'])){try{adminAssertVersion($r,(string)$_POST['expected']);}catch(DomainException $err){failForm(['general'=>$err->getMessage()],$return);}}if($r['status']==='resolved')failForm(['general'=>'이미 처리된 신고입니다.'],$return);if(($_POST['reportAction']??'none')==='hide'){$post=$repo->find('posts',$r['postId']);if(!$post||$post['status']==='deleted')failForm(['general'=>'숨길 수 없는 대상입니다.'],$return);if(isset($_POST['expectedTarget'])){try{adminAssertVersion($post,(string)$_POST['expectedTarget']);}catch(DomainException $err){failForm(['general'=>'대상 원문이 변경되었습니다. 다시 검토해 주세요.'],$return);}}$post['status']='hidden';$post['adminRevision']=($post['adminRevision']??0)+1;$repo->put('posts',$post);adminHistory('posts',$post['id'],'신고에 따른 숨김',$result);}$r['status']='resolved';$r['result']=$result;$r['resolvedAt']=$repo->now()->format(DATE_ATOM);$repo->put('reports',$r);adminHistory('reports',$id,($_POST['reportAction']??'none')==='hide'?'대상 게시글 숨김':'조치 없음',$result);flash('신고 조치 결과를 기록했어요.');break;
 case 'admin_answer':
  $q=$repo->find('inquiries',$id);if(!$q)break;$answer=trim($_POST['answer']??'');if(!$answer)failForm(['answer'=>'답변을 입력해 주세요.'],$return);if(isset($_POST['expected'])){try{adminAssertVersion($q,(string)$_POST['expected']);}catch(DomainException $err){failForm(['general'=>$err->getMessage()],$return);}}$q['adminRevision']=($q['adminRevision']??0)+1;$q['answer']=$answer;$q['status']='answered';$q['answeredAt']=$repo->now()->format(DATE_ATOM);$q['assignee']='데모 운영팀';$repo->put('inquiries',$q);adminHistory('inquiries',$id,'답변 저장',$answer);$repo->notify($q['memberId'],'문의에 답변이 등록되었어요.','/inquiries/'.$id,'finance');flash('답변을 등록했어요.');break;
 case 'undo':
  $u=$_SESSION['undo']??null;if($u){if($u['table']==='journals'&&($u['row']['memberId']??'')!==$memberId)break;if($u['table']!=='journals'&&($u['owner']??'')!==$memberId&&empty($_SESSION['adminDemo']))break;if(isset($u['row']))$repo->put($u['table'],$u['row']);else $repo->remove($u['table'],$u['newId']);unset($_SESSION['undo']);flash('직전 변경을 되돌렸어요.');}break;
 case 'reset_demo':$repo->reset();unset($_SESSION['undo']);flash('가상 데이터를 처음 상태로 복원했어요.');redirect('/admin');
 default:http_response_code(400);exit('지원하지 않는 동작입니다.');
}
redirect($return);
