"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, askReason } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { CAMPAIGN_STATUS, CHANNELS, type Campaign, type CampaignStatus } from "@/lib/types";
import { relTime, fmtNum } from "@/lib/utils";

/** 캠페인 사전 점검 (루비 AI precheck 대체: 규칙 기반 위험/주의/통과) */
function precheck(c: Campaign): { level: "위험" | "주의" | "통과"; notes: string[] } {
  const notes: string[] = [];
  const text = [c.title, c.reward.desc, ...c.missions, ...c.requirements].join(" ");
  if (/선입금|보증금|교육비|가입비/.test(text)) notes.push("선입금·보증금 요구 표현");
  if (/자녀 사진|아이 얼굴|실명/.test(text)) notes.push("자녀 개인정보 요구 가능성");
  if (c.reward.value <= 0 || !c.reward.desc) notes.push("보상 조건 불명확");
  if (c.recruitEnd < c.recruitStart || c.announceDate < c.recruitEnd) notes.push("일정 순서 오류");
  if (c.missions.length === 0) notes.push("미션 없음");
  const level = notes.some((n) => /선입금|자녀/.test(n)) ? "위험" : notes.length ? "주의" : "통과";
  return { level, notes };
}

export default function AdminCampaigns() {
  const { campaigns, users, applications, adminReviewCampaign, adminSetCampaignStatus } = useStore();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const rows = campaigns.filter((c) => tab === "all" || c.status === "pending").map((c) => ({ ...c, advertiser: users.find((u) => u.id === c.advertiserId)?.brand ?? c.brand, apps: applications.filter((a) => a.campaignId === c.id && a.status !== "cancelled").length, check: precheck(c) }));

  return (
    <div>
      <AdminHeader title="캠페인 검수" count={campaigns.filter((c) => c.status === "pending").length} description="검수 기준: 선입금·보증금 금지 · 결과물 소유권 명시 · 자녀 개인정보 요구 금지 · 보상 조건 명확성. 반려 시 사유가 광고주에게 전달됩니다." />
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "pending", label: "검수 대기", count: campaigns.filter((c) => c.status === "pending").length }, { key: "all", label: "전체", count: campaigns.length }]} />
      <AdminTable
        rows={rows}
        searchKeys={["title", "brand", "advertiser"]}
        columns={[
          { key: "title", label: "캠페인", render: (c) => <div className="max-w-[320px]"><div className="flex items-center gap-1.5 mb-0.5"><span className="text-[12px] font-bold text-red">{c.brand}</span><Badge tone={CAMPAIGN_STATUS[c.status].tone}>{CAMPAIGN_STATUS[c.status].label}</Badge></div><Link href={`/campaigns/${c.id}`} className="font-semibold hover:text-red line-clamp-1">{c.title}</Link><p className="text-[11px] text-ink-3">{c.channels.map((ch) => CHANNELS.find((x) => x.key === ch)?.label).join(" · ")} · {c.reward.desc}</p></div> },
          { key: "check", label: "사전 점검", render: (c) => <div><Badge tone={c.check.level === "위험" ? "red" : c.check.level === "주의" ? "butter" : "sage"}>{c.check.level}</Badge>{c.check.notes.length > 0 && <ul className="mt-1 text-[11px] text-ink-2">{c.check.notes.map((n) => <li key={n}>· {n}</li>)}</ul>}</div> },
          { key: "recruit", label: "모집/신청", className: "num", render: (c) => `${c.recruitCount} / ${c.apps}` },
          { key: "period", label: "모집 기간", className: "num text-ink-3", render: (c) => `${c.recruitStart.slice(5)} ~ ${c.recruitEnd.slice(5)}` },
          { key: "createdAt", label: "등록", className: "num text-ink-3", render: (c) => relTime(c.createdAt) },
          { key: "actions", label: "", className: "text-right", render: (c) => c.status === "pending" ? (
            <div className="flex gap-1 justify-end"><Button size="sm" variant="ink" onClick={() => adminReviewCampaign(c.id, true, "검수 통과")}>승인</Button><Button size="sm" variant="danger" onClick={() => { const r = askReason("반려 사유 (광고주에게 전달)"); if (r !== null) adminReviewCampaign(c.id, false, r || "검수 기준 미충족"); }}>반려</Button></div>
          ) : (
            <select value={c.status} onChange={(e) => adminSetCampaignStatus(c.id, e.target.value as CampaignStatus)} className="h-8 rounded-md bg-inset px-2 text-[12px] font-semibold outline-none">{(Object.keys(CAMPAIGN_STATUS) as CampaignStatus[]).map((k) => <option key={k} value={k}>{CAMPAIGN_STATUS[k].label}</option>)}</select>
          ) },
        ]}
      />
      <p className="mt-3 text-[12px] text-ink-3">누적 보상 예산(모집 인원 × 보상가): <span className="num font-semibold text-ink">{fmtNum(campaigns.filter((c) => !["draft", "done"].includes(c.status)).reduce((n, c) => n + c.recruitCount * c.reward.value, 0))}원</span></p>
    </div>
  );
}
