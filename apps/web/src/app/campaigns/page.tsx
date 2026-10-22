"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { CAMPAIGN_CATEGORIES, CHANNELS, type ChannelType } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { Chip, ChipRow } from "@/components/ui/chip";
import { CampaignCard } from "@/components/feature/campaign-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";

function CampaignList() {
  const sp = useSearchParams();
  const campaigns = useStore((s) => s.campaigns);
  const userId = useStore((s) => s.userId);
  const [cat, setCat] = useState(sp.get("c") ?? "all");
  const [ch, setCh] = useState<ChannelType | "all">((sp.get("ch") as ChannelType) ?? "all");
  const [status, setStatus] = useState<"open" | "all">("open");
  const [sort, setSort] = useState<"latest" | "deadline" | "reward">("latest");
  const list = useMemo(() => {
    let l = campaigns.filter((c) => !["draft", "pending"].includes(c.status));
    if (status === "open") l = l.filter((c) => c.status === "open");
    if (cat !== "all") l = l.filter((c) => c.category === cat);
    if (ch !== "all") l = l.filter((c) => c.channels.includes(ch));
    if (sort === "deadline") l = [...l].sort((a, b) => a.recruitEnd.localeCompare(b.recruitEnd));
    if (sort === "reward") l = [...l].sort((a, b) => b.reward.value - a.reward.value);
    if (sort === "latest") l = [...l].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return l;
  }, [campaigns, cat, ch, status, sort]);
  const myCount = useStore((s) => s.applications.filter((a) => a.userId === userId && a.status !== "cancelled").length);

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Enter a Mission" title="체험단 · 미션" description="검증된 광고주의 캠페인만 올라와요. 응모 → 선정 → 미션 → 보상까지 주부테크가 검수합니다." action={userId ? <Link href="/campaigns/my"><Button variant="secondary">내 응모 현황 <span className="num">{myCount}</span></Button></Link> : undefined} />
      <ChipRow>
        <Chip active={cat === "all"} onClick={() => setCat("all")}>전체</Chip>
        {CAMPAIGN_CATEGORIES.map((c) => <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>{c.label}</Chip>)}
      </ChipRow>
      <ChipRow className="mt-2">
        <Chip active={ch === "all"} onClick={() => setCh("all")}>모든 채널</Chip>
        {CHANNELS.map((c) => <Chip key={c.key} active={ch === c.key} onClick={() => setCh(c.key)}>{c.label}</Chip>)}
      </ChipRow>
      <div className="mt-5 flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex gap-3">
          <button type="button" onClick={() => setStatus("open")} className={`label ${status === "open" ? "text-red" : "text-ink-3"}`}>모집중</button>
          <button type="button" onClick={() => setStatus("all")} className={`label ${status === "all" ? "text-red" : "text-ink-3"}`}>전체</button>
          <span className="num text-[12px] text-ink-3">{list.length}건</span>
        </div>
        <div className="flex gap-3">
          {([["latest", "최신순"], ["deadline", "마감임박"], ["reward", "보상높은순"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setSort(k)} className={`label ${sort === k ? "text-red" : "text-ink-3"}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {list.map((c) => <CampaignCard key={c.id} c={c} />)}
      </div>
      {list.length === 0 && <div className="mt-6"><EmptyState icon="campaign" title="조건에 맞는 캠페인이 없어요" description="필터를 바꾸거나 전체 보기로 확인해 보세요." /></div>}
      <div className="mt-12 rounded-xl shadow-card bg-paper p-6 md:p-8 grid gap-4">
        <div>
          <p className="label text-red mb-2">For Brands</p>
          <p className="display text-[20px] md:text-[24px]">구매 결정권을 가진 주부에게, 진짜 후기로 닿으세요</p>
          <p className="text-[14px] text-ink-2 mt-1">캠페인 등록 → 주부테크 검수 → 맞춤 추천 → 결과 보고서. 셀프 등록 5분이면 충분해요.</p>
        </div>
        <Link href="/advertiser/campaigns/new"><Button variant="ink" size="lg">캠페인 열기</Button></Link>
      </div>
    </div>
  );
}
export default function CampaignsPage() {
  return <Suspense><CampaignList /></Suspense>;
}
