"use client";
import Link from "next/link";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { APPLICATION_STATUS, CAMPAIGN_STATUS, CHANNELS, type ApplicationStatus, type CampaignStatus } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { RoleGate } from "@/components/feature/role-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/feature/avatar";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty";
import { relTime, fmtNum } from "@/lib/utils";

const NEXT: Partial<Record<CampaignStatus, { to: CampaignStatus; label: string }>> = {
  pending: { to: "open", label: "검수 승인 → 모집 시작" },
  open: { to: "closed", label: "모집 마감" },
  closed: { to: "selected", label: "선정 발표" },
  selected: { to: "ongoing", label: "미션 시작" },
  ongoing: { to: "done", label: "캠페인 완료" },
};

function Manage() {
  const { id } = useParams<{ id: string }>();
  const c = useStore((s) => s.campaigns.find((x) => x.id === id));
  const apps = useStore((s) => s.applications.filter((a) => a.campaignId === id && a.status !== "cancelled"));
  const users = useStore((s) => s.users);
  const { decideApplication, updateCampaignStatus } = useStore();
  const [tab, setTab] = useState<"all" | ApplicationStatus>("all");
  if (!c) notFound();
  const list = tab === "all" ? apps : apps.filter((a) => a.status === tab);
  const selectedCount = apps.filter((a) => ["selected", "submitted", "completed"].includes(a.status)).length;
  const nx = NEXT[c.status];

  return (
    <div className="px-4 md:px-5">
      <nav className="label text-ink-3 pt-6"><Link href="/advertiser" className="hover:text-red">광고주 센터</Link> / 캠페인 관리</nav>
      <PageHeader eyebrow={c.brand} title={c.title} description={`${c.recruitStart.replace(/-/g, ".")} ~ ${c.recruitEnd.replace(/-/g, ".")} 모집 · 선정 발표 ${c.announceDate.replace(/-/g, ".")}`}
        action={<div className="flex items-center gap-2 flex-wrap"><Badge tone={CAMPAIGN_STATUS[c.status].tone}>{CAMPAIGN_STATUS[c.status].label}</Badge>{nx && <Button size="sm" variant="ink" onClick={() => updateCampaignStatus(c.id, nx.to)}>{nx.label}</Button>}<Link href={`/campaigns/${c.id}`}><Button size="sm" variant="secondary">회원 화면</Button></Link></div>} />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[["모집 인원", c.recruitCount], ["신청", apps.length], ["선정", selectedCount], ["조회", c.views]].map(([k, v]) => (
          <div key={k} className="bg-paper rounded-xl shadow-soft p-4"><p className="label text-ink-3">{k}</p><p className="num text-[24px] font-semibold mt-1">{fmtNum(Number(v))}</p></div>
        ))}
      </div>
      <Tabs active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "all", label: "전체", count: apps.length }, ...(["pending", "selected", "submitted", "completed", "rejected"] as ApplicationStatus[]).map((k) => ({ key: k, label: APPLICATION_STATUS[k].label, count: apps.filter((a) => a.status === k).length }))]} />
      {list.length === 0 ? <div className="mt-6"><EmptyState icon="community" title="해당 상태의 신청자가 없어요" /></div> : (
        <ul className="mt-2 bg-paper rounded-xl shadow-soft divide-y divide-hairline">
          {list.map((a) => {
            const u = users.find((x) => x.id === a.userId);
            const st = APPLICATION_STATUS[a.status];
            return (
              <li key={a.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar name={u?.nickname ?? "?"} size="lg" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{u?.nickname} <span className="label text-ink-3 ml-1">Lv.{u?.level} · {u?.region}</span></p>
                    <p className="num text-[12px] text-ink-3 mt-0.5">{CHANNELS.find((x) => x.key === a.channel)?.label}{a.channelUrl && <> · <a href={a.channelUrl} target="_blank" rel="noreferrer" className="underline hover:text-red">{a.channelUrl.replace(/^https?:\/\//, "")}</a></>} · {relTime(a.createdAt)}</p>
                    {a.message && <p className="text-[14px] mt-1.5 text-ink-2">&ldquo;{a.message}&rdquo;</p>}
                    <div className="mt-1.5 flex gap-1 flex-wrap">{u?.tags.map((t) => <span key={t} className="text-[11px] text-ink-3">#{t}</span>)}{u?.badges.map((b) => <Badge key={b} tone="butter">{b}</Badge>)}</div>
                    {a.submissionUrl && <p className="mt-2 text-[13px]">제출물: <a href={a.submissionUrl} target="_blank" rel="noreferrer" className="text-red underline break-all">{a.submissionUrl}</a></p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:flex-col md:items-end shrink-0">
                  <Badge tone={st.tone}>{st.label}</Badge>
                  {a.status === "pending" && <div className="flex gap-1.5"><Button size="sm" onClick={() => decideApplication(a.id, "selected")}>선정</Button><Button size="sm" variant="ghost" onClick={() => decideApplication(a.id, "rejected")}>미선정</Button></div>}
                  {a.status === "submitted" && <div className="flex gap-1.5"><Button size="sm" onClick={() => decideApplication(a.id, "completed")}>승인·보상 지급</Button><Button size="sm" variant="ghost" onClick={() => decideApplication(a.id, "selected")}>수정 요청</Button></div>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
export default function ManageCampaignPage() {
  return <RoleGate allow={["advertiser", "admin"]}><Manage /></RoleGate>;
}
