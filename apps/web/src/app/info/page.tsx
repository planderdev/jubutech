"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { INFO } from "@/lib/mock";
import { INFO_CATEGORIES } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { Chip, ChipRow } from "@/components/ui/chip";
import { InfoCard } from "@/components/feature/info-card";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/empty";

function InfoList() {
  const sp = useSearchParams();
  const [cat, setCat] = useState(sp.get("c") ?? "all");
  const [sort, setSort] = useState<"latest" | "deadline" | "saves">("latest");
  const saved = useStore((s) => s.savedInfo);
  const hidden = useStore((s) => s.hiddenInfo);
  const list = useMemo(() => {
    const visible = INFO.filter((a) => !hidden.includes(a.id));
    let l = cat === "all" ? visible : cat === "saved" ? visible.filter((a) => saved.includes(a.id)) : visible.filter((a) => a.category === cat);
    if (sort === "deadline") l = [...l].sort((a, b) => (a.deadline ?? "9").localeCompare(b.deadline ?? "9"));
    if (sort === "saves") l = [...l].sort((a, b) => b.saves - a.saves);
    if (sort === "latest") l = [...l].sort((a, b) => b.sourceDate.localeCompare(a.sourceDate));
    return l;
  }, [cat, sort, saved, hidden]);

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Daily Picks" title="돈되는 정보" description="정책·지원금·절약·카드 혜택. 저장만 해도 포인트가 쌓이고, 신청하면 진짜 돈이 됩니다. 모든 정보에 출처와 기준일을 표기해요." />
      <ChipRow>
        <Chip active={cat === "all"} onClick={() => setCat("all")}>전체</Chip>
        {INFO_CATEGORIES.map((c) => <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>{c.label}</Chip>)}
        <Chip active={cat === "saved"} onClick={() => setCat("saved")}>저장함 {saved.length}</Chip>
      </ChipRow>
      <div className="mt-5 flex items-center justify-between">
        <p className="num text-[12px] text-ink-3">{list.length}건</p>
        <div className="flex gap-3">
          {([["latest", "최신순"], ["deadline", "마감임박"], ["saves", "인기순"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setSort(k)} className={`label ${sort === k ? "text-red" : "text-ink-3"}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((a) => <InfoCard key={a.id} a={a} />)}
      </div>
      {list.length === 0 && <EmptyState icon="info" title="아직 저장한 정보가 없어요" description="하트를 누르면 저장되고 포인트가 적립돼요." />}
    </div>
  );
}

export default function InfoPage() {
  return <Suspense><InfoList /></Suspense>;
}
