"use client";
import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { CAMPAIGN_STATUS, CHANNELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { dday, fmtNum } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** 흰 라운드 카드 + 연회색 일러스트 타일 (레드 액센트 스파클) */
export function IllustTile({ icon, size = "md", className }: { icon: LineIconName; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "h-[104px]", md: "h-[140px]", lg: "h-[200px]" }[size];
  const i = { sm: "h-12 w-12", md: "h-16 w-16", lg: "h-24 w-24" }[size];
  return (
    <div className={cn("arch relative flex items-center justify-center overflow-hidden", s, className)}>
      <svg className="absolute inset-0 h-full w-full text-red" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M14 22l6-4M80 18l5 5M86 70l-6 3M18 76l4 5M50 10v5M52 88v4" />
        <circle cx="26" cy="64" r="1.6" fill="currentColor" stroke="none" /><circle cx="74" cy="34" r="1.6" fill="currentColor" stroke="none" />
      </svg>
      <div className="relative rounded-2xl bg-paper shadow-soft p-3"><LineIcon name={icon} className={cn("text-red", i)} strokeWidth={1.3} /></div>
    </div>
  );
}

export function CampaignCard({ c, compact }: { c: Campaign; compact?: boolean }) {
  const st = CAMPAIGN_STATUS[c.status];
  const isOpen = c.status === "open";
  return (
    <Link href={`/campaigns/${c.id}`} className={cn("lift block bg-paper rounded-xl shadow-soft overflow-hidden", compact ? "w-[220px] shrink-0" : "")}>
      <div className="relative p-3 pb-0">
        <IllustTile icon={c.thumbIcon as LineIconName} size={compact ? "sm" : "md"} />
        {isOpen && <span className="absolute left-5 top-5 num text-[11px] font-bold text-paper bg-red rounded-full px-2 py-1">{dday(c.recruitEnd)}</span>}
      </div>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap"><span className="text-[12px] font-bold text-red">{c.brand}</span><Badge tone={st.tone}>{st.label}</Badge></div>
        <h3 className="text-[15px] font-bold leading-snug line-clamp-2 min-h-[42px]">{c.title}</h3>
        <p className="mt-1.5 text-[13px] text-ink-2 line-clamp-1">{c.reward.desc}</p>
        <p className="mt-1 text-[11px] text-ink-3 truncate">{c.channels.map((ch) => CHANNELS.find((x) => x.key === ch)?.label).join(" · ")}{c.region && ` · ${c.region}`}</p>
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap text-[12px] text-ink-3">
          <span className="num">신청 {fmtNum(c.applicantIds.length)}/{fmtNum(c.recruitCount)}</span>
          <span className="num">{c.recruitEnd.slice(5).replace("-", ".")} 마감</span>
        </div>
      </div>
    </Link>
  );
}
