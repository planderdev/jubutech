"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, isNavActive } from "@/lib/nav";
import { LineIcon } from "@/components/ui/line-icon";
import { cn } from "@/lib/utils";

/** 메인 컬럼 안에 붙는 하단 5탭 (데스크톱에서도 600px 컬럼 하단에 고정 — 유니웨이 방식) */
export function BottomNav() {
  const pathname = usePathname();
  const items = NAV.filter((n) => n.primary);
  return (
    <nav className="sticky bottom-0 z-30 bg-paper/95 backdrop-blur border-t border-edge pb-[env(safe-area-inset-bottom)]" aria-label="주요 메뉴">
      <ul className="grid grid-cols-5 h-[64px]">
        {items.map((n) => {
          const active = isNavActive(pathname, n.href);
          return (
            <li key={n.href}>
              <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-1 h-full", active ? "text-red" : "text-ink-3")}>
                <LineIcon name={n.icon} className="h-6 w-6" strokeWidth={active ? 1.6 : 1.3} />
                <span className="text-[10px] font-semibold">{n.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
