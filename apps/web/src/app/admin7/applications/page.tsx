"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { APPLICATION_STATUS, CHANNELS, type ApplicationStatus } from "@/lib/types";
import { relTime } from "@/lib/utils";

export default function AdminApplications() {
  const { applications, campaigns, users, adminForceApplication } = useStore();
  const [tab, setTab] = useState<"all" | ApplicationStatus>("all");
  const rows = applications.filter((a) => tab === "all" || a.status === tab).map((a) => { const c = campaigns.find((x) => x.id === a.campaignId); const u = users.find((x) => x.id === a.userId); return { ...a, campaignTitle: c?.title ?? "", brand: c?.brand ?? "", nickname: u?.nickname ?? a.userId, reward: c?.reward.desc ?? "" }; });
  const keys = ["all", "pending", "selected", "submitted", "completed", "rejected", "cancelled"] as const;

  return (
    <div>
      <AdminHeader title="응모 · 미션" count={applications.length} description="광고주 검수가 지연되면 운영자가 상태를 강제로 바꿀 수 있어요. 완료 처리 시 보상 포인트가 즉시 지급됩니다." />
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={keys.map((k) => ({ key: k, label: k === "all" ? "전체" : APPLICATION_STATUS[k].label, count: k === "all" ? applications.length : applications.filter((a) => a.status === k).length }))} />
      <AdminTable
        rows={rows}
        searchKeys={["campaignTitle", "brand", "nickname", "message"]}
        bulkActions={[
          { label: "선정", variant: "ink", onClick: (ids) => ids.forEach((id) => adminForceApplication(id, "selected")) },
          { label: "완료·지급", onClick: (ids) => { if (confirm(`${ids.length}건을 완료 처리하고 보상을 지급할까요?`)) ids.forEach((id) => adminForceApplication(id, "completed")); } },
        ]}
        columns={[
          { key: "campaignTitle", label: "캠페인", render: (a) => <div className="max-w-[260px]"><p className="text-[12px] font-bold text-red">{a.brand}</p><Link href={`/campaigns/${a.campaignId}`} className="font-semibold hover:text-red line-clamp-1">{a.campaignTitle}</Link></div> },
          { key: "nickname", label: "회원", render: (a) => <div><p className="font-semibold">{a.nickname}</p><p className="text-[11px] text-ink-3">{CHANNELS.find((x) => x.key === a.channel)?.label}{a.channelUrl && ` · ${a.channelUrl.replace(/^https?:\/\//, "")}`}</p></div> },
          { key: "status", label: "상태", render: (a) => <Badge tone={APPLICATION_STATUS[a.status].tone}>{APPLICATION_STATUS[a.status].label}</Badge> },
          { key: "submissionUrl", label: "제출물", render: (a) => a.submissionUrl ? <a href={a.submissionUrl} target="_blank" rel="noreferrer" className="text-red underline text-[12px]">보기</a> : <span className="text-ink-3">—</span> },
          { key: "createdAt", label: "응모", className: "num text-ink-3", render: (a) => relTime(a.createdAt) },
          { key: "actions", label: "", className: "text-right", render: (a) => <select value={a.status} onChange={(e) => adminForceApplication(a.id, e.target.value as ApplicationStatus)} className="h-8 rounded-md bg-inset px-2 text-[12px] font-semibold outline-none">{(Object.keys(APPLICATION_STATUS) as ApplicationStatus[]).map((k) => <option key={k} value={k}>{APPLICATION_STATUS[k].label}</option>)}</select> },
        ]}
      />
      <p className="mt-3 text-[12px] text-ink-3"><Button size="sm" variant="ghost" onClick={() => rows.filter((a) => a.status === "submitted").forEach((a) => adminForceApplication(a.id, "completed"))}>제출된 미션 전체 승인</Button></p>
    </div>
  );
}
