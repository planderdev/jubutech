/**
 * 1-1 후기 자동 검수 — 순수 함수. 네트워크(링크 HEAD 확인)는 호출자가 하고 결과만 `linkStatus` 로 넘긴다.
 * 앱(제출 전 미리 보기)·관리자(제출물 옆 검사 결과)·서버(저장 시 재검사)가 같은 함수를 쓴다.
 */

import type { MissionCard, ReviewCheck, ReviewCheckItem, ReviewCheckKey } from "./types";

export type LinkStatus = "ok" | "unreachable" | "unknown";

export interface ReviewSubmission {
  /** 외부 후기 링크 */
  url?: string;
  /** 앱에서 직접 쓴 본문 (링크만 낼 때는 비움) */
  content?: string;
  /** 첨부(또는 게시물에 올린) 사진 수 */
  photoCount?: number;
  /** 링크 확인 결과. 호출자가 확인하지 않았으면 `unknown` */
  linkStatus?: LinkStatus;
}

export const REVIEW_CHECK_LABEL: Record<ReviewCheckKey, string> = { chars: "글자 수", photos: "사진", keywords: "키워드", hashtags: "해시태그", link: "링크" };

/** PHP `safeUrl()` 와 같은 기준 — http(s) 로 시작하고 공백이 없는 주소 */
export const SAFE_URL = /^https?:\/\/\S+$/i;
export function isSafeUrl(url: string): boolean {
  return SAFE_URL.test(url.trim());
}

/** 글자 수 — 연속 공백은 하나로 세고 앞뒤 공백은 뺀다 (블로그 체험단 기준과 같은 "공백 포함" 셈) */
export function reviewCharCount(content: string): number {
  return Array.from(content.replace(/\s+/g, " ").trim()).length;
}

