export type Role = "guest" | "member" | "advertiser" | "admin";

export interface User {
  id: string;
  name: string;
  nickname: string;
  role: Exclude<Role, "guest">;
  region: string;
  tags: string[];
  points: number;
  level: number;
  badges: string[];
  intro?: string;
  channels?: { type: ChannelType; url: string; followers?: number }[];
  brand?: string;
  status?: "active" | "suspended";
  joinedAt?: string;
  image?: string;
  provider?: string;
}

export type Board = "income" | "sidejob" | "subsidy" | "stock" | "groupbuy" | "free" | "region" | "qna";
export const BOARDS: { key: Board; label: string; desc: string }[] = [
  { key: "income", label: "수익인증", desc: "이번 달 벌었어요" },
  { key: "sidejob", label: "부업후기", desc: "해보니 이랬어요" },
  { key: "subsidy", label: "지원금제보", desc: "이거 신청하세요" },
  { key: "stock", label: "주식·재테크", desc: "공부기록·매매복기" },
  { key: "groupbuy", label: "공구/쇼핑", desc: "같이 사면 싸요" },
  { key: "free", label: "자유", desc: "수다·고민" },
  { key: "region", label: "지역", desc: "우리 동네 생활경제" },
  { key: "qna", label: "질문", desc: "물어보세요" },
];

export interface Post {
  id: string;
  board: Board;
  title: string;
  body: string;
  authorId: string;
  createdAt: string;
  likes: string[];
  views: number;
  tags: string[];
  region?: string;
  thumb?: string;
  sponsored?: boolean;
  income?: number;
  commentCount: number;
  status?: "published" | "hidden";
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  parentId?: string;
}

export type InfoCategory = "subsidy" | "policy" | "saving" | "card" | "finance" | "parenting" | "pet" | "sidejob";
export const INFO_CATEGORIES: { key: InfoCategory; label: string }[] = [
  { key: "subsidy", label: "지원금" },
  { key: "policy", label: "정책" },
  { key: "saving", label: "절약" },
  { key: "card", label: "카드혜택" },
  { key: "finance", label: "금융기초" },
  { key: "parenting", label: "육아·교육" },
  { key: "pet", label: "반려생활" },
  { key: "sidejob", label: "부업" },
];

export interface InfoArticle {
  id: string;
  category: InfoCategory;
  title: string;
  summary: string;
  body: string[];
  source: string;
  sourceDate: string;
  deadline?: string;
  rewardPoints: number;
  saves: number;
  tags: string[];
  amount?: string;
  target?: string;
  howTo?: string[];
}

export type ChannelType = "instagram" | "blog" | "youtube" | "tiktok" | "receipt" | "survey";
export const CHANNELS: { key: ChannelType; label: string }[] = [
  { key: "instagram", label: "인스타그램" },
  { key: "blog", label: "블로그" },
  { key: "youtube", label: "유튜브" },
  { key: "tiktok", label: "틱톡" },
  { key: "receipt", label: "영수증 후기" },
  { key: "survey", label: "설문·테스트" },
];

export type CampaignStatus = "draft" | "pending" | "open" | "closed" | "selected" | "ongoing" | "done";
export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; tone: "red" | "butter" | "sage" | "mute" | "sky" | "ink" }> = {
  draft: { label: "작성중", tone: "mute" },
  pending: { label: "검수중", tone: "sky" },
  open: { label: "모집중", tone: "red" },
  closed: { label: "모집마감", tone: "mute" },
  selected: { label: "선정발표", tone: "butter" },
  ongoing: { label: "미션진행", tone: "sage" },
  done: { label: "완료", tone: "ink" },
};

export type CampaignCategory = "food" | "living" | "beauty" | "parenting" | "pet" | "finance" | "education" | "local";
export const CAMPAIGN_CATEGORIES: { key: CampaignCategory; label: string }[] = [
  { key: "food", label: "식품" },
  { key: "living", label: "생활·가전" },
  { key: "beauty", label: "뷰티" },
  { key: "parenting", label: "육아·교육" },
  { key: "pet", label: "반려동물" },
  { key: "finance", label: "금융·앱" },
  { key: "education", label: "클래스" },
  { key: "local", label: "지역·매장" },
];

