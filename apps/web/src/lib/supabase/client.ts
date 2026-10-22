"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@jubutech/shared/database";

/** 브라우저용 Supabase 클라이언트 (관리자 센터·랜딩). 환경변수 없으면 null — 목 데이터 모드 유지 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient<Database>(url, key);
}
