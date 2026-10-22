"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Notice, type NoticeState } from "@/components/ui/notice";

function AdminLoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin7/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: key.trim() }) });
    const data = (await res.json()) as { ok: boolean; message?: string };
    setBusy(false);
    if (!data.ok) return setNotice({ ok: false, text: data.message ?? "로그인 실패" });
    const next = sp.get("next");
    router.replace(next && next.startsWith("/admin7") ? next : "/admin7");
    router.refresh();
  };
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-paper rounded-2xl shadow-card p-7 space-y-5">
        <div className="text-center">
          <Logo size="lg" />
          <p className="label text-red mt-3">SERVICE OPERATIONS</p>
          <h1 className="display text-[22px] mt-1">관리자 센터 로그인</h1>
          <p className="text-[13px] text-ink-2 mt-1">운영자에게 발급된 접속 키를 입력하세요.</p>
        </div>
        <Field label="접속 키" required><Input type="password" autoFocus autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="••••••••••••" /></Field>
        <Notice notice={notice} />
        <Button type="submit" full variant="ink" size="lg" disabled={busy}>{busy ? "확인 중…" : "입장"}</Button>
        <p className="text-[11px] text-ink-3 text-center">세션은 12시간 후 만료됩니다. 키는 Vercel 환경변수 ADMIN_ACCESS_KEY로 관리합니다.</p>
      </form>
    </div>
  );
}
export default function AdminLoginPage() {
  return <Suspense><AdminLoginForm /></Suspense>;
}
