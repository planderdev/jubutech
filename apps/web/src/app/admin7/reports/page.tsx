"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, askReason } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import type { ReportStatus, ReportTarget } from "@/lib/types";
import { relTime } from "@/lib/utils";

const T: Record<ReportTarget, string> = { post: "게시글", comment: "댓글", campaign: "캠페인", user: "회원" };
const S: Record<ReportStatus, { label: string; tone: "red" | "sage" | "mute" }> = { open: { label: "미처리", tone: "red" }, resolved: { label: "처리됨", tone: "sage" }, dismissed: { label: "기각", tone: "mute" } };

export default function AdminReports() {
  const { reports, users, posts, comments, campaigns, adminResolveReport, adminSetPostStatus, adminDeleteComment, adminSetCampaignStatus, adminSetUserStatus } = useStore();
  const [tab, setTab] = useState<"open" | "all">("open");
  const nick = (id: string) => users.find((u) => u.id === id)?.nickname ?? id;
  const targetLabel = (t: ReportTarget, id: string) => t === "post" ? posts.find((p) => p.id === id)?.title : t === "comment" ? comments.find((c) => c.id === id)?.body : t === "campaign" ? campaigns.find((c) => c.id === id)?.title : nick(id);
  const targetHref = (t: ReportTarget, id: string) => t === "post" ? `/community/${id}` : t === "comment" ? `/community/${comments.find((c) => c.id === id)?.postId ?? ""}` : t === "campaign" ? `/campaigns/${id}` : `/admin7/users`;
  const rows = reports.filter((r) => tab === "all" || r.status === "open").map((r) => ({ ...r, reporter: nick(r.reporterId), targetText: targetLabel(r.target, r.targetId) ?? "(삭제됨)" }));
  const act = (r: (typeof rows)[number]) => {
    const reason = askReason("조치 사유"); if (reason === null) return;
    if (r.target === "post") adminSetPostStatus(r.targetId, "hidden", reason);
    if (r.target === "comment") adminDeleteComment(r.targetId, reason);
    if (r.target === "campaign") adminSetCampaignStatus(r.targetId, "closed");
    if (r.target === "user") adminSetUserStatus(r.targetId, "suspended", reason);
    adminResolveReport(r.id, "resolved", reason);
  };

  return (
    <div>
      <AdminHeader title="신고 처리" count={reports.filter((r) => r.status === "open").length} description="조치 = 게시글 숨김 / 댓글 삭제 / 캠페인 모집 중단 / 회원 정지 후 처리 완료. 기각은 대상에 변화 없음." />
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "open", label: "미처리", count: reports.filter((r) => r.status === "open").length }, { key: "all", label: "전체", count: reports.length }]} />
      <AdminTable
        rows={rows}
        searchKeys={["reason", "detail", "reporter", "targetText"]}
        bulkActions={[{ label: "기각", onClick: (ids) => ids.forEach((id) => adminResolveReport(id, "dismissed")) }]}
        columns={[
          { key: "target", label: "대상", render: (r) => <div className="max-w-[300px]"><div className="flex items-center gap-1.5 mb-0.5"><Badge tone="outline">{T[r.target]}</Badge><Badge tone={S[r.status].tone}>{S[r.status].label}</Badge></div><Link href={targetHref(r.target, r.targetId)} className="font-semibold hover:text-red line-clamp-1">{r.targetText}</Link></div> },
          { key: "reason", label: "사유", render: (r) => <div className="max-w-[260px]"><p className="font-semibold">{r.reason}</p>{r.detail && <p className="text-[12px] text-ink-2 line-clamp-2">{r.detail}</p>}</div> },
          { key: "reporter", label: "신고자", render: (r) => r.reporter },
          { key: "createdAt", label: "접수", className: "num text-ink-3", render: (r) => relTime(r.createdAt) },
          { key: "actions", label: "", className: "text-right", render: (r) => r.status === "open" ? <div className="flex gap-1 justify-end"><Button size="sm" variant="ink" onClick={() => act(r)}>조치</Button><Button size="sm" variant="ghost" onClick={() => adminResolveReport(r.id, "dismissed")}>기각</Button></div> : <span className="text-[12px] text-ink-3">완료</span> },
        ]}
      />
    </div>
  );
}
