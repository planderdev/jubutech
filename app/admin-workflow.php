<?php
/** Admin application services. Session/CSRF gates live in actions.php and routes.php. */
function adminGroups(): array {return ['재테크 정보'=>['articles','categories'],'체험단'=>['campaigns','applications','reviews'],'커뮤니티'=>['posts','comments','reports'],'회원·혜택'=>['members','points','exchanges'],'운영 관리'=>['notices','inquiries','banners'],'서비스 설정'=>['checklist','settings']];}
function adminStatusField(string $table): string {return match($table){'campaigns'=>'publicationStatus','applications'=>'selectionStatus','reviews'=>'reviewStatus','members'=>'accountStatus','categories','banners','checklist'=>'enabled',default=>'status'};}
function adminOps(string $table): array {return match($table){
 'articles','campaigns','notices'=>['publish'=>'공개','hide'=>'비공개'],
 'posts','comments'=>['hide'=>'숨김','publish'=>'복원'],
 'categories','checklist','banners'=>['enable'=>'사용','disable'=>'중지'],
 'applications'=>['select'=>'선정','unselect'=>'선정 해제'],
 'reviews'=>['approve'=>'승인','revision'=>'보완 요청'],
 'members'=>['suspend'=>'이용 정지','restore'=>'이용 복구'],
 'exchanges'=>['cancel'=>'데모 교환 취소·포인트 반환'],default=>[]};}
