/**
 * 1-3 리워드 지갑 — 집계·"다음 할 일"·출금 상태. 순수 함수. 앱 지갑 화면·마이 탭 카드·관리자 포인트 화면이 같이 쓴다.
 * 금액 단위는 원(= 1P). "받은 제품 가치"(product_value)는 잔액과 따로 합산한다.
 */

import type { AppRules } from "./rules";
import type { WalletEntryKind } from "./types";
import { reviewDaysLeft } from "./review-check";
import { demoCampaignState, type DemoApplication, type DemoCampaign } from "./fixtures";
import type { Review } from "./types";

export interface WalletEntryLike {
  amount: number;
  kind?: WalletEntryKind;
  createdAt: string;
}

export interface WalletSummary {
  /** 출금 가능한 잔액(제품 가치 제외) */
  balance: number;
  /** 오늘 번 돈(적립만) */
  today: number;
  /** 이번 달 번 돈(적립만) */
  month: number;
  /** 받은 제품 가치 합계 */
  productValue: number;
  /** 유형별 합계 */
  byKind: Record<WalletEntryKind, number>;
}

export const WALLET_KINDS: WalletEntryKind[] = ["review", "referral", "event", "product_value", "withdraw", "adjust"];

export function walletKindOf(e: WalletEntryLike): WalletEntryKind {
  return e.kind ?? (e.amount < 0 ? "withdraw" : "event");
}

/** 적립(번 돈)으로 세는 항목 — 양수이고 제품 가치가 아닌 것 */
export function isEarning(e: WalletEntryLike): boolean {
  return e.amount > 0 && walletKindOf(e) !== "product_value";
}

export function walletSummary(entries: WalletEntryLike[], now: string | Date = new Date()): WalletSummary {
  const n = typeof now === "string" ? new Date(now) : now;
  const day = localDay(n);
  const month = day.slice(0, 7);
  const byKind = Object.fromEntries(WALLET_KINDS.map((k) => [k, 0])) as Record<WalletEntryKind, number>;
  let balance = 0, today = 0, monthSum = 0, productValue = 0;
  for (const e of entries) {
    const kind = walletKindOf(e);
    byKind[kind] += e.amount;
    if (kind === "product_value") { productValue += e.amount; continue; }
    balance += e.amount;
    if (isEarning(e)) {
      const d = localDay(new Date(e.createdAt));
      if (d === day) today += e.amount;
      if (d.slice(0, 7) === month) monthSum += e.amount;
    }
  }
  return { balance, today, month: monthSum, productValue, byKind };
}

function localDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 출금 버튼 상태 — `wallet.withdrawOpenAt` 전엔 안내 문구, 열렸어도 최소 금액 미만이면 안내 */
export function walletWithdrawState(rules: AppRules, balance: number, now: string | Date = new Date()): { enabled: boolean; label: string; help: string } {
  const openAt = rules.wallet.withdrawOpenAt;
  const nowMs = (typeof now === "string" ? new Date(now) : now).getTime();
  if (!openAt || Date.parse(openAt) > nowMs) {
    const when = openAt ? `${new Date(openAt).getMonth() + 1}월 ${new Date(openAt).getDate()}일` : "12월";
    return { enabled: false, label: `출금은 ${when} 오픈`, help: `그때까지는 적립만 돼요. 최소 출금 ${rules.wallet.withdrawMin.toLocaleString()}원.` };
  }
  if (balance < rules.wallet.withdrawMin) return { enabled: false, label: "출금 신청", help: `${(rules.wallet.withdrawMin - balance).toLocaleString()}원 더 모으면 출금할 수 있어요 (최소 ${rules.wallet.withdrawMin.toLocaleString()}원).` };
  return { enabled: true, label: "출금 신청", help: `최소 출금 ${rules.wallet.withdrawMin.toLocaleString()}원 · 계좌는 신청 때 입력해요.` };
}

export type WalletNextKind = "review_due" | "closing_soon" | "saved" | "none";
export interface WalletNextAction {
  kind: WalletNextKind;
  /** "코지홈 후기 올리면 +1,000원 · D-28" 식 한 줄 */
  text: string;
  /** 앱 라우트 */
  href: string;
  cta: string;
}

/**
 * "다음 할 일" 한 줄 — 규칙 순서: ① 후기 미제출(또는 보완 요청) 선정 건 → ② 마감 임박 모집 중 체험(미응모) → ③ 저장한 정보 → ④ 없음
 */
export function walletNextAction(input: { memberId: string; applications: DemoApplication[]; campaigns: DemoCampaign[]; reviews: Review[]; savedCount: number; rules: AppRules; now: string | Date }): WalletNextAction {
  const { memberId, applications, campaigns, reviews, savedCount, rules, now } = input;
  const nowIso = typeof now === "string" ? now : now.toISOString();
  const mine = applications.filter((a) => a.memberId === memberId);
  const due = mine
    .filter((a) => a.selectionStatus === "selected")
    .map((a) => ({ a, c: campaigns.find((c) => c.id === a.campaignId), r: reviews.find((r) => r.applicationId === a.id) }))
    .filter(({ c, r }) => c && (!r || r.status === "revision"))
    .sort((x, y) => Date.parse(x.c!.reviewDueAt) - Date.parse(y.c!.reviewDueAt))[0];
  if (due) {
    const left = reviewDaysLeft(due.c!.reviewDueAt, nowIso);
    const when = left > 0 ? `D-${left}` : left === 0 ? "오늘 마감" : `${-left}일 지남`;
    return { kind: "review_due", text: `${due.c!.brand} 후기 올리면 +${rules.reward.reviewAmount.toLocaleString()}원 · ${when}`, href: `/application/${due.a.id}/review`, cta: due.r ? "보완 후기 제출" : "후기 제출" };
  }
  const closing = campaigns
    .filter((c) => demoCampaignState(c, nowIso) === "open" && !mine.some((a) => a.campaignId === c.id && a.selectionStatus !== "cancelled"))
    .map((c) => ({ c, left: Math.ceil((Date.parse(c.recruitmentEndAt) - Date.parse(nowIso)) / 86_400_000) }))
    .filter(({ left }) => left <= 7)
    .sort((x, y) => x.left - y.left)[0];
  if (closing) return { kind: "closing_soon", text: `${closing.c.brand} 모집 ${closing.left <= 0 ? "오늘 마감" : `D-${closing.left}`} · 응모하면 후기 리워드 +${rules.reward.reviewAmount.toLocaleString()}원`, href: `/campaign/${closing.c.id}`, cta: "응모하기" };
  if (savedCount > 0) return { kind: "saved", text: `저장한 정보 ${savedCount}개 다시 읽어 보기`, href: "/finance/categories", cta: "저장한 정보" };
  return { kind: "none", text: "지금 할 일은 없어요. 새 체험을 둘러보세요.", href: "/campaigns/explore", cta: "체험 둘러보기" };
}

/** 하루 목표 대비 진행(0~1) */
export function dailyGoalProgress(rules: AppRules, today: number): number {
  return rules.reward.dailyGoal > 0 ? Math.min(1, today / rules.reward.dailyGoal) : 0;
}
