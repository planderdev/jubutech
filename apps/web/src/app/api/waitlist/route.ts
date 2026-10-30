import { NextResponse } from "next/server";
import { normalizeContact } from "@jubutech/shared";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * 랜딩 「출시 알림 받기」 — Supabase 가 연결돼 있으면 `waitlist` 에 저장(서비스 키, RLS 우회), 아니면 `stored: "none"` 로 답해
 * 화면이 데모 스토어(localStorage)에 보관한다. 중복 연락처는 성공으로 처리(unique 제약).
 */
export async function POST(req: Request) {
  let body: { contact?: string; source?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* 빈 본문 */
  }
  const parsed = normalizeContact(body.contact ?? "");
  if (!parsed) return NextResponse.json({ ok: false, message: "이메일 또는 휴대폰 번호를 확인해 주세요." }, { status: 400 });
  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true, stored: "none", ...parsed });
  const { error } = await sb.from("waitlist").insert({ contact: parsed.contact, channel: parsed.channel, source: body.source ?? "landing" });
  if (error && !/duplicate|unique/i.test(error.message)) return NextResponse.json({ ok: false, message: "잠시 후 다시 시도해 주세요." }, { status: 500 });
  return NextResponse.json({ ok: true, stored: error ? "duplicate" : "supabase", ...parsed });
}
