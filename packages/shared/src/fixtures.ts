/**
 * PHP 데모(`app/data/fixtures.php`·`app/data/banners.php`)와 같은 모양의 검토용 데이터.
 * 앱·관리자가 PHP 데모와 같은 화면을 보도록 엔티티 이름·필드를 PHP 쪽에 맞춘다.
 * 기준 시각 2026-10-21 12:00 KST. 모든 데이터는 가상이다.
 */

import type { InviteCode, MissionCard, Review, TrustEvent, WalletEntryKind } from "./types";

export const DEMO_NOW = "2026-10-21T12:00:00+09:00";

export type ServiceMode = "finance" | "journal" | "campaigns";

export interface DemoCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
  enabled: boolean;
}

export interface DemoArticleBlock {
  type: "paragraph" | "heading";
  text: string;
}

export interface DemoArticle {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  icon: string;
  thumbnail: string;
  bodyBlocks: DemoArticleBlock[];
  source: string;
  sourceUrl: string;
  publishedAt: string;
  status: "published" | "hidden";
  placement: "featured" | "list";
}

export interface DemoBanner {
  id: string;
  type: "promotion" | "detail";
  eyebrow: string;
  title: string;
  benefit: string;
  description: string;
  note: string;
  /** PHP 데모의 `/assets/images/banners/<name>.webp` 파일명 */
  image: string;
  imageAlt: string;
  background: "white" | "sky" | "mint" | "sand" | "rose";
  url: string;
  mode: ServiceMode;
  order: number;
  enabled: boolean;
  startAt: string;
  endAt: string;
}

export interface DemoMember {
  id: string;
  nickname: string;
  maskedContact: string;
  joinedAt: string;
  accountStatus: "active" | "suspended";
}

export interface DemoSettings {
  id: "site";
  financeIntro: string;
  journalIntro: string;
  campaignsIntro: string;
  defaultCategory: string;
}

export interface DemoNotification {
  id: string;
  memberId: string;
  title: string;
  body: string;
  url: string;
  mode: ServiceMode;
  read: boolean;
  createdAt: string;
}

const categoryRows: [string, string, string][] = [
  ["subsidy", "지원금", "landmark"],
  ["policy", "정책", "file-text"],
  ["saving", "절약", "shopping-basket"],
  ["card", "카드혜택", "credit-card"],
  ["finance", "금융기초", "book-open"],
  ["parenting", "육아·교육", "baby"],
  ["pet", "반려생활", "paw-print"],
  ["sidejob", "부업", "briefcase-business"],
];
export const DEMO_CATEGORIES: DemoCategory[] = categoryRows.map(([id, name, icon], i) => ({ id, name, icon, order: i + 1, enabled: true }));

