"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useStore, useMe } from "@/lib/store";
import { BOARDS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { LineIcon } from "@/components/ui/line-icon";
import { Avatar } from "@/components/feature/avatar";
import { PostItem } from "@/components/feature/post-item";
import { relTime, fmtWon } from "@/lib/utils";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const post = useStore((s) => s.posts.find((p) => p.id === id));
  const comments = useStore((s) => s.comments.filter((c) => c.postId === id));
  const users = useStore((s) => s.users);
  const bookmarked = useStore((s) => s.bookmarks.includes(id));
  const { toggleLike, toggleBookmark, addComment, viewPost, userId } = useStore();
  const me = useMe();
  const related = useStore((s) => s.posts.filter((p) => p.board === post?.board && p.id !== id).slice(0, 3));
  const [body, setBody] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  useEffect(() => { viewPost(id); }, [id, viewPost]);
  if (!post) notFound();
  const author = users.find((u) => u.id === post.authorId);
  const board = BOARDS.find((b) => b.key === post.board);
  const liked = !!userId && post.likes.includes(userId);
  const roots = comments.filter((c) => !c.parentId);

  const submit = (parentId?: string) => {
    if (!me) return location.assign("/login");
    if (!body.trim()) return;
    addComment(post.id, body.trim(), parentId);
    setBody(""); setReply(null);
  };

  return (
    <div className="px-4 md:px-5">
      <nav className="label text-ink-3 pt-6"><Link href="/community" className="hover:text-red">커뮤니티</Link> / <Link href={`/community?board=${post.board}`} className="hover:text-red">{board?.label}</Link></nav>
      <article className="mt-4 bg-paper rounded-xl shadow-card">
        <header className="p-6 md:p-8">
          <div className="flex items-center gap-2 flex-wrap">
            {post.sponsored && <Badge tone="red">광고</Badge>}
            <Badge tone="outline">{board?.label}</Badge>
            {post.income && <span className="num text-[13px] font-semibold text-red">+{fmtWon(post.income)} 인증</span>}
            {post.tags.map((t) => <span key={t} className="text-[11px] text-ink-3">#{t}</span>)}
          </div>
          <h1 className="display text-[24px] md:text-[30px] mt-3">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={author?.nickname ?? "?"} />
            <div className="flex-1">
              <p className="text-[14px] font-semibold">{author?.nickname} <span className="label text-ink-3 ml-1">Lv.{author?.level}</span></p>
              <p className="num text-[12px] text-ink-3">{author?.region} · {relTime(post.createdAt)} · 조회 {post.views}</p>
            </div>
          </div>
        </header>
        <div className="px-6 md:px-8 pb-8 text-[15px] leading-relaxed whitespace-pre-line border-b border-dashed border-hairline">{post.body}</div>
        <div className="px-6 md:px-8 py-4 flex items-center gap-2">
          <Button size="sm" variant={liked ? "primary" : "secondary"} onClick={() => (me ? toggleLike(post.id) : location.assign("/login"))}><LineIcon name="heart" className="h-4 w-4" />좋아요 <span className="num">{post.likes.length}</span></Button>
          <Button size="sm" variant={bookmarked ? "ink" : "ghost"} onClick={() => toggleBookmark(post.id)}><LineIcon name="star" className="h-4 w-4" />{bookmarked ? "저장됨" : "저장"}</Button>
          <Button size="sm" variant="ghost"><LineIcon name="share" className="h-4 w-4" />공유</Button>
          <button type="button" className="ml-auto label text-ink-3 hover:text-red">신고</button>
        </div>
      </article>

      <section className="mt-8">
        <p className="label text-ink-3 mb-3">댓글 <span className="num text-ink">{comments.length}</span></p>
        <div className="bg-paper rounded-xl shadow-soft p-4">
          <Textarea value={reply ? "" : body} onChange={(e) => setBody(e.target.value)} placeholder={me ? "따뜻한 댓글을 남겨주세요" : "로그인 후 댓글을 남길 수 있어요"} disabled={!!reply} className="min-h-[72px]" />
          <div className="mt-2 flex justify-end"><Button size="sm" onClick={() => submit()} disabled={!!reply}>등록</Button></div>
        </div>
        <ul className="mt-4 divide-y divide-hairline">
          {roots.map((c) => {
            const u = users.find((x) => x.id === c.authorId);
            const children = comments.filter((x) => x.parentId === c.id);
            return (
              <li key={c.id} className="py-4">
                <div className="flex gap-3">
                  <Avatar name={u?.nickname ?? "?"} size="sm" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold">{u?.nickname} <span className="num text-[11px] text-ink-3 font-normal ml-1">{relTime(c.createdAt)}</span></p>
                    <p className="text-[14px] mt-1">{c.body}</p>
                    <button type="button" onClick={() => { setReply(reply === c.id ? null : c.id); setBody(""); }} className="label text-ink-3 mt-2 hover:text-red">답글</button>
                    {reply === c.id && (
                      <div className="mt-2">
                        <Textarea autoFocus value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[60px]" placeholder={`${u?.nickname}님에게 답글`} />
                        <div className="mt-2 flex gap-2 justify-end"><Button size="sm" variant="ghost" onClick={() => setReply(null)}>취소</Button><Button size="sm" onClick={() => submit(c.id)}>등록</Button></div>
                      </div>
                    )}
                    {children.map((r) => {
                      const ru = users.find((x) => x.id === r.authorId);
                      return (
                        <div key={r.id} className="mt-3 pl-4 border-l-2 border-red-300 flex gap-2">
                          <Avatar name={ru?.nickname ?? "?"} size="xs" />
                          <div><p className="text-[13px] font-semibold">{ru?.nickname} <span className="num text-[11px] text-ink-3 font-normal ml-1">{relTime(r.createdAt)}</span></p><p className="text-[14px] mt-0.5">{r.body}</p></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-10 border-t border-hairline">
          <p className="label text-ink-3 pt-4">{board?.label} 다른 글</p>
          {related.map((p) => <PostItem key={p.id} post={p} showBoard={false} />)}
        </section>
      )}
    </div>
  );
}
