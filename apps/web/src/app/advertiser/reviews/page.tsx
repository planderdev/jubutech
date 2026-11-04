"use client";
import { useState } from "react";
import { DEMO_APPLICATIONS, DEMO_CAMPAIGNS, DEMO_MEMBERS, REVIEW_STATUS, ownsDemoCampaign, reviewCheckSummary, reviewDueLabel, type ReviewStatus } from "@jubutech/shared";
import { useStore } from "@/lib/store";
import { AdminTable, StatCard } from "@/components/admin/admin-ui";
import { PageHeader } from "@/components/feature/page-header";
import { ReviewDrawer } from "@/components/feature/review-drawer";
import { RoleGate } from "@/components/feature/role-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { relTime } from "@/lib/utils";

const STATUS_KEYS = ["pending", "revision", "approved", "rejected"] as const;

/**
 * 광고주 후기 검수 (기획안 2-2 · 1-1 "통과한 것만 광고주에게") — 내 체험단에 올라온 후기를 미션 카드와 나란히 보고 승인·보완·반려·별점.
 * 별점은 주부 생활력에 반영된다. 관리자 화면(`/admin7/reviews`)과 같은 드로어·같은 기록.
 */
function AdvertiserReviews() {
  const { reviews, adminDecideReview, userId, role } = useStore();
  const [tab, setTab] = useState<"all" | ReviewStatus>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const mine = reviews.filter((r) => {
    const app = DEMO_APPLICATIONS.find((a) => a.id === r.applicationId);
    return role === "admin" || (app && ownsDemoCampaign(userId ?? "", app.campaignId));
  });
  const rows = mine
    .filter((r) => tab === "all" || r.status === tab)
    .map((r) => {
      const app = DEMO_APPLICATIONS.find((a) => a.id === r.applicationId);
      const c = app ? DEMO_CAMPAIGNS.find((x) => x.id === app.campaignId) : undefined;
      const m = app ? DEMO_MEMBERS.find((x) => x.id === app.memberId) : undefined;
      return { ...r, campaignTitle: c?.title ?? "(캠페인 없음)", brand: c?.brand ?? "", nickname: m?.nickname ?? app?.answers.nickname ?? "", summary: reviewCheckSummary(r.check).text, dueAt: c?.reviewDueAt ?? "" };
    });
  const open = mine.find((r) => r.id === openId) ?? null;
  const count = (k: ReviewStatus) => mine.filter((r) => r.status === k).length;

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Reviews" title="후기 검수" description="앱이 먼저 검사한 후기를 미션 카드와 나란히 보고 확정합니다. 별점은 참여자의 생활력에 반영됩니다." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="검토 대기" value={count("pending")} tone={count("pending") ? "red" : undefined} />
        <StatCard label="보완 요청" value={count("revision")} />
        <StatCard label="승인" value={count("approved")} tone="success" />
        <StatCard label="반려" value={count("rejected")} />
      </div>
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "all", label: "전체", count: mine.length }, ...STATUS_KEYS.map((k) => ({ key: k, label: REVIEW_STATUS[k].label, count: count(k) }))]} />
      <AdminTable
        rows={rows}
        searchKeys={["campaignTitle", "nickname", "content", "url"]}
        empty="이 상태의 후기가 없어요"
        columns={[
          { key: "campaignTitle", label: "체험단", render: (r) => <div className="max-w-[260px]"><p className="text-[12px] font-bold text-red">{r.brand}</p><button type="button" onClick={() => setOpenId(r.id)} className="font-semibold hover:text-red line-clamp-1 text-left">{r.campaignTitle}</button></div> },
          { key: "nickname", label: "참여자", render: (r) => <p className="font-semibold">{r.nickname}</p> },
          { key: "summary", label: "자동 검사", render: (r) => <Badge tone={!r.check ? "mute" : r.check.passed ? "sage" : "butter"}>{r.summary}</Badge> },
          { key: "status", label: "상태", render: (r) => <Badge tone={REVIEW_STATUS[r.status].tone}>{REVIEW_STATUS[r.status].label}</Badge> },
          { key: "rating", label: "별점", className: "num", render: (r) => (r.rating ? "★".repeat(r.rating) : "—") },
          { key: "submittedAt", label: "제출", className: "num text-ink-3", render: (r) => <span title={r.dueAt ? `기한 ${reviewDueLabel(r.dueAt, r.submittedAt)}` : undefined}>{relTime(r.submittedAt)}</span> },
          { key: "actions", label: "", className: "text-right", render: (r) => <Button size="sm" variant={r.status === "pending" ? "ink" : "secondary"} onClick={() => setOpenId(r.id)}>검수</Button> },
        ]}
      />
      <ReviewDrawer review={open} onClose={() => setOpenId(null)} decide={adminDecideReview} />
    </div>
  );
}

export default function AdvertiserReviewsPage() {
  return <RoleGate allow={["advertiser", "admin"]}><AdvertiserReviews /></RoleGate>;
}
