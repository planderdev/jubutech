"use client";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/feature/page-header";
import { Badge } from "@/components/ui/badge";
import { relTime } from "@/lib/utils";

export default function NoticesPage() {
  const notices = useStore((s) => [...s.notices].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)));
  return (
    <div className="px-4 md:px-5">
      <PageHeader eyebrow="Notice" title="공지 · 이벤트" description="주부테크 운영 소식과 이벤트를 안내해요." />
      <ul className="bg-paper rounded-xl shadow-soft divide-y divide-hairline">
        {notices.map((n) => (
          <li key={n.id} className="p-4">
            <div className="flex items-center gap-1.5 mb-1">{n.pinned && <Badge tone="red">고정</Badge>}<span className="num text-[11px] text-ink-3">{relTime(n.createdAt)}</span></div>
            <p className="font-bold text-[15px]">{n.title}</p>
            {n.body && <p className="text-[13px] text-ink-2 mt-1 whitespace-pre-line">{n.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
