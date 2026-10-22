"use client";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { BOARDS } from "@/lib/types";
import { useUser } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "./avatar";
import { LineIcon } from "@/components/ui/line-icon";
import { relTime, fmtWon } from "@/lib/utils";

/** 유니웨이 feed-item 패턴: 박스 카드가 아닌 하단 구분선 리스트 */
export function PostItem({ post, showBoard = true }: { post: Post; showBoard?: boolean }) {
  const author = useUser(post.authorId);
  const board = BOARDS.find((b) => b.key === post.board);
  return (
    <Link href={`/community/${post.id}`} className="group block py-4 border-b border-hairline hover:bg-paper/60 -mx-4 px-4 md:mx-0 md:px-0 md:hover:bg-transparent transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        {post.sponsored && <Badge tone="red">광고</Badge>}
        {showBoard && board && <Badge tone="outline">{board.label}</Badge>}
        {post.income && <span className="num text-[12px] text-red font-semibold">+{fmtWon(post.income)}</span>}
        {post.tags.slice(0, 2).map((t) => <span key={t} className="text-[11px] text-ink-3">#{t}</span>)}
      </div>
      <h3 className="text-[16px] font-semibold leading-snug group-hover:text-red transition-colors line-clamp-2">{post.title}</h3>
      <p className="mt-1 text-[14px] text-ink-2 line-clamp-2">{post.body}</p>
      <div className="mt-2.5 flex items-center gap-3 text-[12px] text-ink-3">
        <span className="flex items-center gap-1.5"><Avatar name={author?.nickname ?? "?"} size="xs" /><span className="text-ink-2 font-medium">{author?.nickname}</span></span>
        {post.region && <span>· {post.region}</span>}
        <span className="ml-auto flex items-center gap-1 num"><LineIcon name="heart" className="h-3.5 w-3.5" />{post.likes.length}</span>
        <span className="flex items-center gap-1 num"><LineIcon name="comment" className="h-3.5 w-3.5" />{post.commentCount}</span>
        <span className="num">{relTime(post.createdAt)}</span>
      </div>
    </Link>
  );
}
