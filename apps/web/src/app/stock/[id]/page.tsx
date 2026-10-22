"use client";
import Link from "next/link";
import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CHECKLIST_ITEMS, MA_KEYS, checklistScore, tradePnl } from "@/lib/types";
import { RoleGate } from "@/components/feature/role-gate";
import { TradeForm, toDraft } from "@/components/stock/trade-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineIcon } from "@/components/ui/line-icon";
import { PnlText } from "@/components/feature/trade-row";
import { fmtNum, cn } from "@/lib/utils";

const EMO: Record<string, string> = { calm: "😌 차분", fomo: "😰 조급(FOMO)", fear: "😨 공포", greedy: "🤑 욕심" };

function Detail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useStore((s) => s.trades.find((x) => x.id === id));
  const { updateTrade, deleteTrade, addPost } = useStore();
  const [edit, setEdit] = useState(false);
  if (!t) notFound();
  const r = tradePnl(t);
  const score = checklistScore(t.checklist);

  if (edit)
    return (
      <div className="px-4 md:px-5">
        <nav className="label text-ink-3 pt-6"><Link href="/stock" className="hover:text-red">매매일지</Link> / {t.name} / 수정</nav>
        <div className="py-4" />
        <TradeForm initial={toDraft(t)} submitLabel="수정 저장" onSubmit={(d) => { updateTrade(t.id, d); setEdit(false); }} onCancel={() => setEdit(false)} />
      </div>
    );

  const share = () => {
    const pid = addPost({ board: "stock", title: `${t.name} 매매 복기 — 체크리스트 ${score}/6${r ? `, ${r.pct >= 0 ? "+" : ""}${r.pct.toFixed(1)}%` : ""}`, body: `매수 ${t.buyDate} ${fmtNum(t.buyPrice)}원 × ${t.qty}${t.sellDate ? ` → 매도 ${t.sellDate} ${fmtNum(t.sellPrice ?? 0)}원` : " (보유중)"}\n\n체크리스트: ${CHECKLIST_ITEMS.map((c) => `${t.checklist[c.key] ? "☑" : "☐"} ${c.label}`).join(" · ")}\n\n매수 이유: ${t.buyReasons.join(" / ") || "-"}\n매도 이유: ${[t.sellReasons.intraday, t.sellReasons.volume, t.sellReasons.index].filter(Boolean).join(" / ") || "-"}\n\n${t.memo ?? ""}`, tags: ["매매일지", "복기"] });
    router.push(`/community/${pid}`);
  };

  return (
    <div className="px-4 md:px-5">
      <nav className="label text-ink-3 pt-6"><Link href="/stock" className="hover:text-red">매매일지</Link> / {t.name}</nav>
      <div className="mt-4 bg-paper rounded-xl shadow-card">
        {/* 인쇄 양식 헤더 */}
        <header className="p-5 md:p-7 border-b border-hairline">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="display text-[22px] md:text-[26px]">트레이딩 매매 체크리스트 <span className="text-ink-3 text-[15px] font-normal">(원칙 점검 일지)</span></p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[14px]">
                <span>종목명 : <strong className="text-[18px]">{t.name}</strong> <Badge tone="mute" className="ml-1">{t.market}</Badge></span>
                <span className="num">매수일자 : {t.buyDate.replace(/-/g, " . ")}</span>
                <span className="num">매도일자 : {t.sellDate ? t.sellDate.replace(/-/g, " . ") : "____ . __ . __"}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="label text-ink-3">손익</p>
              <PnlText t={t} className="text-[22px]" />
              <p className="num text-[12px] text-ink-3 mt-0.5">{fmtNum(t.buyPrice)} × {t.qty} = {fmtNum(t.buyPrice * t.qty)}원</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => setEdit(true)}><LineIcon name="edit" className="h-4 w-4" />수정</Button>
            {!t.sellDate && <Button size="sm" onClick={() => setEdit(true)}>매도 기록하기</Button>}
            <Button size="sm" variant="ghost" onClick={share}><LineIcon name="share" className="h-4 w-4" />커뮤니티에 복기 공유</Button>
            <Button size="sm" variant="ghost" className="ml-auto text-ink-3" onClick={() => { if (confirm("이 매매일지를 삭제할까요?")) { deleteTrade(t.id); router.push("/stock"); } }}><LineIcon name="trash" className="h-4 w-4" />삭제</Button>
          </div>
        </header>

        <div className="p-5 md:p-7 space-y-7">
          <section>
            <h2 className="flex items-center gap-2 mb-3"><span className="h-6 w-6 bg-ink text-paper num text-[12px] inline-flex items-center justify-center rounded-xs">1</span><span className="display text-[16px]">기술적 분석 & 진입 전 필수 체크리스트</span><span className={cn("num ml-auto text-[13px] font-semibold", score >= 4 ? "text-success" : "text-red")}>{score} / 6</span></h2>
            <table className="w-full text-[13px] md:text-[14px] border border-hairline">
              <thead><tr className="bg-inset/60 label text-ink-3"><th className="text-left px-3 py-2 font-medium">핵심 지표</th><th className="text-left px-3 py-2 font-medium">체크 포인트</th><th className="px-3 py-2 font-medium">확인</th></tr></thead>
              <tbody className="divide-y divide-hairline">
                {CHECKLIST_ITEMS.map((c) => (
                  <tr key={c.key}><td className="px-3 py-2.5 font-semibold whitespace-nowrap">{c.label}</td><td className="px-3 py-2.5 text-ink-2">{c.point}{c.key === "ichimoku" && t.ichimokuPos && <Badge tone="outline" className="ml-2">{t.ichimokuPos === "above" ? "위" : "아래"}</Badge>}{c.key === "bollinger" && t.bollingerPos && <Badge tone="outline" className="ml-2">{t.bollingerPos === "upper" ? "상단" : "하단"}</Badge>}</td><td className="px-3 py-2.5 text-center"><span className={cn("inline-flex h-5 w-5 border rounded-xs items-center justify-center", t.checklist[c.key] ? "bg-red border-red text-paper" : "border-ink")}>{t.checklist[c.key] && "✓"}</span></td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="flex items-center gap-2 mb-3"><span className="h-6 w-6 bg-ink text-paper num text-[12px] inline-flex items-center justify-center rounded-xs">2</span><span className="display text-[16px]">이평선별 추세 세부 체크</span></h2>
            <div className="grid grid-cols-7 border border-hairline text-center">
              {MA_KEYS.map((k) => <div key={k} className="border-r border-hairline last:border-r-0"><p className="label py-1.5 bg-inset/60 border-b border-hairline text-[9px] md:text-[11px]">{k}일선</p><p className={cn("py-2 text-[15px] font-semibold", t.maTrend[k] === "up" ? "text-up" : t.maTrend[k] === "down" ? "text-down" : "text-ink-3")}>{t.maTrend[k] === "up" ? "▲" : t.maTrend[k] === "down" ? "▼" : "–"}</p></div>)}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 mb-3"><span className="h-6 w-6 bg-ink text-paper num text-[12px] inline-flex items-center justify-center rounded-xs">3</span><span className="display text-[16px]">리스크 관리 기준 설정</span></h2>
            <div className="grid grid-cols-2 border border-hairline divide-x divide-hairline">
              {[["목표가 (익절선)", t.targetPrice ? `${fmtNum(t.targetPrice)} 원` : "—", t.targetPrice ? `+${(((t.targetPrice - t.buyPrice) / t.buyPrice) * 100).toFixed(1)}%` : ""], ["손절 기준선", t.stopPrice ? `${fmtNum(t.stopPrice)} 원` : "미설정", t.stopPrice ? `${(((t.stopPrice - t.buyPrice) / t.buyPrice) * 100).toFixed(1)}%` : ""], ["지지선 분석", t.support || "—", ""], ["저항선 분석", t.resistance || "—", ""]].map(([k, v, s]) => (
                <div key={k} className="p-3 border-b border-hairline [&:nth-last-child(-n+2)]:border-b-0"><p className="label text-ink-3">{k}</p><p className="num text-[15px] font-semibold mt-0.5">{v} {s && <span className="text-[12px] text-ink-3 font-normal">({s})</span>}</p></div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 mb-3"><span className="h-6 w-6 bg-ink text-paper num text-[12px] inline-flex items-center justify-center rounded-xs">4</span><span className="display text-[16px]">매수·매도 근거 핵심 기록</span><span className="text-[12px] text-ink-3">(결과보다 기준을 복기)</span></h2>
            <div className="grid md:grid-cols-2 border border-hairline divide-y md:divide-y-0 md:divide-x divide-hairline">
              <div className="p-4"><p className="label text-ink-3 mb-2 text-center">− 매수 이유 (진입 근거)</p><ul className="space-y-1.5 text-[14px]">{t.buyReasons.length ? t.buyReasons.map((b, i) => <li key={i} className="flex gap-2"><span className="text-red">•</span>{b}</li>) : <li className="text-ink-3">기록 없음</li>}</ul></div>
              <div className="p-4"><p className="label text-ink-3 mb-2 text-center">+ 매도 이유 (청산 근거)</p><ul className="space-y-1.5 text-[14px]">{[["장중 대응", t.sellReasons.intraday], ["5분봉/거래량 흐름", t.sellReasons.volume], ["지수 연동 여부", t.sellReasons.index]].map(([k, v]) => <li key={k} className="flex gap-2"><span className="text-red">•</span><span><span className="text-ink-3">[{k}]</span> {v || <span className="text-ink-3">—</span>}</span></li>)}</ul></div>
            </div>
            {(t.emotion || t.memo) && <div className="mt-3 flex flex-wrap gap-3 text-[13px]">{t.emotion && <Badge tone="butter">{EMO[t.emotion]}</Badge>}{t.memo && <p className="text-ink-2">{t.memo}</p>}</div>}
          </section>
        </div>
        <footer className="px-5 md:px-7 py-3 border-t border-hairline flex justify-between"><span className="label text-ink-3">@jubutech2026</span><span className="num text-[11px] text-ink-3">작성 {t.createdAt.slice(0, 10).replace(/-/g, ".")}</span></footer>
      </div>
    </div>
  );
}
export default function TradeDetailPage() {
  return <RoleGate allow={["member", "admin"]}><Detail /></RoleGate>;
}
