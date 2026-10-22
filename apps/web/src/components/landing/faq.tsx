"use client";
import { useState } from "react";
import { LineIcon } from "@/components/ui/line-icon";
import { cn } from "@/lib/utils";

const ITEMS = [
  { q: "정말 무료인가요? 나중에 돈을 내야 하나요?", a: "회원 이용은 무료예요. 수익은 광고주 캠페인 운영비에서 나오고, 회원에게 선입금·교육비·보증금을 요구하는 캠페인은 검수에서 걸러집니다." },
  { q: "주식 종목을 추천해 주나요?", a: "아니요. 주부테크는 종목 추천·리딩을 하지 않아요. 매매일지는 체크리스트와 손절선을 미리 적어 스스로 기준을 지키도록 돕는 도구입니다." },
  { q: "포인트는 어떻게 쓰나요?", a: "기프티콘 교환과 활동비 정산에 사용해요. 체험단 미션 완료 보상은 광고주 검수 후 3일 내 지급됩니다." },
  { q: "아이 사진이나 정보를 올려야 하나요?", a: "아니요. 자녀 정보는 수집하지 않으며, 자녀 개인정보를 요구하는 캠페인은 등록되지 않습니다." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="mt-6 divide-y divide-hairline rounded-2xl bg-paper shadow-soft">
      {ITEMS.map((it, i) => {
        const on = open === i;
        return (
          <li key={it.q}>
            <button type="button" onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer">
              <span className="flex-1 text-[15px] font-bold">{it.q}</span>
              <LineIcon name="chevronRight" className={cn("h-4 w-4 text-ink-3 transition-transform duration-200", on && "rotate-90")} />
            </button>
            <div className={cn("grid transition-[grid-template-rows] duration-200 ease-out", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><div className="overflow-hidden"><p className="px-5 pb-5 text-[14px] text-ink-2 leading-relaxed break-keep">{it.a}</p></div></div>
          </li>
        );
      })}
    </ul>
  );
}
