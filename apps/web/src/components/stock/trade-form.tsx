"use client";
import { useState } from "react";
import { CHECKLIST_ITEMS, MA_KEYS, emptyChecklist, emptyMaTrend, type MaKey, type Market, type Trade, type Trend } from "@/lib/types";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { cn, todayStr } from "@/lib/utils";

export type TradeDraft = Omit<Trade, "id" | "createdAt" | "userId">;

const EMOTIONS: { k: NonNullable<Trade["emotion"]>; label: string }[] = [
  { k: "calm", label: "😌 차분" },
  { k: "fomo", label: "😰 조급(FOMO)" },
  { k: "fear", label: "😨 공포" },
  { k: "greedy", label: "🤑 욕심" },
];

export function toDraft(t?: Partial<Trade>, prefill?: { date?: string; name?: string }): TradeDraft {
  return {
    name: t?.name ?? prefill?.name ?? "",
    market: t?.market ?? "KOSPI",
    buyDate: t?.buyDate ?? prefill?.date ?? todayStr(),
    sellDate: t?.sellDate,
    buyPrice: t?.buyPrice ?? 0,
    sellPrice: t?.sellPrice,
    qty: t?.qty ?? 0,
    targetPrice: t?.targetPrice,
    stopPrice: t?.stopPrice,
    support: t?.support ?? "",
    resistance: t?.resistance ?? "",
    checklist: t?.checklist ?? emptyChecklist(),
    ichimokuPos: t?.ichimokuPos,
    bollingerPos: t?.bollingerPos,
    maTrend: t?.maTrend ?? emptyMaTrend(),
    buyReasons: t?.buyReasons?.length ? t.buyReasons : [""],
    sellReasons: t?.sellReasons ?? { intraday: "", volume: "", index: "" },
    memo: t?.memo ?? "",
    emotion: t?.emotion,
  };
}

/** 2026-10-01 사용자 요청으로 숨김(나중에 다시 켤 예정): "기술적 분석 & 진입 전 필수 체크리스트" + "이평선별 추세 세부 체크". true 로 바꾸면 복구된다. 데이터 모델(checklist·maTrend)은 그대로 유지. */
const SHOW_TECH_CHECK = false;