/** 본문의 해시태그 목록 (# 없이, 중복 제거) */
export function reviewHashtags(content: string): string[] {
  const found = new Set<string>();
  for (const m of content.matchAll(/#([\p{L}\p{N}_]+)/gu)) found.add(m[1]);
  return [...found];
}

const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/**
 * 미션 카드 기준으로 제출물을 검사한다.
 * - 본문 없이 링크만 냈을 때 글자 수·키워드·해시태그는 자동으로 볼 수 없으므로 `skipped` 로 두고 운영팀이 확인한다.
 * - `passed` 는 건너뛴 항목을 통과로 치고 나머지가 모두 통과일 때 true.
 */
export function checkReview(mission: MissionCard, submission: ReviewSubmission, now: string = new Date().toISOString()): ReviewCheck {
  const url = (submission.url ?? "").trim();
  const content = (submission.content ?? "").trim();
  const photoCount = Math.max(0, Math.floor(submission.photoCount ?? 0));
  const hasContent = content.length > 0;
  const linkOnly = !hasContent && url.length > 0;
  const items: ReviewCheckItem[] = [];

  const skip = (key: ReviewCheckKey, required: ReviewCheckItem["required"], what: string): ReviewCheckItem => ({ key, ok: true, skipped: true, required, actual: "링크 제출", message: `링크 제출 · ${what}는 운영팀이 확인해요` });

  if (mission.minChars > 0) {
    if (linkOnly) items.push(skip("chars", mission.minChars, "글자 수"));
    else {
      const actual = reviewCharCount(content);
      const ok = actual >= mission.minChars;
      items.push({ key: "chars", ok, required: mission.minChars, actual, message: ok ? `${actual}자 작성` : hasContent ? `글자 수가 ${mission.minChars - actual}자 더 필요해요` : "후기 내용을 입력해 주세요" });
    }
  }

  if (mission.photoCount > 0) {
    const ok = photoCount >= mission.photoCount;
    items.push({ key: "photos", ok, required: mission.photoCount, actual: photoCount, message: ok ? `사진 ${photoCount}장 확인` : `사진 ${mission.photoCount - photoCount}장 더 필요해요` });
  }

  if (mission.requiredKeywords.length > 0) {
    if (linkOnly) items.push(skip("keywords", mission.requiredKeywords, "키워드"));
    else {
      const body = norm(content);
      const found = mission.requiredKeywords.filter((k) => body.includes(norm(k)));
      const missing = mission.requiredKeywords.filter((k) => !found.includes(k));
      const ok = missing.length === 0;
      items.push({ key: "keywords", ok, required: mission.requiredKeywords, actual: found, message: ok ? "키워드 모두 포함" : `'${missing.join("', '")}' 키워드를 넣어 주세요` });
    }
  }

  if (mission.hashtags.length > 0) {
    if (linkOnly) items.push(skip("hashtags", mission.hashtags, "해시태그"));
    else {
      const tags = reviewHashtags(content).map(norm);
      const found = mission.hashtags.filter((t) => tags.includes(norm(t)));
      const missing = mission.hashtags.filter((t) => !found.includes(t));
      const ok = missing.length === 0;
      items.push({ key: "hashtags", ok, required: mission.hashtags, actual: found, message: ok ? "해시태그 모두 포함" : `${missing.map((t) => `#${t}`).join(" ")} 해시태그가 필요해요` });
    }
  }

  if (url) {
    if (!isSafeUrl(url)) items.push({ key: "link", ok: false, required: "열리는 링크", actual: url, message: "올바른 주소(https://…)를 입력해 주세요" });
    else if (submission.linkStatus === "unreachable") items.push({ key: "link", ok: false, required: "열리는 링크", actual: "연결 실패", message: "링크가 열리지 않아요. 주소를 확인해 주세요" });
    else if (submission.linkStatus === "ok") items.push({ key: "link", ok: true, required: "열리는 링크", actual: "HTTP 200", message: "링크 확인" });
    else items.push({ key: "link", ok: true, skipped: true, required: "열리는 링크", actual: "미확인", message: "링크는 운영팀이 열어 확인해요" });
  }

  return { passed: items.every((i) => i.ok), items, checkedAt: now };
}

/** "5개 중 3개 통과" 식 요약 */
export function reviewCheckSummary(check?: ReviewCheck): { ok: number; total: number; skipped: number; text: string } {
  if (!check || check.items.length === 0) return { ok: 0, total: 0, skipped: 0, text: "검사 항목 없음" };
  const ok = check.items.filter((i) => i.ok && !i.skipped).length;
  const skipped = check.items.filter((i) => i.skipped).length;
  const total = check.items.length;
  const text = check.passed ? (skipped ? `자동 검사 통과 · ${skipped}개 운영팀 확인` : "자동 검사 모두 통과") : `${total}개 중 ${ok + skipped}개 통과`;
  return { ok, total, skipped, text };
}

/** 후기 기한까지 남은 날 — 0 = 오늘, 음수 = 지남 (날짜 단위, 시각 무시) */
export function reviewDaysLeft(dueAt: string, now: string | Date = new Date()): number {
  const day = (d: Date) => Math.floor((d.getTime() + d.getTimezoneOffset() * -60_000) / 86_400_000);
  return day(new Date(dueAt)) - day(typeof now === "string" ? new Date(now) : now);
}

/** "D-3" · "오늘 마감" · "3일 지남" */
export function reviewDueLabel(dueAt: string, now: string | Date = new Date()): string {
  const left = reviewDaysLeft(dueAt, now);
  if (left > 0) return `D-${left}`;
  if (left === 0) return "오늘 마감";
  return `${-left}일 지남`;
}

/**
 * 기한 알림 시각 — `rules.mission.reminderDaysBefore` 의 각 n 에 대해 (기한 − n일) 의 `hour`시.
 * 지난 시각은 뺀다. 로컬 알림(expo-notifications)·서버 푸시 모두 이 결과를 쓴다.
 */
export function reviewReminderTimes(dueAt: string, daysBefore: number[], now: string | Date = new Date(), hour = 9): { daysBefore: number; at: string }[] {
  const nowMs = (typeof now === "string" ? new Date(now) : now).getTime();
  return daysBefore
    .map((n) => {
      const d = new Date(dueAt);
      d.setDate(d.getDate() - n);
      d.setHours(hour, 0, 0, 0);
      return { daysBefore: n, at: d.toISOString() };
    })
    .filter((r) => new Date(r.at).getTime() > nowMs)
    .sort((a, b) => a.at.localeCompare(b.at));
}

/** 알림 문구 — "후기 제출 3일 전이에요" / "오늘이 후기 마감일이에요" */
export function reviewReminderText(daysBefore: number, campaignTitle: string): { title: string; body: string } {
  return daysBefore === 0
    ? { title: "오늘이 후기 마감일이에요", body: `${campaignTitle} 후기를 오늘 안에 제출해 주세요.` }
    : { title: `후기 제출 ${daysBefore}일 전이에요`, body: `${campaignTitle} 후기 기한이 ${daysBefore}일 남았어요.` };
}
