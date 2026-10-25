"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { MenuDrawer } from "./menu-drawer";
import { useMe, useStore } from "@/lib/store";
import { LineIcon } from "@/components/ui/line-icon";
import { Avatar } from "@/components/feature/avatar";
import { cn } from "@/lib/utils";

/** 유니웨이 topbar: 아바타 + "이름님, 반가워요" | 알림 · 메뉴 */
export function Topbar({ workspace }: { workspace?: boolean }) {
  const pathname = usePathname();
  const me = useMe();
  const unread = useStore((s) => s.notifications.filter((n) => n.userId === s.userId && !n.read).length);
  const [open, setOpen] = useState(false);

  return (
    <header className={cn("sticky top-0 z-30 h-14 flex items-center gap-3 px-4 bg-paper/95 backdrop-blur border-b border-edge", workspace && "rounded-b-xl border shadow-soft")}>
      {me ? (
        <Link href={workspace && pathname.startsWith("/admin7") ? "/admin7" : "/me"} className="flex items-center gap-2.5 min-w-0">
          <Avatar name={me.nickname} size="sm" image={me.image} />
          <span className="text-[14px] truncate"><b className="font-bold">{me.nickname}님</b><span className="text-ink-2">, 반가워요</span></span>
        </Link>
      ) : (
        <Link href="/login" className="flex items-center gap-2.5"><Logo size="sm" /><span className="text-[13px] text-ink-2">로그인하고 시작하기</span></Link>
      )}
      <div className="ml-auto flex items-center gap-0.5">
        <Link href="/notifications" className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-inset" aria-label={`알림 ${unread}건`}>
          <LineIcon name="bell" />
          {unread > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red ring-2 ring-paper" />}
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-inset" aria-label="메뉴 열기">
          <LineIcon name="menu" />
        </button>
      </div>

      <MenuDrawer open={open} onClose={() => setOpen(false)} admin={!!workspace && pathname.startsWith("/admin7")} />
    </header>
  );
}
