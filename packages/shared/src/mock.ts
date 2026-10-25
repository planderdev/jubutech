import type { Application, Campaign, Comment, InfoArticle, Notification, PointLog, Post, Report, Trade, User } from "./types";
import { emptyChecklist, emptyMaTrend } from "./types";

const d = (daysAgo: number, h = 9) => {
  const t = new Date();
  t.setDate(t.getDate() - daysAgo);
  t.setHours(h, 12, 0, 0);
  return t.toISOString();
};
const day = (offset: number) => {
  const t = new Date();
  t.setDate(t.getDate() + offset);
  return t.toISOString().slice(0, 10);
};

export const USERS: User[] = [
  { id: "u1", status: "active", joinedAt: "2026-03-02", name: "김서연", nickname: "서연맘", role: "member", region: "경기 성남", tags: ["7세 자녀", "재택부업", "ETF 입문"], points: 12400, level: 3, badges: ["첫 수익", "영수증 30일", "매매일지 10회"], intro: "둘째 등원 후 오전 두 시간이 제 부업 시간이에요.", channels: [{ type: "instagram", url: "https://instagram.com/seoyeon_mom", followers: 2300 }, { type: "blog", url: "https://blog.naver.com/seoyeonmom", followers: 800 }] },
  { id: "u2", status: "active", joinedAt: "2026-02-14", name: "박지혜", nickname: "지혜의숲", role: "member", region: "서울 마포", tags: ["신혼", "주식 3년차"], points: 30250, level: 5, badges: ["월 50만 달성", "우수 답변"], intro: "매매일지 쓰고 나서 손절이 빨라졌어요." },
  { id: "u3", status: "active", joinedAt: "2026-05-21", name: "이하은", nickname: "하은이네", role: "member", region: "부산 해운대", tags: ["반려견", "블로그 체험단"], points: 8900, level: 2, badges: ["첫 수익"] },
  { id: "u4", status: "active", joinedAt: "2026-04-09", name: "최민정", nickname: "민정살림", role: "member", region: "제주 제주시", tags: ["쌍둥이", "지원금 덕후"], points: 15600, level: 4, badges: ["지원금 제보왕"] },
  { id: "u5", status: "active", joinedAt: "2026-08-30", name: "정유진", nickname: "유진의 가계부", role: "member", region: "인천 송도", tags: ["가계부", "파킹통장"], points: 4200, level: 1, badges: [] },
  { id: "a1", status: "active", joinedAt: "2026-06-01", name: "오지훈", nickname: "그린테이블 마케팅", role: "advertiser", region: "서울 강남", tags: [], points: 0, level: 0, badges: [], brand: "그린테이블" },
  { id: "a2", status: "active", joinedAt: "2026-07-15", name: "한수민", nickname: "베베코튼", role: "advertiser", region: "경기 파주", tags: [], points: 0, level: 0, badges: [], brand: "베베코튼" },
  { id: "adm", name: "주부테크 운영팀", nickname: "운영자", role: "admin", region: "서울", tags: [], points: 0, level: 9, badges: ["운영"] },
];

