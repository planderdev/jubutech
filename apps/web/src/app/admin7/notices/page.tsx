"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminHeader } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { relTime } from "@/lib/utils";

export default function AdminNotices() {
  const { notices, adminAddNotice, adminDeleteNotice } = useStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  return (
    <div>
      <AdminHeader title="공지 · 이벤트" count={notices.length} description="고정 공지는 커뮤니티 상단과 홈 펄스 스트립에 노출됩니다." />
      <form className="bg-paper rounded-xl shadow-soft p-4 mb-4 space-y-3" onSubmit={(e) => { e.preventDefault(); if (title.trim().length < 4) return; adminAddNotice(title.trim(), body.trim(), pinned); setTitle(""); setBody(""); setPinned(false); }}>
        <Field label="제목" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="10월 영수증 인증 이벤트 안내" /></Field>
        <Field label="내용"><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[80px]" /></Field>
        <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-red" />상단 고정</label><Button type="submit" variant="ink">등록</Button></div>
      </form>
      <ul className="bg-paper rounded-xl shadow-soft divide-y divide-hairline">
        {notices.map((n) => (
          <li key={n.id} className="p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 mb-1">{n.pinned && <Badge tone="red">고정</Badge>}<span className="num text-[11px] text-ink-3">{relTime(n.createdAt)}</span></div><p className="font-semibold">{n.title}</p>{n.body && <p className="text-[13px] text-ink-2 mt-0.5 line-clamp-2">{n.body}</p>}</div>
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("삭제할까요?")) adminDeleteNotice(n.id); }}>삭제</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