export interface Campaign {
  id: string;
  advertiserId: string;
  brand: string;
  title: string;
  category: CampaignCategory;
  channels: ChannelType[];
  thumbIcon: string;
  reward: { type: "product" | "point" | "cash"; value: number; desc: string };
  recruitCount: number;
  applicantIds: string[];
  recruitStart: string;
  recruitEnd: string;
  announceDate: string;
  missionStart: string;
  missionEnd: string;
  missions: string[];
  requirements: string[];
  keywords: string[];
  region?: string;
  /** 1-1 미션 카드 — 없으면 `rules.mission` 기본값을 쓴다 */
  mission?: MissionCard;
  /** 협찬 제품 가치(원) — 지갑의 "받은 제품 가치" 합산용. 포인트·현금 보상은 reward.value */
  benefitValue?: number;
  status: CampaignStatus;
  createdAt: string;
  views: number;
  reviewNote?: string;
}

export type ApplicationStatus = "pending" | "selected" | "rejected" | "submitted" | "completed" | "cancelled";
export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: "red" | "butter" | "sage" | "mute" | "sky" | "ink" }> = {
  pending: { label: "응모완료", tone: "sky" },
  selected: { label: "선정", tone: "red" },
  rejected: { label: "미선정", tone: "mute" },
  submitted: { label: "미션제출", tone: "butter" },
  completed: { label: "완료·지급", tone: "sage" },
  cancelled: { label: "취소", tone: "mute" },
};

export interface Application {
  id: string;
  campaignId: string;
  userId: string;
  message: string;
  channel: ChannelType;
  channelUrl: string;
  status: ApplicationStatus;
  createdAt: string;
  submissionUrl?: string;
}

/* ───────── 매매일지 (트레이딩 매매 체크리스트 기반) ───────── */
export type Market = "KOSPI" | "KOSDAQ" | "ETF" | "US";
export type Trend = "up" | "down" | null;
export const MA_KEYS = ["5", "10", "20", "60", "120", "224", "448"] as const;
export type MaKey = (typeof MA_KEYS)[number];

export const CHECKLIST_ITEMS: { key: keyof TradeChecklist; label: string; point: string }[] = [
  { key: "ma", label: "이평선 배열", point: "5일선·20일선 골든크로스 발생 여부 및 정배열 초입 확인" },
  { key: "ichimoku", label: "일목균형표", point: "현재 주가가 구름대 위/아래 위치 및 돌파 여부" },
  { key: "bollinger", label: "볼린저밴드", point: "현재 주가 위치 (상단 돌파·안착 / 하단 지지)" },
  { key: "supply", label: "수급 분석", point: "기관 평단가 부근 및 외국인 지속 수급/평단 확인 여부" },
  { key: "entry", label: "매수 타점", point: "직전 고점 돌파(거래량 동반) 또는 주요 지지선 눌림목 확인" },
  { key: "market", label: "시장 환경 (지수)", point: "코스피/코스닥 지수의 방향성 및 변동성 장세 유무 확인" },
];

export interface TradeChecklist {
  ma: boolean;
  ichimoku: boolean;
  bollinger: boolean;
  supply: boolean;
  entry: boolean;
  market: boolean;
}

export interface Trade {
  id: string;
  userId: string;
  name: string;
  market: Market;
  buyDate: string;
  sellDate?: string;
  buyPrice: number;
  sellPrice?: number;
  qty: number;
  targetPrice?: number;
  stopPrice?: number;
  support?: string;
  resistance?: string;
  checklist: TradeChecklist;
  ichimokuPos?: "above" | "below";
  bollingerPos?: "upper" | "lower";
  maTrend: Record<MaKey, Trend>;
  buyReasons: string[];
  sellReasons: { intraday: string; volume: string; index: string };
  memo?: string;
  emotion?: "calm" | "fomo" | "fear" | "greedy";
  createdAt: string;
}

export const emptyChecklist = (): TradeChecklist => ({ ma: false, ichimoku: false, bollinger: false, supply: false, entry: false, market: false });
export const emptyMaTrend = (): Record<MaKey, Trend> => ({ "5": null, "10": null, "20": null, "60": null, "120": null, "224": null, "448": null });

export function tradePnl(t: Trade) {
  if (!t.sellPrice) return null;
  const pnl = (t.sellPrice - t.buyPrice) * t.qty;
  const pct = ((t.sellPrice - t.buyPrice) / t.buyPrice) * 100;
  return { pnl, pct };
}
export function checklistScore(c: TradeChecklist) {
  return Object.values(c).filter(Boolean).length;
}

export type ReportTarget = "post" | "comment" | "campaign" | "user";
export type ReportStatus = "open" | "resolved" | "dismissed";
export interface Report {
  id: string;
  target: ReportTarget;
  targetId: string;
  reporterId: string;
  reason: string;
  detail?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  target: string;
  reason?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
}