export const POSTS: Post[] = [
  { id: "p1", board: "income", title: "9월 첫째 주 체험단 + 설문으로 187,000원 벌었어요", body: "아이 등원시키고 오전 10시부터 12시까지 딱 두 시간만 써요.\n\n이번 주는 그린테이블 밀키트 인스타 후기(제품+3만P), 베이비 로션 블로그 후기(제품), 설문 3건(1.2만원) 이렇게요.\n\n영수증 인증 포인트까지 합치니 18만원 넘게 찍혔네요. 처음엔 몇 천원이었는데 6개월 하니까 루틴이 생겼어요. 저처럼 시간 쪼개 쓰시는 분들 화이팅!", authorId: "u1", createdAt: d(0, 11), likes: ["u2", "u3", "u4", "u5"], views: 812, tags: ["체험단", "설문", "재택"], income: 187000, commentCount: 3 },
  { id: "p2", board: "subsidy", title: "[마감 D-12] 경기도 아이돌봄 본인부담금 지원, 맞벌이 아니어도 돼요", body: "구청 게시판에서 보고 바로 신청했어요. 3~12세 자녀 가구, 소득 150% 이하면 월 최대 10만원. 정부24 → 보조금24에서 '아이돌봄' 검색하면 나옵니다. 주민센터 방문 없이 온라인 가능!", authorId: "u4", createdAt: d(0, 8), likes: ["u1", "u2", "u5"], views: 1204, tags: ["경기도", "육아지원금"], region: "경기", commentCount: 5 },
  { id: "p3", board: "stock", title: "삼성전자 손절 복기 — 체크리스트 6개 중 2개만 맞았더라고요", body: "매매일지 다시 열어보니 '매수 타점'이랑 '시장 환경' 체크를 안 하고 들어갔어요. 결과보다 기준을 복기하라는 말이 이제 이해가 됩니다. 손절선을 미리 적어둔 덕에 -4%에서 끊었어요.", authorId: "u2", createdAt: d(1, 21), likes: ["u1", "u5"], views: 540, tags: ["매매일지", "손절", "복기"], commentCount: 4 },
  { id: "p4", board: "sidejob", title: "AI 데이터 검수 부업 2주 해본 솔직 후기 (시급 환산 9,800원)", body: "장점: 시간 자유, 애 재우고 밤에 가능. 단점: 초반 검수 탈락 많음, 집중력 소모. 건당 단가는 낮지만 정산이 정확해서 신뢰가 갔어요. 선입금 요구하는 곳은 무조건 거르세요.", authorId: "u3", createdAt: d(1, 14), likes: ["u1", "u4"], views: 932, tags: ["AI부업", "재택"], commentCount: 6 },
  { id: "p5", board: "groupbuy", title: "[공구] 무형광 유아 세제 4kg 2개 — 30명 모이면 38% 할인", body: "지난달 공구 후기 좋아서 다시 열어요. 9/25까지 신청, 배송 10/2 예정. 댓글로 수량 남겨주세요.", authorId: "u4", createdAt: d(2, 10), likes: ["u1", "u3", "u5", "u2"], views: 1500, tags: ["공구", "유아세제"], commentCount: 21 },
  { id: "p6", board: "free", title: "남편 몰래 만든 비상금 통장, 파킹통장 금리 어디가 나아요?", body: "3.2%랑 3.5% 중에 고민이에요. 매달 30만원씩 넣을 거라 큰 차이 없겠지만 그래도 궁금해서요.", authorId: "u5", createdAt: d(2, 22), likes: ["u2"], views: 388, tags: ["파킹통장"], commentCount: 9 },
  { id: "p7", board: "region", title: "[성남 분당] 롯데마트 수요일 저녁 7시 이후 신선식품 30% 스티커", body: "매주 수요일 7시 넘으면 육류·생선 코너 마감 할인 붙어요. 애들 저녁 준비하고 잠깐 다녀오기 딱이에요.", authorId: "u1", createdAt: d(3, 19), likes: ["u4"], views: 260, tags: ["분당", "마트할인"], region: "경기 성남", commentCount: 2 },
  { id: "p8", board: "qna", title: "체험단 선정되면 세금 신고 해야 하나요?", body: "제품 협찬만 받으면 괜찮은지, 원고료 받으면 3.3% 떼는 건지 헷갈려요.", authorId: "u5", createdAt: d(4, 15), likes: [], views: 410, tags: ["세금", "체험단"], commentCount: 3 },
  { id: "p9", board: "income", title: "매매일지 3개월 — 승률 41%에서 58%로", body: "종목 추천 안 보고 체크리스트만 지켰어요. 특히 '손절 기준선' 미리 적는 것만으로 큰 손실이 사라졌습니다.", authorId: "u2", createdAt: d(5, 9), likes: ["u1", "u3", "u4"], views: 1100, tags: ["매매일지", "승률"], income: 412000, commentCount: 7 },
  { id: "p10", board: "sidejob", title: "[광고] 그린테이블 밀키트 인스타 릴스 체험단 — 15명 모집", body: "제품 제공 + 3만 포인트. 30초 릴스 1건. 신청은 체험단 메뉴에서!", authorId: "a1", createdAt: d(0, 9), likes: [], views: 200, tags: ["체험단"], sponsored: true, commentCount: 0 },
];

