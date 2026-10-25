"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";

export function RoleGate({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const role = useStore((s) => s.role);
  const hydrated = useStore((s) => s.hydrated);
  if (!hydrated) return <div className="container py-16 text-center label text-ink-3">불러오는 중…</div>;
  if (!allow.includes(role))
    return (
      <div className="container py-12 max-w-lg">
        <EmptyState icon="my" title="로그인이 필요해요" description={allow.includes("member") ? "주부테크 회원만 이용할 수 있어요." : "광고주 계정으로 로그인해 주세요."} action={<Link href="/login"><Button>로그인 · 역할 전환</Button></Link>} />
      </div>
    );
  return <>{children}</>;
}
