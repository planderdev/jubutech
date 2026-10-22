"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { INFO } from "@/lib/mock";
import { BOARDS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Chip, ChipRow } from "@/components/ui/chip";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { CampaignCard, IllustTile } from "@/components/feature/campaign-card";
import { InfoCard } from "@/components/feature/info-card";
import { PostItem } from "@/components/feature/post-item";
import { Fab } from "@/components/layout/fab";
import { fmtWon, todayStr } from "@/lib/utils";

const QUICK: { label: string; icon: LineIconName; href: string }[] = [
  { label: "지원금", icon: "gift", href: "/info?c=subsidy" },
  { label: "체험단", icon: "campaign", href: "/campaigns" },
  { label: "부업", icon: "hand", href: "/community?board=sidejob" },
  { label: "매매일지", icon: "stock", href: "/stock" },
  { label: "육아·교육", icon: "baby", href: "/info?c=parenting" },
  { label: "반려생활", icon: "paw", href: "/info?c=pet" },
];

/** 유니웨이 홈 구조: 검색 → 카테고리 칩 → 펄스 스트립 → 피드. 주부테크 히어로·미션·정보·캠페인을 컬럼 안에 쌓는다. */
export default function HomePage() {
  const router = useRouter();
  const campaigns = useStore((s) => s.campaigns.filter((c) => c.status === "open").slice(0, 6));
  const posts = useStore((s) => s.posts);
  const users = useStore((s) => s.users);
  const [board, setBoard] = useState("all");
  const [q, setQ] = useState("");
  const incomes = posts.filter((p) => p.income);
  const feed = useMemo(() => (board === "all" ? posts : posts.filter((p) => p.board === board)).filter((p) => p.status !== "hidden").slice(0, 8), [posts, board]);
  const earners = users.filter((u) => u.role === "member").length;

  return (
    <div className="px-4 md:px-5 pt-4">
      {/* 검색 */}
      <form role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/community?q=${encodeURIComponent(q)}`); }} className="flex items-center h-12 rounded-xl bg-inset px-4 gap-3 focus-within:ring-2 focus-within:ring-red/20">
        <LineIcon name="search" className="h-5 w-5 text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="지원금, 부업, 종목… 궁금한 걸 검색해 보세요" className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-3" aria-label="검색" />
        <button type="submit" className="text-ink-2" aria-label="검색 실행"><LineIcon name="arrowRight" className="h-5 w-5" /></button>
      </form>

      {/* 카테고리 칩 */}
      <ChipRow className="mt-3">
        <Chip active={board === "all"} onClick={() => setBoard("all")}>전체</Chip>
        {BOARDS.slice(0, 5).map((b) => <Chip key={b.key} active={board === b.key} onClick={() => setBoard(b.key)}>{b.label}</Chip>)}
      </ChipRow>

      {/* 펄스 스트립 */}
      <Link href="/community?board=income" className="mt-3 flex items-center justify-center gap-2 rounded-md bg-paper shadow-soft text-[13px] text-red px-3 py-2.5">
        <LineIcon name="coin" className="h-4 w-4" />이번 주 첫 수익을 만든 <b>{earners}명의 주부</b>
      </Link>

      {/* 퀵 메뉴 */}
      <ul className="mt-4 grid grid-cols-3 gap-1">
        {QUICK.map((qm) => (
          <li key={qm.label}>
            <Link href={qm.href} className="flex flex-col items-center gap-1.5 py-2.5 group">
              <span className="h-12 w-12 rounded-2xl bg-inset flex items-center justify-center text-red group-hover:bg-red group-hover:text-paper transition-colors"><LineIcon name={qm.icon} className="h-6 w-6" /></span>
              <span className="text-[11px] font-semibold">{qm.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* 오늘의 미션 */}
      <section className="mt-4 rounded-xl bg-paper shadow-soft p-4 flex items-center gap-4">
        <IllustTile icon="receipt" size="sm" className="w-[104px] shrink-0" />
        <div className="min-w-0">
          <p className="label text-ink-3">오늘의 미션</p>
          <p className="display text-[17px] mt-1">영수증 한 장으로 <span className="text-red">+500P</span></p>
          <p className="text-[12px] text-ink-2 mt-1">7일 연속이면 보너스까지.</p>
          <Link href="/campaigns" className="inline-block mt-2"><Button size="sm" variant="ink">인증하러 가기</Button></Link>
        </div>
      </section>

      {/* 수익 인증 마퀴 */}
      <div className="mt-4 rounded-full bg-inset overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee" aria-hidden>
          {[...incomes, ...incomes, ...incomes, ...incomes].map((p, i) => { const u = users.find((x) => x.id === p.authorId); return <span key={i} className="inline-flex items-center gap-2 px-5 py-2 text-[12px]"><span className="h-1.5 w-1.5 rounded-full bg-red" />{u?.nickname} 님 <span className="text-red font-bold">+{fmtWon(p.income ?? 0)}</span> 인증</span>; })}
        </div>
      </div>

      {/* 돈되는 정보 */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[17px] font-bold">오늘의 돈되는 정보</h2><Link href="/info" className="text-[12px] text-ink-3 hover:text-red">전체 보기 ›</Link></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{INFO.slice(0, 4).map((a) => <InfoCard key={a.id} a={a} />)}</div>
      </section>

      {/* 체험단 */}
      <section className="mt-7 -mx-4 md:-mx-5 px-4 md:px-5 py-6 bg-stage text-paper">
        <div className="flex items-end justify-between mb-4">
          <div><p className="label text-red">미션</p><h2 className="display text-[22px] mt-1">참여하고 보상 받기</h2></div>
          <Link href="/campaigns" className="text-[12px] text-paper/70 hover:text-red">전체 캠페인 ›</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 md:-mx-5 px-4 md:px-5">{campaigns.map((c) => <CampaignCard key={c.id} c={c} compact />)}</div>
      </section>

      {/* 커뮤니티 피드 */}
      <section className="mt-6">
        <div className="flex items-center justify-between pb-2 border-b border-hairline"><h2 className="text-[17px] font-bold">커뮤니티 {board !== "all" && <span className="text-ink-3 font-medium text-[13px]">· {BOARDS.find((b) => b.key === board)?.label}</span>}</h2><Link href="/community" className="text-[12px] text-ink-3 hover:text-red">최신순 ›</Link></div>
        {feed.map((p) => <PostItem key={p.id} post={p} />)}
      </section>
      <Fab href="/community/write" label="글쓰기" />
    </div>
  );
}
