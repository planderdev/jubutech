import tokens from "../../../../design/tokens.json";
import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: { default: "주부테크 — 주부의 일상이 돈이 되는 곳", template: "%s — 주부테크" },
  description: "현명한 소비도, 소소한 공부도 모두 재테크가 됩니다. 지원금·절약 정보, 체험단·부업 미션, 매매일지까지 주부를 위한 생활경제 커뮤니티.",
  applicationName: "주부테크",
  icons: { icon: "/icon.png", apple: "/logo/apple-touch-icon.png" },
  openGraph: { title: "주부테크 — 주부의 일상이 돈이 되는 곳", description: "현명한 소비도, 소소한 공부도 모두 재테크가 됩니다.", siteName: "주부테크", locale: "ko_KR", type: "website" },
};
export const viewport: Viewport = { themeColor: tokens.color.base.canvas.hex, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
