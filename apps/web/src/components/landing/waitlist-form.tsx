"use client";
import { useState } from "react";
import { normalizeContact } from "@jubutech/shared";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** 랜딩 「출시 알림 받기」 — 이메일 또는 휴대폰 한 칸. API(Supabase) → 없으면 데모 스토어에 보관 */
export function WaitlistForm({ source = "landing", className, dark }: { source?: string; className?: string; dark?: boolean }) {
  const joinWaitlist = useStore((s) => s.joinWaitlist);
  const [value, setValue] = useState("");
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = normalizeContact(value);
    if (!parsed) return setState({ ok: false, text: "이메일 또는 휴대폰 번호를 확인해 주세요." });
    setBusy(true);
    let stored = "none";
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contact: value, source }) });
      const json = (await res.json()) as { ok: boolean; stored?: string; message?: string };
      if (!json.ok) throw new Error(json.message);
      stored = json.stored ?? "none";
    } catch {
      stored = "none";
    }
    joinWaitlist(parsed.contact, parsed.channel, source);
    setBusy(false);
    setValue("");
    setState({ ok: true, text: stored === "duplicate" ? "이미 신청된 연락처예요. 출시되면 바로 알려 드릴게요." : "신청됐어요! 출시되면 가장 먼저 알려 드릴게요." });
  };

  return (
    <form onSubmit={submit} className={cn("w-full max-w-md mx-auto", className)}>
      <div className="flex gap-2">
        <input value={value} onChange={(e) => { setValue(e.target.value); setState(null); }} inputMode="email" autoComplete="email" placeholder="이메일 또는 휴대폰 번호" aria-label="이메일 또는 휴대폰 번호" className={cn("field flex-1 h-12", dark && "bg-paper text-ink")} />
        <Button type="submit" size="lg" variant={dark ? "ink" : "primary"} disabled={busy}>{busy ? "신청 중…" : "출시 알림 받기"}</Button>
      </div>
      <p role="status" className={cn("mt-2 text-[12px] min-h-[18px]", state ? (state.ok ? (dark ? "text-paper" : "text-success") : "text-red") : dark ? "text-paper/70" : "text-ink-3")}>{state?.text ?? "앱 출시와 첫 체험단 소식만 보내요. 언제든 해지할 수 있어요."}</p>
    </form>
  );
}
