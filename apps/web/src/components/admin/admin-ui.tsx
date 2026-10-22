"use client";
import { useMemo, useState } from "react";
import { LineIcon } from "@/components/ui/line-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminHeader({ title, description, count, action }: { title: string; description?: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 pt-6 pb-5">
      <div>
        <h1 className="display text-[24px] md:text-[28px]">{title} {typeof count === "number" && <span className="num text-[15px] text-ink-3 font-semibold ml-1">{count}</span>}</h1>
        {description && <p className="mt-1 text-[13px] text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, tone, href }: { label: string; value: string | number; sub?: string; tone?: "red" | "info" | "success"; href?: string }) {
  const inner = (
    <div className="bg-paper rounded-xl shadow-soft p-4 h-full">
      <p className="label text-ink-3">{label}</p>
      <p className={cn("num text-[24px] font-extrabold mt-1", tone === "red" && "text-red", tone === "info" && "text-info", tone === "success" && "text-success")}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-[11px] text-ink-3 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <a href={href} className="lift block rounded-xl">{inner}</a> : inner;
}

/** 유니웨이 bulkTable 축약판: 검색 + 체크 선택 + 일괄 액션 + CSV 내보내기 */
export function AdminTable<T extends { id: string }>({ rows, columns, searchKeys, bulkActions, empty = "데이터가 없어요", filters }: {
  rows: T[];
  columns: { key: string; label: string; render: (r: T) => React.ReactNode; className?: string }[];
  searchKeys?: (keyof T)[];
  bulkActions?: { label: string; onClick: (ids: string[]) => void; variant?: "primary" | "ink" | "danger" | "secondary" }[];
  empty?: string;
  filters?: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const list = useMemo(() => {
    if (!q.trim() || !searchKeys) return rows;
    const k = q.toLowerCase();
    return rows.filter((r) => searchKeys.some((key) => String(r[key] ?? "").toLowerCase().includes(k)));
  }, [rows, q, searchKeys]);
  const allSel = list.length > 0 && list.every((r) => sel.includes(r.id));
  const toggleAll = () => setSel(allSel ? sel.filter((id) => !list.some((r) => r.id === id)) : Array.from(new Set([...sel, ...list.map((r) => r.id)])));
  const exportCsv = () => {
    const head = columns.map((c) => c.label).join(",");
    const body = list.map((r) => columns.map((c) => { const el = c.render(r); const t = typeof el === "string" || typeof el === "number" ? String(el) : JSON.stringify(r[c.key as keyof T] ?? ""); return `"${t.replace(/"/g, '""')}"`; }).join(",")).join("\n");
    const blob = new Blob(["﻿" + head + "\n" + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "jubutech-export.csv"; a.click();
  };
  return (
    <div className="bg-paper rounded-xl shadow-soft overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-hairline">
        {searchKeys && (
          <label className="flex items-center gap-2 h-9 rounded-full bg-inset px-3 flex-1 min-w-[180px] max-w-xs">
            <LineIcon name="search" className="h-4 w-4 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색" className="bg-transparent text-[13px] outline-none flex-1" />
          </label>
        )}
        {filters}
        <span className="num text-[12px] text-ink-3 ml-auto">{list.length}건{sel.length > 0 && ` · 선택 ${sel.length}`}</span>
        {bulkActions?.map((b) => <Button key={b.label} size="sm" variant={b.variant ?? "secondary"} disabled={sel.length === 0} onClick={() => { b.onClick(sel); setSel([]); }}>{b.label}</Button>)}
        <Button size="sm" variant="ghost" onClick={exportCsv}>CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-ink-3 border-b border-hairline">
              {bulkActions && <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={allSel} onChange={toggleAll} aria-label="전체 선택" className="accent-red" /></th>}
              {columns.map((c) => <th key={c.key} className={cn("px-3 py-2.5 font-semibold", c.className)}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {list.length === 0 && <tr><td colSpan={columns.length + 1} className="px-3 py-10 text-center text-ink-3">{empty}</td></tr>}
            {list.map((r) => (
              <tr key={r.id} className={cn("hover:bg-canvas/60 align-middle", sel.includes(r.id) && "bg-red-100/50")}>
                {bulkActions && <td className="px-3 py-2.5"><input type="checkbox" checked={sel.includes(r.id)} onChange={() => setSel(sel.includes(r.id) ? sel.filter((x) => x !== r.id) : [...sel, r.id])} aria-label="선택" className="accent-red" /></td>}
                {columns.map((c) => <td key={c.key} className={cn("px-3 py-2.5", c.className)}>{c.render(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 사유 입력 확인 (유니웨이 confirm-with-reason) */
export function askReason(title: string): string | null {
  const r = window.prompt(`${title}\n사유를 입력하세요 (선택)`, "");
  return r === null ? null : r;
}
