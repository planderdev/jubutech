"use client";
import { Fab } from "@/components/layout/fab";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { checklistScore, tradePnl } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { RoleGate } from "@/components/feature/role-gate";
import { TradeCalendar, type CalMode } from "@/components/stock/trade-calendar";
import { TradeRow } from "@/components/feature/trade-row";
import { Button } from "@/components/ui/button";
import { LineIcon } from "@/components/ui/line-icon";
import { EmptyState } from "@/components/ui/empty";
import { PostItem } from "@/components/feature/post-item";
import { fmtNum, cn } from "@/lib/utils";

function Journal() {
  const trades = useStore((s) => s.trades.filter((t) => t.userId === s.userId).sort((a, b) => b.buyDate.localeCompare(a.buyDate)));
  const stockPosts = useStore((s) => s.posts.filter((p) => p.board === "stock").slice(0, 3));
  const [view, setView] = useState<CalMode | "list">("month");
  const [filter, setFilter] = useState<"all" | "holding" | "closed">("all");
  const closed = trades.filter((t) => t.sellDate);
  const wins = closed.filter((t) => (tradePnl(t)?.pnl ?? 0) > 0).length;
  const realized = closed.reduce((n, t) => n + (tradePnl(t)?.pnl ?? 0), 0);
  const holding = trades.filter((t) => !t.sellDate);
  const invested = holding.reduce((n, t) => n + t.buyPrice * t.qty, 0);
  const avgScore = trades.length ? trades.reduce((n, t) => n + checklistScore(t.checklist), 0) / trades.length : 0;
  const disciplined = closed.filter((t) => checklistScore(t.checklist) >= 4);
  const dWin = disciplined.length ? Math.round((disciplined.filter((t) => (tradePnl(t)?.pnl ?? 0) > 0).length / disciplined.length) * 100) : null;
  const list = filter === "all" ? trades : filter === "holding" ? holding : closed;

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Trading Journal" title="매매일지" description="종목 추천 대신 기준을 기록해요. 트레이딩 체크리스트 6항목 · 이평선 추세 · 손절선 · 매수/매도 근거를 한 장에." action={<Link href="/stock/new"><Button><LineIcon name="plus" className="h-4 w-4" />새 매매일지</Button></Link>} />
      <div className="grid grid-cols-2 gap-3">
        {[
          ["실현 손익", `${realized >= 0 ? "+" : ""}${fmtNum(realized)}원`, realized >= 0 ? "text-up" : "text-down"],
          ["승률", closed.length ? `${Math.round((wins / closed.length) * 100)}%` : "—", "", `${wins}승 ${closed.length - wins}패`],
          ["보유 투자금", `${fmtNum(invested)}원`, "", `${holding.length}종목`],
          ["체크리스트 평균", `${avgScore.toFixed(1)} / 6`, "", dWin !== null ? `4개↑ 지킨 매매 승률 ${dWin}%` : "4개↑ 지킨 매매 없음"],
        ].map(([k, v, cls, sub]) => (
          <div key={k} className="bg-paper rounded-xl shadow-soft p-4"><p className="label text-ink-3">{k}</p><p className={cn("num text-[20px] md:text-[24px] font-semibold mt-1", cls)}>{v}</p>{sub && <p className="num text-[11px] text-ink-3 mt-0.5">{sub}</p>}</div>
        ))}
      </div>

      <div className="mt-8 grid gap-6">
        <div className="">
          <div className="flex items-center justify-between mb-3">
            <div className="flex rounded-full bg-inset p-1">
              {([["month", "월"], ["week", "주"], ["day", "일"], ["list", "목록"]] as const).map(([v, l]) => <button key={v} type="button" onClick={() => setView(v)} className={cn("h-8 px-3.5 rounded-full text-[13px] font-semibold transition-colors", view === v ? "bg-stage text-paper shadow-soft" : "text-ink-2 hover:text-ink")}>{l}</button>)}
            </div>
            {view === "list" && (
              <div className="flex gap-3">{([["all", "전체"], ["holding", "보유"], ["closed", "청산"]] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setFilter(k)} className={`label ${filter === k ? "text-red" : "text-ink-3"}`}>{l}</button>)}</div>
            )}
          </div>
          {view !== "list" ? <TradeCalendar trades={trades} mode={view} /> : (
            <div className="bg-paper rounded-xl shadow-card px-4 md:px-2">
              {list.length === 0 ? <div className="py-6"><EmptyState icon="stock" title="기록이 없어요" action={<Link href="/stock/new"><Button>첫 매매일지 쓰기</Button></Link>} /></div> : list.map((t) => <TradeRow key={t.id} t={t} />)}
            </div>
          )}
        </div>
        <aside className=" space-y-5">
          <div className="bg-paper rounded-xl shadow-card p-5">
            <p className="label text-red mb-3">보유 중 · 손절선 점검</p>
            {holding.length === 0 ? <p className="text-[13px] text-ink-3">보유 종목이 없어요.</p> : (
              <ul className="space-y-3">
                {holding.map((t) => (
                  <li key={t.id}><Link href={`/stock/${t.id}`} className="block group"><div className="flex justify-between"><span className="font-semibold text-[14px] group-hover:text-red">{t.name}</span><span className="num text-[12px] text-ink-3">{t.buyDate.slice(5).replace("-", ".")}</span></div><p className="num text-[12px] text-ink-2 mt-0.5">매수 {fmtNum(t.buyPrice)} · 손절 {t.stopPrice ? <span className="text-down">{fmtNum(t.stopPrice)}</span> : <span className="text-red">미설정!</span>} · 목표 {t.targetPrice ? fmtNum(t.targetPrice) : "—"}</p></Link></li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-inset rounded-xl p-5">
            <p className="label text-ink mb-2">최근 기록</p>
            <ul className="divide-y divide-hairline">{trades.slice(0, 4).map((t) => <TradeRow key={t.id} t={t} />)}</ul>
          </div>
          <div>
            <p className="label text-ink-3 mb-1">커뮤니티 매매 복기</p>
            <div className="border-t border-hairline">{stockPosts.map((p) => <PostItem key={p.id} post={p} showBoard={false} />)}</div>
          </div>
        </aside>
      </div>
      <Fab href="/stock/new" label="매매일지" icon="plus" />
    </div>
  );
}
export default function StockPage() {
  return <RoleGate allow={["member", "admin"]}><Journal /></RoleGate>;
}
