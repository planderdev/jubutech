import { cn } from "@/lib/utils";

export type NoticeState = { ok: boolean; text: string } | null;

export function Notice({ notice, className }: { notice: NoticeState; className?: string }) {
  if (!notice) return null;
  return (
    <div role="status" className={cn("rounded-md px-3.5 py-2.5 text-[13px] font-medium animate-fade-up", notice.ok ? "bg-sage-soft text-success" : "bg-red-100 text-red", className)}>
      {notice.text}
    </div>
  );
}
