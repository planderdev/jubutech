"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabItem = { key: string; label: string; href?: string; count?: number };

export function Tabs({ items, active, onChange, className }: { items: TabItem[]; active: string; onChange?: (k: string) => void; className?: string }) {
  return (
    <div className={cn("flex gap-6 border-b border-hairline overflow-x-auto no-scrollbar", className)} role="tablist">
      {items.map((t) => {
        const isActive = t.key === active;
        const cls = cn(
          "relative pb-3 pt-1 text-[15px] font-semibold whitespace-nowrap transition-colors",
          isActive ? "text-ink" : "text-ink-3 hover:text-ink",
          "after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:rounded-full",
          isActive ? "after:bg-red" : "after:bg-transparent",
        );
        const inner = (
          <>
            {t.label}
            {typeof t.count === "number" && <span className="num ml-1.5 text-[12px] text-ink-3">{t.count}</span>}
          </>
        );
        return t.href ? (
          <Link key={t.key} href={t.href} role="tab" aria-selected={isActive} className={cls}>{inner}</Link>
        ) : (
          <button key={t.key} type="button" role="tab" aria-selected={isActive} onClick={() => onChange?.(t.key)} className={cls}>{inner}</button>
        );
      })}
    </div>
  );
}
