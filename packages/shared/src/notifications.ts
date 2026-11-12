/**
 * 알림 — 선정·기한·검수 결과 이벤트를 알림 객체로 바꾸는 한 곳. 앱 알림함은 이 객체를 쌓아 보여 주고,
 * 서버 푸시는 1단계 W8(Supabase) + FCM·APNs 키가 생기면 같은 객체를 서버에서 보낸다. 켜고 끄기는 `notify.*`(운영)와 회원 설정.
 */
import type { AppRules } from "./rules";
import type { DemoNotification, ServiceMode } from "./fixtures";

export type NotifyEvent =
  | { kind: "selected"; applicationId: string; brand: string }
  | { kind: "not_selected"; applicationId: string; brand: string }
  | { kind: "review_revision"; applicationId: string; brand: string; feedback?: string }
  | { kind: "review_approved"; applicationId: string; brand: string; amount: number }
  | { kind: "review_rejected"; applicationId: string; brand: string; feedback?: string }
  | { kind: "review_due"; applicationId: string; brand: string; daysBefore: number }
  | { kind: "subsidy_deadline"; articleId: string; title: string; daysLeft: number };

export type NotifyCategory = "selection" | "review" | "subsidy";
export const NOTIFY_CATEGORY_LABEL: Record<NotifyCategory, { label: string; sub: string }> = {
  selection: { label: "체험단 선정 결과", sub: "선정·미선정을 바로 알려요" },
  review: { label: "후기 기한·검토 결과", sub: "기한 임박, 보완 요청, 승인" },
  subsidy: { label: "맞춤 지원금 마감", sub: "내 조건에 맞는 지원금이 마감되기 전에" },
};
export type NotifyPrefs = Record<NotifyCategory, boolean>;
export const DEFAULT_NOTIFY_PREFS: NotifyPrefs = { selection: true, review: true, subsidy: true };

export function notifyCategory(e: NotifyEvent): NotifyCategory {
  if (e.kind === "selected" || e.kind === "not_selected") return "selection";
  return e.kind === "subsidy_deadline" ? "subsidy" : "review";
}

/** 운영에서 그 종류를 켰는지(`notify.*`) */
export function notifyEnabled(rules: AppRules, category: NotifyCategory): boolean {
  if (category === "selection") return rules.notify.selection;
  if (category === "review") return rules.notify.review;
  return rules.notify.subsidy;
}

export function notificationText(e: NotifyEvent): { title: string; body: string; url: string; mode: ServiceMode } {
  switch (e.kind) {
    case "selected":
      return { title: `${e.brand} 체험단에 선정되었어요`, body: "체험 일정과 후기 미션을 확인해 주세요.", url: `/application/${e.applicationId}`, mode: "campaigns" };
    case "not_selected":
      return { title: `${e.brand} 체험단 결과가 나왔어요`, body: "이번에는 함께하지 못했어요. 다른 체험도 둘러보세요.", url: `/application/${e.applicationId}`, mode: "campaigns" };
    case "review_revision":
      return { title: "후기를 조금 보완해 주세요", body: e.feedback || `${e.brand} 후기에 보완 요청이 있어요.`, url: `/application/${e.applicationId}`, mode: "campaigns" };
    case "review_approved":
      return { title: "후기가 승인되었어요", body: `${e.brand} 리워드 ${e.amount.toLocaleString("ko-KR")}원이 지갑에 들어왔어요.`, url: "/wallet", mode: "campaigns" };
    case "review_rejected":
      return { title: "후기가 반려되었어요", body: e.feedback || `${e.brand} 후기 검토 결과를 확인해 주세요.`, url: `/application/${e.applicationId}`, mode: "campaigns" };
    case "review_due":
      return { title: e.daysBefore === 0 ? "오늘이 후기 제출 마감이에요" : `후기 마감 ${e.daysBefore}일 전이에요`, body: `${e.brand} 후기를 올려 주세요. 기한을 넘기면 다음 응모가 제한돼요.`, url: `/application/${e.applicationId}`, mode: "campaigns" };
    case "subsidy_deadline":
      return { title: `신청 마감 ${e.daysLeft}일 전이에요`, body: e.title, url: `/article/${e.articleId}`, mode: "finance" };
  }
}

/** 이벤트 → 알림함 한 줄. 운영에서 껐거나 회원이 끄면 null */
export function makeNotification(rules: AppRules, prefs: NotifyPrefs, memberId: string, event: NotifyEvent, now: string): DemoNotification | null {
  const category = notifyCategory(event);
  if (!notifyEnabled(rules, category) || !prefs[category]) return null;
  return { id: `nt${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, memberId, read: false, createdAt: now, ...notificationText(event) };
}

/** PHP 경로로 적힌 예전 픽스처 주소를 앱 라우트로 */
export function notificationHref(url: string): string {
  return url.replace(/^\/applications\//, "/application/");
}
