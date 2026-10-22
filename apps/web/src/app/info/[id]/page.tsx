"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { INFO } from "@/lib/mock";
import { INFO_CATEGORIES } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineIcon } from "@/components/ui/line-icon";
import { InfoCard } from "@/components/feature/info-card";
import { dday, cn } from "@/lib/utils";

export default function InfoDetail() {
  const { id } = useParams<{ id: string }>();
  const a = INFO.find((x) => x.id === id);
  const saved = useStore((s) => s.savedInfo.includes(id));
  const toggle = useStore((s) => s.toggleSaveInfo);
  const me = useStore((s) => s.userId);
  if (!a) notFound();
  const cat = INFO_CATEGORIES.find((c) => c.key === a.category);
  const related = INFO.filter((x) => x.category === a.category && x.id !== a.id).slice(0, 3);

  return (
    <div className="px-4 md:px-5">
      <nav className="label text-ink-3 pt-6"><Link href="/info" className="hover:text-red">돈되는정보</Link> / {cat?.label}</nav>
      <article className="mt-4 bg-paper rounded-xl shadow-card">
        <header className="p-6 md:p-8 border-b border-dashed border-hairline">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="outline">{cat?.label}</Badge>
            {a.deadline && <Badge tone="red">{dday(a.deadline)} · {a.deadline.replace(/-/g, ".")} 마감</Badge>}
            {a.tags.map((t) => <span key={t} className="text-[11px] text-ink-3">#{t}</span>)}
          </div>
          <h1 className="display text-[26px] md:text-[32px] mt-3">{a.title}</h1>
          <p className="mt-3 text-[15px] text-ink-2">{a.summary}</p>
          <p className="mt-4 text-[11px] text-ink-3">출처 {a.source} · 기준일 {a.sourceDate.replace(/-/g, ".")}</p>
        </header>
        {(a.amount || a.target) && (
          <div className="grid grid-cols-2 border-b border-dashed border-hairline">
            {a.amount && <div className="p-5 border-r border-dashed border-hairline"><p className="label text-ink-3">지원 금액</p><p className="num text-[20px] font-semibold text-red mt-1">{a.amount}</p></div>}
            {a.target && <div className="p-5"><p className="label text-ink-3">대상</p><p className="text-[16px] font-semibold mt-1">{a.target}</p></div>}
          </div>
        )}
        <div className="p-6 md:p-8 space-y-4 text-[15px] leading-relaxed">
          {a.body.map((b, i) => <p key={i} className="flex gap-3"><span className="num text-red shrink-0">{String(i + 1).padStart(2, "0")}</span>{b}</p>)}
          {a.howTo && (
            <div className="mt-6 border border-red rounded-md p-5 bg-red-100">
              <p className="label text-red mb-3">신청 방법</p>
              <ol className="space-y-2">{a.howTo.map((h, i) => <li key={i} className="flex gap-3 text-[14px]"><span className="h-6 w-6 rounded-full bg-red text-paper num text-[12px] inline-flex items-center justify-center shrink-0">{i + 1}</span>{h}</li>)}</ol>
            </div>
          )}
        </div>
        <footer className="p-6 md:p-8 border-t border-hairline flex flex-wrap gap-3 items-center">
          <Button variant={saved ? "ink" : "primary"} onClick={() => (me ? toggle(a.id) : location.assign("/login"))} className={cn(saved && "pointer-events-none")}>
            <LineIcon name={saved ? "check" : "heart"} className="h-4 w-4" />{saved ? "저장됨 · 포인트 적립 완료" : `저장하고 +${a.rewardPoints}P 받기`}
          </Button>
          <Button variant="secondary"><LineIcon name="share" className="h-4 w-4" />공유</Button>
          <Link href="/community/write?board=subsidy" className="ml-auto label text-ink-3 hover:text-red">이 정보에 제보 덧붙이기 →</Link>
        </footer>
      </article>
      {related.length > 0 && (
        <section className="mt-10">
          <p className="label text-ink-3 mb-3">같은 카테고리</p>
          <div className="grid grid-cols-2 gap-3">{related.map((r) => <InfoCard key={r.id} a={r} />)}</div>
        </section>
      )}
    </div>
  );
}
