"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

/** 접근 제어는 middleware(접속 키 쿠키)가 담당. 여기서는 스토어 역할을 운영자로 맞춘다. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useStore((s) => s.role);
  const hydrated = useStore((s) => s.hydrated);
  const login = useStore((s) => s.login);
  useEffect(() => { if (hydrated && role !== "admin" && pathname !== "/admin7/login") login("admin"); }, [hydrated, role, pathname, login]);
  if (pathname === "/admin7/login") return <>{children}</>;
  return <div className="px-1 md:px-0 pb-16">{children}</div>;
}