const articleRows: [string, string, string, string][] = [
  ["subsidy", "우리 집이 받을 수 있는 지원금, 어디서 찾을까요?", "흩어져 있는 생활 지원 정보, 보조금24에서 확인하는 순서를 정리했어요.", "landmark"],
  ["saving", "식비를 아끼는 일주일 장보기 루틴", "냉장고 확인부터 장보기 목록까지, 작은 습관으로 시작해요.", "shopping-basket"],
  ["finance", "ETF가 뭔가요? 바구니로 이해하는 첫 투자", "한 종목 대신 여러 자산을 담는다는 의미부터 알아봐요.", "chart-pie"],
  ["card", "카드 혜택보다 먼저 확인할 세 가지", "전월 실적, 제외 항목, 할인 한도를 함께 살펴보세요.", "credit-card"],
  ["parenting", "아이 교육비, 우리 집 기준부터 세우기", "월별 고정 비용과 일회성 비용을 나눠 적어보세요.", "baby"],
  ["policy", "생활 정책 알림, 필요한 것만 받아보기", "거주 지역과 관심 분야에 맞게 알림을 설정하는 방법.", "bell"],
  ["saving", "구독 서비스 정리하는 날", "한 달 동안 사용하지 않은 구독이 있는지 살펴봐요.", "receipt"],
  ["pet", "반려동물 생활비, 항목별로 모아보기", "사료·병원·용품 비용을 분리하면 계획이 쉬워져요.", "paw-print"],
  ["sidejob", "재택 부업을 시작하기 전 확인할 것", "업무 범위와 정산 조건을 먼저 확인하는 습관.", "briefcase-business"],
  ["finance", "투자 일지에는 무엇을 적으면 좋을까요?", "결과보다 판단의 과정을 남기는 기록 방법.", "notebook-pen"],
  ["subsidy", "아이돌봄 지원, 신청 전 준비할 정보", "지원 조건과 신청 기간은 공식 안내에서 확인하세요.", "landmark"],
  ["saving", "가계부를 오래 쓰는 작은 방법", "모든 지출을 완벽히 적기보다, 꾸준히 돌아보세요.", "wallet"],
];
export const DEMO_ARTICLES: DemoArticle[] = articleRows.map(([categoryId, title, summary, icon], i) => ({
  id: `i${i + 1}`,
  categoryId,
  title,
  summary,
  icon,
  thumbnail: "",
  bodyBlocks: [
    { type: "paragraph", text: summary },
    { type: "heading", text: "내 생활에 맞게 하나씩 확인해요" },
    { type: "paragraph", text: "가장 먼저 지금의 상황과 필요한 정보를 적어보세요. 공식 안내의 기준일과 적용 대상을 확인하고, 궁금한 부분은 담당 기관의 안내를 참고하세요." },
    { type: "heading", text: "오늘 해볼 수 있는 작은 실천" },
    { type: "paragraph", text: "이번 주에 확인할 항목 한 가지를 정하고 메모에 남겨보세요. 이 글을 저장해 두면 마이페이지에서 다시 읽을 수 있어요." },
  ],
  source: "주부테크 편집팀 · 화면 검토용 예시",
  sourceUrl: "",
  publishedAt: `2026-10-${String(21 - i).padStart(2, "0")}T09:00:00+09:00`,
  status: "published",
  placement: i === 0 ? "featured" : "list",
}));

export const DEMO_BANNERS: DemoBanner[] = [
  { id: "home-finance-support", type: "promotion", eyebrow: "생활 속 돈 이야기", title: "우리 집 지원금,\n어디서 찾을까요?", benefit: "", description: "신청 전 필요한 정보를\n한곳에서 확인해요", note: "", image: "support-envelope", imageAlt: "파란 봉투와 황금 동전", background: "white", url: "/finance/articles/i1", mode: "finance", order: 1, enabled: true, startAt: "2026-10-01T00:00:00+09:00", endAt: "2026-12-31T23:59:59+09:00" },
  { id: "home-finance-card", type: "promotion", eyebrow: "우리 집 소비 점검", title: "카드 혜택보다\n먼저 확인할 세 가지", benefit: "", description: "실적·제외 항목·한도,\n내 기준부터 살펴봐요", note: "", image: "benefit-coupons", imageAlt: "글로시 핑크 카드와 할인 쿠폰", background: "white", url: "/finance/articles/i4", mode: "finance", order: 2, enabled: true, startAt: "2026-10-01T00:00:00+09:00", endAt: "2026-12-31T23:59:59+09:00" },
  { id: "home-campaign-discover", type: "promotion", eyebrow: "새롭게 만나는 일상", title: "써보고 싶었던 것,\n새로운 체험으로", benefit: "", description: "생활에 맞는 체험을\n천천히 골라보세요", note: "", image: "discovery-gift", imageAlt: "선물 상자와 체험 초대 카드 그래픽", background: "mint", url: "/campaigns/explore", mode: "campaigns", order: 1, enabled: true, startAt: "2026-10-01T00:00:00+09:00", endAt: "2026-12-31T23:59:59+09:00" },
];

export const DEMO_MEMBERS: DemoMember[] = [
  { id: "m1", nickname: "서연맘", maskedContact: "010-****-0101", joinedAt: "2026-08-01", accountStatus: "active" },
  { id: "m2", nickname: "민정살림", maskedContact: "010-****-0202", joinedAt: "2026-08-12", accountStatus: "active" },
  { id: "m3", nickname: "지혜의숲", maskedContact: "010-****-0303", joinedAt: "2026-09-02", accountStatus: "active" },
];

