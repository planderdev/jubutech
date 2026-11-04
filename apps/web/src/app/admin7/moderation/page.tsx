"use client";
import { useState } from "react";
import Link from "next/link";
import { WORD_ACTION_LABEL, distinctReporters, type WordAction } from "@jubutech/shared";
import { useRules, useStore } from "@/lib/store";
import { BOARDS } from "@/lib/types";
import { AdminHeader, AdminTable, StatCard, askReason } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { Tabs } from "@/components/ui/tabs";
import { relTime } from "@/lib/utils";

/**
 * 운영 도구 (기획안 2-4) — 사람이 볼 글을 줄인다.
 * 검토 목록: 자동 판단(금칙어·홍보 링크·주식 권유)으로 검토 대기가 됐거나 신고 누적으로 숨겨진 글 → 공개 / 숨김 확정.
 * 금칙어 사전: 단어별로 "바로 숨김" / "검토 대기". 숫자와 켜고 끄기는 운영 규칙(설정).
 */
export default function AdminModeration() {
  const { posts, users, reports, moderationWords, adminAddWord, adminRemoveWord, adminSetWordAction, adminDecideModeration } = useStore();
  const rules = useRules();
  const [tab, setTab] = useState<"queue" | "words">("queue");
  const [word, setWord] = useState("");
  const [action, setAction] = useState<WordAction>("review");
  const [notice, setNotice] = useState<NoticeState>(null);
  const nick = (id: string) => users.find((u) => u.id === id)?.nickname ?? id;
  const queue = posts
    .filter((p) => p.status === "review" || (p.status === "hidden" && (p.moderationNote || reports.some((r) => r.target === "post" && r.targetId === p.id && r.status === "open"))))
    .map((p) => ({ ...p, author: nick(p.authorId), boardLabel: BOARDS.find((b) => b.key === p.board)?.label ?? p.board, reporters: distinctReporters(reports, "post", p.id) }));
  const words = moderationWords.map((w) => ({ ...w }));

  return (
    <div>
      <AdminHeader title="운영 도구" count={queue.length} description="자동 판단은 우선 가리는 것까지만 합니다. 공개·숨김 확정은 여기서 합니다." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="검토 대기" value={posts.filter((p) => p.status === "review").length} tone={posts.some((p) => p.status === "review") ? "red" : undefined} />
        <StatCard label="자동·수동 숨김" value={posts.filter((p) => p.status === "hidden").length} />
        <StatCard label="금칙어" value={moderationWords.length} />
        <StatCard label="자동 숨김 기준" value={`${rules.report.autoHideCount}명`} sub="설정 report.autoHideCount · 초안" />
      </div>
      <Tabs className="mb-3" active={tab} onChange={(k) => setTab(k as typeof tab)} items={[{ key: "queue", label: "검토 목록", count: queue.length }, { key: "words", label: "금칙어 사전", count: moderationWords.length }]} />
      {tab === "queue" ? (
        <AdminTable
          rows={queue}
          searchKeys={["title", "body", "author"]}
          empty="검토할 글이 없어요"
          columns={[
            { key: "title", label: "글", render: (p) => <div className="max-w-[360px]"><div className="flex items-center gap-1.5 mb-0.5"><Badge tone="outline">{p.boardLabel}</Badge><Badge tone={p.status === "review" ? "butter" : "mute"}>{p.status === "review" ? "검토 대기" : "숨김"}</Badge></div><Link href={`/community/${p.id}`} className="font-semibold hover:text-red line-clamp-1">{p.title}</Link><p className="text-[12px] text-ink-2 line-clamp-2">{p.body}</p></div> },
            { key: "moderationNote", label: "사유", render: (p) => <div className="max-w-[220px] text-[12px]">{p.moderationNote ?? "운영자 숨김"}{p.reporters ? <p className="text-ink-3">신고 {p.reporters}명</p> : null}</div> },
            { key: "author", label: "작성자", render: (p) => p.author },
            { key: "createdAt", label: "작성", className: "num text-ink-3", render: (p) => relTime(p.createdAt) },
            { key: "actions", label: "", className: "text-right", render: (p) => <div className="flex gap-1 justify-end"><Button size="sm" variant="ink" onClick={() => adminDecideModeration(p.id, "published", "검토 후 공개")}>공개</Button>{p.status === "review" ? <Button size="sm" variant="ghost" onClick={() => { const r = askReason("숨김 사유"); if (r !== null) adminDecideModeration(p.id, "hidden", r); }}>숨김</Button> : <Button size="sm" variant="ghost" onClick={() => { const r = askReason("숨김 확정 사유"); if (r !== null) adminDecideModeration(p.id, "hidden", r); }}>숨김 확정</Button>}</div> },
          ]}
        />
      ) : (
        <>
          <form className="bg-paper rounded-xl shadow-soft p-4 mb-3 grid sm:grid-cols-[1fr_160px_auto] gap-3 items-end" onSubmit={(e) => { e.preventDefault(); const r = adminAddWord(word, action); setNotice({ ok: r.ok, text: r.message }); if (r.ok) setWord(""); }}>
            <Field label="단어" hint="띄어쓰기는 무시하고 찾아요"><Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="예: 리딩방" /></Field>
            <Field label="걸리면"><Select value={action} onChange={(e) => setAction(e.target.value as WordAction)}><option value="review">{WORD_ACTION_LABEL.review}</option><option value="hide">{WORD_ACTION_LABEL.hide}</option></Select></Field>
            <Button type="submit">추가</Button>
          </form>
          <Notice notice={notice} />
          <AdminTable
            rows={words}
            searchKeys={["word"]}
            empty="등록한 단어가 없어요"
            columns={[
              { key: "word", label: "단어", render: (w) => <span className="font-semibold">{w.word}</span> },
              { key: "action", label: "걸리면", render: (w) => <Select value={w.action} onChange={(e) => adminSetWordAction(w.id, e.target.value as WordAction)} aria-label={`${w.word} 조치`} className="!w-[140px]"><option value="review">{WORD_ACTION_LABEL.review}</option><option value="hide">{WORD_ACTION_LABEL.hide}</option></Select> },
              { key: "actions", label: "", className: "text-right", render: (w) => <Button size="sm" variant="ghost" onClick={() => adminRemoveWord(w.id)}>삭제</Button> },
            ]}
          />
          <p className="mt-3 text-[12px] text-ink-3">홍보 링크(`moderation.blockPromoLinks`)와 주식 권유 표현(`moderation.stockGuard`)은 사전과 별도로 검토 대기로 보냅니다. 앱 쪽 사전은 Supabase 연결 뒤 이 목록과 합쳐집니다.</p>
        </>
      )}
    </div>
  );
}
