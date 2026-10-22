"use client";
import { cn } from "@/lib/utils";

export function Chip({ active, children, onClick, className }: { active?: boolean; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap",
        active ? "bg-stage text-paper" : "bg-paper text-ink-2 border border-hairline hover:border-ink-3 hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap", className)}>{children}</div>;
}
