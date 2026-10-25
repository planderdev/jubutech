import { NextResponse } from "next/server";
import { configuredProviders } from "@/auth";

/** 로그인 화면이 어떤 소셜 제공자가 설정됐는지 알기 위한 공개 엔드포인트 */
export function GET() {
  return NextResponse.json({ providers: configuredProviders, demo: process.env.NEXT_PUBLIC_DEMO_LOGIN === "1" || configuredProviders.length === 0 });
}
