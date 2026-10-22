"use client";
import Link from "next/link";
import type { Trade } from "@/lib/types";
import { checklistScore, tradePnl } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { fmtNum, fmtPct, cn } from "@/lib/utils";

export function PnlText({ t, className }: { t: Trade; className?: string }) {
  const r = tradePnl(t);
  if (!r) return <span className={cn("num text-ink-3", className)}>보유중</span>;
  const up = r.pnl >= 0;
  return (
    <span className={cn("num font-semibold", up ? "text-up" : "text-down", className)}>
      {up ? "+" : ""}{fmtNum(r.pnl)}원 <span className="text-[0.85em] opacity-80">({fmtPct(r.pct)})</span>
    </span>
  );
}

export function ChecklistDots({ t }: { t: Trade }) {
  const n = checklistScore(t.checklist);
  return (
    <span className="inline-flex items-center gap-[3px]" title={`체크리스트 ${n}/6`} aria-label={`체크리스트 ${n}/6`}>
      {Array.from({ length: 6 }).map((_, i) => <span key={i} className={cn("h-2 w-2 rounded-full border border-red", i < n ? "bg-red" : "bg-transparent")} />)}
    </span>
  );
}

export function TradeRow({ t }: { t: Trade }) {
  return (
    <Link href={`/stock/${t.id}`} className="flex items-center gap-3 py-3 border-b border-hairline hover:bg-paper/70 -mx-4 px-4 md:mx-0 md:px-2 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px] truncate">{t.name}</span>
          <Badge tone="mute">{t.market}</Badge>
          {t.sellDate ? <Badge tone="outline">청산</Badge> : <Badge tone="sage">보유</Badge>}
        </div>
        <p className="num mt-1 text-[12px] text-ink-3">
          {t.buyDate.slice(5).replace("-", ".")} 매수 {fmtNum(t.buyPrice)} × {t.qty}
          {t.sellDate && <> → {t.sellDate.slice(5).replace("-", ".")} 매도 {fmtNum(t.sellPrice ?? 0)}</>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <PnlText t={t} className="text-[14px]" />
        <div className="mt-1 flex justify-end"><ChecklistDots t={t} /></div>
      </div>
    </Link>
  );
}
