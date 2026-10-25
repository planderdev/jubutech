"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * 우측 슬라이드 드로어 — document.body 포털로 렌더링 (backdrop-filter 조상의 containing block 문제 회피)
 * ESC 닫기 · 배경 클릭 닫기 · 본문 스크롤 잠금 · 닫힐 때 포커스 복귀
 */
export function Drawer({ open, onClose, title, children, width = 320 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a,button,input")?.focus(), 30);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); restoreRef.current?.focus?.(); };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-stage/50 animate-[fade-in_.2s_ease-out]" onClick={onClose} aria-label="닫기" />
      <div ref={panelRef} style={{ width, maxWidth: "88vw" }} className={cn("absolute right-0 top-0 h-full bg-paper shadow-float flex flex-col rounded-l-2xl overflow-hidden animate-[slide-in-right_.22s_cubic-bezier(.2,.8,.2,1)]")}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
