"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/layout/logo";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { cn } from "@/lib/utils";

const SOCIAL = [
  { id: "kakao", label: "카카오로 3초 만에 시작", cls: "bg-[#FEE500] text-[#191600]", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.2 4.6 6.6L5.5 21l4.4-2.9c.7.1 1.4.2 2.1.2 5.5 0 10-3.6 10-8.1S17.5 3 12 3z"/></svg> },
  { id: "naver", label: "네이버로 시작", cls: "bg-[#03C75A] text-white", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M4 4h5.2l5.6 8.3V4H20v16h-5.2L9.2 11.7V20H4z"/></svg> },
];
const ERRORS: Record<string, string> = { OAuthSignin: "로그인 요청을 시작하지 못했어요.", OAuthCallback: "제공자 응답 처리에 실패했어요. 콜백 URL 설정을 확인해 주세요.", OAuthAccountNotLinked: "다른 방법으로 가입한 계정이에요.", AccessDenied: "로그인이 거부되었어요.", Configuration: "로그인 설정이 아직 완료되지 않았어요." };

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { status } = useSession();
  const { login, role, reset, authSource } = useStore();
  const [cfg, setCfg] = useState<{ providers: string[]; demo: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const next = sp.get("next") && sp.get("next")!.startsWith("/") ? sp.get("next")! : "/";
  const err = sp.get("error");
  const notice: NoticeState = err ? { ok: false, text: ERRORS[err] ?? `로그인 오류 (${err})` } : null;

  useEffect(() => { fetch("/api/auth/config").then((r) => r.json()).then(setCfg).catch(() => setCfg({ providers: [], demo: true })); }, []);
  useEffect(() => { if (status === "authenticated") router.replace(next === "/login" ? "/" : next); }, [status, next, router]);

  const social = async (id: string) => { setBusy(id); await signIn(id, { callbackUrl: next }); };
  const demo = (r: "member" | "advertiser") => { login(r); router.push(r === "advertiser" ? "/advertiser" : next); };

  return (
    <div className="px-4 md:px-5 py-8">
      <div className="bg-paper rounded-2xl shadow-card p-6 md:p-8 text-center">
        <Logo size="lg" />
        <p className="label text-red mt-3">주부의 일상이 돈이 되는 곳</p>
        <p className="text-[14px] text-ink-2 mt-4">가입하면 관심사에 맞는 지원금·미션을 추천해 드려요.<br />첫 가입 시 <span className="num font-semibold text-ink">1,000P</span> 지급.</p>
        <div className="mt-6 space-y-2">
          {SOCIAL.map((s) => {
            const enabled = !!cfg?.providers.includes(s.id);
            return (
              <button key={s.id} type="button" disabled={!cfg || !enabled || !!busy} onClick={() => social(s.id)} className={cn("w-full h-12 rounded-md font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-transform active:scale-[.98] disabled:opacity-40", s.cls)}>
                {s.icon}{busy === s.id ? "이동 중…" : s.label}
              </button>
            );
          })}
        </div>
        {cfg && cfg.providers.length === 0 && <p className="mt-3 text-[12px] text-ink-3">소셜 로그인 키가 아직 등록되지 않았어요. 아래 데모 로그인으로 둘러볼 수 있어요.</p>}
        <Notice notice={notice} className="mt-3 text-left" />
        <p className="mt-4 text-[11px] text-ink-3">가입 시 이용약관·개인정보처리방침에 동의하게 됩니다. 자녀 정보는 수집하지 않아요.</p>
      </div>

      {(cfg?.demo || authSource === "demo") && (
        <div className="mt-6 bg-inset rounded-xl p-5">
          <p className="label text-ink-2">데모 계정으로 둘러보기 <span className="font-normal text-ink-3">(소셜 로그인 키 등록 전)</span></p>
          <ul className="mt-3 space-y-2">
            {([["member", "회원(주부)", "서연맘 · Lv.3 · 12,400P", "👩‍👧"], ["advertiser", "광고주", "그린테이블 마케팅", "🏢"]] as const).map(([r, label, desc, icon]) => (
              <li key={r}><button type="button" onClick={() => demo(r)} className={cn("w-full flex items-center gap-3 bg-paper rounded-md px-4 py-3 text-left shadow-soft", role === r && authSource === "demo" ? "ring-2 ring-red" : "")}><span className="text-xl">{icon}</span><span className="flex-1"><span className="block text-[14px] font-semibold">{label}</span><span className="block text-[12px] text-ink-3">{desc}</span></span>{role === r && authSource === "demo" && <span className="label text-red">현재</span>}</button></li>
            ))}
          </ul>
          <button type="button" onClick={() => { reset(); router.push("/"); }} className="label text-ink-3 mt-4 hover:text-red">데모 데이터 초기화</button>
        </div>
      )}
    </div>
  );
}
export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}
