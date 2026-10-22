"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { emptyChecklist, emptyMaTrend, tradePnl, type Trade } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LineIcon } from "@/components/ui/line-icon";
import { Badge } from "@/components/ui/badge";
import { cn, fmtManwon, fmtNum, todayStr } from "@/lib/utils";

/**
 * 수익차곡 레퍼런스 캘린더 — 월 / 주 / 일 3모드
 *  · 헤더: 기간 제목 + 기간 손익(빨강/파랑) · ‹ › · 오늘
 *  · 월 목표 배너: "N월 목표 달성까지 N원 남았어요"
 *  · 월: 날짜 원을 일별 실현손익으로 물들이고 아래 금액 표시, 매수만 있는 날은 점
 *  · 주: 일~토 날짜 카드 스트립, 선택일 블랙 강조
 *  · 일: 하루 단위 이동 + 그날의 거래 리스트
 *  · 공통: 선택한 날의 거래 리스트("9월 2일 거래") + 인라인 빠른 기록 (플랜더웍스 패턴, Enter 저장)
 */
export type CalMode = "month" | "week" | "day";
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const WD = ["일", "월", "화", "수", "목", "금", "토"];

type DayAgg = { realized: number; sells: number; buys: number };

export function TradeCalendar({ trades, mode }: { trades: Trade[]; mode: CalMode }) {
  const router = useRouter();
  const { addTrade, updateTrade, monthlyGoal, setMonthlyGoal } = useStore();
  const today = todayStr();
  const [sel, setSel] = useState(today);          // 선택일 (주/일 모드의 기준, 월 모드의 하이라이트)
  const [month, setMonth] = useState(today.slice(0, 7)); // 월 모드 기준 YYYY-MM
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(""); const [price, setPrice] = useState(""); const [qty, setQty] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const nameRef = useRef<HTMLInputElement>(null);

  /* 일별 집계 */
  const agg = useMemo(() => {
    const m: Record<string, DayAgg> = {};
    for (const t of trades) {
      (m[t.buyDate] ??= { realized: 0, sells: 0, buys: 0 }).buys++;
      if (t.sellDate) { const a = (m[t.sellDate] ??= { realized: 0, sells: 0, buys: 0 }); a.sells++; a.realized += tradePnl(t)?.pnl ?? 0; }
    }
    return m;
  }, [trades]);
  const sumRange = (from: string, to: string) => Object.entries(agg).filter(([d]) => d >= from && d <= to).reduce((n, [, a]) => n + a.realized, 0);

  /* 기간 계산 */
  const weekStart = useMemo(() => { const d = parse(sel); d.setDate(d.getDate() - d.getDay()); return iso(d); }, [sel]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const monthCells = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(y, m - 1, 1); const start = new Date(first); start.setDate(1 - first.getDay());
    const n = Math.ceil((first.getDay() + new Date(y, m, 0).getDate()) / 7) * 7;
    return Array.from({ length: n }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return { date: iso(d), inMonth: d.getMonth() === m - 1, day: d.getDate(), wd: d.getDay() }; });
  }, [month]);
  const monthOf = mode === "month" ? month : sel.slice(0, 7);
  const monthPnl = sumRange(`${monthOf}-01`, `${monthOf}-31`);
  const weekPnl = sumRange(weekDays[0], weekDays[6]);
  const dayPnl = agg[sel]?.realized ?? 0;

  const title = mode === "month" ? `${Number(monthOf.slice(0, 4))}년 ${Number(monthOf.slice(5))}월`
    : mode === "week" ? `${Number(weekDays[0].slice(5, 7))}월 ${Math.ceil(Number(weekDays[0].slice(8)) / 7)}주차`
    : `${Number(sel.slice(5, 7))}월 ${Number(sel.slice(8))}일 (${WD[parse(sel).getDay()]})`;
  const periodPnl = mode === "month" ? monthPnl : mode === "week" ? weekPnl : dayPnl;

  const move = (dir: -1 | 1) => {
    if (mode === "month") { const [y, m] = month.split("-").map(Number); const d = new Date(y, m - 1 + dir, 1); setMonth(iso(d).slice(0, 7)); }
    else if (mode === "week") setSel(addDays(sel, 7 * dir));
    else setSel(addDays(sel, dir));
  };
  const goToday = () => { setSel(today); setMonth(today.slice(0, 7)); };
  const pick = (d: string) => { setSel(d); if (mode === "month" && d.slice(0, 7) !== month) setMonth(d.slice(0, 7)); };

  /* 빠른 기록 */
  const openAdd = () => { setAdding(true); setSide("buy"); setTimeout(() => nameRef.current?.focus(), 0); };
  const save = (full: boolean) => {
    if (!name.trim()) return;
    if (full) { router.push(`/stock/new?date=${sel}&name=${encodeURIComponent(name.trim())}`); return; }
    const p = Number(price.replace(/\D/g, "")) || 0, q = Number(qty.replace(/\D/g, "")) || 0;
    const blank = { checklist: emptyChecklist(), maTrend: emptyMaTrend(), buyReasons: [], sellReasons: { intraday: "", volume: "", index: "" } };
    if (side === "buy") addTrade({ name: name.trim(), market: "KOSPI", buyDate: sel, buyPrice: p, qty: q, ...blank });
    else {
      const holding = trades.find((t) => t.name === name.trim() && !t.sellDate);
      if (holding) updateTrade(holding.id, { sellDate: sel, sellPrice: p || holding.buyPrice });
      else addTrade({ name: name.trim(), market: "KOSPI", buyDate: sel, sellDate: sel, buyPrice: p, sellPrice: p, qty: q, ...blank });
    }
    setName(""); setPrice(""); setQty(""); setAdding(false);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.nativeEvent.isComposing) return; if (e.key === "Enter") { e.preventDefault(); save(false); } if (e.key === "Escape") setAdding(false); };
  const holdingNames = Array.from(new Set(trades.filter((t) => !t.sellDate).map((t) => t.name)));

  /* 선택일 거래 */
  const dayItems = useMemo(() => {
    const items: { t: Trade; kind: "buy" | "sell" }[] = [];
    for (const t of trades) { if (t.buyDate === sel) items.push({ t, kind: "buy" }); if (t.sellDate === sel) items.push({ t, kind: "sell" }); }
    return items;
  }, [trades, sel]);

  const goalLeft = monthlyGoal - monthPnl;
  const PnL = ({ v, className }: { v: number; className?: string }) => <span className={cn("num font-bold", v > 0 ? "text-up" : v < 0 ? "text-down" : "text-ink-3", className)}>{v === 0 ? "0원" : fmtManwon(v)}</span>;

  return (
    <div className="space-y-3">
      {/* 월 목표 배너 */}
      <button type="button" onClick={() => { const v = window.prompt("이번 달 실현손익 목표 (원)", String(monthlyGoal)); if (v !== null && Number(v.replace(/\D/g, ""))) setMonthlyGoal(Number(v.replace(/\D/g, ""))); }} className="w-full flex items-center gap-2 rounded-xl bg-paper shadow-soft px-4 py-2.5 text-[13px] text-left">
        <LineIcon name="star" className="h-4 w-4 text-red shrink-0" />
        {goalLeft > 0 ? <span>{Number(monthOf.slice(5))}월 목표 달성까지 <PnL v={goalLeft} className="text-red" /> 남았어요!</span> : <span>{Number(monthOf.slice(5))}월 목표 <span className="num font-bold">{fmtManwon(monthlyGoal, false)}</span> 달성! <span className="text-success font-bold">🎉</span></span>}
        <span className="ml-auto text-[11px] text-ink-3">목표 수정</span>
      </button>

      <div className="bg-paper rounded-xl shadow-card overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="display text-[18px] num">{title}</p>
            <PnL v={periodPnl} className="text-[13px]" />
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => move(-1)} className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-inset hover:bg-hairline" aria-label="이전"><LineIcon name="chevronLeft" className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(1)} className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-inset hover:bg-hairline" aria-label="다음"><LineIcon name="chevronRight" className="h-4 w-4" /></button>
            <button type="button" onClick={goToday} className="h-8 px-3 rounded-full bg-inset hover:bg-hairline text-[12px] font-semibold">오늘</button>
          </div>
        </div>

        {/* 월 그리드 */}
        {mode === "month" && (
          <div className="px-2 pb-2">
            <div className="grid grid-cols-7">{WD.map((d, i) => <div key={d} className={cn("label text-center py-1.5", i === 0 ? "text-red" : i === 6 ? "text-info" : "text-ink-3")}>{d}</div>)}</div>
            <div className="grid grid-cols-7">
              {monthCells.map((c) => {
                const a = agg[c.date]; const v = a?.realized ?? 0; const hasSell = (a?.sells ?? 0) > 0;
                const tone = !hasSell ? "" : v > 0 ? "bg-red-100 text-red" : v < 0 ? "bg-sky-soft text-info" : "bg-inset";
                return (
                  <button key={c.date} type="button" onClick={() => pick(c.date)} className={cn("flex flex-col items-center py-1.5 rounded-md transition-colors hover:bg-canvas", !c.inMonth && "opacity-30", sel === c.date && "bg-canvas")} aria-label={c.date}>
                    <span className={cn("num text-[13px] font-semibold h-8 w-8 inline-flex items-center justify-center rounded-full relative", tone, c.date === today && "ring-2 ring-red", sel === c.date && c.date !== today && "ring-2 ring-ink")}>
                      {c.day}
                      {a && !hasSell && a.buys > 0 && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-red" />}
                    </span>
                    <span className={cn("num text-[9px] leading-tight mt-0.5 h-3", v > 0 ? "text-red" : v < 0 ? "text-info" : "text-transparent")}>{hasSell ? fmtManwon(v).replace("원", "") : "·"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 주 스트립 */}
        {mode === "week" && (
          <div className="grid grid-cols-7 gap-1.5 px-3 pb-3">
            {weekDays.map((d) => {
              const a = agg[d]; const v = a?.realized ?? 0; const active = d === sel; const wd = parse(d).getDay();
              return (
                <button key={d} type="button" onClick={() => setSel(d)} className={cn("rounded-xl py-2.5 flex flex-col items-center gap-0.5 transition-colors", active ? "bg-stage text-paper shadow-card" : "bg-inset hover:bg-hairline/70")} aria-label={d}>
                  <span className={cn("text-[10px] font-semibold", active ? "text-paper/60" : wd === 0 ? "text-red" : wd === 6 ? "text-info" : "text-ink-3")}>{WD[wd]}</span>
                  <span className={cn("num text-[16px] font-bold", d === today && !active && "text-red")}>{Number(d.slice(8))}</span>
                  <span className="h-1.5 flex gap-0.5">{a?.sells ? <span className={cn("h-1.5 w-1.5 rounded-full", v >= 0 ? (active ? "bg-red-400" : "bg-red") : (active ? "bg-sky" : "bg-info"))} /> : a?.buys ? <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-paper/50" : "bg-ink-3")} /> : null}</span>
                  <span className={cn("num text-[9px] leading-none", a?.sells ? (v >= 0 ? (active ? "text-red-400" : "text-red") : (active ? "text-sky" : "text-info")) : "text-transparent")}>{a?.sells ? fmtManwon(v).replace("원", "") : "·"}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 일 — 날짜 이동은 헤더 ‹ ›, 여기서는 요약 스트립 */}
        {mode === "day" && (
          <div className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline">
            {[["실현 손익", dayPnl, true], ["매도", agg[sel]?.sells ?? 0, false], ["매수", agg[sel]?.buys ?? 0, false]].map(([k, v, money]) => (
              <div key={k as string} className="px-4 py-2.5 text-center"><p className="label text-ink-3">{k as string}</p>{money ? <PnL v={v as number} className="text-[15px]" /> : <p className="num text-[15px] font-bold">{v as number}건</p>}</div>
            ))}
          </div>
        )}
      </div>

      {/* 선택일 거래 */}
      <div className="bg-paper rounded-xl shadow-soft">
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
          <p className="text-[15px] font-bold">{Number(sel.slice(5, 7))}월 {Number(sel.slice(8))}일 거래 <span className="num text-[12px] text-ink-3 font-medium ml-1">{dayItems.length}건</span></p>
          <div className="flex items-center gap-3"><PnL v={dayPnl} className="text-[14px]" /><Button size="sm" variant="ink" onClick={openAdd}><LineIcon name="plus" className="h-4 w-4" />기록</Button></div>
        </div>
        {adding && (
          <div className="px-3 py-3 border-b border-hairline bg-red-100/60 animate-fade-up">
            <p className="label text-red mb-2"><span className="num">{sel.replace(/-/g, ".")}</span> 빠른 기록 — Enter 저장 · Esc 취소</p>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex rounded-md overflow-hidden bg-inset">{(["buy", "sell"] as const).map((s) => <button key={s} type="button" onClick={() => setSide(s)} className={cn("text-[12px] font-semibold px-3 h-9", side === s ? (s === "buy" ? "bg-red text-paper" : "bg-info text-paper") : "text-ink-2")}>{s === "buy" ? "매수" : "매도"}</button>)}</div>
              <input ref={nameRef} list="holding-names" value={name} onChange={(e) => setName(e.target.value)} placeholder="종목명" className="field h-9 !py-1 w-[130px]" onKeyDown={onKey} />
              {side === "sell" && <datalist id="holding-names">{holdingNames.map((n) => <option key={n} value={n} />)}</datalist>}
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="단가" inputMode="numeric" className="field num h-9 !py-1 w-[100px]" onKeyDown={onKey} />
              {side === "buy" && <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="수량" inputMode="numeric" className="field num h-9 !py-1 w-[76px]" onKeyDown={onKey} />}
              <Button size="sm" type="button" onClick={() => save(false)}>저장</Button>
              {side === "buy" && <Button size="sm" type="button" variant="secondary" onClick={() => save(true)}>체크리스트로</Button>}
              <button type="button" onClick={() => setAdding(false)} className="h-9 w-9 inline-flex items-center justify-center" aria-label="닫기"><LineIcon name="close" className="h-4 w-4" /></button>
            </div>
          </div>
        )}
        {dayItems.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-ink-3">이날 기록이 없어요. <button type="button" onClick={openAdd} className="text-red font-semibold">기록 추가</button></p>
        ) : (
          <ul className="divide-y divide-hairline">
            {dayItems.map(({ t, kind }, i) => {
              const r = tradePnl(t);
              return (
                <li key={t.id + i}>
                  <Link href={`/stock/${t.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-canvas">
                    <span className={cn("h-10 w-10 rounded-xl inline-flex items-center justify-center text-[11px] font-bold shrink-0", kind === "buy" ? "bg-red-100 text-red" : r && r.pnl < 0 ? "bg-sky-soft text-info" : "bg-red-100 text-red")}>{t.market === "ETF" ? "ETF" : t.market === "US" ? "US" : "KR"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-ink-3">{t.market === "US" ? "해외주식" : t.market === "ETF" ? "ETF" : "국내주식"} · {kind === "buy" ? "매수" : "매도"}</p>
                      <p className="text-[15px] font-bold truncate">{t.name}</p>
                      <p className="num text-[11px] text-ink-3">{kind === "buy" ? `${fmtNum(t.buyPrice)}원 × ${t.qty}` : `${fmtNum(t.buyPrice)} → ${fmtNum(t.sellPrice ?? 0)} × ${t.qty}`}{t.memo ? ` · ${t.memo}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {kind === "sell" && r ? <><PnL v={r.pnl} className="text-[15px]" /><p className={cn("num text-[11px] font-semibold", r.pnl >= 0 ? "text-red" : "text-info")}>{r.pct >= 0 ? "+" : ""}{r.pct.toFixed(1)}%</p></> : <Badge tone={t.sellDate ? "mute" : "sage"}>{t.sellDate ? "청산됨" : "보유중"}</Badge>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
