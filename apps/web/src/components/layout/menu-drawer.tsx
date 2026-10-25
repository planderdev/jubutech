"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/ui/drawer";
import { Logo } from "./logo";
import { Avatar } from "@/components/feature/avatar";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { Button } from "@/components/ui/button";
import { useMe, useStore } from "@/lib/store";
import { logoutEverywhere } from "@/components/providers";
import { BOARDS, INFO_CATEGORIES } from "@/lib/types";
import { cn, fmtNum, todayStr as today } from "@/lib/utils";

/**
 * 햄버거 메뉴 기획
 *  1 프로필 헤더  — 아바타·닉네임·Lv·포인트, MY로 이동 / 비로그인 시 로그인 CTA
 *  2 오늘의 미션  — 영수증 인증·매매일지·응모 3칸 진행 (작은 체크)
 *  3 빠른 실행    — 글쓰기 · 매매일지 쓰기 · 영수증 인증
 *  4 둘러보기     — 홈 / 돈되는정보(+카테고리 칩) / 커뮤니티(+게시판 칩) / 체험단 / 매매일지
 *  5 내 활동      — 내 응모 · 저장한 정보 · 내가 쓴 글 · 포인트 내역 · 알림(미읽음 배지)
 *  6 서비스       — 공지·이벤트 · 광고·제휴 문의 · 질문/고객센터 · 약관
 *  7 하단         — 역할 전환(데모) / 로그아웃 · 버전
 */
