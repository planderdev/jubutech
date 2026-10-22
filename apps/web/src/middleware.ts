import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_BASE, ADMIN_COOKIE, adminKey, sessionToken } from "@/lib/admin-auth";
import { auth } from "@/auth";

/** 로그인이 필요한 사용자 경로 (실제 소셜 로그인 세션 또는 데모 로그인 허용 — 데모는 클라이언트 RoleGate가 처리) */
const PROTECTED = ["/me", "/notifications", "/campaigns/my", "/community/write", "/stock", "/advertiser"];
const notFound = (req: NextRequest) => NextResponse.rewrite(new URL("/__not_found__", req.url), { status: 404 });

/**
 * 단일 도메인 운영 (2026-09-18~): 관리자 센터는 같은 배포의 /admin7 아래에 있다.
 *  - /admin7/login 외의 /admin7* 과 /api/admin7/*(login 제외)는 접속 키 쿠키가 없으면 차단
 *  - 접속 키(ADMIN_ACCESS_KEY)가 없는 배포에서는 관리자 경로 전체가 404
 *  - 예전 경로 /admin* 은 라우트가 없으므로 404
 * 소셜 로그인이 설정된 배포(AUTH_NAVER_ID/AUTH_KAKAO_ID)에서는 보호 경로에 세션이 없으면 /login 으로 보낸다.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname === ADMIN_BASE || pathname.startsWith(ADMIN_BASE + "/");
  const isAdminApi = pathname.startsWith(`/api${ADMIN_BASE}/`);

  if (isAdmin || isAdminApi) {
    const key = adminKey();
    if (!key) return notFound(req);
    const open = pathname === `${ADMIN_BASE}/login` || pathname === `/api${ADMIN_BASE}/login`;
    if (!open) {
      const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
      if (!cookie || cookie !== (await sessionToken(key))) {
        if (isAdminApi) return NextResponse.json({ ok: false }, { status: 401 });
        const url = new URL(`${ADMIN_BASE}/login`, req.url); url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // 소셜 로그인이 켜진 배포에서만 서버 측 보호 (데모 모드는 클라이언트 RoleGate)
  const oauthEnabled = !!(process.env.AUTH_NAVER_ID || process.env.AUTH_KAKAO_ID) && process.env.NEXT_PUBLIC_DEMO_LOGIN !== "1";
  if (oauthEnabled && PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const session = await auth();
    if (!session?.user) {
      const url = new URL("/login", req.url); url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|jpg|svg|css|js|txt|html)).*)"] };
