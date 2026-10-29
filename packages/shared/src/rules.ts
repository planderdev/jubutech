/**
 * 운영 규칙(설정값) — 기획안(2026-10-30)에서 아직 정해지지 않은 숫자는 전부 여기 키로 둔다.
 * 코드 기본값은 **논의용 초안**이고, 확정값은 Supabase `app_settings`(key/value) 에서 덮어쓴다.
 * 앱·관리자 모두 `resolveRules(rows)` 로 읽는다. 관리자 설정 화면은 `RULE_META` 로 입력란을 만든다.
 */

import type { TrustEventKind } from "./types";

export interface AppRules {
  reward: {
    /** 후기 1건 승인 시 리워드(원) */
    reviewAmount: number;
    /** 하루 수익 목표(원) — 지갑 "오늘 번 돈" 기준 (5천·1만·2만 중 미정) */
    dailyGoal: number;
  };
  wallet: {
    /** 최소 출금액(원) */
    withdrawMin: number;
    /** 출금 오픈일(ISO 날짜). null 이면 오픈 전 — "출금은 12월 오픈" 안내만 */
    withdrawOpenAt: string | null;
  };
  mission: {
    /** 미션 카드가 없는 캠페인의 기본 사진 장수 */
    defaultPhotoCount: number;
    /** 기본 최소 글자 수 (800자인지 80자인지 미확정) */
    defaultMinChars: number;
    /** 선정 발표 후 제출 기한(일) */
    defaultDueDays: number;
    /** 기한 알림 시점(일 전). 0 = 당일 */
    reminderDaysBefore: number[];
  };
  penalty: {
    /** 기한 초과 시 다음 응모 제한(일) */
    lateBlockDays: number;
  };
  trust: {
    /** 신뢰도 지표 이름 (후보 '생활력') */
    name: string;
    /** 사용자에게 점수·등급 노출 여부 — 출시 초기엔 관리자만 본다 */
    visibleToUsers: boolean;
    delta: {
      reviewApproved: number;
      /** 별점 1~5 → (별점 − 3) × ratingPerStar */
      ratingPerStar: number;
      commentLiked: number;
      reviewOverdue: number;
      postHidden: number;
      inviteBonus: number;
    };
  };
  invite: {
    /** 초대 보너스 종류: 첫 체험단 우선 선정권 / 생활력 가산 */
    bonus: "priority" | "trust";
  };
  report: {
    /** 서로 다른 신고자 몇 명부터 자동 숨김 (2단계) */
    autoHideCount: number;
  };
}

/** 코드 기본값 = 기획안 초안. 확정되면 `app_settings` 로 덮어쓴다 */
export const DEFAULT_RULES: AppRules = {
  reward: { reviewAmount: 1000, dailyGoal: 5000 },
  wallet: { withdrawMin: 10000, withdrawOpenAt: "2026-12-01" },
  mission: { defaultPhotoCount: 3, defaultMinChars: 800, defaultDueDays: 14, reminderDaysBefore: [3, 0] },
  penalty: { lateBlockDays: 30 },
  trust: {
    name: "생활력",
    visibleToUsers: false,
    delta: { reviewApproved: 10, ratingPerStar: 3, commentLiked: 1, reviewOverdue: -20, postHidden: -10, inviteBonus: 5 },
  },
  invite: { bonus: "priority" },
  report: { autoHideCount: 3 },
};

export type RuleKey =
  | "reward.reviewAmount"
  | "reward.dailyGoal"
  | "wallet.withdrawMin"
  | "wallet.withdrawOpenAt"
  | "mission.defaultPhotoCount"
  | "mission.defaultMinChars"
  | "mission.defaultDueDays"
  | "mission.reminderDaysBefore"
  | "penalty.lateBlockDays"
  | "trust.name"
  | "trust.visibleToUsers"
  | "trust.delta.reviewApproved"
  | "trust.delta.ratingPerStar"
  | "trust.delta.commentLiked"
  | "trust.delta.reviewOverdue"
  | "trust.delta.postHidden"
  | "trust.delta.inviteBonus"
  | "invite.bonus"
  | "report.autoHideCount";

