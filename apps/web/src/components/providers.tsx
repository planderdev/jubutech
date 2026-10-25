"use client";
import { useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useStore } from "@/lib/store";

/** 소셜 로그인 세션 ↔ 로컬 스토어 동기화 */
function AuthSync() {
  const { data, status } = useSession();
  const hydrated = useStore((s) => s.hydrated);
  const authSource = useStore((s) => s.authSource);
  const userId = useStore((s) => s.userId);
  const loginOAuth = useStore((s) => s.loginOAuth);
  const logout = useStore((s) => s.logout);
  useEffect(() => {
    if (!hydrated || status === "loading") return;
    if (data?.user?.id) {
      if (userId !== data.user.id || authSource !== "oauth") loginOAuth({ id: data.user.id, name: data.user.name, image: data.user.image, provider: data.user.provider });
    } else if (authSource === "oauth") {
      logout();
    }
  }, [hydrated, status, data, userId, authSource, loginOAuth, logout]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useStore.persist.rehydrate();
    useStore.getState().setHydrated();
  }, []);
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}

/** 로그아웃 — 소셜 세션이 있으면 서버 세션까지 종료 */
export async function logoutEverywhere() {
  const src = useStore.getState().authSource;
  useStore.getState().logout();
  if (src === "oauth") await signOut({ redirect: false });
}
