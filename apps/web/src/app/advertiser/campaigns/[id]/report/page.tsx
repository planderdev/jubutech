"use client";
import Link from "next/link";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { campaignReport } from "@jubutech/shared";
import { useRules, useStore } from "@/lib/store";
import { RoleGate } from "@/components/feature/role-gate";
import { Button } from "@/components/ui/button";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-hairline p-4">
      <p className="label text-ink-3">{label}</p>
      <p className="num text-[24px] font-extrabold mt-1">{value}</p>
      {sub && <p className="text-[11px] text-ink-3 mt-0.5">{sub}</p>}
    </div>
  );
}

/**
 * 광고주 결과 리포트 (기획안 3-2) — 캠페인이 끝나면 한 장으로. 인쇄 버튼으로 PDF 저장, 링크 복사로 전달.
 * 추천 구매 수는 2-1 이 붙기 전까지 "연결 전". 링크는 로그인한 광고주·운영자만 열 수 있다(공개 공유 링크는 Supabase 연결 뒤).
 */
function Report() {
  const { id } = useParams<{ id: string }>();
  const rules = useRules();
  const c = useStore((s) => s.campaigns.find((x) => x.id === id));
  const applications = useStore((s) => s.applications);
  const users = useStore((s) => s.users);
  const trustEvents = useStore((s) => s.trustEvents);
  const [copied, setCopied] = useState(false);
  if (!c) notFound();
  const r = campaignReport({ campaignId: c.id, applications, users, trustEvents, rules });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch {
      prompt("링크를 복사해 주세요", location.href);
    }
  };
  return (
    <div className="px-4 md:px-5 max-w-3xl">
      <nav className="label text-ink-3 pt-6 print:hidden"><Link href={`/advertiser/campaigns/${c.id}`} className="hover:text-red">캠페인 관리</Link> / 결과 리포트</nav>
      <div className="flex flex-wrap items-end justify-between gap-3 pt-4 pb-5">
        <div>
          <p className="text-[12px] font-bold text-red">{c.brand}</p>
          <h1 className="display text-[24px]">{c.title}</h1>
          <p className="mt-1 text-[13px] text-ink-2">모집 {c.recruitStart.replace(/-/g, ".")} ~ {c.recruitEnd.replace(/-/g, ".")} · 미션 마감 {c.missionEnd.replace(/-/g, ".")}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="secondary" onClick={copy}>{copied ? "복사했어요" : "링크 복사"}</Button>
          <Button onClick={() => window.print()}>인쇄·PDF</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="응모" value={`${r.applied}명`} sub={`모집 ${c.recruitCount}명`} />
        <Stat label="선정" value={`${r.selected}명`} />
        <Stat label="후기 제출률" value={r.submitRate !== null ? `${r.submitRate}%` : "—"} sub={`제출 ${r.submitted}건 · 완료 ${r.completed}건`} />
        <Stat label={`참여자 평균 ${rules.trust.name}`} value={r.averageTemperature !== null ? `${r.averageTemperature}°` : "—"} sub={`시작 ${rules.trust.baseTemperature}°`} />
        <Stat label="조회" value={c.views.toLocaleString()} />
        <Stat label="추천 링크 구매" value={r.referralPurchases ?? "연결 전"} sub="추천 링크 기능이 붙으면 집계" />
      </div>
      <section className="mt-6">
        <p className="label text-ink-3 mb-2">후기 링크 {r.links.length}건</p>
        {r.links.length === 0 ? <p className="rounded-xl border border-hairline p-4 text-[13px] text-ink-2">아직 제출된 후기 링크가 없어요.</p> : (
          <ul className="rounded-xl border border-hairline divide-y divide-hairline">
            {r.links.map((l) => <li key={l.url} className="px-4 py-3 text-[13px] flex justify-between gap-3"><span className="font-semibold shrink-0">{l.nickname}</span><a href={l.url} target="_blank" rel="noreferrer" className="text-red underline break-all text-right">{l.url}</a></li>)}
          </ul>
        )}
      </section>
      <p className="mt-6 text-[11px] text-ink-3">주부테크 체험단 결과 리포트 · 데모 데이터 기준 · 만든 날 {new Date().toLocaleDateString("ko-KR")}</p>
    </div>
  );
}

export default function ReportPage() {
  return <RoleGate allow={["advertiser", "admin"]}><Report /></RoleGate>;
}
