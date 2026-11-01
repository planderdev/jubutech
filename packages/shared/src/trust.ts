/**
 * 1-2 생활력(신뢰도) — 관리자 전용 점수. 순수 함수: 점수 합산·등급, 이벤트 생성(규칙표 `trustDelta`), 기한 초과 일일 점검, 응모 제한.
 * 점수는 이벤트 delta 의 합(DB `profiles.trust_score` 와 같은 정의, 시작 0). 사용자 노출은 `rules.trust.visibleToUsers` 가 true 일 때만.
 */

import { trustDelta, type AppRules } from "./rules";
import type { TrustEvent, TrustEventKind, Review } from "./types";
import type { DemoApplication, DemoCampaign } from "./fixtures";

export function trustScore(events: TrustEvent[], userId: string): number {
  return events.filter((e) => e.userId === userId).reduce((n, e) => n + e.delta, 0);
}

export function trustScores(events: TrustEvent[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) out[e.userId] = (out[e.userId] ?? 0) + e.delta;
  return out;
}

export type TrustGrade = "caution" | "normal" | "good" | "excellent";
export const TRUST_GRADE_LABEL: Record<TrustGrade, string> = { caution: "주의", normal: "보통", good: "좋음", excellent: "우수" };
/** 등급 경계(초안): 음수 주의 · 0~19 보통 · 20~49 좋음 · 50 이상 우수 */
export function trustGrade(score: number): TrustGrade {
  if (score < 0) return "caution";
  if (score < 20) return "normal";
  if (score < 50) return "good";
  return "excellent";
}

/** 규칙표로 delta 를 계산해 이벤트를 만든다 */
export function makeTrustEvent(rules: AppRules, kind: TrustEventKind, userId: string, now: string, opts: { rating?: number; refType?: string; refId?: string; note?: string; delta?: number; id?: string } = {}): TrustEvent {
  const delta = opts.delta ?? trustDelta(rules, kind, opts.rating);
  return { id: opts.id ?? `te${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, userId, kind, delta, refType: opts.refType, refId: opts.refId, note: opts.note, createdAt: now };
}

/** 같은 대상에 같은 종류의 이벤트가 이미 있는지 (중복 기록 방지) */
export function hasTrustEvent(events: TrustEvent[], kind: TrustEventKind, refType: string, refId: string, userId?: string): boolean {
  return events.some((e) => e.kind === kind && e.refType === refType && e.refId === refId && (!userId || e.userId === userId));
}

/**
 * 기한 초과 일일 점검 — 선정됐는데 후기 기한(`campaign.reviewDueAt`)이 지났고 제출(pending/approved)이 없는 응모마다 `review_overdue` 1건.
 * 보완 요청(revision) 상태로 기한을 넘긴 것도 미제출로 본다. 이미 기록된 응모는 건너뛴다. `memberId` 매핑이 필요하면 `userIdOf` 로.
 */
export function reviewOverdueTrustEvents(input: { applications: DemoApplication[]; campaigns: DemoCampaign[]; reviews: Review[]; events: TrustEvent[]; rules: AppRules; now: string; userIdOf?: (memberId: string) => string }): TrustEvent[] {
  const { applications, campaigns, reviews, events, rules, now } = input;
  const map = input.userIdOf ?? ((id: string) => id);
  const nowMs = Date.parse(now);
  const out: TrustEvent[] = [];
  for (const a of applications) {
    if (a.selectionStatus !== "selected") continue;
    const c = campaigns.find((x) => x.id === a.campaignId);
    if (!c || Date.parse(c.reviewDueAt) >= nowMs) continue;
    const r = reviews.find((x) => x.applicationId === a.id);
    if (r && (r.status === "pending" || r.status === "approved")) continue;
    if (hasTrustEvent([...events, ...out], "review_overdue", "application", a.id)) continue;
    out.push(makeTrustEvent(rules, "review_overdue", map(a.memberId), now, { refType: "application", refId: a.id, note: `${c.brand} 후기 기한 ${c.reviewDueAt.slice(0, 10)} 초과`, id: `te-od-${a.id}` }));
  }
  return out;
}

/** 기한 초과 뒤 응모 제한 — 가장 최근 `review_overdue` + `penalty.lateBlockDays` 까지. 지났으면 null */
export function applyBlockedUntil(events: TrustEvent[], rules: AppRules, userId: string, now: string | Date = new Date()): string | null {
  const last = events.filter((e) => e.userId === userId && e.kind === "review_overdue").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!last) return null;
  const until = new Date(last.createdAt);
  until.setDate(until.getDate() + rules.penalty.lateBlockDays);
  const nowMs = (typeof now === "string" ? new Date(now) : now).getTime();
  return until.getTime() > nowMs ? until.toISOString() : null;
}

/** 회원 상세 변동 이력 — 최신순 */
export function trustTimeline(events: TrustEvent[], userId: string): TrustEvent[] {
  return events.filter((e) => e.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