export const COMMENTS: Comment[] = [
  { id: "c1", postId: "p1", authorId: "u2", body: "루틴 만드신 게 대단해요. 설문은 어디서 하세요?", createdAt: d(0, 12) },
  { id: "c2", postId: "p1", authorId: "u1", body: "주부테크 체험단 탭에 설문 카테고리 있어요! 하루 3개 제한이라 매일 들어가요.", createdAt: d(0, 12), parentId: "c1" },
  { id: "c3", postId: "p1", authorId: "u4", body: "저도 다음 주부터 오전 두 시간 도전합니다", createdAt: d(0, 13) },
  { id: "c4", postId: "p3", authorId: "u1", body: "손절선 미리 쓰는 거 저도 해봐야겠어요.", createdAt: d(1, 22) },
  { id: "c5", postId: "p2", authorId: "u5", body: "신청했어요! 감사합니다.", createdAt: d(0, 9) },
];

export const INFO: InfoArticle[] = [
  { id: "i1", category: "subsidy", title: "2026 하반기 아이돌봄 본인부담금 지원 (경기·서울 확대)", summary: "3~12세 자녀 가구, 중위소득 150% 이하면 월 최대 10만원. 온라인 신청 가능.", body: ["기존 맞벌이 조건이 폐지되어 외벌이·휴직 가구도 신청할 수 있습니다.", "정부24 보조금24에서 '아이돌봄' 검색 후 신청. 심사 2~3주.", "이미 아이돌봄 서비스를 이용 중이면 소급 적용됩니다."], source: "보건복지부 · 정부24", sourceDate: "2026-09-10", deadline: day(12), rewardPoints: 300, saves: 1820, tags: ["육아", "경기도", "서울"], amount: "월 최대 100,000원", target: "3~12세 자녀 가구", howTo: ["정부24 로그인", "보조금24 → 아이돌봄 검색", "가구원·소득 정보 확인 후 제출"] },
  { id: "i2", category: "card", title: "9월 주부 필수 카드 혜택 3가지 — 마트 10% · 학원비 5% · 주유 리터당 100원", summary: "이번 달 실적 조건이 낮아진 카드 위주로 정리했어요.", body: ["A카드: 전월 30만원 실적으로 대형마트 10% (월 1만원 한도)", "B카드: 학원·교육비 5% 청구할인, 실적 40만원", "C카드: 주유 리터당 100원, 실적 없음"], source: "각 카드사 공지 취합", sourceDate: "2026-09-01", rewardPoints: 100, saves: 940, tags: ["카드", "마트", "학원비"] },
  { id: "i3", category: "finance", title: "ETF가 뭔가요? 5분 만에 이해하는 주부용 설명", summary: "한 종목이 아니라 '바구니'를 사는 것. 월 10만원부터 시작하는 법.", body: ["ETF는 여러 종목을 묶어 놓은 바구니를 주식처럼 사고파는 상품입니다.", "국내 대표지수·미국 S&P500·배당 ETF가 입문용으로 많이 언급됩니다. 특정 상품 추천이 아닌 구조 설명입니다.", "적립식으로 매달 같은 날 매수하면 가격 평균 효과가 생깁니다.", "총보수(수수료)와 분배금(배당) 지급 주기를 꼭 확인하세요."], source: "주부테크 에디터", sourceDate: "2026-09-05", rewardPoints: 200, saves: 2210, tags: ["ETF", "입문", "학습"] },
  { id: "i4", category: "saving", title: "식비 30% 줄여준 장보기 루틴 — 마감 할인 시간표 (전국 마트별)", summary: "이마트·롯데마트·홈플러스 신선식품 마감 할인 시작 시간 정리.", body: ["이마트: 20시 이후 초밥·베이커리 30~50%", "롯데마트: 수요일 19시 이후 육류·생선", "홈플러스: 21시 이후 조리식품"], source: "회원 제보 취합 (12건)", sourceDate: "2026-09-12", rewardPoints: 100, saves: 3100, tags: ["절약", "마트", "식비"] },
  { id: "i5", category: "parenting", title: "초등 돌봄교실 신청 놓쳤다면? 지자체 '우리동네 키움센터' 이용법", summary: "방과후 17~19시 무료 돌봄, 저녁 간식 제공. 서울 전 자치구.", body: ["서울시 우리동네키움센터는 초등 1~6학년 대상 무료 돌봄입니다.", "우리동네키움포털에서 센터 찾기 → 등록 신청."], source: "서울시", sourceDate: "2026-08-28", rewardPoints: 150, saves: 760, tags: ["초등", "돌봄", "서울"] },
  { id: "i6", category: "pet", title: "반려동물 진료비 부가세 면제 항목 확대 — 예방접종·중성화 포함", summary: "올해부터 면제 항목이 100개로 늘었어요. 영수증에서 확인하는 법.", body: ["진찰·입원·예방접종·중성화 등 100개 항목이 부가세 면제.", "동물병원 영수증의 '면세' 표기를 확인하세요."], source: "농림축산식품부", sourceDate: "2026-09-02", rewardPoints: 100, saves: 430, tags: ["반려동물", "진료비"] },
  { id: "i7", category: "sidejob", title: "선입금 요구하면 무조건 사기 — 재택부업 안전 체크 7가지", summary: "주부테크가 미션을 검수할 때 쓰는 기준을 그대로 공개합니다.", body: ["교육비·보증금·물품비 선입금 요구 → 차단", "사업자 정보·정산 주기 명시 여부", "결과물 소유권과 초상권 조항 확인", "다단계식 '추천인 모집' 구조 → 차단"], source: "주부테크 운영팀", sourceDate: "2026-09-08", rewardPoints: 200, saves: 1990, tags: ["부업", "안전"] },
  { id: "i8", category: "policy", title: "경력단절여성 '새일센터' 직업훈련 — 훈련수당 월 20만원 + 취업연계", summary: "온라인 콘텐츠 제작·전자상거래 과정 10월 개강. 수강료 무료.", body: ["여성새로일하기센터 직업교육훈련 참여 시 훈련수당 지급.", "온라인 콘텐츠 마케터, 스마트스토어 운영 과정 등."], source: "여성가족부 새일센터", sourceDate: "2026-09-14", deadline: day(20), rewardPoints: 300, saves: 1250, tags: ["재취업", "교육", "무료"], amount: "훈련수당 월 200,000원", target: "경력단절여성" },
];