function adminSelectionBlock(string $table,array $r): string {global $repo;return match(true){$table==='applications'&&($r['selectionStatus']==='cancelled'||$repo->review($r['id']))=>'취소 또는 리뷰 제출 건은 선정 변경 불가',$table==='reviews'&&!in_array($r['reviewStatus'],['pending','revision'])=>'확정 검수는 개별 상세에서 검토',$table==='exchanges'&&$r['status']!=='demo'=>'처리가 끝난 교환 신청',in_array($table,['posts','comments'])&&$r['status']==='deleted'=>'작성자 삭제 항목',default=>''};}
function adminDateFields(string $table): array {return match($table){'articles'=>['publishedAt'=>'게시일','updatedAt'=>'수정일'],'campaigns'=>['recruitmentStartAt'=>'모집 시작','recruitmentEndAt'=>'모집 종료','reviewDueAt'=>'리뷰 마감'],'applications'=>['appliedAt'=>'신청일'],'reviews'=>['submittedAt'=>'제출일'],'members'=>['joinedAt'=>'가입일'],'banners'=>['startAt'=>'노출 시작','endAt'=>'노출 종료'],'categories','checklist','settings'=>[],default=>['createdAt'=>'등록일']};}
function adminListUrl(string $table): string {$candidate=(string)($_GET['return']??$_POST['listReturn']??'');return preg_match('#^/admin/'.preg_quote($table,'#').'(?:\?[^\r\n]*)?$#D',$candidate)?$candidate:'/admin/'.$table;}
function adminPostedList(string $table): string {$candidate=(string)($_POST['listReturn']??'');return preg_match('#^/admin/'.preg_quote($table,'#').'(?:\?[^\r\n]*)?$#D',$candidate)?$candidate:'/admin/'.$table;}
function adminUploadControl(): void {echo '<div class="admin-upload"><label for="admin-upload">이미지 업로드·교체</label><input type="file" id="admin-upload" name="assetUpload" accept="image/png,image/webp" data-image-upload><label><input type="checkbox" name="removeImage" value="1"> 이미지 연결 해제</label><p class="help">PNG·WebP 5MB 이하 / 가로·세로 8000px 이하. 저장 시 파일을 보관합니다. 연결 해제는 원본 파일을 삭제하지 않습니다.</p></div>';}
function adminItemUrl(string $table,string $id,bool $edit=false,?string $list=null): string {return '/admin/'.$table.'/'.rawurlencode($id).($edit?'/edit':'').'?'.http_build_query(['return'=>$list??adminListUrl($table)]);}
function adminQueryRows(string $table,array $query): array {
 global $repo;$rows=$repo->all($table);$q=trim((string)($query['q']??''));$kind=$query['search_by']??'all';$status=$query['status']??'';$dateFields=adminDateFields($table);$df=isset($dateFields[$query['date_field']??''])?$query['date_field']:array_key_first($dateFields);
 $rows=array_values(array_filter($rows,function($r)use($table,$query,$q,$kind,$status,$df,$repo){
  if($status!==''&&(string)($r[adminStatusField($table)]??'')!==(string)$status)return false;
  if(!adminMatchesFilters($table,$r,$query))return false;
  $app=isset($r['applicationId'])?$repo->find('applications',$r['applicationId']):null;
  if(($query['campaign']??'')!==''&&($r['campaignId']??$app['campaignId']??'')!==$query['campaign'])return false;
  if(($query['member']??'')!==''&&($r['memberId']??$app['memberId']??'')!==$query['member'])return false;
  $date=substr((string)($r[$df??'']??''),0,10);
  foreach(['from','to'] as $bound)if(($query[$bound]??'')!==''&&validDate($query[$bound])&&(!$date||($bound==='from'?$date<$query[$bound]:$date>$query[$bound])))return false;
  $text=match($kind){'id'=>$r['id'],'title'=>adminRowName($r),'member'=>$repo->find('members',$r['memberId']??$app['memberId']??'')['nickname']??'',default=>strip_tags(implode(' ',adminCells($table,$r)))};
  return $q===''||str_contains(mb_strtolower($text),mb_strtolower($q));
 }));
 $sort=$query['sort']??'newest';$ordered=in_array($table,['categories','checklist','banners']);
 usort($rows,fn($a,$b)=>($sort==='title'?strcmp(adminRowName($a),adminRowName($b)):($sort==='oldest'?1:-1)*($ordered?(($b['order']??0)<=>($a['order']??0)):strcmp(adminRowDate($a),adminRowDate($b))))?:strcmp($a['id'],$b['id']));return $rows;
}
function adminHistory(string $table,string $id,string $action,string $reason=''): void {global $repo;$repo->put('adminHistory',['table'=>$table,'targetId'=>$id,'action'=>$action,'reason'=>$reason,'operator'=>'데모 운영자','createdAt'=>$repo->now()->format(DATE_ATOM)]);$repo->log($action.' · '.$id);}
function adminAssertVersion(array $row,string $version): void {if(!$version||!hash_equals(rowVersion($row),$version))throw new DomainException('다른 작업에서 변경되었습니다. 최신 내용을 확인하고 다시 처리해 주세요.');}
function adminMutate(string $table,string $id,string $op,string $reason,string $version): bool {
 global $repo;if(empty($_SESSION['adminDemo']))throw new DomainException('관리자 권한이 필요합니다.');
 if(!isset(adminOps($table)[$op]))throw new DomainException('허용되지 않은 작업입니다.');$row=$repo->find($table,$id);if(!$row)throw new DomainException('대상이 삭제되었습니다.');adminAssertVersion($row,$version);
 $field=adminStatusField($table);$current=$row[$field]??'';$target=match($op){'publish'=>'published','hide'=>'hidden','enable'=>true,'disable'=>false,'select'=>'selected','unselect'=>'applied','approve'=>'approved','revision'=>'revision','suspend'=>'suspended','restore'=>'active','cancel'=>'cancelled'};
 if(in_array($op,['revision','suspend','restore','cancel'])&&trim($reason)==='')throw new DomainException('처리 사유를 입력해 주세요.');
 if($current===$target)return false;
 if(in_array($table,['posts','comments'])&&!in_array($current,['published','hidden']))throw new DomainException('작성자가 삭제한 항목은 복원하거나 숨길 수 없습니다.');
 if($table==='applications'){
  if($current==='cancelled'||$repo->review($id))throw new DomainException('취소되었거나 후기가 제출된 응모입니다.');$campaign=$repo->find('campaigns',$row['campaignId']);if(!$campaign)throw new DomainException('연결된 체험단이 없습니다.');
  $count=count(array_filter($repo->all('applications'),fn($a)=>$a['campaignId']===$campaign['id']&&$a['selectionStatus']==='selected'));
  if($op==='select'&&$count>=$campaign['capacity'])throw new DomainException('모집 인원 '.$campaign['capacity'].'명 초과: 현재 선정 '.$count.'명입니다.');
 }
 if($table==='reviews'){
  if(!in_array($current,['pending','revision']))throw new DomainException('이미 확정된 검수입니다. 개별 제출 내역을 확인해 주세요.');
  $row['feedback']=$reason;$row['history'][]=['status'=>$target,'message'=>$reason?:'운영자 승인','at'=>$repo->now()->format(DATE_ATOM)];
 }
 if($table==='exchanges'){
  if($current!=='demo')throw new DomainException('데모 신청 상태에서만 취소할 수 있습니다.');
  $debits=array_values(array_filter($repo->all('points'),fn($p)=>($p['exchangeId']??'')===$id&&$p['amount']<0&&$p['memberId']===$row['memberId']));
  $refunds=array_filter($repo->all('points'),fn($p)=>($p['refundFor']??'')===$id);
  if(count($debits)!==1||!isset($row['points'])||-$debits[0]['amount']!==$row['points']||$refunds)throw new DomainException('연결 차감 원장을 확인할 수 없거나 이미 반환되었습니다.');
  $repo->put('points',['memberId'=>$row['memberId'],'amount'=>$row['points'],'reason'=>'데모 교환 취소 반환 · '.$reason,'exchangeId'=>$id,'refundFor'=>$id,'createdAt'=>$repo->now()->format(DATE_ATOM)]);
 }
 if($table==='checklist')$row['version']=max(array_column($repo->all('checklist'),'version'))+1;
 $row[$field]=$target;$row['updatedAt']=$repo->now()->format(DATE_ATOM);$row['adminRevision']=($row['adminRevision']??0)+1;$repo->put($table,$row);adminHistory($table,$id,adminOps($table)[$op],$reason);
 if($table==='applications')$repo->notify($row['memberId'],'체험단 응모 결과가 변경되었어요.','/applications/'.$id,'campaigns');
 if($table==='reviews'){$app=$repo->find('applications',$row['applicationId']);$repo->notify($app['memberId'],'후기 검토 결과가 도착했어요.','/applications/'.$app['id'],'campaigns');}
 return true;
}
function adminExport(string $table): never {
 if(empty($_SESSION['adminDemo'])||!in_array($table,['articles','categories','campaigns','applications','reviews','posts','comments','reports','members','points','exchanges','notices','inquiries','banners','checklist'])){http_response_code(403);exit('다운로드 권한이 없습니다.');}
 $rows=adminQueryRows($table,$_GET);header('Content-Type: text/csv; charset=UTF-8');header('Content-Disposition: attachment; filename="'.$table.'.csv"');$out=fopen('php://output','w');fwrite($out,"\xEF\xBB\xBF");if(!$rows){global $repo;$sample=$repo->all($table)[0]??null;fputcsv($out,$sample?array_keys(adminCells($table,$sample)):['ID']);}
 foreach($rows as $i=>$row){$cells=adminCells($table,$row);if(!$i)fputcsv($out,array_keys($cells));fputcsv($out,array_map(function($cell){$value=html_entity_decode(strip_tags(str_replace(['<br>','</small>'],[' ',' '],(string)$cell)),ENT_QUOTES,'UTF-8');return preg_match('/^[=+@\-\t\r]/u',$value)?"'".$value:$value;},array_values($cells)));}fclose($out);exit;
}

function adminStatusLabel(string $s): string {return ['1'=>'사용','0'=>'중지','published'=>'게시','hidden'=>'숨김','draft'=>'초안','applied'=>'신청 완료','selected'=>'선정','not_selected'=>'미선정','pending'=>'대기','revision'=>'보완 요청','approved'=>'승인','rejected'=>'반려','answered'=>'답변 완료','active'=>'사용 중','suspended'=>'이용 정지','cancelled'=>'취소','demo'=>'데모','resolved'=>'처리 완료','deleted'=>'작성자 삭제'][$s]??$s;}
function adminRowName(array $r): string {global $repo;return $r['title']??$r['nickname']??$r['name']??$r['reason']??(isset($r['campaignId'])?($repo->find('campaigns',$r['campaignId'])['title']??'종료된 캠페인').' · '.($repo->find('members',$r['memberId'])['nickname']??''):(isset($r['applicationId'])?($repo->find('campaigns',$repo->find('applications',$r['applicationId'])['campaignId'])['title']??'후기'):($r['body']??$r['id'])));}
