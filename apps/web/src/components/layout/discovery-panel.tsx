"use client";
import Link from "next/link";
import { Logo } from "./logo";
import { useStore } from "@/lib/store";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { Avatar } from "@/components/feature/avatar";
import { fmtNum } from "@/lib/utils";

const STARTS: { k: string; title: string; sub: string; href: string; icon: LineIconName; cta: string; dark?: boolean }[] = [
  { k: "SUBSIDY", title: "지원금", sub: "놓친 돈부터 찾기", href: "/info?c=subsidy", icon: "gift", cta: "이번 달 지원금 보기" },
  { k: "MISSION", title: "체험단", sub: "오늘 바로 벌기", href: "/campaigns", icon: "campaign", cta: "모집중 캠페인 보기" },
  { k: "JOURNAL", title: "매매일지", sub: "기준을 기록하기", href: "/stock", icon: "stock", cta: "체크리스트 쓰기" },
];

/** 유니웨이 discovery-panel: 로고·태그라인 → "어디서 시작할까요" 카드 → 함께하면 좋은 사람 → 가이드 → 사이드 푸터 */
export function DiscoveryPanel() {
  const users = useStore((s) => s.users.filter((u) => u.role === "member").slice(0, 3));
  const posts = useStore((s) => s.posts.filter((p) => p.income).slice(0, 2));
  return (
    <aside className="discovery-panel" aria-label="탐색 및 서비스 안내">
      <Logo size="xl" />
      <p className="mt-2 text-[14px] text-ink-2">주부의 일상이 돈이 되는 곳</p>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[16px] font-bold">오늘 뭐부터 할까요?</h2><Link href="/info" className="text-[12px] text-ink-3 hover:text-red">전체 보기 ↗</Link></div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {STARTS.map((s) => (
            <Link key={s.k} href={s.href} className={`lift shrink-0 w-[164px] h-[236px] rounded-xl p-4 flex flex-col relative overflow-hidden ${s.dark ? "bg-stage text-paper" : "bg-paper shadow-soft"}`}>
              <span className={`text-[10px] font-bold tracking-wide ${s.dark ? "text-paper/60" : "text-ink-3"}`}>{s.k}</span>
              <p className="display text-[26px] mt-1">{s.title}</p>
              <p className={`text-[12px] mt-0.5 ${s.dark ? "text-paper/70" : "text-ink-2"}`}>{s.sub}</p>
              <LineIcon name={s.icon} className="text-red h-14 w-14 mt-auto mb-10 self-center" strokeWidth={1.2} />
              <span className={`absolute left-3 right-3 bottom-3 rounded-full text-[11px] font-semibold px-3 py-2 text-center ${s.dark ? "bg-paper/15 text-paper" : "bg-inset text-ink"}`}>{s.cta} ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[16px] font-bold">이번 주 첫 수익</h2><Link href="/community?board=income" className="text-[12px] text-ink-3 hover:text-red">더 보기 ↗</Link></div>
        <div className="space-y-2">
          {posts.map((p) => {
            const u = users.find((x) => x.id === p.authorId) ?? users[0];
            return (
              <Link key={p.id} href={`/community/${p.id}`} className="lift flex items-center gap-3 bg-paper rounded-xl shadow-soft p-3.5">
                <Avatar name={u.nickname} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold truncate">{u.nickname} <span className="text-ink-3 font-medium">· {u.region.split(" ")[0]}</span></p>
                  <p className="text-[12px] text-ink-2 truncate">{p.title}</p>
                </div>
                <span className="num text-[13px] font-bold text-red shrink-0">+{fmtNum(p.income ?? 0)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8 pt-6 border-t border-hairline flex gap-3">
        <LineIcon name="study" className="text-red h-6 w-6 shrink-0" />
        <div>
          <p className="text-[14px] font-bold">처음이라 궁금한 게 많다면</p>
          <p className="text-[12px] text-ink-2 mt-0.5">ETF·연금·카드 혜택, 5분 금융 기초</p>
          <Link href="/info?c=finance" className="inline-block mt-2 text-[13px] font-semibold text-red">차근차근 공부하기 →</Link>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-hairline text-[12px] text-ink-3 space-y-2">
        <p className="text-[13px] text-ink-2">작은 활동도, 모두 재테크가 되도록.</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1"><Link href="/advertiser" className="hover:text-red">광고·제휴 문의</Link><Link href="/community?board=free" className="hover:text-red">공지사항</Link><Link href="/login" className="hover:text-red">설정</Link></div>
        <div className="flex flex-wrap gap-x-3 gap-y-1"><Link href="/landing" className="hover:text-red">서비스 소개</Link><Link href="/design-system" className="hover:text-red">디자인 시스템</Link><Link href="/advertiser" className="hover:text-red">광고주 센터</Link></div>
        <p>© JubuTech · 생활경제 커뮤니티 데모</p>
      </div>
    </aside>
  );
}