export const CAMPAIGNS: Campaign[] = [
  // (검수 대기 캠페인은 PENDING_CAMPAIGN 으로 아래에서 병합)
  { id: "cp1", advertiserId: "a1", brand: "그린테이블", title: "저염 밀키트 3종 인스타 릴스 체험단", category: "food", channels: ["instagram"], thumbIcon: "noodle", reward: { type: "point", value: 30000, desc: "밀키트 3종(정가 42,000원) + 30,000P" }, recruitCount: 15, applicantIds: ["u2", "u3", "u4", "u5"], recruitStart: day(-5), recruitEnd: day(6), announceDate: day(8), missionStart: day(9), missionEnd: day(23), missions: ["30초 이상 릴스 1건 (조리 과정 포함)", "본문에 #그린테이블 #주부테크체험단 해시태그", "게시물 4주 유지"], requirements: ["팔로워 500명 이상 공개 계정", "만 20세 이상", "수령 후 14일 내 업로드"], keywords: ["밀키트", "저염", "저녁준비"], status: "open", createdAt: d(5), views: 2210 },
  { id: "cp2", advertiserId: "a2", brand: "베베코튼", title: "신생아 오가닉 바디로션 블로그 리뷰", category: "parenting", channels: ["blog"], thumbIcon: "baby", reward: { type: "product", value: 28000, desc: "바디로션 200ml 2개 (정가 28,000원)" }, recruitCount: 20, applicantIds: ["u1", "u3"], recruitStart: day(-3), recruitEnd: day(10), announceDate: day(12), missionStart: day(13), missionEnd: day(27), missions: ["사진 10장 이상 블로그 리뷰 1건", "사용 전후 피부 상태 솔직 후기"], requirements: ["0~24개월 자녀 양육 중", "네이버 블로그 일 방문 50 이상"], keywords: ["신생아로션", "오가닉"], status: "open", createdAt: d(3), views: 1480 },
  { id: "cp3", advertiserId: "a1", brand: "주부테크 리서치", title: "3040 주부 장보기 습관 설문 (10분)", category: "finance", channels: ["survey"], thumbIcon: "basket", reward: { type: "point", value: 3000, desc: "3,000P 즉시 지급" }, recruitCount: 300, applicantIds: ["u1", "u2", "u3", "u4", "u5"], recruitStart: day(-10), recruitEnd: day(3), announceDate: day(3), missionStart: day(-10), missionEnd: day(3), missions: ["설문 완료 (약 10분)"], requirements: ["주 1회 이상 장보기"], keywords: ["설문"], status: "open", createdAt: d(10), views: 5300 },
  { id: "cp4", advertiserId: "a2", brand: "멍냥마켓", title: "강아지 덴탈껌 영수증 후기 (전국 매장)", category: "pet", channels: ["receipt"], thumbIcon: "paw", reward: { type: "cash", value: 8000, desc: "구매 금액 100% 페이백 (최대 8,000원)" }, recruitCount: 50, applicantIds: ["u3"], recruitStart: day(-2), recruitEnd: day(14), announceDate: day(14), missionStart: day(-2), missionEnd: day(21), missions: ["매장 구매 영수증 업로드", "별점+한 줄 후기"], requirements: ["반려견 양육 가구"], keywords: ["덴탈껌", "페이백"], status: "open", createdAt: d(2), views: 880 },
  { id: "cp5", advertiserId: "a1", brand: "코지홈", title: "무선 물걸레 청소기 4주 사용 유튜브 쇼츠", category: "living", channels: ["youtube", "tiktok"], thumbIcon: "home", reward: { type: "product", value: 189000, desc: "청소기 제공 (반납 없음) + 50,000P" }, recruitCount: 5, applicantIds: ["u1", "u2", "u4", "u5", "u3"], recruitStart: day(-20), recruitEnd: day(-4), announceDate: day(-2), missionStart: day(0), missionEnd: day(28), missions: ["쇼츠 2건", "4주차 솔직 리뷰"], requirements: ["구독자 1,000명 이상"], keywords: ["청소기"], status: "ongoing", createdAt: d(20), views: 4100 },
  { id: "cp6", advertiserId: "a2", brand: "새싹영어", title: "초등 화상영어 2주 무료체험 후기", category: "education", channels: ["blog", "instagram"], thumbIcon: "study", reward: { type: "point", value: 20000, desc: "2주 무료 수강 + 20,000P" }, recruitCount: 30, applicantIds: [], recruitStart: day(-30), recruitEnd: day(-15), announceDate: day(-13), missionStart: day(-12), missionEnd: day(-1), missions: ["체험 후기 1건"], requirements: ["초등 자녀"], keywords: ["화상영어"], status: "done", createdAt: d(30), views: 3300 },
  { id: "cp7", advertiserId: "a1", brand: "동네빵집 르뺑", title: "[성남 분당] 신메뉴 시식단 — 매장 방문 후기", category: "local", channels: ["instagram", "receipt"], thumbIcon: "chef", reward: { type: "product", value: 25000, desc: "신메뉴 세트 + 아메리카노 2잔" }, recruitCount: 10, applicantIds: ["u1"], recruitStart: day(-1), recruitEnd: day(5), announceDate: day(6), missionStart: day(7), missionEnd: day(14), missions: ["매장 방문 사진 3장 포함 게시물"], requirements: ["성남·용인 거주"], keywords: ["분당", "빵집"], region: "경기 성남", status: "open", createdAt: d(1), views: 610 },
];

