"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type MenuItem = { href: string; label: string; icon: LineIconName; count?: number };
const ADVERTISER: MenuItem[] = [
  { href: "/advertiser", label: "대시보드", icon: "home" },
  { href: "/advertiser/campaigns/new", label: "캠페인 만들기", icon: "plus" },
  { href: "/campaigns", label: "회원 화면 보기", icon: "campaign" },
];

/** 유니웨이 workspace 셸의 좌측 센터 메뉴 (광고주 센터 / 관리자 센터) */
export function WorkspacePanel({ kind }: { kind: "advertiser" | "admin" }) {
  const pathname = usePathname();
  const pendingCampaigns = useStore((s) => s.campaigns.filter((c) => c.status === "pending").length);
  const openReports = useStore((s) => s.reports.filter((r) => r.status === "open").length);
  const ADMIN: MenuItem[] = [
    { href: "/admin7", label: "대시보드", icon: "home" },
    { href: "/admin7/users", label: "회원", icon: "community" },
    { href: "/admin7/posts", label: "게시글·댓글", icon: "comment" },
    { href: "/admin7/reports", label: "신고", icon: "bell", count: openReports },
    { href: "/admin7/campaigns", label: "캠페인 검수", icon: "campaign", count: pendingCampaigns },
    { href: "/admin7/applications", label: "응모·미션", icon: "check" },
    { href: "/admin7/info", label: "돈되는정보", icon: "info" },
    { href: "/admin7/points", label: "포인트", icon: "coin" },
    { href: "/admin7/notices", label: "공지", icon: "bulb" },
    { href: "/admin7/logs", label: "운영 로그", icon: "list" },
  ];
  const menu = kind === "admin" ? ADMIN : ADVERTISER;
  return (
    <aside className="discovery-panel" aria-label={kind === "admin" ? "관리자 센터 메뉴" : "광고주 센터 메뉴"}>
      <Logo size="md" />
      <p className="label text-red mt-6">{kind === "admin" ? "SERVICE OPERATIONS" : "ADVERTISER CENTER"}</p>
      <h2 className="display text-[22px] mt-1">{kind === "admin" ? "관리자 센터" : "광고주 센터"}</h2>
      <nav className="mt-5 space-y-1">
        {menu.map((m) => {
          const active = m.href === "/admin7" || m.href === "/advertiser" ? pathname === m.href : pathname.startsWith(m.href);
          return (
            <Link key={m.href} href={m.href} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[14px] font-semibold", active ? "bg-stage text-paper" : "text-ink-2 hover:bg-paper")}>
              <LineIcon name={m.icon} className="h-[18px] w-[18px]" />{m.label}
              {m.count ? <span className="ml-auto num text-[11px] font-bold bg-red text-paper rounded-full px-1.5 py-0.5">{m.count}</span> : null}
            </Link>
          );
        })}
      </nav>
      {kind === "admin" ? (
        <button type="button" onClick={async () => { await fetch("/api/admin7/logout", { method: "POST" }); location.href = "/admin7/login"; }} className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-red"><LineIcon name="close" className="h-4 w-4" />관리자 로그아웃</button>
      ) : (
        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-red"><LineIcon name="chevronLeft" className="h-4 w-4" />커뮤니티로 돌아가기</Link>
      )}
    </aside>
  );
}
