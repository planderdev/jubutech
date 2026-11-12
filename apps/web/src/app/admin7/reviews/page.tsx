"use client";
import { useState } from "react";
import { DEMO_APPLICATIONS, DEMO_CAMPAIGNS, DEMO_MEMBERS, REVIEW_STATUS, reviewCheckSummary, reviewDueLabel, type ReviewStatus } from "@jubutech/shared";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, StatCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewDrawer } from "@/components/feature/review-drawer";
import { Tabs } from "@/components/ui/tabs";
import { relTime } from "@/lib/utils";

const STATUS_KEYS = ["pending", "revision", "approved", "rejected"] as const;

/**
 * 후기 검수 — PHP `/admin/reviews` + 상세(`adminDetail('reviews')`) 를 한 화면에:
 * 목록(상태 탭·자동 검사 요약) → 드로어에 제출 원문과 미션 카드를 나란히, 자동 검사 항목, 검수 결과(승인·보완·반려 + 사유 + 별점).
 */
export default function AdminReviews() {
  const { reviews, adminDecideReview } = useStore();
  const [tab, setTab] = useState<"all" | ReviewStatus>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = reviews
    .filter((r) => tab === "all" || r.status === tab)
    .map((r) => {
      const app = DEMO_APPLICATIONS.find((a) => a.id === r.applicationId);
      const c = app ? DEMO_CAMPAIGNS.find((x) => x.id === app.campaignId) : undefined;
      const m = app ? DEMO_MEMBERS.find((x) => x.id === app.memberId) : undefined;
      return { ...r, campaignTitle: c?.title ?? "(캠페인 없음)", brand: c?.brand ?? "", nickname: m?.nickname ?? app?.answers.nickname ?? app?.memberId ?? "", summary: reviewCheckSummary(r.check).text, dueAt: c?.reviewDueAt ?? "" };
    });
  const open = reviews.find((r) => r.id === openId) ?? null;
  const count = (k: ReviewStatus) => reviews.filter((r) => r.status === k).length;

  return (
    <div>
      <AdminHeader title="후기 검수" count={count("pending")} description="제출된 후기와 미션 카드를 나란히 보고 승인·보완 요청·반려를 기록합니다. 자동 검사는 참고용이고 확정은 운영자가 합니다. 승인 시 리워드 적립은 지갑(W4)과 함께 연결됩니다." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="검토 대기" value={count("pending")} tone={count("pending") ? "red" : undefined} />
        <StatCard label="보완 요청" value={count("revision")} />
        <StatCard label="승인" value={count("approved")} tone="success" />
        <StatCard label="반려" value={count("rejected")} />
      </div>
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "all", label: "전체", count: reviews.length }, ...STATUS_KEYS.map((k) => ({ key: k, label: REVIEW_STATUS[k].label, count: count(k) }))]} />
      <AdminTable
        rows={rows}
        searchKeys={["campaignTitle", "brand", "nickname", "content", "url"]}
        empty="이 상태의 후기가 없어요"
        columns={[
          { key: "campaignTitle", label: "체험단", render: (r) => <div className="max-w-[260px]"><p className="text-[12px] font-bold text-red">{r.brand}</p><button type="button" onClick={() => setOpenId(r.id)} className="font-semibold hover:text-red line-clamp-1 text-left">{r.campaignTitle}</button></div> },
          { key: "nickname", label: "회원", render: (r) => <p className="font-semibold">{r.nickname}</p> },
          { key: "summary", label: "자동 검사", render: (r) => <Badge tone={!r.check ? "mute" : r.check.passed ? "sage" : "butter"}>{r.summary}</Badge> },
          { key: "status", label: "상태", render: (r) => <Badge tone={REVIEW_STATUS[r.status].tone}>{REVIEW_STATUS[r.status].label}</Badge> },
          { key: "url", label: "제출물", render: (r) => <div className="text-[12px]">{r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-red underline">링크</a> : <span className="text-ink-3">앱 작성</span>}{r.content ? <span className="text-ink-3"> · {r.content.length}자</span> : null}<span className="text-ink-3"> · 사진 {r.photoCount}장</span></div> },
          { key: "submittedAt", label: "제출", className: "num text-ink-3", render: (r) => <span title={r.dueAt ? `기한 ${reviewDueLabel(r.dueAt, r.submittedAt)}` : undefined}>{relTime(r.submittedAt)}</span> },
          { key: "actions", label: "", className: "text-right", render: (r) => <Button size="sm" variant={r.status === "pending" ? "ink" : "secondary"} onClick={() => setOpenId(r.id)}>검수</Button> },
        ]}
      />
      <ReviewDrawer review={open} onClose={() => setOpenId(null)} decide={adminDecideReview} />
    </div>
  );
}