export const APPLICATIONS: Application[] = [
  { id: "ap1", campaignId: "cp2", userId: "u1", message: "5개월 아기 키우고 있어요. 민감 피부라 오가닉 로션 리뷰에 진심입니다.", channel: "blog", channelUrl: "https://blog.naver.com/seoyeonmom", status: "pending", createdAt: d(2) },
  { id: "ap2", campaignId: "cp3", userId: "u1", message: "", channel: "survey", channelUrl: "", status: "completed", createdAt: d(8) },
  { id: "ap3", campaignId: "cp5", userId: "u1", message: "물걸레 청소기 3대째 써본 경험 있어요.", channel: "youtube", channelUrl: "https://youtube.com/@seoyeonmom", status: "selected", createdAt: d(15) },
  { id: "ap4", campaignId: "cp7", userId: "u1", message: "분당 거주, 매주 가는 빵집이에요!", channel: "instagram", channelUrl: "https://instagram.com/seoyeon_mom", status: "pending", createdAt: d(0) },
  { id: "ap5", campaignId: "cp1", userId: "u2", message: "저녁 준비 릴스 자주 올려요.", channel: "instagram", channelUrl: "https://instagram.com/jihye", status: "pending", createdAt: d(3) },
  { id: "ap6", campaignId: "cp1", userId: "u3", message: "요리 릴스 계정 운영 중입니다.", channel: "instagram", channelUrl: "https://instagram.com/haeun", status: "pending", createdAt: d(2) },
  { id: "ap7", campaignId: "cp1", userId: "u4", message: "쌍둥이 저녁 전쟁 컨텐츠로 유명해요 ㅎㅎ", channel: "instagram", channelUrl: "https://instagram.com/minjeong", status: "pending", createdAt: d(1) },
  { id: "ap8", campaignId: "cp1", userId: "u5", message: "", channel: "instagram", channelUrl: "https://instagram.com/yujin", status: "pending", createdAt: d(0) },
];

