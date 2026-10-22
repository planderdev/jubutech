"use client";
import Link from "next/link";
import type { InfoArticle } from "@/lib/types";
import { INFO_CATEGORIES } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { dday } from "@/lib/utils";
import { LineIcon } from "@/components/ui/line-icon";
import { cn } from "@/lib/utils";

export function InfoCard({ a, className }: { a: InfoArticle; className?: string }) {
  const saved = useStore((s) => s.savedInfo.includes(a.id));
  const cat = INFO_CATEGORIES.find((c) => c.key === a.category);
  return (
    <Link href={`/info/${a.id}`} className={cn("lift block bg-paper rounded-xl shadow-soft p-4", className)}>
      <div className="flex items-center gap-1.5">
        <Badge tone="outline">{cat?.label}</Badge>
        {a.deadline && <Badge tone="red">{dday(a.deadline)}</Badge>}
        <span className="ml-auto text-[12px] font-bold text-red">+{a.rewardPoints}P</span>
      </div>
      <h3 className="mt-2.5 text-[16px] font-bold leading-snug line-clamp-2">{a.title}</h3>
      <p className="mt-1 text-[13px] text-ink-2 line-clamp-2">{a.summary}</p>
      {a.amount && <p className="num mt-2 text-[14px] font-bold text-red">{a.amount}</p>}
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-3">
        <span>{a.source} · {a.sourceDate.replace(/-/g, ".")}</span>
        <span className={cn("inline-flex items-center gap-1 num", saved && "text-red")}><LineIcon name="heart" className="h-3.5 w-3.5" />{a.saves + (saved ? 1 : 0)}</span>
      </div>
    </Link>
  );
}
