import NextAuth, { type NextAuthConfig } from "next-auth";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";

/**
 * 소셜 로그인 — Auth.js v5 (JWT 세션, DB 없음)
 *  · 네이버: AUTH_NAVER_ID / AUTH_NAVER_SECRET  (콜백 /api/auth/callback/naver)
 *  · 카카오: AUTH_KAKAO_ID / AUTH_KAKAO_SECRET  (콜백 /api/auth/callback/kakao)
 *  · AUTH_SECRET 필수. 키가 없는 제공자는 목록에서 제외되어 로그인 화면에 비활성으로 표시된다.
 *  세션 user.id = "{provider}:{providerAccountId}" — 스토어/향후 Supabase profiles 키로 사용.
 */
const providers: NextAuthConfig["providers"] = [];
if (process.env.AUTH_NAVER_ID && process.env.AUTH_NAVER_SECRET) providers.push(Naver({ clientId: process.env.AUTH_NAVER_ID, clientSecret: process.env.AUTH_NAVER_SECRET }));
if (process.env.AUTH_KAKAO_ID) providers.push(Kakao({ clientId: process.env.AUTH_KAKAO_ID, clientSecret: process.env.AUTH_KAKAO_SECRET ?? "" }));

export const authConfig: NextAuthConfig = {
  providers,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.uid = `${account.provider}:${account.providerAccountId}`;
        // 네이버/카카오 프로필에서 닉네임·이미지 보강
        const p = profile as Record<string, unknown> | undefined;
        const naver = (p?.response ?? {}) as { nickname?: string; profile_image?: string; name?: string };
        const kakaoProps = ((p?.properties ?? {}) as { nickname?: string; profile_image?: string });
        const kakaoAcc = ((p?.kakao_account ?? {}) as { profile?: { nickname?: string; profile_image_url?: string } }).profile ?? {};
        token.name = token.name || naver.nickname || naver.name || kakaoProps.nickname || kakaoAcc.nickname || null;
        token.picture = token.picture || naver.profile_image || kakaoProps.profile_image || kakaoAcc.profile_image_url || null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? session.user.id;
        (session.user as { provider?: string }).provider = token.provider as string | undefined;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const configuredProviders = providers.map((p) => (typeof p === "function" ? p({}).id : p.id));
