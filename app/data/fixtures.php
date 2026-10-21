<?php
declare(strict_types=1);
// All records are fictional. Time is fixed to make campaign QA reproducible.
$categories = [];
foreach ([['subsidy','지원금','landmark'],['policy','정책','file-text'],['saving','절약','shopping-basket'],['card','카드혜택','credit-card'],['finance','금융기초','book-open'],['parenting','육아·교육','baby'],['pet','반려생활','paw-print'],['sidejob','부업','briefcase-business']] as $i=>$c) $categories[]=['id'=>$c[0],'name'=>$c[1],'icon'=>$c[2],'order'=>$i+1,'enabled'=>true];
$articleRows = [
 ['subsidy','우리 집이 받을 수 있는 지원금, 어디서 찾을까요?','흩어져 있는 생활 지원 정보, 보조금24에서 확인하는 순서를 정리했어요.','landmark'],
 ['saving','식비를 아끼는 일주일 장보기 루틴','냉장고 확인부터 장보기 목록까지, 작은 습관으로 시작해요.','shopping-basket'],
 ['finance','ETF가 뭔가요? 바구니로 이해하는 첫 투자','한 종목 대신 여러 자산을 담는다는 의미부터 알아봐요.','chart-pie'],
 ['card','카드 혜택보다 먼저 확인할 세 가지','전월 실적, 제외 항목, 할인 한도를 함께 살펴보세요.','credit-card'],
 ['parenting','아이 교육비, 우리 집 기준부터 세우기','월별 고정 비용과 일회성 비용을 나눠 적어보세요.','baby'],
 ['policy','생활 정책 알림, 필요한 것만 받아보기','거주 지역과 관심 분야에 맞게 알림을 설정하는 방법.','bell'],
 ['saving','구독 서비스 정리하는 날','한 달 동안 사용하지 않은 구독이 있는지 살펴봐요.','receipt'],
 ['pet','반려동물 생활비, 항목별로 모아보기','사료·병원·용품 비용을 분리하면 계획이 쉬워져요.','paw-print'],
 ['sidejob','재택 부업을 시작하기 전 확인할 것','업무 범위와 정산 조건을 먼저 확인하는 습관.','briefcase-business'],
 ['finance','투자 일지에는 무엇을 적으면 좋을까요?','결과보다 판단의 과정을 남기는 기록 방법.','notebook-pen'],
 ['subsidy','아이돌봄 지원, 신청 전 준비할 정보','지원 조건과 신청 기간은 공식 안내에서 확인하세요.','landmark'],
 ['saving','가계부를 오래 쓰는 작은 방법','모든 지출을 완벽히 적기보다, 꾸준히 돌아보세요.','wallet']
];
$articles=[];
foreach($articleRows as $i=>$a) $articles[]=['id'=>'i'.($i+1),'categoryId'=>$a[0],'title'=>$a[1],'summary'=>$a[2],'icon'=>$a[3],'thumbnail'=>'','bodyBlocks'=>[['type'=>'paragraph','text'=>$a[2]],['type'=>'heading','text'=>'내 생활에 맞게 하나씩 확인해요'],['type'=>'paragraph','text'=>'가장 먼저 지금의 상황과 필요한 정보를 적어보세요. 공식 안내의 기준일과 적용 대상을 확인하고, 궁금한 부분은 담당 기관의 안내를 참고하세요.'],['type'=>'heading','text'=>'오늘 해볼 수 있는 작은 실천'],['type'=>'paragraph','text'=>'이번 주에 확인할 항목 한 가지를 정하고 메모에 남겨보세요. 이 글을 저장해 두면 마이페이지에서 다시 읽을 수 있어요.']],'source'=>'주부테크 편집팀 · 화면 검토용 예시','sourceUrl'=>'','publishedAt'=>'2026-10-'.str_pad((string)(21-$i),2,'0',STR_PAD_LEFT).'T09:00:00+09:00','status'=>'published','placement'=>$i===0?'featured':'list'];
$checklist=[];
foreach([['이평선 배열','5일선·20일선 골든크로스 및 정배열 초입 여부'],['일목균형표','구름대 위·아래 위치와 돌파 여부'],['볼린저밴드','상단 돌파·안착 또는 하단 지지 여부'],['수급 분석','기관 평단가 부근 및 외국인 지속 수급·평단 확인'],['매수 타점','거래량 동반 직전 고점 돌파 또는 주요 지지선 눌림목'],['시장 환경','코스피·코스닥 방향성과 변동성 장세 여부']] as $i=>$c) $checklist[]=['id'=>'check'.($i+1),'title'=>$c[0],'help'=>$c[1],'order'=>$i+1,'enabled'=>true,'version'=>1];
$journals=[];
$tradeRows=[['21','삼성전자','005930','buy',68200,10],['21','TIGER 미국S&P500','360750','buy',19850,5],['20','현대차','005380','buy',243000,3],['19','KODEX 200','069500','sell',41200,10],['17','삼성전자','005930','buy',67500,5],['15','NAVER','035420','buy',185000,2],['14','에코프로비엠','247540','sell',161500,4],['12','에코프로비엠','247540','buy',152000,4],['08','KODEX 200','069500','buy',38900,30],['03','삼성전자','005930','sell',64000,5]];
foreach($tradeRows as $i=>$t) $journals[]=['id'=>'j'.($i+1),'memberId'=>'m1','tradeDate'=>'2026-10-'.$t[0],'market'=>'KR','symbol'=>$t[2],'stockName'=>$t[1],'side'=>$t[3],'unitPrice'=>$t[4],'quantity'=>$t[5],'fee'=>100,'tax'=>0,'reason'=>$i===0?'정해둔 가격대에서 분할 매수했어요.':'계획한 기준을 확인하고 기록했어요.','reflection'=>$i===0?'조급하게 결정하지 않고 체크리스트를 먼저 확인했어요.':'다음 거래 전에도 내 기준을 돌아보기.','emotion'=>'차분함','attachments'=>[],'checklistTemplateVersion'=>1,'checklistSnapshot'=>$checklist,'checklistAnswers'=>['check1'=>'yes','check2'=>'yes','check3'=>'no','check4'=>'yes','check5'=>'unreviewed','check6'=>'yes'],'trendChecks'=>['5'=>'up','10'=>'up','20'=>'flat','60'=>'unreviewed','120'=>'unreviewed','224'=>'unreviewed','448'=>'unreviewed'],'targetPrice'=>0,'stopLossPrice'=>0,'supportNote'=>'','resistanceNote'=>'','sellReview'=>'','intraday'=>'','volumeNote'=>'','indexNote'=>'','draftStatus'=>'complete','positionId'=>null];
$campaignRows=[
 ['그린테이블','저염 밀키트 3종, 가볍게 차리는 저녁','식품','밀키트 3종 제공','인스타그램',15,'16','27','29','2026-11-13','food'],
 ['베베코튼','우리 아기의 첫 보습, 오가닉 바디로션','육아','바디로션 200ml 2개 제공','블로그',20,'15','31','31','2026-11-17','lotion'],
 ['주부테크 리서치','장보기 습관을 들려주세요','설문','설문 참여 · 샘플 3,000P','설문',300,'18','24','25','2026-10-30','survey'],
 ['멍냥마켓','매일 챙기는 반려견 덴탈 케어','반려생활','덴탈껌 체험팩 제공','블로그',50,'20','30','31','2026-11-15','pet'],
 ['코지홈','무선 물걸레 청소기, 4주 사용 기록','생활','무선 물걸레 청소기 대여','유튜브',5,'01','15','18','2026-11-18','home'],
 ['데일리컵','매일 쓰기 좋은 작은 머그컵','생활','세라믹 머그컵 1개 제공','인스타그램',12,'25','31','31','2026-11-18','cup'],
 ['동네빵집 르뺑','분당에서 만나는 갓 구운 작은 행복','방문','신메뉴 세트와 커피 2잔','인스타그램',10,'15','26','28','2026-11-04','bread'],
 ['맑은생활','향을 덜어낸 주방 세제 사용기','생활','주방 세제 500ml 제공','블로그',20,'01','10','12','2026-10-30','soap']
];
$campaigns=[];
foreach($campaignRows as $i=>$c) $campaigns[]=['id'=>'cp'.($i+1),'brand'=>$c[0],'title'=>$c[1],'categoryId'=>$c[2],'benefit'=>$c[3],'channel'=>$c[4],'capacity'=>$c[5],'recruitmentStartAt'=>'2026-10-'.$c[6].'T00:00:00+09:00','recruitmentEndAt'=>'2026-10-'.$c[7].'T23:59:59+09:00','announcementAt'=>'2026-10-'.$c[8].'T23:59:59+09:00','reviewDueAt'=>$c[9].'T23:59:59+09:00','missions'=>['직접 사용한 경험을 사진과 함께 작성해 주세요.','제품 제공 사실을 게시물에 표시해 주세요.','후기 게시물은 4주간 유지해 주세요.'],'questions'=>['평소 이 제품을 어떻게 사용하고 싶으세요?'],'description'=>'일상에서 직접 사용해 보고 솔직한 이야기를 들려주세요. '.$c[3].' 캠페인입니다.','conditions'=>'공개된 활동 채널을 운영하며 후기 기한을 지킬 수 있는 분','publicationStatus'=>'published','image'=>$c[10],'shipping'=>$c[2]!=='방문' && $c[2]!=='설문','exposureStartAt'=>'2026-10-01T00:00:00+09:00','exposureEndAt'=>'2026-12-31T23:59:59+09:00'];
$applications=[];
foreach([['a1','cp5','m1','selected'],['a2','cp2','m1','applied'],['a3','cp7','m1','applied'],['a4','cp1','m2','applied'],['a5','cp8','m2','selected'],['a6','cp8','m1','not_selected']] as $a) $applications[]=['id'=>$a[0],'campaignId'=>$a[1],'memberId'=>$a[2],'answers'=>['nickname'=>$a[2]==='m1'?'서연맘':'민정살림','contact'=>'010-0000-0000','channelUrl'=>'https://example.com/demo-profile','reason'=>'생활 속에서 직접 사용해 보고 꼼꼼히 기록하고 싶어요.','extra'=>['일상에 맞는 사용 후기를 남길게요.']],'consentRecords'=>['required'=>true,'optional'=>false,'version'=>'review-draft-1'],'selectionStatus'=>$a[3],'appliedAt'=>($a[1]==='cp5'?'2026-10-14T10:00:00+09:00':($a[1]==='cp8'?'2026-10-08T10:00:00+09:00':'2026-10-19T10:00:00+09:00')),'shipping'=>null];
return [
 'meta'=>['version'=>1,'now'=>'2026-10-21T12:00:00+09:00'], 'categories'=>$categories,'articles'=>$articles,'journals'=>$journals,'checklist'=>$checklist,'campaigns'=>$campaigns,'applications'=>$applications,
 'reviews'=>[['id'=>'r1','applicationId'=>'a5','url'=>'https://example.com/demo-review','content'=>'향이 강하지 않아 설거지할 때 쓰기 좋았어요.','reviewStatus'=>'pending','feedback'=>'','submittedAt'=>'2026-10-20T12:00:00+09:00']],
 'members'=>[['id'=>'m1','nickname'=>'서연맘','maskedContact'=>'010-****-0101','joinedAt'=>'2026-08-01','accountStatus'=>'active'],['id'=>'m2','nickname'=>'민정살림','maskedContact'=>'010-****-0202','joinedAt'=>'2026-08-12','accountStatus'=>'active'],['id'=>'m3','nickname'=>'지혜의숲','maskedContact'=>'010-****-0303','joinedAt'=>'2026-09-02','accountStatus'=>'active']],
 'saved'=>['m1'=>['i3','i4']], 'goals'=>['m1'=>['2026-10'=>12]],
 'posts'=>[['id'=>'p1','memberId'=>'m1','topic'=>'부업후기','title'=>'등원 후 두 시간, 나만의 작은 루틴이 생겼어요','body'=>'처음에는 시간을 어떻게 써야 할지 막막했어요. 이제는 관심 있는 체험을 살펴보고 하루의 기록을 남기고 있어요. 작은 일도 꾸준히 해보려고요.','status'=>'published','createdAt'=>'2026-10-20T10:00:00+09:00','likes'=>['m2'],'sourceJournalId'=>null],['id'=>'p2','memberId'=>'m3','topic'=>'주식·재테크','title'=>'매매일지를 쓰고 달라진 건 수익보다 마음이었어요','body'=>'종목을 고른 이유를 적으니, 나중에 내 판단을 차분히 돌아볼 수 있었어요. 오늘도 결과보다 과정을 기록해 봅니다.','status'=>'published','createdAt'=>'2026-10-19T10:00:00+09:00','likes'=>['m1','m2'],'sourceJournalId'=>null],['id'=>'p3','memberId'=>'m2','topic'=>'공구/쇼핑','title'=>'장보기 전에 냉장고 사진 한 장 찍어보세요','body'=>'이미 있는 재료를 또 사는 일이 줄었어요. 생각보다 도움이 되는 작은 습관이에요.','status'=>'published','createdAt'=>'2026-10-18T10:00:00+09:00','likes'=>[],'sourceJournalId'=>null]],
 'comments'=>[['id'=>'cm1','postId'=>'p1','memberId'=>'m2','body'=>'저도 작은 습관부터 시작해 볼게요.','status'=>'published','createdAt'=>'2026-10-20T12:00:00+09:00']], 'reports'=>[],
 'points'=>[['id'=>'pt1','memberId'=>'m1','amount'=>8400,'reason'=>'이전 활동 잔액 · 예시','createdAt'=>'2026-10-01'],['id'=>'pt2','memberId'=>'m1','amount'=>3000,'reason'=>'설문 완료 · 예시','createdAt'=>'2026-10-18'],['id'=>'pt3','memberId'=>'m1','amount'=>1000,'reason'=>'기록 활동 · 예시','createdAt'=>'2026-10-20']],
 'rewards'=>[['id'=>'rw1','title'=>'따뜻한 커피 한 잔','points'=>5000,'description'=>'검토용 교환 예시입니다. 실제 상품·단가·지급 정책은 확정되지 않았어요.']], 'exchanges'=>[],
 'notices'=>[['id'=>'n1','title'=>'주부테크 데모에 오신 것을 환영해요','body'=>'재테크 정보, 투자 기록, 체험단을 서비스 선택 메뉴에서 오갈 수 있어요. 이 공간의 회원·캠페인·보상은 화면 검토를 위한 가상 데이터입니다.','status'=>'published','pinned'=>true,'createdAt'=>'2026-10-21']],
 'inquiries'=>[['id'=>'q1','memberId'=>'m1','title'=>'체험단 후기 링크를 수정하고 싶어요','body'=>'제출 전에 작성한 내용을 다시 확인할 수 있나요?','status'=>'pending','answer'=>'','createdAt'=>'2026-10-20']],
 'notifications'=>[['id'=>'nt1','memberId'=>'m1','title'=>'코지홈 체험단에 선정되었어요','body'=>'체험 일정과 후기 미션을 확인해 주세요.','url'=>'/applications/a1','mode'=>'campaigns','read'=>false,'createdAt'=>'2026-10-18'],['id'=>'nt2','memberId'=>'m1','title'=>'오늘의 투자 과정을 남겨보세요','body'=>'작은 기록이 나만의 기준이 돼요.','url'=>'/journal','mode'=>'journal','read'=>false,'createdAt'=>'2026-10-21']],
 'banners'=>[['id'=>'b1','title'=>'작은 기록이 나만의 투자 기준이 돼요','url'=>'/journal','mode'=>'journal','order'=>1,'enabled'=>true,'image'=>'','startAt'=>'2026-10-01T00:00:00+09:00','endAt'=>'2026-12-31T23:59:59+09:00']],
 'settings'=>[['id'=>'site','financeIntro'=>'오늘의 발견이\n내일의 여유로','journalIntro'=>'결과보다 과정을, 나만의 투자 기록','campaignsIntro'=>'써보고 싶었던 것,\n좋아하는 일상 속으로','defaultCategory'=>'subsidy']], 'activity'=>[]
];
