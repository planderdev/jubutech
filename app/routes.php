<?php
declare(strict_types=1);
require APP_PATH.'/pages/finance.php';
require APP_PATH.'/pages/journal.php';
require APP_PATH.'/pages/campaigns.php';
require APP_PATH.'/pages/common.php';
require APP_PATH.'/pages/account.php';
require APP_PATH.'/pages/admin.php';
require APP_PATH.'/pages/dev-content.php';
require APP_PATH.'/pages/dev-banners.php';
if(preg_match('#^/campaigns/([^/]+)/recommendations$#',$path,$recommendations)){
 campaignRecommendationsResponse($recommendations[1]);exit;
}
if(preg_match('#^/admin-user-preview/(articles|campaigns|notices)/([^/]+)$#',$path,$preview)){
 if(empty($_SESSION['adminDemo']))redirect('/admin/login');
 $isAdmin=false;$title='저장된 사용자 화면';$back='';$bottom=false;$view=match($preview[1]){'articles'=>'articleDetail','campaigns'=>'campaignDetail',default=>'noticeDetail'};$mode=$preview[1]==='campaigns'?'campaigns':'finance';
 ob_start();if($preview[1]==='articles')articleDetail($preview[2],true);elseif($preview[1]==='campaigns')campaignDetail($preview[2],true);else noticeDetail($preview[2],true);$content=ob_get_clean();require APP_PATH.'/layouts/user.php';exit;
}
if($path==='/dev/content'&&($_GET['static']??'')==='1') {
 echo '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>본문 CSS 단독 검수</title><link rel="stylesheet" href="'.e(assetUrl('/assets/css/ds.css')).'"><link rel="stylesheet" href="'.e(assetUrl('/assets/css/app.css')).'"></head><body class="root"><div class="app-shell"><main class="app-main no-bottom-nav">';
 contentPreview();echo '</main></div></body></html>';exit;
}
if($path==='/dev/showcase') {
 echo '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>주부테크 · 세 가지 일상</title><link rel="stylesheet" href="'.e(assetUrl('/assets/css/ds.css')).'"><link rel="stylesheet" href="'.e(assetUrl('/assets/css/app.css')).'"></head><body class="root"><h1 class="type-fixed-title-2 text-center my-16">주부테크 <small class="type-caption-2 muted">재테크 정보 · 주식매매일지 · 체험단</small></h1><div class="preview-screens">';
 $showcase=match($_GET['view']??'homes'){'content'=>['제목과 링크'=>'/dev/content','목록과 인용'=>'/dev/content#prose-lists','표와 조작 요소'=>'/dev/content#prose-table'],'details'=>['체험단 상세'=>'/campaigns/cp1','매매 기록'=>'/journal/entries/new','마이'=>'/mypage?mode=finance'],'explore'=>['재테크 정보'=>'/finance/categories','체험단 탐색'=>'/campaigns/explore','내 응모'=>'/applications'],default=>['재테크 홈'=>'/finance','매매일지'=>'/journal','체험단 홈'=>'/campaigns']};
 foreach($showcase as $label=>$url)echo '<div class="preview-device"><div class="preview-canvas"><iframe title="'.e($label).' 모바일 화면" src="'.e($url).'"></iframe></div></div>';
 echo '</div></body></html>';exit;
}
if($path==='/dev/viewport') {
 $height=(int)($_GET['height']??844);if(!in_array($height,[640,844]))$height=844;
 $width=(int)($_GET['width']??390);if(!in_array($width,[360,390,430,768,800,991,992,1000,1280,1440]))$width=390;
 $target=(string)($_GET['target']??'/journal');if(!preg_match('#^/(finance|journal|campaigns|admin|applications|mypage|notifications|community|inquiries|rewards|notices|legal|about|login|search|dev/(?:states|content|banners))(/|\?|$)#',$target)||str_starts_with($target,'//'))$target='/journal';
 echo '<!doctype html><html lang="ko"><head><meta charset="utf-8"><script src="/assets/js/viewport-qa.js"></script><title>주부테크 반응형 검수 '.$width.'px</title><link rel="stylesheet" href="'.e(assetUrl('/assets/css/ds.css')).'"><link rel="stylesheet" href="'.e(assetUrl('/assets/css/app.css')).'"></head><body class="root"><p class="text-center my-16">개발용 뷰포트 검수 · '.$width.'px</p><iframe class="preview-frame" title="주부테크 검수 화면" width="'.$width.'" height="'.$height.'" src="'.e($target.(str_contains($target,'?')?'&':'?').'qa=1').'"></iframe><output id="qa-result" class="column text-center p-16" aria-live="polite">검수 중</output></body></html>';exit;
}
$title='주부테크';$back='';$view=null;$params=[];$bottom=true;
$routes=[
 ['#^/dev/banners$#','bannerPreview','배너 검수','/campaigns'],
 ['#^/dev/content$#','contentPreview','본문 스타일 검수','/finance'],
 ['#^/admin/content-preview$#','contentPreview','본문 스타일 검수','/admin'],
 ['#^/$#','entry','주부테크'],
 ['#^/finance$#','financeHome','재테크 정보'],
 ['#^/finance/categories$#','financeList','돈되는 정보'],
 ['#^/finance/saved$#','savedArticles','저장한 정보','/finance'],
 ['#^/finance/articles/([^/]+)$#','articleDetail','돈되는 정보','/finance/categories'],
 ['#^/journal$#','journalHome','주식매매일지'],
 ['#^/journal/entries$#','journalList','나의 일지'],
 ['#^/journal/entries/new$#','journalForm','매매 기록','/journal'],
 ['#^/journal/entries/([^/]+)/edit$#','journalForm','기록 수정','/journal/entries'],
 ['#^/journal/entries/([^/]+)/share$#','shareJournal','복기 공유','/journal/entries'],
 ['#^/journal/entries/([^/]+)$#','journalDetail','매매일지','/journal/entries'],
 ['#^/journal/analysis$#','journalAnalysis','기록 분석'],
 ['#^/campaigns$#','campaignHome','체험단 응모'],
 ['#^/campaigns/explore$#','campaignExplore','체험단 탐색'],
 ['#^/campaigns/([^/]+)/apply$#','campaignApply','체험단 응모','/campaigns'],
 ['#^/campaigns/([^/]+)$#','campaignDetail','체험단 상세','/campaigns'],
 ['#^/applications$#','applicationList','내 응모'],
 ['#^/applications/([^/]+)/review$#','reviewForm','후기 제출','/applications'],
 ['#^/applications/([^/]+)$#','applicationDetail','응모 내역','/applications'],
 ['#^/search$#','searchPage','검색','/finance'],
 ['#^/notifications$#','notificationsPage','알림','/mypage'],
 ['#^/community/new$#','communityForm','글쓰기','/community'],
 ['#^/community$#','communityList','함께 나누는 이야기'],
 ['#^/community/([^/]+)/edit$#','communityForm','글 수정','/community'],
 ['#^/community/([^/]+)$#','communityDetail','커뮤니티','/community'],
 ['#^/mypage$#','myPage','마이'],
 ['#^/mypage/(points|missions|badges|posts|settings)$#','mySubpage','나의 활동','/mypage'],
 ['#^/rewards$#','rewardsPage','포인트 교환','/mypage/points'],
 ['#^/rewards/([^/]+)$#','rewardDetail','교환 미리보기','/rewards'],
 ['#^/notices$#','noticeList','공지사항','/mypage'],
 ['#^/notices/([^/]+)$#','noticeDetail','공지사항','/notices'],
 ['#^/inquiries/new$#','inquiryForm','문의하기','/inquiries'],
 ['#^/inquiries$#','inquiryList','내 문의','/mypage'],
 ['#^/inquiries/([^/]+)$#','inquiryDetail','문의 상세','/inquiries'],
 ['#^/legal/(terms|privacy)$#','legalPage','검토용 문안','/mypage/settings'],
 ['#^/about$#','aboutPage','주부테크 소개','/mypage'],
 ['#^/login$#','loginPage','데모 시작','/finance'],
 ['#^/dev/states$#','statePreview','상태 미리보기','/finance'],
 ['#^/admin/login$#','adminLogin','관리자 데모 로그인'],
 ['#^/admin$#','adminDashboard','대시보드'],
 ['#^/admin/([a-z]+)/(new)$#','adminEdit','등록'],
 ['#^/admin/([a-z]+)/([^/]+)/edit$#','adminEdit','수정'],
 ['#^/admin/([a-z]+)/([^/]+)/preview$#','adminPreview','사용자 미리보기'],
 ['#^/admin/([a-z]+)/([^/]+)$#','adminDetail','상세'],
 ['#^/admin/([a-z]+)$#','adminList','관리 목록']
];
foreach($routes as $r)if(preg_match($r[0],$path,$m)){$view=$r[1];$title=$r[2];$back=$r[3]??'';$params=array_slice($m,1);break;}
if($isAdmin&&$path!=='/admin/login'&&empty($_SESSION['adminDemo']))redirect('/admin/login');
if($isAdmin)foreach($_GET as $key=>$value)if(!is_scalar($value)){http_response_code(400);exit('잘못된 조회 조건입니다.');}
if(!$view){http_response_code(404);$view='notFound';$title='페이지를 찾을 수 없어요';$back='/finance';}
if(in_array($view,['campaignDetail','articleDetail','communityDetail','journalDetail','applicationDetail','statePreview','contentPreview']))$bottom=false;
if($view==='reviewForm')$back='/applications/'.$params[0];
if(in_array($view,['journalForm','shareJournal'])&&!empty($params[0]))$back='/journal/entries/'.$params[0];
if($view==='campaignApply')$back='/campaigns/'.$params[0];
if($view==='communityForm'&&($postReturn=accountPostsReturn($_GET['return']??'')))$back=$postReturn;
if($view==='mySubpage')$title=match($params[0]){'missions'=>'진행 중인 미션','posts'=>'내가 쓴 글','settings'=>'설정','points'=>'나의 포인트',default=>'나의 배지'};
if(in_array($view,['mySubpage','noticeList','noticeDetail','inquiryList','inquiryForm','inquiryDetail','aboutPage','legalPage']))$back=accountUrl($back);
if(str_contains($path,'/new')||str_ends_with($path,'/edit')||str_ends_with($path,'/apply')||str_ends_with($path,'/review')||str_ends_with($path,'/share'))$bottom=false;
ob_start();try{$view(...$params);}catch(Throwable $error){if(!$isAdmin)throw $error;ob_clean();error_log('Admin render failure: '.$error->getMessage());http_response_code(500);echo '<section class="admin-notice admin-notice--error" role="alert"><h2>정보를 불러오지 못했습니다.</h2><p>잠시 후 다시 조회해 주세요. 문제가 계속되면 서버 기록을 확인해 주세요.</p><a class="button button--neutral" href="'.e($_SERVER['REQUEST_URI']).'">다시 조회</a></section>';}$content=ob_get_clean();
require APP_PATH.'/layouts/'.($isAdmin?'admin':'user').'.php';