/** 회원별 저장한 정보 id */
export const DEMO_SAVED: Record<string, string[]> = { m1: ["i3", "i4"] };

export const DEMO_SETTINGS: DemoSettings = {
  id: "site",
  financeIntro: "오늘의 발견이\n내일의 여유로",
  journalIntro: "결과보다 과정을, 나만의 투자 기록",
  campaignsIntro: "써보고 싶었던 것,\n좋아하는 일상 속으로",
  defaultCategory: "subsidy",
};

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: "nt1", memberId: "m1", title: "코지홈 체험단에 선정되었어요", body: "체험 일정과 후기 미션을 확인해 주세요.", url: "/applications/a1", mode: "campaigns", read: false, createdAt: "2026-10-18" },
  { id: "nt2", memberId: "m1", title: "오늘의 투자 과정을 남겨보세요", body: "작은 기록이 나만의 기준이 돼요.", url: "/journal", mode: "journal", read: false, createdAt: "2026-10-21" },
];

/** PHP `homeCategories()`: 사용 중인 카테고리를 기본 카테고리 우선, 그다음 order 순으로 */
export function demoHomeCategories(categories = DEMO_CATEGORIES, defaultId = DEMO_SETTINGS.defaultCategory): DemoCategory[] {
  return categories
    .filter((c) => c.enabled)
    .sort((a, b) => (a.id === defaultId ? 0 : 1) - (b.id === defaultId ? 0 : 1) || a.order - b.order);
}

/** PHP `visibleArticle()`: 게시 상태이고 게시 시각이 기준 시각 이전 */
export function demoVisibleArticles(articles = DEMO_ARTICLES, now = DEMO_NOW): DemoArticle[] {
  const t = Date.parse(now);
  return articles.filter((a) => a.status === "published" && Date.parse(a.publishedAt) <= t);
}

/** PHP `visibleBanners()`: 서비스별 사용 중·노출 기간 내 배너를 order 순으로 */
export function demoVisibleBanners(mode: ServiceMode, banners = DEMO_BANNERS, now = DEMO_NOW): DemoBanner[] {
  const t = Date.parse(now);
  return banners
    .filter((b) => b.enabled && b.mode === mode && Date.parse(b.startAt) <= t && Date.parse(b.endAt) >= t)
    .sort((a, b) => a.order - b.order);
}

export function demoCategoryName(id: string, categories = DEMO_CATEGORIES): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}

/* ───────── 체험단 · 응모 · 후기 · 포인트 (PHP `fixtures.php` 의 campaigns/applications/reviews/points) ───────── */

/** PHP 데모의 체험단 분류 — `campaignShortcuts()` 의 라벨 */
export type DemoCampaignCategory = "식품" | "육아" | "생활" | "반려생활" | "방문" | "설문";
export type DemoCampaignChannel = "인스타그램" | "블로그" | "유튜브" | "설문";
export type DemoCampaignState = "upcoming" | "open" | "closed";

export interface DemoCampaign {
  id: string;
  brand: string;
  title: string;
  categoryId: DemoCampaignCategory;
  /** 혜택 문구 ("밀키트 3종 제공") */
  benefit: string;
  /** 협찬 제품 가치(원) — 지갑 "받은 제품 가치". 설문·대여는 0 */
  benefitValue: number;
  channel: DemoCampaignChannel;
  capacity: number;
  recruitmentStartAt: string;
  recruitmentEndAt: string;
  announcementAt: string;
  reviewDueAt: string;
  /** 미션 안내 문장 (PHP 그대로) */
  missions: string[];
  /** 1-1 미션 카드 — 자동 검사 기준 */
  mission: MissionCard;
  questions: string[];
  description: string;
  conditions: string;
  publicationStatus: "draft" | "published" | "hidden";
  /** PHP `/assets/images/campaigns/<image>` 이름 */
  image: string;
  shipping: boolean;
  exposureStartAt: string;
  exposureEndAt: string;
}

export type DemoSelectionStatus = "applied" | "selected" | "not_selected" | "cancelled";

