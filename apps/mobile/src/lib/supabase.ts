import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@jubutech/shared/database";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseEnabled = !!(url && key);

/** 모바일용 Supabase 클라이언트 — 세션은 AsyncStorage 에 저장, 앱이 포그라운드일 때만 토큰 자동 갱신 */
export const supabase = createClient<Database>(url || "https://placeholder.supabase.co", key || "placeholder", {
  // PKCE: 카카오 OAuth 가 앱 딥링크로 `code` 를 돌려주면 `exchangeCodeForSession` 으로 세션을 만든다 (lib/auth.tsx)
  auth: { storage: AsyncStorage, autoRefreshToken: supabaseEnabled, persistSession: supabaseEnabled, detectSessionInUrl: false, flowType: "pkce" },
});