export type RuleValueType = "number" | "text" | "date" | "boolean" | "numbers" | "choice";

export interface RuleMeta {
  label: string;
  type: RuleValueType;
  unit?: string;
  /** 어느 기획 항목의 숫자인지 · 미확정 메모 */
  note: string;
  /** 그룹(관리자 설정 화면 섹션) */
  group: "리워드·지갑" | "미션·기한" | "생활력" | "초대·운영";
  choices?: string[];
}

export const RULE_META: Record<RuleKey, RuleMeta> = {
  "reward.reviewAmount": { label: "후기 리워드", type: "number", unit: "원", note: "1-3 · 다음 회의에서 확정", group: "리워드·지갑" },
  "reward.dailyGoal": { label: "하루 수익 목표", type: "number", unit: "원", note: "1-3 · 5천·1만·2만 중 미정", group: "리워드·지갑" },
  "wallet.withdrawMin": { label: "최소 출금액", type: "number", unit: "원", note: "1-3 · 세금 처리와 함께 확정", group: "리워드·지갑" },
  "wallet.withdrawOpenAt": { label: "출금 오픈일", type: "date", note: "1-3 · 비우면 '출금은 12월 오픈' 안내만", group: "리워드·지갑" },
  "mission.defaultPhotoCount": { label: "기본 사진 장수", type: "number", unit: "장", note: "1-1 · 캠페인에 미션 카드가 없을 때", group: "미션·기한" },
  "mission.defaultMinChars": { label: "기본 글자 수", type: "number", unit: "자", note: "1-1 · 800자/80자 회의록에서 불분명", group: "미션·기한" },
  "mission.defaultDueDays": { label: "제출 기한", type: "number", unit: "일", note: "1-1 · 선정 발표 후", group: "미션·기한" },
  "mission.reminderDaysBefore": { label: "기한 알림 시점", type: "numbers", unit: "일 전", note: "1-1 · 3일 전·당일", group: "미션·기한" },
  "penalty.lateBlockDays": { label: "기한 초과 응모 제한", type: "number", unit: "일", note: "1-1", group: "미션·기한" },
  "trust.name": { label: "신뢰도 지표 이름", type: "text", note: "1-2 · '생활력' 확정 여부", group: "생활력" },
  "trust.visibleToUsers": { label: "사용자에게 노출", type: "boolean", note: "1-2 · 데이터가 쌓인 뒤 켠다", group: "생활력" },
  "trust.delta.reviewApproved": { label: "후기 승인", type: "number", unit: "점", note: "1-2 표 · 오름", group: "생활력" },
  "trust.delta.ratingPerStar": { label: "별점 1점당", type: "number", unit: "점", note: "1-2 표 · (별점−3)×값", group: "생활력" },
  "trust.delta.commentLiked": { label: "답글 좋아요", type: "number", unit: "점", note: "1-2 표 · 조금 오름", group: "생활력" },
  "trust.delta.reviewOverdue": { label: "미제출·기한 초과", type: "number", unit: "점", note: "1-2 표 · 크게 내림", group: "생활력" },
  "trust.delta.postHidden": { label: "신고 누적 숨김", type: "number", unit: "점", note: "1-2 표 · 내림", group: "생활력" },
  "trust.delta.inviteBonus": { label: "초대 보너스", type: "number", unit: "점", note: "2-3 · 보너스가 '생활력 가산'일 때", group: "생활력" },
  "invite.bonus": { label: "초대 보너스 종류", type: "choice", choices: ["priority", "trust"], note: "2-3 · 우선 선정권 / 생활력 가산", group: "초대·운영" },
  "report.autoHideCount": { label: "자동 숨김 신고 건수", type: "number", unit: "명", note: "2-4(2단계) · 몇 건부터 숨길지 미정", group: "초대·운영" },
};