const t = (o: Partial<Trade> & Pick<Trade, "id" | "name" | "buyDate" | "buyPrice" | "qty">): Trade => ({
  userId: "u1",
  market: "KOSPI",
  checklist: emptyChecklist(),
  maTrend: emptyMaTrend(),
  buyReasons: [],
  sellReasons: { intraday: "", volume: "", index: "" },
  createdAt: d(0),
  ...o,
});

export const TRADES: Trade[] = [
  t({ id: "t1", name: "삼성전자", buyDate: day(-24), sellDate: day(-18), buyPrice: 71200, sellPrice: 68400, qty: 20, targetPrice: 78000, stopPrice: 68500, support: "68,000 (20일선)", resistance: "75,000 (전고점)", checklist: { ma: true, ichimoku: false, bollinger: true, supply: false, entry: false, market: false }, ichimokuPos: "below", bollingerPos: "lower", maTrend: { "5": "up", "10": "up", "20": "down", "60": "down", "120": "up", "224": "up", "448": "up" }, buyReasons: ["5일선 골든크로스", "외국인 3일 연속 순매수"], sellReasons: { intraday: "손절선 -4% 터치, 기계적 매도", volume: "5분봉 거래량 급감", index: "코스피 -1.8% 동반 하락" }, memo: "체크 6개 중 2개. 시장 환경 확인 안 함.", emotion: "fomo", createdAt: d(24) }),
  t({ id: "t2", name: "KODEX 200", market: "ETF", buyDate: day(-15), sellDate: day(-3), buyPrice: 38900, sellPrice: 41200, qty: 30, targetPrice: 41000, stopPrice: 37500, support: "38,500", resistance: "41,000", checklist: { ma: true, ichimoku: true, bollinger: true, supply: true, entry: true, market: true }, ichimokuPos: "above", bollingerPos: "upper", maTrend: { "5": "up", "10": "up", "20": "up", "60": "up", "120": "up", "224": "up", "448": "up" }, buyReasons: ["정배열 초입", "구름대 상단 돌파", "지수 상승 추세"], sellReasons: { intraday: "목표가 도달 익절", volume: "", index: "" }, emotion: "calm", createdAt: d(15) }),
  t({ id: "t3", name: "에코프로비엠", market: "KOSDAQ", buyDate: day(-9), sellDate: day(-7), buyPrice: 152000, sellPrice: 161500, qty: 4, targetPrice: 165000, stopPrice: 146000, checklist: { ma: true, ichimoku: true, bollinger: false, supply: true, entry: true, market: true }, maTrend: { "5": "up", "10": "up", "20": "up", "60": "down", "120": "down", "224": "down", "448": "down" }, buyReasons: ["전고점 돌파(거래량 동반)"], sellReasons: { intraday: "장중 급등 후 윗꼬리, 분할 익절", volume: "5분봉 거래량 피크", index: "코스닥 강세" }, emotion: "calm", createdAt: d(9) }),
  t({ id: "t4", name: "TIGER 미국S&P500", market: "ETF", buyDate: day(-6), buyPrice: 19850, qty: 50, targetPrice: 22000, stopPrice: 18800, checklist: { ma: true, ichimoku: true, bollinger: true, supply: false, entry: true, market: true }, maTrend: { "5": "up", "10": "up", "20": "up", "60": "up", "120": "up", "224": "up", "448": "up" }, buyReasons: ["적립식 정기 매수", "20일선 눌림목"], sellReasons: { intraday: "", volume: "", index: "" }, emotion: "calm", createdAt: d(6) }),
  t({ id: "t5", name: "현대차", buyDate: day(-2), buyPrice: 243000, qty: 3, targetPrice: 262000, stopPrice: 233000, support: "238,000", resistance: "255,000", checklist: { ma: true, ichimoku: true, bollinger: false, supply: true, entry: true, market: false }, ichimokuPos: "above", maTrend: { "5": "up", "10": "up", "20": "up", "60": "up", "120": "down", "224": "up", "448": "up" }, buyReasons: ["기관 평단가 부근", "지지선 눌림목"], sellReasons: { intraday: "", volume: "", index: "" }, emotion: "calm", createdAt: d(2) }),
];

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "u1", title: "코지홈 청소기 체험단에 선정되었어요!", body: "미션 기간을 확인하고 제품 수령 주소를 등록해 주세요.", href: "/campaigns/cp5", read: false, createdAt: d(2) },
  { id: "n2", userId: "u1", title: "설문 완료 3,000P 지급", body: "주부 장보기 습관 설문 참여 감사합니다.", href: "/me", read: false, createdAt: d(3) },
  { id: "n3", userId: "u1", title: "지혜의숲 님이 댓글을 남겼어요", body: "루틴 만드신 게 대단해요. 설문은 어디서 하세요?", href: "/community/p1", read: true, createdAt: d(0) },
];