function Sec({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="bg-paper rounded-xl shadow-card overflow-hidden">
      <header className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-hairline bg-inset/60">
        <span className="h-7 w-7 bg-ink text-paper num text-[13px] font-semibold inline-flex items-center justify-center rounded-xs">{n}</span>
        <h2 className="display text-[16px] md:text-[17px]">{title}</h2>
        {sub && <span className="hidden md:inline text-[12px] text-ink-3">{sub}</span>}
      </header>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

const NumInput = (p: React.ComponentProps<typeof Input>) => <Input inputMode="numeric" className="num" {...p} />;
const num = (v: string) => (v === "" ? undefined : Number(v.replace(/[^\d.]/g, "")));

export function TradeForm({ initial, onSubmit, onCancel, submitLabel = "저장하기" }: { initial: TradeDraft; onSubmit: (d: TradeDraft) => void; onCancel?: () => void; submitLabel?: string }) {
  const [d, setD] = useState<TradeDraft>(initial);
  const [notice, setNotice] = useState<NoticeState>(null);
  const up = <K extends keyof TradeDraft>(k: K, v: TradeDraft[K]) => setD((s) => ({ ...s, [k]: v }));
  const score = Object.values(d.checklist).filter(Boolean).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d.name.trim()) return setNotice({ ok: false, text: "종목명을 입력해 주세요." });
    if (!d.buyPrice || !d.qty) return setNotice({ ok: false, text: "매수 단가와 수량을 입력해 주세요." });
    if (d.sellDate && !d.sellPrice) return setNotice({ ok: false, text: "매도일이 있으면 매도 단가도 입력해 주세요." });
    onSubmit({ ...d, name: d.name.trim(), buyReasons: d.buyReasons.filter((r) => r.trim()) });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* 헤더: 종목명 / 매수일자 / 매도일자 (인쇄 양식 상단) */}
      <div className="bg-paper rounded-xl shadow-card p-4 md:p-5 grid grid-cols-2 gap-4 items-end">
        <Field label="종목명" required><Input autoFocus value={d.name} onChange={(e) => up("name", e.target.value)} placeholder="삼성전자" /></Field>
        <Field label="시장"><Select value={d.market} onChange={(e) => up("market", e.target.value as Market)}>{["KOSPI", "KOSDAQ", "ETF", "US"].map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="매수일자" required><Input type="date" className="num" value={d.buyDate} onChange={(e) => up("buyDate", e.target.value)} /></Field>
        <Field label="매도일자" hint="보유중이면 비움"><Input type="date" className="num" value={d.sellDate ?? ""} onChange={(e) => up("sellDate", e.target.value || undefined)} /></Field>
        <Field label="매수 단가 (원)" required><NumInput value={d.buyPrice || ""} onChange={(e) => up("buyPrice", num(e.target.value) ?? 0)} placeholder="71,200" /></Field>
        <Field label="수량" required><NumInput value={d.qty || ""} onChange={(e) => up("qty", num(e.target.value) ?? 0)} placeholder="20" /></Field>
        <Field label="매도 단가 (원)"><NumInput value={d.sellPrice ?? ""} onChange={(e) => up("sellPrice", num(e.target.value))} placeholder="청산 시" /></Field>
        <div className="text-[12px] text-ink-3 md:pb-3">
          투자금 <span className="num text-ink font-semibold">{(d.buyPrice * d.qty).toLocaleString()}원</span>
        </div>
      </div>

      {SHOW_TECH_CHECK && (<>
      <Sec n="1" title="기술적 분석 & 진입 전 필수 체크리스트" sub={`${score}/6 확인`}>
        <ul className="divide-y divide-hairline border border-hairline rounded-sm">
          {CHECKLIST_ITEMS.map((it) => {
            const on = d.checklist[it.key];
            return (
              <li key={it.key} className={cn("grid grid-cols-[110px_1fr_auto] md:grid-cols-[150px_1fr_auto] items-center gap-3 px-3 py-3", on && "bg-red-100/50")}>
                <span className="text-[13px] md:text-[14px] font-semibold">{it.label}</span>
                <div className="text-[13px] text-ink-2">
                  {it.point}
                  {it.key === "ichimoku" && (
                    <span className="ml-2 inline-flex gap-1">{(["above", "below"] as const).map((p) => <button key={p} type="button" onClick={() => up("ichimokuPos", d.ichimokuPos === p ? undefined : p)} className={cn("label px-1.5 py-1 rounded-xs border", d.ichimokuPos === p ? "bg-ink text-paper border-ink" : "border-hairline")}>{p === "above" ? "위" : "아래"}</button>)}</span>
                  )}
                  {it.key === "bollinger" && (
                    <span className="ml-2 inline-flex gap-1">{(["upper", "lower"] as const).map((p) => <button key={p} type="button" onClick={() => up("bollingerPos", d.bollingerPos === p ? undefined : p)} className={cn("label px-1.5 py-1 rounded-xs border", d.bollingerPos === p ? "bg-ink text-paper border-ink" : "border-hairline")}>{p === "upper" ? "상단" : "하단"}</button>)}</span>
                  )}
                </div>
                <button type="button" role="checkbox" aria-checked={on} aria-label={`${it.label} 확인`} onClick={() => up("checklist", { ...d.checklist, [it.key]: !on })} className={cn("h-7 w-7 border rounded-xs inline-flex items-center justify-center transition-colors", on ? "bg-red border-red text-paper" : "border-ink bg-paper")}>
                  {on && <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7" /></svg>}
                </button>
              </li>
            );
          })}
        </ul>
      </Sec>

      <Sec n="2" title="이평선별 추세 세부 체크" sub="일봉/분봉 기준 방향 표시">
        <div className="grid grid-cols-4 sm:grid-cols-7 border border-hairline rounded-sm overflow-hidden">
          {MA_KEYS.map((k: MaKey) => {
            const v: Trend = d.maTrend[k];
            return (
              <div key={k} className="border-r border-b sm:border-b-0 border-hairline last:border-r-0 text-center">
                <p className="label py-2 bg-inset/60 border-b border-hairline">{k}일선</p>
                <div className="flex">
                  {(["up", "down"] as const).map((t) => (
                    <button key={t} type="button" aria-pressed={v === t} onClick={() => up("maTrend", { ...d.maTrend, [k]: v === t ? null : t })} className={cn("flex-1 py-2.5 text-[15px] transition-colors", v === t ? (t === "up" ? "bg-red text-paper" : "bg-info text-paper") : "text-ink-3 hover:bg-inset")}>{t === "up" ? "▲" : "▼"}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Sec>
      </>)}

      <Sec n={SHOW_TECH_CHECK ? "3" : "1"} title="리스크 관리 기준 설정" sub="진입 즉시 기계적 대응용">
        <div className="grid grid-cols-2 gap-4">
          <Field label="목표가 (익절선)"><NumInput value={d.targetPrice ?? ""} onChange={(e) => up("targetPrice", num(e.target.value))} placeholder="원" /></Field>
          <Field label="손절 기준선"><NumInput value={d.stopPrice ?? ""} onChange={(e) => up("stopPrice", num(e.target.value))} placeholder="원" /></Field>
          <Field label="지지선 분석"><Input value={d.support ?? ""} onChange={(e) => up("support", e.target.value)} placeholder="68,000 부근 (20일선)" /></Field>
          <Field label="저항선 분석"><Input value={d.resistance ?? ""} onChange={(e) => up("resistance", e.target.value)} placeholder="75,000 부근 (전고점)" /></Field>
        </div>
        {d.buyPrice > 0 && (d.targetPrice || d.stopPrice) && (
          <p className="mt-3 num text-[12px] text-ink-2">
            {d.targetPrice ? <>익절 <span className="text-up font-semibold">{(((d.targetPrice - d.buyPrice) / d.buyPrice) * 100).toFixed(1)}%</span></> : null}
            {d.targetPrice && d.stopPrice ? " · " : ""}
            {d.stopPrice ? <>손절 <span className="text-down font-semibold">{(((d.stopPrice - d.buyPrice) / d.buyPrice) * 100).toFixed(1)}%</span></> : null}
            {d.targetPrice && d.stopPrice ? <> · 손익비 <span className="font-semibold text-ink">{((d.targetPrice - d.buyPrice) / Math.max(1, d.buyPrice - d.stopPrice)).toFixed(1)}</span></> : null}
          </p>
        )}
      </Sec>

      <Sec n={SHOW_TECH_CHECK ? "4" : "2"} title="매수·매도 근거 핵심 기록" sub="결과보다 기준을 복기">
        <div className="grid gap-5">
          <div>
            <p className="label text-ink-2 mb-2">− 매수 이유 (진입 근거)</p>
            <div className="space-y-2">
              {d.buyReasons.map((r, i) => (
                <div key={i} className="flex gap-2 items-center"><span className="text-red">•</span><Input value={r} onChange={(e) => up("buyReasons", d.buyReasons.map((x, j) => (j === i ? e.target.value : x)))} placeholder={i === 0 ? "5일선 골든크로스 + 거래량 동반" : ""} onKeyDown={(e) => { if (e.nativeEvent.isComposing) return; if (e.key === "Enter" && r.trim()) { e.preventDefault(); up("buyReasons", [...d.buyReasons, ""]); } }} /></div>
              ))}
            </div>
            <button type="button" onClick={() => up("buyReasons", [...d.buyReasons, ""])} className="label text-red mt-2">+ 이유 추가 (Enter)</button>
          </div>
          <div>
            <p className="label text-ink-2 mb-2">+ 매도 이유 (청산 근거)</p>
            <div className="space-y-3">
              <Field label="[장중 대응]"><Input value={d.sellReasons.intraday} onChange={(e) => up("sellReasons", { ...d.sellReasons, intraday: e.target.value })} placeholder="손절선 터치, 기계적 매도" /></Field>
              <Field label="[5분봉/거래량 흐름]"><Input value={d.sellReasons.volume} onChange={(e) => up("sellReasons", { ...d.sellReasons, volume: e.target.value })} placeholder="윗꼬리 + 거래량 피크" /></Field>
              <Field label="[지수 연동 여부]"><Input value={d.sellReasons.index} onChange={(e) => up("sellReasons", { ...d.sellReasons, index: e.target.value })} placeholder="코스피 -1.8% 동반" /></Field>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 items-start">
          <div>
            <p className="label text-ink-2 mb-2">매수 당시 감정</p>
            <div className="flex flex-wrap gap-1.5">{EMOTIONS.map((e) => <button key={e.k} type="button" onClick={() => up("emotion", d.emotion === e.k ? undefined : e.k)} className={cn("text-[13px] px-2.5 py-1.5 rounded-full border", d.emotion === e.k ? "bg-ink text-paper border-ink" : "border-hairline")}>{e.label}</button>)}</div>
          </div>
          <Field label="메모"><Textarea value={d.memo ?? ""} onChange={(e) => up("memo", e.target.value)} placeholder="다음에 같은 상황이면 어떻게 할지 한 줄" className="min-h-[64px]" /></Field>
        </div>
      </Sec>

      <Notice notice={notice} />
      <div className="flex gap-2 justify-end sticky bottom-[68px] bg-canvas/90 backdrop-blur py-3 -mx-4 px-4 md:mx-0 md:px-0 border-t border-hairline md:border-0">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>취소</Button>}
        <Button type="submit" size="lg">{submitLabel}</Button>
      </div>
    </form>
  );
}
