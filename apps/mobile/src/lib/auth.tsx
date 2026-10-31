import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "@/lib/supabase";

/**
 * 모바일 로그인 — Supabase Auth + 카카오(OAuth). 네이티브 카카오 SDK 없이 브라우저 창으로 로그인하므로 Expo Go 에서도 된다.
 * 흐름: signInWithOAuth(kakao, redirectTo=앱 딥링크, PKCE) → 시스템 브라우저 → 카카오 동의 → Supabase 콜백 → 앱 딥링크(?code=) → exchangeCodeForSession.
 * 가입과 동시에 `profiles` 행은 DB 트리거(handle_new_user)가 만든다. 웹(Auth.js)과 계정 통합은 W8 에서.
 * 키가 없으면(`supabaseEnabled=false`) 데모 모드: 로그인 없이 서연맘으로 둘러본다.
 */
WebBrowser.maybeCompleteAuthSession();

export type AuthStatus = "loading" | "guest" | "signed-in" | "demo";

export interface AuthUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  email?: string;
  provider?: string;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  session: Session | null;
  /** 카카오 로그인 — 성공·취소·오류를 돌려준다. 데모 모드면 `{ ok: false, reason: "disabled" }` */
  signInWithKakao: () => Promise<{ ok: true } | { ok: false; reason: "disabled" | "cancelled" | "error"; message?: string }>;
  signOut: () => Promise<void>;
  /** 딥링크로 받은 콜백 URL 을 세션으로 바꾼다 (app/auth/callback.tsx 에서 사용) */
  completeFromUrl: (url: string) => Promise<boolean>;
}

const Ctx = createContext<AuthState | null>(null);

/** 콜백 딥링크 — Expo Go: exp://…/--/auth/callback, 빌드: jubutech://auth/callback. 둘 다 Supabase Redirect URLs 에 등록 */
export const authRedirectUri = () => Linking.createURL("auth/callback");

function toUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const m = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  return {
    id: session.user.id,
    nickname: str(m.nickname) ?? str(m.name) ?? str(m.full_name) ?? str(m.preferred_username) ?? `주부${session.user.id.slice(0, 4)}`,
    avatarUrl: str(m.avatar_url) ?? str(m.picture),
    email: session.user.email ?? undefined,
    provider: session.user.app_metadata?.provider,
  };
}

/** 콜백 URL 에서 `code`(PKCE) 또는 `#access_token`(implicit) 을 꺼내 세션으로 */
async function sessionFromUrl(url: string): Promise<boolean> {
  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.code;
  if (typeof code === "string" && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }
  const hash = url.split("#")[1];
  if (hash) {
    const q = new URLSearchParams(hash);
    const access_token = q.get("access_token");
    const refresh_token = q.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      return !error;
    }
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseEnabled);

  useEffect(() => {
    if (!supabaseEnabled) return;
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => alive && setSession(data.session))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => alive && setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithKakao = useCallback<AuthState["signInWithKakao"]>(async () => {
    if (!supabaseEnabled) return { ok: false, reason: "disabled" };
    try {
      const redirectTo = authRedirectUri();
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo, skipBrowserRedirect: true } });
      if (error || !data.url) return { ok: false, reason: "error", message: error?.message };
      if (Platform.OS === "web") {
        window.location.assign(data.url);
        return { ok: true };
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, { preferEphemeralSession: false });
      if (result.type !== "success") return { ok: false, reason: "cancelled" };
      const ok = await sessionFromUrl(result.url);
      return ok ? { ok: true } : { ok: false, reason: "error", message: "로그인 응답을 세션으로 바꾸지 못했어요." };
    } catch (e) {
      return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabaseEnabled) return;
    await supabase.auth.signOut().catch(() => {});
    setSession(null);
  }, []);

  const completeFromUrl = useCallback(async (url: string) => (supabaseEnabled ? sessionFromUrl(url) : false), []);

  const value = useMemo<AuthState>(() => {
    const user = toUser(session);
    const status: AuthStatus = !supabaseEnabled ? "demo" : loading ? "loading" : user ? "signed-in" : "guest";
    return { status, user, session, signInWithKakao, signOut, completeFromUrl };
  }, [session, loading, signInWithKakao, signOut, completeFromUrl]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider 안에서만 useAuth 를 쓸 수 있어요");
  return v;
}
