"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AdminHeader, AdminTable, askReason } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Chip, ChipRow } from "@/components/ui/chip";
import { BOARDS } from "@/lib/types";
import { relTime } from "@/lib/utils";

export default function AdminPosts() {
  const { posts, comments, users, adminSetPostStatus, adminDeletePost, adminDeleteComment } = useStore();
  const [tab, setTab] = useState<"posts" | "comments">("posts");
  const [board, setBoard] = useState("all");
  const nick = (id: string) => users.find((u) => u.id === id)?.nickname ?? id;
  const rows = posts.filter((p) => board === "all" || p.board === board).map((p) => ({ ...p, author: nick(p.authorId), boardLabel: BOARDS.find((b) => b.key === p.board)?.label ?? p.board }));
  const crow = comments.map((c) => ({ ...c, author: nick(c.authorId), postTitle: posts.find((p) => p.id === c.postId)?.title ?? "(삭제된 글)" }));

  return (
    <div>
      <AdminHeader title="게시글 · 댓글" count={tab === "posts" ? posts.length : comments.length} description="숨김은 목록에서만 제외되고 작성자에게 보입니다. 삭제는 되돌릴 수 없어요." />
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "posts", label: "게시글", count: posts.length }, { key: "comments", label: "댓글", count: comments.length }]} />
      {tab === "posts" ? (
        <AdminTable
          rows={rows}
          searchKeys={["title", "body", "author"]}
          filters={<ChipRow className="!mx-0 !px-0 md:!flex-nowrap"><Chip active={board === "all"} onClick={() => setBoard("all")}>전체</Chip>{BOARDS.map((b) => <Chip key={b.key} active={board === b.key} onClick={() => setBoard(b.key)}>{b.label}</Chip>)}</ChipRow>}
          bulkActions={[
            { label: "숨김", onClick: (ids) => { const r = askReason(`${ids.length}건 숨김`); if (r === null) return; ids.forEach((id) => adminSetPostStatus(id, "hidden", r)); } },
            { label: "복구", onClick: (ids) => ids.forEach((id) => adminSetPostStatus(id, "published")) },
            { label: "삭제", variant: "danger", onClick: (ids) => { if (!confirm(`${ids.length}건을 삭제할까요? 되돌릴 수 없어요.`)) return; const r = askReason("삭제") ?? ""; ids.forEach((id) => adminDeletePost(id, r)); } },
          ]}
          columns={[
            { key: "title", label: "제목", render: (p) => <div className="max-w-[320px]"><div className="flex items-center gap-1.5 mb-0.5">{p.sponsored && <Badge tone="red">광고</Badge>}<Badge tone="outline">{p.boardLabel}</Badge>{p.status === "hidden" && <Badge tone="mute">숨김</Badge>}</div><Link href={`/community/${p.id}`} className="font-semibold hover:text-red line-clamp-1">{p.title}</Link></div> },
            { key: "author", label: "작성자", render: (p) => p.author },
            { key: "likes", label: "♡ / 💬 / 조회", className: "num text-ink-2", render: (p) => `${p.likes.length} / ${p.commentCount} / ${p.views}` },
            { key: "createdAt", label: "작성", className: "num text-ink-3", render: (p) => relTime(p.createdAt) },
            { key: "actions", label: "", className: "text-right", render: (p) => <div className="flex gap-1 justify-end">{p.status === "hidden" ? <Button size="sm" variant="secondary" onClick={() => adminSetPostStatus(p.id, "published")}>복구</Button> : <Button size="sm" variant="secondary" onClick={() => { const r = askReason("숨김"); if (r !== null) adminSetPostStatus(p.id, "hidden", r); }}>숨김</Button>}<Button size="sm" variant="danger" onClick={() => { if (confirm("삭제할까요?")) adminDeletePost(p.id, askReason("삭제") ?? ""); }}>삭제</Button></div> },
          ]}
        />
      ) : (
        <AdminTable
          rows={crow}
          searchKeys={["body", "author", "postTitle"]}
          bulkActions={[{ label: "삭제", variant: "danger", onClick: (ids) => { if (!confirm(`${ids.length}건 삭제?`)) return; ids.forEach((id) => adminDeleteComment(id)); } }]}
          columns={[
            { key: "body", label: "댓글", render: (c) => <p className="max-w-[360px] line-clamp-2">{c.parentId && <Badge tone="mute" className="mr-1">답글</Badge>}{c.body}</p> },
            { key: "postTitle", label: "원글", render: (c) => <Link href={`/community/${c.postId}`} className="text-ink-2 hover:text-red line-clamp-1 max-w-[220px]">{c.postTitle}</Link> },
            { key: "author", label: "작성자", render: (c) => c.author },
            { key: "createdAt", label: "작성", className: "num text-ink-3", render: (c) => relTime(c.createdAt) },
            { key: "actions", label: "", className: "text-right", render: (c) => <Button size="sm" variant="danger" onClick={() => { if (confirm("삭제할까요?")) adminDeleteComment(c.id, askReason("삭제") ?? ""); }}>삭제</Button> },
          ]}
        />
      )}
    </div>
  );
}
