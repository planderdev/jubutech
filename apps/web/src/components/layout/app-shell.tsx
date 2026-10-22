"use client";
import { usePathname } from "next/navigation";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { DiscoveryPanel } from "./discovery-panel";
import { WorkspacePanel } from "./workspace-panel";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

/** 유니웨이 app-shell: 탐색 패널(360, sticky) + 메인 컬럼(600). 광고주 센터는 workspace 셸(220 + 넓은 본문). */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useStore((s) => s.hydrated);
  const admin = pathname.startsWith("/admin7");
  const workspace = pathname.startsWith("/advertiser") || admin;
  if (pathname === "/admin7/login" || pathname === "/landing") return <>{children}</>;
  return (
    <>
      <div className={cn("app-shell", workspace && "workspace")}>
        {workspace ? <WorkspacePanel kind={admin ? "admin" : "advertiser"} /> : <DiscoveryPanel />}
        <main className="main-panel" id="main-panel">
          <Topbar workspace={workspace} />
          <div className={cn("main-content", !workspace && "pb-4")}>{hydrated ? children : <ShellSkeleton />}</div>
          {!workspace && <BottomNav />}
        </main>
      </div>
    </>
  );
}

function ShellSkeleton() {
  return (
    <div className="px-4 md:px-5 pt-4 space-y-3 min-h-[80vh]" aria-busy="true" aria-label="불러오는 중">
      <div className="skeleton-block h-12" />
      <div className="flex gap-2">{[72, 84, 84, 96].map((w, i) => <div key={i} className="skeleton-block h-9 rounded-full" style={{ width: w }} />)}</div>
      <div className="skeleton-block h-[220px]" />
      <div className="grid grid-cols-2 gap-3"><div className="skeleton-block h-[180px]" /><div className="skeleton-block h-[180px]" /></div>
      <div className="skeleton-block h-[120px]" />
    </div>
  );
}
