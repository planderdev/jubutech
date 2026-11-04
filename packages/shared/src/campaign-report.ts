/**
 * 3-2 광고주 결과 리포트 · 3-3 관리자 현황판 — 숫자 계산만. 없는 데이터(활성 사용자, 1:1 채팅, 매출 원장)는 null 로 두고 화면에서 "연결 전"으로 표시한다.
 * 지어낸 숫자를 보여 주지 않는 것이 원칙이다. 이 숫자가 영업·투자 자료가 된다.
 */
import type { AppRules } from "./rules";
import { trustTemperature } from "./trust";
import type { Application, Campaign, PointLog, Report, Review, TrustEvent, User, Post } from "./types";
import { campaignQuote } from "./advertiser";
import { downloadMilestone } from "./invite";

export interface CampaignReport {
  applied: number;
  selected: number;
  submitted: number;
  completed: number;
  /** 선정 대비 후기 제출률(%) */
  submitRate: number | null;
  links: { nickname: string; url: string }[];
  /** 참여자(선정 이상) 평균 생활력 온도 */
  averageTemperature: number | null;
  /** 2-1 추천 링크 구매 수 — 연결 전 null */
  referralPurchases: number | null;
}

export function campaignReport(input: { campaignId: string; applications: Application[]; users: User[]; trustEvents: TrustEvent[]; rules: AppRules }): CampaignReport {
  const rows = input.applications.filter((a) => a.campaignId === input.campaignId && a.status !== "cancelled");
  const chosen = rows.filter((a) => ["selected", "submitted", "completed"].includes(a.status));
  const done = rows.filter((a) => ["submitted", "completed"].includes(a.status));
  const score = (id: string) => input.trustEvents.filter((e) => e.userId === id).reduce((n, e) => n + e.delta, 0);
  const temps = chosen.map((a) => trustTemperature(score(a.userId), input.rules));
  return {
    applied: rows.length,
    selected: chosen.length,
    submitted: done.length,
    completed: rows.filter((a) => a.status === "completed").length,
    submitRate: chosen.length ? Math.round((done.length / chosen.length) * 100) : null,
    links: done.filter((a) => a.submissionUrl).map((a) => ({ nickname: input.users.find((u) => u.id === a.userId)?.nickname ?? "회원", url: a.submissionUrl as string })),
    averageTemperature: temps.length ? Math.round((temps.reduce((n, t) => n + t, 0) / temps.length) * 10) / 10 : null,
    referralPurchases: null,
  };
}

export interface DashboardMetrics {
  growth: { downloads: number; milestone: string; weeklySignups: number; weeklyActive: number | null };
  campaigns: { running: number; applied: number; selected: number; submitted: number; overdue: number };
  money: { monthlyFee: number; monthlyAgency: number; monthlyAdRevenue: number | null; rewardsPaid: number };
  ops: { reviewPosts: number; openReports: number; pendingReviews: number; openChats: number | null };
}

/** 기획안 3-3 네 묶음. 수수료는 이번 달에 등록된 캠페인 × 현재 단가로 계산한 추정치다(결제 연결 전) */
export function dashboardMetrics(input: { downloads: number; users: User[]; campaigns: Campaign[]; applications: Application[]; reviews: Review[]; overdueCount: number; pointLogs: PointLog[]; posts: Post[]; reports: Report[]; rules: AppRules; now: Date }): DashboardMetrics {
  const { now, rules } = input;
  const weekAgo = now.getTime() - 7 * 86400000;
  const sameMonth = (iso: string) => { const d = new Date(iso); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); };
  const live = input.applications.filter((a) => a.status !== "cancelled");
  const monthCampaigns = input.campaigns.filter((c) => c.status !== "draft" && sameMonth(c.createdAt));
  return {
    growth: { downloads: input.downloads, milestone: downloadMilestone(input.downloads).label, weeklySignups: input.users.filter((u) => u.joinedAt && Date.parse(u.joinedAt) >= weekAgo).length, weeklyActive: null },
    campaigns: {
      running: input.campaigns.filter((c) => ["open", "closed", "selected", "ongoing"].includes(c.status)).length,
      applied: live.length,
      selected: live.filter((a) => ["selected", "submitted", "completed"].includes(a.status)).length,
      submitted: live.filter((a) => ["submitted", "completed"].includes(a.status)).length,
      overdue: input.overdueCount,
    },
    money: {
      monthlyFee: monthCampaigns.reduce((n, c) => n + campaignQuote(rules, c.selectionMode ?? "self").baseFee, 0),
      monthlyAgency: monthCampaigns.reduce((n, c) => n + campaignQuote(rules, c.selectionMode ?? "self").agencyFee, 0),
      monthlyAdRevenue: null,
      rewardsPaid: input.pointLogs.filter((l) => l.amount > 0 && sameMonth(l.createdAt)).reduce((n, l) => n + l.amount, 0),
    },
    ops: {
      reviewPosts: input.posts.filter((p) => p.status === "review").length,
      openReports: input.reports.filter((r) => r.status === "open").length,
      pendingReviews: input.reviews.filter((r) => r.status === "pending").length,
      openChats: null,
    },
  };
}
