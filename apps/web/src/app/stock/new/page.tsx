"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/feature/page-header";
import { RoleGate } from "@/components/feature/role-gate";
import { TradeForm, toDraft } from "@/components/stock/trade-form";

function NewTrade() {
  const sp = useSearchParams();
  const router = useRouter();
  const addTrade = useStore((s) => s.addTrade);
  return (
    <div className="px-4 md:px-5">
      <nav className="label text-ink-3 pt-6"><Link href="/stock" className="hover:text-red">매매일지</Link> / 새 기록</nav>
      {/* 체크리스트 영역을 다시 켜면(trade-form.tsx SHOW_TECH_CHECK) 제목 "트레이딩 매매 체크리스트", 설명 "체크리스트는 매수 전에…"로 되돌릴 것 */}
      <PageHeader eyebrow="원칙 점검 일지" title="매매일지 쓰기" description="종목명·매수일만 있어도 저장돼요. 목표가·손절선은 매수 전에, 매도 이유는 청산 후에 채워도 됩니다. 작성 시 100P." className="py-4 md:py-6" />
      <TradeForm initial={toDraft(undefined, { date: sp.get("date") ?? undefined, name: sp.get("name") ?? undefined })} onSubmit={(d) => { const id = addTrade(d); router.push(`/stock/${id}`); }} onCancel={() => router.back()} />
    </div>
  );
}
export default function NewTradePage() {
  return <RoleGate allow={["member", "admin"]}><Suspense><NewTrade /></Suspense></RoleGate>;
}
