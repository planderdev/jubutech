/**
 * 2-5 지원금 맞춤 알림 — 세 가지 질문(사는 지역·자녀 연령대·관심 분야)과 마감 임박 판단. 소득 같은 깊은 정보는 받지 않는다.
 * 답은 기기 안에만 둔다(약관의 "자녀 정보는 수집하지 않아요"와 맞춘다). 서버로 옮기려면 개인정보처리방침을 먼저 고쳐야 한다.
 */
import { DEMO_NOW, type DemoArticle } from "./fixtures";
import { parseDate } from "./journal";
import type { AppRules } from "./rules";

export type ChildAge = "" | "none" | "infant" | "elementary" | "teen";
export const CHILD_AGE_OPTIONS: { key: ChildAge; label: string }[] = [
  { key: "", label: "답하지 않을게요" },
  { key: "none", label: "자녀 없음" },
  { key: "infant", label: "영유아" },
  { key: "elementary", label: "초등" },
  { key: "teen", label: "중고등" },
];
/** 지역은 시 단위까지만 (벤치마크 §3). 지역 인증이 붙으면 자동으로 채운다 */
export const SUBSIDY_REGIONS = ["성남시", "제주시", "서귀포시", "서울", "경기", "그 밖의 지역"] as const;

export interface SubsidyProfile {
  region: string;
  childAge: ChildAge;
  /** 관심 분야 — 정보 카테고리 id */
  interests: string[];
  /** 세 질문을 마쳤는지 */
  answered: boolean;
}
export const EMPTY_SUBSIDY_PROFILE: SubsidyProfile = { region: "", childAge: "", interests: [], answered: false };

export function daysUntil(iso: string, now = DEMO_NOW): number {
  return Math.round((parseDate(iso).getTime() - parseDate(now).getTime()) / 86400000);
}

/** 마감이 지나지 않은 신청형 글이면 "D-3" / "오늘 마감", 아니면 null */
export function deadlineLabel(a: Pick<DemoArticle, "applyEndAt">, now = DEMO_NOW): string | null {
  if (!a.applyEndAt) return null;
  const d = daysUntil(a.applyEndAt, now);
  if (d < 0) return null;
  return d === 0 ? "오늘 마감" : `D-${d}`;
}

function regionMatches(articleRegion: string | undefined, region: string): boolean {
  if (!articleRegion || !region) return true;
  return region.includes(articleRegion) || articleRegion.includes(region);
}

/** 내 조건에 맞는 글 — 지역·연령이 다르면 빼고, 마감 있는 글(가까운 순) → 관심 분야 순 */
export function matchArticles(articles: DemoArticle[], profile: SubsidyProfile, now = DEMO_NOW): DemoArticle[] {
  const rows = articles.filter((a) => {
    if (!regionMatches(a.region, profile.region)) return false;
    if (a.childAges?.length && profile.childAge && !(a.childAges as string[]).includes(profile.childAge)) return false;
    if (a.applyEndAt && daysUntil(a.applyEndAt, now) < 0) return false;
    const inInterest = profile.interests.length === 0 || profile.interests.includes(a.categoryId);
    return inInterest || !!a.region;
  });
  const key = (a: DemoArticle) => (a.applyEndAt ? daysUntil(a.applyEndAt, now) : 9999);
  return rows.sort((x, y) => key(x) - key(y));
}

/** 마감 임박 — `notify.subsidyDaysBefore` 일 안에 마감하는 맞는 글 */
export function subsidyDueAlerts(articles: DemoArticle[], profile: SubsidyProfile, rules: AppRules, now = DEMO_NOW): { article: DemoArticle; daysLeft: number }[] {
  if (!profile.answered || !rules.notify.subsidy) return [];
  return matchArticles(articles, profile, now)
    .filter((a) => a.applyEndAt && daysUntil(a.applyEndAt, now) <= rules.notify.subsidyDaysBefore)
    .map((article) => ({ article, daysLeft: daysUntil(article.applyEndAt as string, now) }));
}