export const REPORTS: Report[] = [
  { id: "r1", target: "post", targetId: "p10", reporterId: "u5", reason: "광고 표시 누락 의심", detail: "협찬 문구 없이 링크만 있어요.", status: "open", createdAt: d(0, 10) },
  { id: "r2", target: "post", targetId: "p6", reporterId: "u3", reason: "개인정보 노출", detail: "통장 캡처에 계좌번호가 보여요.", status: "open", createdAt: d(1, 16) },
  { id: "r3", target: "comment", targetId: "c3", reporterId: "u2", reason: "도배", status: "resolved", createdAt: d(3, 9) },
  { id: "r4", target: "campaign", targetId: "cp4", reporterId: "u1", reason: "선입금 요구", detail: "구매 후 페이백인데 조건이 불명확해요.", status: "open", createdAt: d(2, 13) },
  { id: "r5", target: "user", targetId: "u5", reporterId: "u4", reason: "리딩방 홍보 DM", status: "dismissed", createdAt: d(5, 11) },
];

export const PENDING_CAMPAIGN: Campaign = { id: "cp8", advertiserId: "a2", brand: "베베코튼", title: "아기 세탁세제 영수증 후기 (전국 마트)", category: "parenting", channels: ["receipt"], thumbIcon: "baby", reward: { type: "cash", value: 6000, desc: "구매 금액 페이백 (최대 6,000원)" }, recruitCount: 100, applicantIds: [], recruitStart: day(3), recruitEnd: day(20), announceDate: day(20), missionStart: day(3), missionEnd: day(27), missions: ["영수증 업로드", "별점+한 줄 후기"], requirements: ["0~36개월 자녀"], keywords: ["세제", "페이백"], status: "pending", createdAt: d(0, 8), views: 0 };
CAMPAIGNS.push(PENDING_CAMPAIGN);

export const POINT_LOGS: PointLog[] = [
  { id: "pl1", userId: "u1", amount: 3000, reason: "설문 완료 · 3040 주부 장보기 습관", createdAt: d(3) },
  { id: "pl2", userId: "u1", amount: 300, reason: "지원금 정보 저장 · 아이돌봄 본인부담금", createdAt: d(4) },
  { id: "pl3", userId: "u1", amount: 500, reason: "영수증 인증 7일 연속 보너스", createdAt: d(5) },
  { id: "pl4", userId: "u1", amount: 200, reason: "학습 완료 · ETF가 뭔가요?", createdAt: d(6) },
  { id: "pl5", userId: "u1", amount: -5000, reason: "기프티콘 교환 · 커피 쿠폰", createdAt: d(9) },
  { id: "pl6", userId: "u1", amount: 30000, reason: "체험단 미션 완료 · 8월 밀키트", createdAt: d(22) },
];
