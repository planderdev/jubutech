import type { LineIconName } from "@/components/ui/line-icon";
import type { Role } from "./types";

export interface NavItem { href: string; label: string; icon: LineIconName; roles?: Role[]; primary?: boolean }

/** 하단 탭바(primary) + 헤더/드로어 공용 내비 정의 — 한 곳에서만 관리 (루비 dashboard-nav 패턴) */
export const NAV: NavItem[] = [
  { href: "/", label: "홈", icon: "home", primary: true },
  { href: "/info", label: "돈되는정보", icon: "info", primary: true },
  { href: "/community", label: "커뮤니티", icon: "community", primary: true },
  { href: "/campaigns", label: "체험단", icon: "campaign", primary: true },
  { href: "/stock", label: "매매일지", icon: "stock" },
  { href: "/me", label: "MY", icon: "my", primary: true },
  { href: "/advertiser", label: "광고주센터", icon: "building", roles: ["advertiser", "admin"] },
];

export const isNavActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