export interface PointLog {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  /** 1-3 지갑 내역 유형. 없으면 "event" 로 본다 */
  kind?: WalletEntryKind;
  refType?: string;
  refId?: string;
  createdAt: string;
}

/* ───────── 1단계 (기획안 2026-10-30) — 미션 카드 · 후기 검수 · 생활력 · 지갑 · 초대 ───────── */

/** 1-1 미션 카드: 광고주가 캠페인 등록 시 정하고, 주부는 선정 화면에서 체크리스트로 본다 */
export interface MissionCard {
  /** 필수 사진 장수 */
  photoCount: number;
  /** 최소 글자 수 */
  minChars: number;
  /** 본문에 꼭 들어가야 하는 키워드 */
  requiredKeywords: string[];
  /** 꼭 붙여야 하는 해시태그 (# 없이) */
  hashtags: string[];
  /** 선정 발표 후 제출 기한(일). 없으면 `rules.mission.defaultDueDays` */
  dueDays?: number;
}

export type ReviewStatus = "pending" | "revision" | "approved" | "rejected";
export const REVIEW_STATUS: Record<ReviewStatus, { label: string; tone: "red" | "butter" | "sage" | "mute" | "sky" | "ink" }> = {
  pending: { label: "검토 대기", tone: "sky" },
  revision: { label: "보완 요청", tone: "butter" },
  approved: { label: "승인 완료", tone: "sage" },
  rejected: { label: "반려", tone: "mute" },
};

export type ReviewCheckKey = "chars" | "photos" | "keywords" | "hashtags" | "link";
/** 자동 검사 항목 하나의 결과 — "사진 2장 더 필요해요" 식 안내는 `message` */
export interface ReviewCheckItem {
  key: ReviewCheckKey;
  ok: boolean;
  required: number | string | string[];
  actual: number | string | string[];
  message: string;
}
export interface ReviewCheck {
  passed: boolean;
  items: ReviewCheckItem[];
  checkedAt: string;
}

/** 1-1 후기 제출물 — 응모(Application) 1건당 최대 1건, 보완 요청 시 같은 레코드를 갱신 */
export interface Review {
  id: string;
  applicationId: string;
  /** 외부 후기 링크(블로그·인스타·네이버 리뷰). 앱 안에서 직접 쓰면 비움 */
  url?: string;
  /** 앱 안에서 직접 쓴 본문 */
  content?: string;
  photoCount: number;
  check?: ReviewCheck;
  status: ReviewStatus;
  /** 보완 요청·반려 사유 */
  feedback?: string;
  /** 광고주(또는 대행 관리자) 별점 1~5 — 1-2 생활력 반영 */
  rating?: number;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/** 1-2 생활력 점수가 바뀌는 일 (규칙표의 행) */
export type TrustEventKind = "review_approved" | "review_rated" | "comment_liked" | "review_overdue" | "post_hidden" | "invite_bonus" | "manual";
export const TRUST_EVENT_LABEL: Record<TrustEventKind, string> = {
  review_approved: "기한 안에 후기 제출·검수 통과",
  review_rated: "광고주의 후기 평가(별점)",
  comment_liked: "커뮤니티에서 도움된 답글",
  review_overdue: "선정 후 미제출·기한 초과",
  post_hidden: "신고 누적으로 글 숨김",
  invite_bonus: "초대 보너스",
  manual: "운영자 조정",
};
export interface TrustEvent {
  id: string;
  userId: string;
  kind: TrustEventKind;
  /** 점수 변화(±). 규칙은 `rules.trust.delta` */
  delta: number;
  refType?: string;
  refId?: string;
  note?: string;
  createdAt: string;
}

/** 1-3 지갑 내역 유형 — 포인트 원장(PointLog)에 붙는다. 금액 단위는 원 */
export type WalletEntryKind = "review" | "referral" | "event" | "product_value" | "withdraw" | "adjust";
export const WALLET_KIND_LABEL: Record<WalletEntryKind, string> = {
  review: "후기 리워드",
  referral: "추천 수익",
  event: "이벤트",
  product_value: "받은 제품 가치",
  withdraw: "출금",
  adjust: "운영 조정",
};

/** 2-3 초대 코드 — 회원 1명당 1개 */
export interface InviteCode {
  code: string;
  ownerId: string;
  createdAt: string;
  uses: { userId: string; usedAt: string }[];
}

/** 2-3 랜딩 "출시 알림 받기" 대기자 */
export interface WaitlistEntry {
  id: string;
  contact: string;
  channel: "email" | "phone";
  source?: string;
  createdAt: string;
}
