/**
 * 1-2 상호 평가 — 주부도 광고주를 평가한다(제품 발송이 늦었는지, 안내와 달랐는지).
 * 당근 매너온도의 핵심이 양쪽 평가라는 점을 옮겼다. 광고주·다른 회원에게는 닉네임 없이 통계로만 보이고, 건수가 적으면(`rating.minVisible`) 숨긴다.
 */
import { demoCampaignState, type DemoApplication, type DemoCampaign } from "./fixtures";
import type { AppRules } from "./rules";
import type { Review } from "./types";

export type YesNoNa = "yes" | "no" | "na";
export interface BrandRating {
  id: string;
  applicationId: string;
  campaignId: string;
  brand: string;
  memberId: string;
  /** 1~5 */
  stars: number;
  /** 제품이 약속한 때 왔나요 (배송이 없는 체험은 na) */
  shippedOnTime: YesNoNa;
  /** 안내와 같았나요 */
  matchedGuide: "yes" | "no";
  comment?: string;
  status: "visible" | "hidden";
  createdAt: string;
}

export const DEMO_BRAND_RATINGS: BrandRating[] = [
  { id: "br1", applicationId: "x1", campaignId: "cp8", brand: "맑은생활", memberId: "m2", stars: 5, shippedOnTime: "yes", matchedGuide: "yes", comment: "제품이 빨리 왔고 안내가 자세했어요.", status: "visible", createdAt: "2026-09-28T10:00:00+09:00" },
  { id: "br2", applicationId: "x2", campaignId: "cp8", brand: "맑은생활", memberId: "m3", stars: 4, shippedOnTime: "yes", matchedGuide: "yes", status: "visible", createdAt: "2026-09-29T10:00:00+09:00" },
  { id: "br3", applicationId: "x3", campaignId: "cp8", brand: "맑은생활", memberId: "m4", stars: 5, shippedOnTime: "no", matchedGuide: "yes", comment: "배송이 하루 늦었지만 연락이 왔어요.", status: "visible", createdAt: "2026-09-30T10:00:00+09:00" },
  { id: "br4", applicationId: "x4", campaignId: "cp1", brand: "그린테이블", memberId: "m2", stars: 4, shippedOnTime: "yes", matchedGuide: "yes", status: "visible", createdAt: "2026-09-20T10:00:00+09:00" },
];

export function canRateBrand(a: DemoApplication | undefined, review: Review | undefined, ratings: BrandRating[]): boolean {
  if (!a || a.selectionStatus !== "selected" || review?.status !== "approved") return false;
  return !ratings.some((r) => r.applicationId === a.id);
}

export interface BrandRatingSummary {
  count: number;
  /** 소수 첫째 자리. 건수가 부족하면 null */
  average: number | null;
  /** 안내와 같았다는 비율(%) */
  matchRate: number | null;
  /** 제때 왔다는 비율(%) — 배송 체험만 */
  onTimeRate: number | null;
  /** `rating.minVisible` 이상이라 공개해도 되는지 */
  visible: boolean;
}

export function brandRatingSummary(ratings: BrandRating[], brand: string, rules: AppRules): BrandRatingSummary {
  const rows = ratings.filter((r) => r.brand === brand && r.status === "visible");
  const visible = rows.length >= rules.rating.minVisible;
  if (!visible) return { count: rows.length, average: null, matchRate: null, onTimeRate: null, visible };
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : null);
  const shipped = rows.filter((r) => r.shippedOnTime !== "na");
  return {
    count: rows.length,
    average: Math.round((rows.reduce((n, r) => n + r.stars, 0) / rows.length) * 10) / 10,
    matchRate: pct(rows.filter((r) => r.matchedGuide === "yes").length, rows.length),
    onTimeRate: pct(shipped.filter((r) => r.shippedOnTime === "yes").length, shipped.length),
    visible,
  };
}

/** 체험단 상세 광고주 블록 — 벤치마크 패턴 5(업체 카드: 평점·후기 수·단골 수) 자리에 체험 횟수·평점 */
export function brandCampaignCount(campaigns: DemoCampaign[], brand: string, now?: string): { total: number; running: number } {
  const rows = campaigns.filter((c) => c.brand === brand);
  return { total: rows.length, running: rows.filter((c) => demoCampaignState(c, now) === "open").length };
}
