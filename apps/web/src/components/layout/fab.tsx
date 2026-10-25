import Link from "next/link";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";

/** 컬럼 우하단 플로팅 버튼 (유니웨이 float-write) — 페이지 콘텐츠 마지막에 배치, sticky로 하단 탭 위에 고정 */
export function Fab({ href, label, icon = "edit" }: { href: string; label: string; icon?: LineIconName }) {
  return (
    <div className="sticky bottom-[80px] z-20 flex justify-end pr-4 pointer-events-none mt-4">
      <Link href={href} className="pointer-events-auto inline-flex items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-red text-paper font-bold text-[14px] shadow-red hover:bg-red-700 active:scale-[.98] transition-all">
        <LineIcon name={icon} className="h-5 w-5" strokeWidth={1.6} />{label}
      </Link>
    </div>
  );
}
