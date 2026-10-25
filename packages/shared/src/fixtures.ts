/**
 * PHP 데모(`app/data/fixtures.php`·`app/data/banners.php`)와 같은 모양의 검토용 데이터.
 * 앱·관리자가 PHP 데모와 같은 화면을 보도록 엔티티 이름·필드를 PHP 쪽에 맞춘다.
 * 기준 시각 2026-10-21 12:00 KST. 모든 데이터는 가상이다.
 */

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