export interface DemoApplication {
  id: string;
  campaignId: string;
  memberId: string;
  answers: { nickname: string; contact: string; channelUrl: string; reason: string; extra: string[] };
  consentRecords: { required: boolean; optional: boolean; version: string };
  selectionStatus: DemoSelectionStatus;
  appliedAt: string;
  shipping: { name: string; address: string } | null;
}

/** PHP `points` + 1-3 내역 유형. 금액 단위는 원(= 1P) */
export interface DemoPoint {
  id: string;
  memberId: string;
  amount: number;
  kind: WalletEntryKind;
  reason: string;
  createdAt: string;
}

// [brand, title, category, benefit, benefitValue, channel, capacity, 모집시작일, 모집종료일, 발표일, 후기마감, image]
const campaignRows: [string, string, DemoCampaignCategory, string, number, DemoCampaignChannel, number, string, string, string, string, string][] = [
  ["그린테이블", "저염 밀키트 3종, 가볍게 차리는 저녁", "식품", "밀키트 3종 제공", 29000, "인스타그램", 15, "16", "27", "29", "2026-11-13", "food"],
  ["베베코튼", "우리 아기의 첫 보습, 오가닉 바디로션", "육아", "바디로션 200ml 2개 제공", 24000, "블로그", 20, "15", "31", "31", "2026-11-17", "lotion"],
  ["주부테크 리서치", "장보기 습관을 들려주세요", "설문", "설문 참여 · 샘플 3,000P", 0, "설문", 300, "18", "24", "25", "2026-10-30", "survey"],
  ["멍냥마켓", "매일 챙기는 반려견 덴탈 케어", "반려생활", "덴탈껌 체험팩 제공", 15000, "블로그", 50, "20", "30", "31", "2026-11-15", "pet"],
  ["코지홈", "무선 물걸레 청소기, 4주 사용 기록", "생활", "무선 물걸레 청소기 대여", 0, "유튜브", 5, "01", "15", "18", "2026-11-18", "home"],
  ["데일리컵", "매일 쓰기 좋은 작은 머그컵", "생활", "세라믹 머그컵 1개 제공", 12000, "인스타그램", 12, "25", "31", "31", "2026-11-18", "cup"],
  ["동네빵집 르뺑", "분당에서 만나는 갓 구운 작은 행복", "방문", "신메뉴 세트와 커피 2잔", 18000, "인스타그램", 10, "15", "26", "28", "2026-11-04", "bread"],
  ["맑은생활", "향을 덜어낸 주방 세제 사용기", "생활", "주방 세제 500ml 제공", 9000, "블로그", 20, "01", "10", "12", "2026-10-30", "soap"],
];

/** 채널별 미션 카드 초안 — 글자 수·사진 수는 설정 기본값(rules.mission)과 맞춘다 */
function demoMission(channel: DemoCampaignChannel, brand: string): MissionCard {
  switch (channel) {
    case "설문":
      return { photoCount: 0, minChars: 0, requiredKeywords: [], hashtags: [], dueDays: 3 };
    case "유튜브":
      return { photoCount: 0, minChars: 200, requiredKeywords: [brand], hashtags: ["주부테크", "협찬"], dueDays: 28 };
    case "인스타그램":
      return { photoCount: 3, minChars: 300, requiredKeywords: [brand], hashtags: ["주부테크", "협찬", brand.replace(/\s/g, "")], dueDays: 14 };
    case "블로그":
      return { photoCount: 5, minChars: 800, requiredKeywords: [brand], hashtags: ["주부테크", "협찬"], dueDays: 14 };
  }
}

