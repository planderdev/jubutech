import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@jubutech/shared/database";

/** 서버 컴포넌트·Route Handler 용 Supabase 클라이언트 (쿠키 세션). 환경변수 없으면 null */
export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (all: { name: string; value: string; options?: CookieOptions }[]) => { try { all.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* 서버 컴포넌트에서는 set 불가 — 미들웨어가 갱신 */ } },
    },
  });
}

/** 서비스 롤 클라이언트 — 관리자 API 전용(RLS 우회). 절대 클라이언트로 노출 금지 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServerClient<Database>(url, key, { cookies: { getAll: () => [], setAll: () => {} } });
}
