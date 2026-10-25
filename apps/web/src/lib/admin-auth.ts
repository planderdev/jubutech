/** 관리자 경로 — 사용자 사이트와 같은 도메인에 두되, 추측하기 어려운 경로를 쓴다. 바꾸려면 src/app/admin7 · src/app/api/admin7 디렉터리명과 함께 바꿀 것 */
export const ADMIN_BASE = "/admin7";
/** 관리자 세션 토큰 — 접속 키를 그대로 쿠키에 넣지 않고 SHA-256 서명값을 저장 (Edge/Node 공용 Web Crypto) */
export const ADMIN_COOKIE = "jt_admin";

export function adminKey(): string | null {
  const k = process.env.ADMIN_ACCESS_KEY;
  if (k) return k;
  return process.env.NODE_ENV === "development" ? "dev" : null;
}

export async function sessionToken(key: string): Promise<string> {
  const data = new TextEncoder().encode(`jubutech-admin-session:${key}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