export const DEMO_CAMPAIGNS: DemoCampaign[] = campaignRows.map(([brand, title, categoryId, benefit, benefitValue, channel, capacity, start, end, announce, reviewDue, image], i) => ({
  id: `cp${i + 1}`,
  brand,
  title,
  categoryId,
  benefit,
  benefitValue,
  channel,
  capacity,
  recruitmentStartAt: `2026-10-${start}T00:00:00+09:00`,
  recruitmentEndAt: `2026-10-${end}T23:59:59+09:00`,
  announcementAt: `2026-10-${announce}T23:59:59+09:00`,
  reviewDueAt: `${reviewDue}T23:59:59+09:00`,
  missions: ["직접 사용한 경험을 사진과 함께 작성해 주세요.", "제품 제공 사실을 게시물에 표시해 주세요.", "후기 게시물은 4주간 유지해 주세요."],
  mission: demoMission(channel, brand),
  questions: ["평소 이 제품을 어떻게 사용하고 싶으세요?"],
  description: `일상에서 직접 사용해 보고 솔직한 이야기를 들려주세요. ${benefit} 캠페인입니다.`,
  conditions: "공개된 활동 채널을 운영하며 후기 기한을 지킬 수 있는 분",
  publicationStatus: "published",
  image,
  shipping: categoryId !== "방문" && categoryId !== "설문",
  exposureStartAt: "2026-10-01T00:00:00+09:00",
  exposureEndAt: "2026-12-31T23:59:59+09:00",
}));

const applicationRows: [string, string, string, DemoSelectionStatus][] = [
  ["a1", "cp5", "m1", "selected"],
  ["a2", "cp2", "m1", "applied"],
  ["a3", "cp7", "m1", "applied"],
  ["a4", "cp1", "m2", "applied"],
  ["a5", "cp8", "m2", "selected"],
  ["a6", "cp8", "m1", "not_selected"],
];
export const DEMO_APPLICATIONS: DemoApplication[] = applicationRows.map(([id, campaignId, memberId, selectionStatus]) => ({
  id,
  campaignId,
  memberId,
  answers: {
    nickname: memberId === "m1" ? "서연맘" : "민정살림",
    contact: "010-0000-0000",
    channelUrl: "https://example.com/demo-profile",
    reason: "생활 속에서 직접 사용해 보고 꼼꼼히 기록하고 싶어요.",
    extra: ["일상에 맞는 사용 후기를 남길게요."],
  },
  consentRecords: { required: true, optional: false, version: "review-draft-1" },
  selectionStatus,
  appliedAt: campaignId === "cp5" ? "2026-10-14T10:00:00+09:00" : campaignId === "cp8" ? "2026-10-08T10:00:00+09:00" : "2026-10-19T10:00:00+09:00",
  shipping: null,
}));

/** PHP `reviews` r1 — 민정살림(m2)의 맑은생활 후기, 검토 대기. 자동 검사는 글자 수 부족으로 미통과 */
export const DEMO_REVIEWS: Review[] = [
  {
    id: "r1",
    applicationId: "a5",
    url: "https://example.com/demo-review",
    content: "향이 강하지 않아 설거지할 때 쓰기 좋았어요.",
    photoCount: 5,
    check: {
      passed: false,
      checkedAt: "2026-10-20T12:00:00+09:00",
      items: [
        { key: "chars", ok: false, required: 800, actual: 24, message: "글자 수가 776자 더 필요해요" },
        { key: "photos", ok: true, required: 5, actual: 5, message: "사진 5장 확인" },
        { key: "keywords", ok: false, required: ["맑은생활"], actual: [], message: "'맑은생활' 키워드를 넣어 주세요" },
        { key: "hashtags", ok: false, required: ["주부테크", "협찬"], actual: [], message: "#주부테크 #협찬 해시태그가 필요해요" },
        { key: "link", ok: true, required: "열리는 링크", actual: "HTTP 200", message: "링크 확인" },
      ],
    },
    status: "pending",
    submittedAt: "2026-10-20T12:00:00+09:00",
  },
];

export const DEMO_POINTS: DemoPoint[] = [
  { id: "pt1", memberId: "m1", amount: 8400, kind: "adjust", reason: "이전 활동 잔액 · 예시", createdAt: "2026-10-01" },
  { id: "pt2", memberId: "m1", amount: 3000, kind: "event", reason: "설문 완료 · 예시", createdAt: "2026-10-18" },
  { id: "pt3", memberId: "m1", amount: 1000, kind: "review", reason: "기록 활동 · 예시", createdAt: "2026-10-20" },
  { id: "pt4", memberId: "m1", amount: 1000, kind: "review", reason: "후기 리워드 · 맑은생활 (예시)", createdAt: "2026-10-21" },
];

