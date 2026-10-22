"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { BOARDS, type Board } from "@/lib/types";
import { PageHeader } from "@/components/feature/page-header";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Chip, ChipRow } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/feature/role-gate";
import { Notice, type NoticeState } from "@/components/ui/notice";

function WriteForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const addPost = useStore((s) => s.addPost);
  const [board, setBoard] = useState<Board>((sp.get("board") as Board) ?? "free");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [income, setIncome] = useState("");
  const [region, setRegion] = useState("");
  const [notice, setNotice] = useState<NoticeState>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4) return setNotice({ ok: false, text: "제목은 4자 이상 적어주세요." });
    if (body.trim().length < 10) return setNotice({ ok: false, text: "내용은 10자 이상 적어주세요." });
    const id = addPost({ board, title: title.trim(), body: body.trim(), tags: tags.split(/[,\s#]+/).filter(Boolean).slice(0, 5), income: board === "income" && income ? Number(income) : undefined, region: region || undefined });
    router.push(`/community/${id}`);
  };

  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Write" title="글쓰기" description="작성 시 50P 적립. 수익 인증은 금액을 함께 적으면 인증 배지가 붙어요." />
      <form onSubmit={submit} className="bg-paper rounded-xl shadow-card p-5 md:p-7 space-y-5">
        <div>
          <p className="label text-ink-2 mb-2">게시판</p>
          <ChipRow>{BOARDS.map((b) => <Chip key={b.key} active={board === b.key} onClick={() => setBoard(b.key)}>{b.label}</Chip>)}</ChipRow>
        </div>
        <Field label="제목" required><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="한 줄로 핵심을 적어주세요" maxLength={80} /></Field>
        {board === "income" && <Field label="이번 달 수익 금액" hint="숫자만 입력 (원)"><Input inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))} placeholder="187000" className="num" /></Field>}
        {board === "region" && <Field label="지역"><Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 경기 성남" /></Field>}
        <Field label="내용" required><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="언제·어디서·얼마나. 구체적인 숫자가 다른 분께 가장 큰 도움이 돼요." className="min-h-[220px]" /></Field>
        <Field label="태그" hint="쉼표로 구분, 최대 5개"><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="체험단, 재택, 설문" /></Field>
        <Notice notice={notice} />
        <div className="flex gap-2 justify-end pt-2 border-t border-dashed border-hairline">
          <Button type="button" variant="ghost" onClick={() => router.back()}>취소</Button>
          <Button type="submit">등록하기</Button>
        </div>
      </form>
    </div>
  );
}
export default function WritePage() {
  return <RoleGate allow={["member", "admin", "advertiser"]}><Suspense><WriteForm /></Suspense></RoleGate>;
}