export function MenuDrawer({ open, onClose, admin }: { open: boolean; onClose: () => void; admin?: boolean }) {
  const pathname = usePathname();
  const me = useMe();
  const role = useStore((s) => s.role);
  const unread = useStore((s) => s.notifications.filter((n) => n.userId === s.userId && !n.read).length);
  const apps = useStore((s) => s.applications.filter((a) => a.userId === s.userId && ["pending", "selected", "submitted"].includes(a.status)).length);
  const saved = useStore((s) => s.savedInfo.length);
  const myPosts = useStore((s) => s.posts.filter((p) => p.authorId === s.userId).length);
  const trades = useStore((s) => s.trades.filter((t) => t.userId === s.userId));
  const todayStr = today();
  const todayLog = useStore((s) => s.pointLogs.some((l) => l.userId === s.userId && l.createdAt.slice(0, 10) === todayStr && /영수증/.test(l.reason)));
  const todayTrade = trades.some((t) => t.createdAt.slice(0, 10) === todayStr || t.buyDate === todayStr);
  const todayApply = useStore((s) => s.applications.some((a) => a.userId === s.userId && a.createdAt.slice(0, 10) === todayStr));

  const Item = ({ href, icon, label, count, sub }: { href: string; icon: LineIconName; label: string; count?: number; sub?: React.ReactNode }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);
    return (
      <div>
        <Link href={href} onClick={onClose} className={cn("flex items-center gap-3 px-5 py-3 text-[15px] font-semibold", active ? "text-red" : "text-ink hover:bg-inset")}>
          <LineIcon name={icon} className={cn("h-5 w-5", active ? "text-red" : "text-ink-2")} />
          <span className="flex-1">{label}</span>
          {typeof count === "number" && count > 0 && <span className="num text-[11px] font-bold bg-red text-paper rounded-full px-1.5 py-0.5">{count}</span>}
          <LineIcon name="chevronRight" className="h-4 w-4 text-ink-3" />
        </Link>
        {sub && <div className="flex gap-1.5 flex-wrap px-5 pb-3 -mt-1">{sub}</div>}
      </div>
    );
  };
  const Sub = ({ href, label }: { href: string; label: string }) => <Link href={href} onClick={onClose} className="text-[12px] font-semibold text-ink-2 bg-inset rounded-full px-2.5 py-1 hover:bg-hairline">{label}</Link>;
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="py-2 border-t border-hairline"><p className="label text-ink-3 px-5 pt-3 pb-1">{title}</p>{children}</section>;

  if (admin)
    return (
      <Drawer open={open} onClose={onClose} title="관리자 메뉴">
        <div className="flex items-center justify-between h-14 px-4 border-b border-hairline"><Logo size="sm" /><button type="button" onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-inset" aria-label="메뉴 닫기"><LineIcon name="close" /></button></div>
        <nav className="flex-1 overflow-y-auto py-2">
          {([["/admin7", "대시보드", "home"], ["/admin7/users", "회원", "community"], ["/admin7/posts", "게시글·댓글", "comment"], ["/admin7/reports", "신고", "bell"], ["/admin7/campaigns", "캠페인 검수", "campaign"], ["/admin7/applications", "응모·미션", "check"], ["/admin7/info", "돈되는정보", "info"], ["/admin7/points", "포인트", "coin"], ["/admin7/notices", "공지", "bulb"], ["/admin7/logs", "운영 로그", "list"]] as [string, string, LineIconName][]).map(([h, l, i]) => <Item key={h} href={h} icon={i} label={l} />)}
        </nav>
        <div className="p-4 border-t border-hairline"><Button full variant="secondary" onClick={async () => { await fetch("/api/admin7/logout", { method: "POST" }); location.href = "/admin7/login"; }}>관리자 로그아웃</Button></div>
      </Drawer>
    );

  return (
    <Drawer open={open} onClose={onClose} title="전체 메뉴">
      <div className="flex items-center justify-between h-14 px-4 border-b border-hairline">
        <Logo size="sm" />
        <button type="button" onClick={onClose} className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-inset" aria-label="메뉴 닫기"><LineIcon name="close" /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* 1 프로필 */}
        <div className="p-4">
          {me ? (
            <Link href="/me" onClick={onClose} className="flex items-center gap-3 rounded-xl bg-inset p-3 hover:bg-hairline/60">
              <Avatar name={me.nickname} size="lg" image={me.image} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[15px] truncate">{me.nickname}님 <span className="label text-red ml-1">Lv.{me.level}</span></p>
                <p className="num text-[12px] text-ink-2">{fmtNum(me.points)}P · {me.region}</p>
              </div>
              <LineIcon name="chevronRight" className="h-4 w-4 text-ink-3" />
            </Link>
          ) : (
            <div className="rounded-xl bg-stage text-paper p-4">
              <p className="font-bold text-[15px]">3초 만에 시작하기</p>
              <p className="text-[12px] text-paper/70 mt-0.5">가입하면 관심사에 맞는 지원금·미션을 추천해 드려요.</p>
              <Link href="/login" onClick={onClose} className="block mt-3"><Button full size="sm">로그인 · 회원가입</Button></Link>
            </div>
          )}
          {/* 2 오늘의 미션 */}
          {me && (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {([["영수증 인증", todayLog, "/campaigns?c=all&ch=receipt", "receipt"], ["매매일지", todayTrade, "/stock", "stock"], ["응모 1건", todayApply, "/campaigns", "campaign"]] as [string, boolean, string, LineIconName][]).map(([l, done, h, i]) => (
                <Link key={l} href={h} onClick={onClose} className={cn("rounded-lg px-2 py-2 text-center", done ? "bg-sage-soft text-success" : "bg-paper border border-hairline text-ink-2")}>
                  <LineIcon name={done ? "check" : i} className="h-4 w-4 mx-auto" /><p className="text-[11px] font-semibold mt-1">{l}</p>
                </Link>
              ))}
            </div>
          )}
          {/* 3 빠른 실행 */}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <Link href="/community/write" onClick={onClose}><Button full size="sm" variant="ink"><LineIcon name="edit" className="h-4 w-4" />글쓰기</Button></Link>
            <Link href="/stock/new" onClick={onClose}><Button full size="sm" variant="secondary"><LineIcon name="plus" className="h-4 w-4" />매매일지</Button></Link>
            <Link href="/campaigns?ch=receipt" onClick={onClose}><Button full size="sm" variant="secondary"><LineIcon name="camera" className="h-4 w-4" />영수증</Button></Link>
          </div>
        </div>

        {/* 4 둘러보기 */}
        <Section title="둘러보기">
          <Item href="/" icon="home" label="홈" />
          <Item href="/info" icon="info" label="돈되는정보" sub={INFO_CATEGORIES.slice(0, 5).map((c) => <Sub key={c.key} href={`/info?c=${c.key}`} label={c.label} />)} />
          <Item href="/community" icon="community" label="커뮤니티" sub={BOARDS.slice(0, 6).map((b) => <Sub key={b.key} href={`/community?board=${b.key}`} label={b.label} />)} />
          <Item href="/campaigns" icon="campaign" label="체험단 · 미션" />
          <Item href="/stock" icon="stock" label="매매일지" />
        </Section>

        {/* 5 내 활동 */}
        {me && (
          <Section title="내 활동">
            <Item href="/campaigns/my" icon="check" label="내 응모 현황" count={apps} />
            <Item href="/info?c=saved" icon="heart" label="저장한 정보" count={saved} />
            <Item href="/community?board=income" icon="edit" label="내가 쓴 글" count={myPosts} />
            <Item href="/me" icon="coin" label="포인트 내역" />
            <Item href="/notifications" icon="bell" label="알림" count={unread} />
          </Section>
        )}

        {/* 6 서비스 */}
        <Section title="서비스">
          <Item href="/landing" icon="star" label="서비스 소개" />
          <Item href="/notices" icon="bulb" label="공지 · 이벤트" />
          {(role === "advertiser") && <Item href="/advertiser" icon="building" label="광고주 센터" />}
          {role !== "advertiser" && <Item href="/advertiser" icon="building" label="광고 · 제휴 문의" />}
          <Item href="/community?board=qna" icon="comment" label="질문 · 고객센터" />
        </Section>
      </div>

      {/* 7 하단 */}
      <div className="border-t border-hairline p-4 flex items-center justify-between text-[12px] text-ink-3">
        <div className="flex gap-3"><Link href="#" onClick={onClose} className="hover:text-red">이용약관</Link><Link href="#" onClick={onClose} className="hover:text-red">개인정보</Link><Link href="/login" onClick={onClose} className="hover:text-red">역할 전환(데모)</Link></div>
        {me ? <button type="button" onClick={() => { void logoutEverywhere(); onClose(); }} className="font-semibold text-ink-2 hover:text-red">로그아웃</button> : <span>v0.1</span>}
      </div>
    </Drawer>
  );
}