/** 1-2 생활력 변동 이력 — 관리자 화면에서만 본다 */
export const DEMO_TRUST_EVENTS: TrustEvent[] = [
  { id: "te1", userId: "m1", kind: "review_approved", delta: 10, refType: "review", refId: "r0", note: "예시", createdAt: "2026-10-05" },
  { id: "te2", userId: "m1", kind: "review_rated", delta: 6, refType: "review", refId: "r0", note: "별점 5", createdAt: "2026-10-05" },
  { id: "te3", userId: "m2", kind: "comment_liked", delta: 1, refType: "comment", refId: "c1", createdAt: "2026-10-12" },
  { id: "te4", userId: "m3", kind: "review_overdue", delta: -20, refType: "application", refId: "a0", note: "예시", createdAt: "2026-10-15" },
];

export const DEMO_INVITE_CODES: InviteCode[] = [
  { code: "JUBU-SEOYEON", ownerId: "m1", createdAt: "2026-10-10", uses: [{ userId: "m3", usedAt: "2026-10-12" }] },
  { code: "JUBU-MINJUNG", ownerId: "m2", createdAt: "2026-10-11", uses: [] },
];

/** PHP `visibleCampaign()`: 공개 상태이고 노출 기간 안 */
export function demoVisibleCampaigns(campaigns = DEMO_CAMPAIGNS, now = DEMO_NOW): DemoCampaign[] {
  const t = Date.parse(now);
  return campaigns.filter((c) => c.publicationStatus === "published" && Date.parse(c.exposureStartAt) <= t && Date.parse(c.exposureEndAt) >= t);
}

/** PHP `campaignState()`: 모집 전 / 모집 중 / 모집 종료 */
export function demoCampaignState(c: DemoCampaign, now = DEMO_NOW): DemoCampaignState {
  const t = Date.parse(now);
  if (t < Date.parse(c.recruitmentStartAt)) return "upcoming";
  if (t > Date.parse(c.recruitmentEndAt)) return "closed";
  return "open";
}

/** 모집 중이고 마감까지 `days` 일 이내 (PHP 탐색의 '마감 임박' = 7일) */
export function demoCampaignClosingSoon(c: DemoCampaign, now = DEMO_NOW, days = 7): boolean {
  return demoCampaignState(c, now) === "open" && Date.parse(c.recruitmentEndAt) - Date.parse(now) <= days * 86400_000;
}

/** PHP `application()`: 회원의 (취소되지 않은) 해당 캠페인 응모 */
export function demoApplication(memberId: string, campaignId: string, applications = DEMO_APPLICATIONS): DemoApplication | undefined {
  return applications.find((a) => a.memberId === memberId && a.campaignId === campaignId && a.selectionStatus !== "cancelled");
}

/** PHP `review()`: 응모의 후기 */
export function demoReview(applicationId: string, reviews = DEMO_REVIEWS): Review | undefined {
  return reviews.find((r) => r.applicationId === applicationId);
}

/** 1-3 지갑 요약 — 오늘·이번 달 번 돈(원), 받은 제품 가치는 별도 합산 */
export function demoWalletSummary(memberId: string, points = DEMO_POINTS, now = DEMO_NOW) {
  const mine = points.filter((p) => p.memberId === memberId);
  const day = now.slice(0, 10);
  const month = now.slice(0, 7);
  const earned = (p: DemoPoint) => p.amount > 0 && p.kind !== "product_value";
  return {
    balance: mine.filter((p) => p.kind !== "product_value").reduce((n, p) => n + p.amount, 0),
    today: mine.filter((p) => earned(p) && p.createdAt.slice(0, 10) === day).reduce((n, p) => n + p.amount, 0),
    month: mine.filter((p) => earned(p) && p.createdAt.slice(0, 7) === month).reduce((n, p) => n + p.amount, 0),
    productValue: mine.filter((p) => p.kind === "product_value").reduce((n, p) => n + p.amount, 0),
  };
}