export const RULE_KEYS = Object.keys(RULE_META) as RuleKey[];

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let cur = obj;
  for (const k of keys.slice(0, -1)) {
    const next = cur[k];
    if (!next || typeof next !== "object") cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
}

/** 저장된 값이 키의 타입에 맞는지 — 맞지 않으면 기본값을 유지한다 */
export function isValidRuleValue(key: RuleKey, value: unknown): boolean {
  switch (RULE_META[key].type) {
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "text":
      return typeof value === "string";
    case "date":
      return value === null || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value));
    case "boolean":
      return typeof value === "boolean";
    case "numbers":
      return Array.isArray(value) && value.every((v) => typeof v === "number");
    case "choice":
      return typeof value === "string" && (RULE_META[key].choices ?? []).includes(value);
  }
}

/** `app_settings` 행(또는 평평한 key→value 객체)을 기본값 위에 덮어 AppRules 로 */
export function resolveRules(overrides?: Partial<Record<RuleKey, unknown>> | { key: string; value: unknown }[] | null): AppRules {
  const rules = JSON.parse(JSON.stringify(DEFAULT_RULES)) as AppRules;
  if (!overrides) return rules;
  const entries = Array.isArray(overrides) ? overrides.map((r) => [r.key, r.value] as const) : Object.entries(overrides);
  for (const [key, value] of entries) {
    if (!(key in RULE_META)) continue;
    if (!isValidRuleValue(key as RuleKey, value)) continue;
    setPath(rules as unknown as Record<string, unknown>, key, value);
  }
  return rules;
}

/** AppRules → 평평한 key→value (설정 화면·시드용) */
export function flattenRules(rules: AppRules = DEFAULT_RULES): Record<RuleKey, unknown> {
  return Object.fromEntries(RULE_KEYS.map((k) => [k, getPath(rules, k)])) as Record<RuleKey, unknown>;
}

export function getRule<T = unknown>(rules: AppRules, key: RuleKey): T {
  return getPath(rules, key) as T;
}

/** 1-2 규칙표: 이벤트 종류 → 점수 변화. 별점은 (별점−3)×ratingPerStar */
export function trustDelta(rules: AppRules, kind: TrustEventKind, rating?: number): number {
  const d = rules.trust.delta;
  switch (kind) {
    case "review_approved":
      return d.reviewApproved;
    case "review_rated":
      return rating ? (Math.min(5, Math.max(1, rating)) - 3) * d.ratingPerStar : 0;
    case "comment_liked":
      return d.commentLiked;
    case "review_overdue":
      return d.reviewOverdue;
    case "post_hidden":
      return d.postHidden;
    case "invite_bonus":
      return rules.invite.bonus === "trust" ? d.inviteBonus : 0;
    case "manual":
      return 0;
  }
}

/** 1-3 출금 버튼을 열어도 되는 시점인지 */
export function withdrawOpen(rules: AppRules, now: string | Date = new Date()): boolean {
  if (!rules.wallet.withdrawOpenAt) return false;
  return new Date(now).getTime() >= new Date(rules.wallet.withdrawOpenAt).getTime();
}

/** 1-1 캠페인 미션 카드 — 없거나 비어 있는 값은 기본값으로 채운다 */
export function missionWithDefaults(rules: AppRules, mission?: Partial<{ photoCount: number; minChars: number; requiredKeywords: string[]; hashtags: string[]; dueDays?: number }>) {
  return {
    photoCount: mission?.photoCount ?? rules.mission.defaultPhotoCount,
    minChars: mission?.minChars ?? rules.mission.defaultMinChars,
    requiredKeywords: mission?.requiredKeywords ?? [],
    hashtags: mission?.hashtags ?? [],
    dueDays: mission?.dueDays ?? rules.mission.defaultDueDays,
  };
}
