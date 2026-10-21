<?php
/** Entity-specific cells; all cell values are escaped at their source. */
function adminCells(string $table,array $r): array {
 global $repo;
 $member=fn($id)=>e($repo->find('members',$id)['nickname']??'탈퇴 회원');
 $date=fn($value)=>$value?e(dateLabel($value,'Y.m.d')):'—';
 $state=fn($value)=>badge(adminStatusLabel($value),in_array($value,['hidden','draft','not_selected','suspended','cancelled','deleted'])?'neutral':(in_array($value,['approved','answered','resolved','selected'])?'green':'rose'));
 $count=fn($source,$field,$value)=>count(array_filter($repo->all($source),fn($item)=>($item[$field]??null)===$value));
 $id=$r['id'];$name='<strong>'.e(adminRowName($r)).'</strong><small class="muted">'.e($id).'</small>';
 $c=isset($r['campaignId'])?$repo->find('campaigns',$r['campaignId']):null;
 $a=isset($r['applicationId'])?$repo->find('applications',$r['applicationId']):null;
 if($a)$c=$repo->find('campaigns',$a['campaignId']);
 $selected=$c?count(array_filter($repo->all('applications'),fn($a)=>$a['campaignId']===$c['id']&&$a['selectionStatus']==='selected')):0;
 return match($table){
  'articles'=>['콘텐츠'=>$name,'카테고리'=>e($repo->find('categories',$r['categoryId'])['name']??'삭제된 분류'),'공개 상태'=>$state($r['status']).($r['status']==='published'&&strtotime($r['publishedAt'])>$repo->now()->getTimestamp()?'<small>예약 게시</small>':''),'게시일'=>$date($r['publishedAt']),'수정일'=>$date($r['updatedAt']??''),'노출'=>($r['placement']==='featured'?'편집 추천':'목록').'<br><a class="text-button" target="_blank" rel="noopener" href="/admin/articles/'.e($id).'/preview">미리보기</a>'],
  'categories'=>['분류'=>$name,'서비스'=>'재테크 정보','순서'=>(string)$r['order'],'사용'=>$state($r['enabled']?'active':'hidden'),'연결 콘텐츠'=>$count('articles','categoryId',$id).'개 · 기존 글 보존'],
  'campaigns'=>['체험단'=>'<div class="admin-thumb">'.campaignImage($r).'<span>'.$name.'<small>'.e($r['brand']).'</small></span></div>','진행 상태'=>$state($r['publicationStatus']).'<small>'.e(campaignDeadline($r)).'</small>','모집 기간'=>$date($r['recruitmentStartAt']).'<br>~ '.$date($r['recruitmentEndAt']),'모집 인원'=>number_format($r['capacity']).'명','응모 수'=>$count('applications','campaignId',$id).'명','선정 발표 / 리뷰 마감'=>$date($r['announcementAt']).'<br>'.$date($r['reviewDueAt'])],
  'applications'=>['캠페인'=>e($c['title']??'종료된 체험'),'신청자'=>$member($r['memberId']),'신청일'=>$date($r['appliedAt']),'신청 내용'=>e(mb_substr($r['answers']['reason']??'',0,56)),'결과'=>$state($r['selectionStatus']),'선정 / 정원'=>$selected.' / '.($c['capacity']??0).'명'],
  'reviews'=>['캠페인'=>e($c['title']??'종료된 체험'),'작성자'=>$member($a['memberId']??''),'제출일'=>$date($r['submittedAt']),'후기'=>$r['url']?'<a class="text-button" target="_blank" rel="noopener noreferrer" href="'.e($r['url']).'">후기 링크</a>':'본문 제출','검토'=>$state($r['reviewStatus']),'보완 이력'=>count(array_filter($r['history']??[],fn($h)=>$h['status']==='revision')).'회'.($r['feedback']?'<br>'.e(mb_substr($r['feedback'],0,36)):'')],
  'posts'=>['게시글'=>$name,'주제'=>e($r['topic']),'작성자'=>$member($r['memberId']),'작성일'=>$date($r['createdAt']),'노출'=>$state($r['status']),'반응 / 신고'=>'공감 '.count($r['likes']).' · 댓글 '.$count('comments','postId',$id).'<br>신고 '.$count('reports','postId',$id)],
  'comments'=>['댓글'=>e(mb_substr($r['body'],0,80)),'작성자'=>$member($r['memberId']),'대상 글'=>e($repo->find('posts',$r['postId'])['title']??'삭제된 글'),'작성일'=>$date($r['createdAt']),'노출'=>$state($r['status'])],
  'reports'=>['대상'=>$name,'신고 사유'=>e($r['body']),'접수일'=>$date($r['createdAt']),'처리'=>$state($r['status']),'조치 결과'=>e($r['result']??'검토 대기')],
  'members'=>['회원'=>$name,'연락처'=>e($r['maskedContact']),'가입일'=>$date($r['joinedAt']),'계정'=>$state($r['accountStatus']),'공개 활동'=>count(array_filter($repo->all('posts'),fn($p)=>$p['memberId']===$id&&$p['status']==='published')).'개 글 · 응모 '.$count('applications','memberId',$id).'건'],
  'points'=>['회원'=>$member($r['memberId']),'증감'=>($r['amount']>0?'+':'').number_format($r['amount']).' P','사유'=>e($r['reason']),'일시'=>$date($r['createdAt']),'반영'=>'데모 잔액에 반영'],
  'exchanges'=>['회원'=>$member($r['memberId']),'교환 항목'=>$name,'사용 포인트'=>isset($r['points'])?number_format($r['points']).' P':'연결 내역 확인','신청일'=>$date($r['createdAt']),'처리 단계'=>$state($r['status'])],
  'notices'=>['공지'=>$name,'게시'=>$state($r['status']),'작성일'=>$date($r['createdAt']),'고정'=>$r['pinned']?'상단 고정':'일반 공지','담당'=>e($r['assignee']??'데모 운영팀')],
  'inquiries'=>['문의'=>$name,'작성자'=>$member($r['memberId']),'접수일'=>$date($r['createdAt']),'답변'=>$state($r['status']),'담당 / 답변'=>e($r['assignee']??'데모 운영팀').'<br>'.e(mb_substr($r['answer']?:'답변 대기',0,56))],
  'banners'=>['배너'=>'<div class="admin-thumb">'.(bannerImagePath($r['image']??'')?'<img src="'.e($r['image']).'" alt="'.e($r['imageAlt']??'배너 이미지').'" loading="lazy">':'').'<span>'.$name.'</span></div>','서비스 / 위치'=>e(['finance'=>'재테크 정보','journal'=>'매매일지','campaigns'=>'체험단'][$r['mode']]).'<small>홈 배너 슬라이더</small>','유형'=>(($r['type']??'promotion')==='detail'?'누끼 상세형':'프로모션형'),'노출 기간'=>$date($r['startAt']).'<br>~ '.$date($r['endAt']),'순서'=>(string)$r['order'],'사용 / 현재 노출'=>($r['enabled']?'사용':'중지').'<br>'.$state($r['enabled']&&strtotime($r['startAt'])<=$repo->now()->getTimestamp()&&strtotime($r['endAt'])>=$repo->now()->getTimestamp()?'active':'hidden')],
  'checklist'=>['점검 항목'=>$name,'도움말'=>e($r['help']),'순서'=>(string)$r['order'],'사용'=>$state($r['enabled']?'active':'hidden'),'버전 / 보존'=>'v'.$r['version'].'<br>과거 일지 문구 유지'],
  default=>['항목'=>$name]
 };
}
function adminRowDate(array $row): string {return $row['publishedAt']??$row['appliedAt']??$row['submittedAt']??$row['createdAt']??$row['joinedAt']??$row['recruitmentStartAt']??'';}
function adminFilters(string $table): array {
 global $repo;
 return match($table){
  'articles'=>['categoryId'=>['카테고리',array_column($repo->all('categories'),'name','id')],'placement'=>['노출 위치',['list'=>'목록','featured'=>'편집 추천']],'visibility'=>['게시 일정',['visible'=>'현재 게시 중','scheduled'=>'예약 게시']]],
  'campaigns'=>['categoryId'=>['체험 분류',array_combine(['식품','육아','생활','반려생활','방문','설문'],['식품','육아','생활','반려생활','방문','설문'])],'recruiting'=>['모집 상태',['open'=>'모집 중','upcoming'=>'모집 예정','closed'=>'모집 종료']],'exposure'=>['현재 노출',['visible'=>'노출 중','off'=>'노출 안 함']]],
  'categories','checklist'=>['enabled'=>['사용 여부',['1'=>'사용','0'=>'중지']]],
  'banners'=>['mode'=>['서비스',['finance'=>'재테크 정보','journal'=>'매매일지','campaigns'=>'체험단']],'enabled'=>['사용 여부',['1'=>'사용','0'=>'중지']]],
  'posts'=>['topic'=>['주제',array_combine(['수익인증','부업후기','지원금제보','주식·재테크','공구/쇼핑','자유'],['수익인증','부업후기','지원금제보','주식·재테크','공구/쇼핑','자유'])]],
  'points'=>['direction'=>['증감',['credit'=>'적립','debit'=>'차감']]],
  'notices'=>['pinned'=>['고정 여부',['1'=>'상단 고정','0'=>'일반 공지']]],
  default=>[]
 };
}
function adminMatchesFilters(string $table,array $row,?array $query=null): bool {
 global $repo;
 $query??=$_GET;foreach(adminFilters($table) as $field=>$_){$wanted=$query[$field]??'';if($wanted==='')continue;$actual=match($field){'visibility'=>$repo->visibleArticle($row)?'visible':($row['status']==='published'?'scheduled':'off'),'exposure'=>$repo->visibleCampaign($row)?'visible':'off','recruiting'=>$repo->campaignState($row),'direction'=>$row['amount']>=0?'credit':'debit','enabled','pinned'=>!empty($row[$field])?'1':'0',default=>(string)($row[$field]??'')};if((string)$wanted!==$actual)return false;}
 return true;
}
require_once APP_PATH.'/admin-list-table.php';
