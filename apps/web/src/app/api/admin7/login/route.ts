import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminKey, sessionToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const key = adminKey();
  if (!key) return NextResponse.json({ ok: false, message: "관리자 접속 키가 설정되지 않았어요." }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { key?: string };
  if (!body.key || body.key !== key) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, message: "접속 키가 올바르지 않아요." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await sessionToken(key), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
