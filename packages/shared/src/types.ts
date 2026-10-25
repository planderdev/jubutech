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
  createdAt: string;
}
