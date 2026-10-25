"use client";
import { Fab } from "@/components/layout/fab";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { BOARDS } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { Chip, ChipRow } from "@/components/ui/chip";
import { PostItem } from "@/components/feature/post-item";
import { Button } from "@/components/ui/button";
import { LineIcon } from "@/components/ui/line-icon";
import { EmptyState } from "@/components/ui/empty";
import { Avatar } from "@/components/feature/avatar";

function CommunityList() {
  const sp = useSearchParams();
  const [board, setBoard] = useState(sp.get("board") ?? "all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const q = (sp.get("q") ?? "").trim();
  const posts = useStore((s) => s.posts);
  const users = useStore((s) => s.users);
  const list = useMemo(() => {
    let l = (board === "all" ? posts : posts.filter((p) => p.board === board)).filter((p) => p.status !== "hidden");
    if (q) l = l.filter((p) => (p.title + p.body + p.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
    if (sort === "popular") l = [...l].sort((a, b) => b.likes.length * 2 + b.commentCount - (a.likes.length * 2 + a.commentCount));
    return l;
  }, [posts, board, q, sort]);
  const b = BOARDS.find((x) => x.key === board);
  const top = [...users].filter((u) => u.role === "member").sort((a, b) => b.points - a.points).slice(0, 5);

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Community" title={b ? b.label : "커뮤니티"} description={b ? b.desc : "수익 인증부터 지원금 제보, 매매 복기까지. 비슷한 상황의 사람들과 경험을 나눠요."} action={<Link href={`/community/write${board !== "all" ? `?board=${board}` : ""}`} className="hidden"><Button>글쓰기</Button></Link>} />
      <ChipRow>
        <Chip active={board === "all"} onClick={() => setBoard("all")}>전체</Chip>
        {BOARDS.map((x) => <Chip key={x.key} active={board === x.key} onClick={() => setBoard(x.key)}>{x.label}</Chip>)}
      </ChipRow>
      <div className="mt-6 grid gap-8">
        <div className="">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <p className="num text-[12px] text-ink-3">{q && <>&ldquo;{q}&rdquo; 검색 · </>}{list.length}건</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setSort("latest")} className={`label ${sort === "latest" ? "text-red" : "text-ink-3"}`}>최신순</button>
              <button type="button" onClick={() => setSort("popular")} className={`label ${sort === "popular" ? "text-red" : "text-ink-3"}`}>인기순</button>
            </div>
          </div>
          {list.map((p) => <PostItem key={p.id} post={p} showBoard={board === "all"} />)}
          {list.length === 0 && <div className="mt-6"><EmptyState icon="community" title="아직 글이 없어요" description="첫 글을 남겨보세요. 게시글 작성 시 50P가 적립돼요." action={<Link href="/community/write"><Button>글쓰기</Button></Link>} /></div>}
        </div>
        <aside className=" space-y-5">
          <div className="bg-paper rounded-xl shadow-card p-5">
            <p className="label text-red mb-3">이달의 활동 랭킹</p>
            <ol className="space-y-2.5">
              {top.map((u, i) => (
                <li key={u.id} className="flex items-center gap-3"><span className="num text-[12px] text-ink-3 w-3">{i + 1}</span><Avatar name={u.nickname} size="sm" /><span className="text-[14px] font-medium flex-1 truncate">{u.nickname}</span><span className="num text-[12px] text-red">{u.points.toLocaleString()}P</span></li>
              ))}
            </ol>
          </div>
          <div className="bg-inset rounded-xl p-5 text-[13px] text-ink-2 leading-relaxed">
            <p className="label text-ink mb-2">커뮤니티 약속</p>
            선입금 요구·다단계·종목 리딩 홍보는 즉시 삭제됩니다. 광고·협찬은 [광고] 표시를 붙여주세요. 자녀 사진·개인정보는 최소로만 공유해요.
          </div>
        </aside>
      </div>
      <Fab href="/community/write" label="글쓰기" />
    </div>
  );
}
export default function CommunityPage() {
  return <Suspense><CommunityList /></Suspense>;
}
