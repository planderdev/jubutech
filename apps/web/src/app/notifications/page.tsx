"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/feature/page-header";
import { RoleGate } from "@/components/feature/role-gate";
import { EmptyState } from "@/components/ui/empty";
import { relTime, cn } from "@/lib/utils";

function List() {
  const items = useStore((s) => s.notifications.filter((n) => n.userId === s.userId));
  const { readNotification, readAllNotifications } = useStore();
  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Inbox" title="알림" action={<button type="button" onClick={readAllNotifications} className="label text-ink-3 hover:text-red">모두 읽음</button>} />
      {items.length === 0 ? <EmptyState icon="bell" title="새 알림이 없어요" /> : (
        <ul className="bg-paper rounded-xl shadow-soft divide-y divide-hairline">
          {items.map((n) => (
            <li key={n.id}><Link href={n.href} onClick={() => readNotification(n.id)} className={cn("flex gap-3 p-4 hover:bg-canvas", !n.read && "bg-red-100/60")}><span className={cn("mt-2 h-2 w-2 rounded-full shrink-0", n.read ? "bg-transparent" : "bg-red")} /><div className="flex-1"><p className={cn("text-[15px]", !n.read && "font-semibold")}>{n.title}</p><p className="text-[13px] text-ink-2 mt-0.5">{n.body}</p><p className="num text-[11px] text-ink-3 mt-1">{relTime(n.createdAt)}</p></div></Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default function NotificationsPage() {
  return <RoleGate allow={["member", "advertiser", "admin"]}><List /></RoleGate>;
}
