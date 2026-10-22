import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LineIcon, type LineIconName } from "@/components/ui/line-icon";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/feature/avatar";
import { Reveal, CountUp, FloatIn } from "@/components/landing/motion";
import { Phone } from "@/components/landing/phone";
import { Faq } from "@/components/landing/faq";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "주부테크 — 주부의 일상이 돈이 되는 곳" },
  description: "지원금 찾기, 영수증 인증, 체험단 미션, 매매일지까지. 현명한 소비도 소소한 공부도 모두 재테크가 되는 3040 주부 생활경제 커뮤니티.",
  alternates: { canonical: "/landing" },
};

const VALUES: { k: string; ko: string; desc: string; icon: LineIconName }[] = [
  { k: "SAVE", ko: "아끼기", desc: "지원금·카드혜택·마감할인, 놓친 돈부터 찾아드려요", icon: "basket" },
  { k: "LEARN", ko: "공부하기", desc: "ETF·연금·카드, 5분 금융 기초를 읽으면 포인트", icon: "study" },
  { k: "EARN", ko: "벌기", desc: "체험단·설문·영수증 후기, 검증된 미션으로 실제 수익", icon: "coin" },
  { k: "GROW", ko: "불리기", desc: "종목 추천 대신 기준을 기록하는 매매일지", icon: "stock" },
  { k: "CAREER", ko: "다시 일하기", desc: "미션 수행 이력이 포트폴리오가 되고 재택 일자리로", icon: "hand" },
];

const STEPS = [
  { n: "01", title: "정보를 발견해요", desc: "관심사·지역·자녀 나이에 맞춘 지원금과 미션이 매일 도착해요.", icon: "info" as LineIconName },
  { n: "02", title: "행동하고 인증해요", desc: "신청하고, 영수증 찍고, 후기 쓰고, 매매일지를 남겨요.", icon: "camera" as LineIconName },
  { n: "03", title: "포인트와 수익이 쌓여요", desc: "포인트·기프티콘·활동비로 돌아오고, 경험은 커뮤니티에 남아요.", icon: "gift" as LineIconName },
];

const FEATURES: { title: string; desc: string; bullets: string[]; img: string; href: string; cta: string }[] = [
  { title: "돈되는 정보", desc: "정책·지원금·카드혜택을 출처와 기준일까지 표기해 정리해요. 저장만 해도 포인트.", bullets: ["마감 D-day 알림", "지역·자녀 나이 맞춤", "신청 방법 단계별 안내"], img: "/landing/app-home.webp", href: "/info", cta: "정보 둘러보기" },
  { title: "체험단 · 미션", desc: "검증된 광고주 캠페인에 응모하고, 선정되면 미션 후 보상을 받아요. 선입금 요구 캠페인은 올라오지 않아요.", bullets: ["인스타·블로그·영수증·설문", "응모 → 선정 → 미션 → 보상", "제품 · 포인트 · 활동비"], img: "/landing/app-campaigns.webp", href: "/campaigns", cta: "모집중 캠페인 보기" },
  { title: "매매일지", desc: "수익 자랑이 아니라 기준 복기. 6항목 체크리스트와 손절선을 미리 적고, 월·주·일 캘린더로 손익 흐름을 봐요.", bullets: ["트레이딩 체크리스트 6항목", "월/주/일 손익 캘린더", "월 목표 · 승률 · 체크리스트 평균"], img: "/landing/app-stock.webp", href: "/stock", cta: "매매일지 써보기" },
];

const REVIEWS = [
  { name: "서연맘", region: "경기 성남 · 7세 자녀", text: "둘째 등원시키고 오전 두 시간. 체험단 두 개랑 설문 세 개로 이번 주 18만원. 처음엔 몇 천원이었는데 6개월 하니까 루틴이 생겼어요.", amount: "+187,000원" },
  { name: "지혜의숲", region: "서울 마포 · 주식 3년차", text: "매매일지 쓰고 나서 손절이 빨라졌어요. 체크리스트 4개 이상 지킨 매매만 세어보니 승률이 41%에서 58%로.", amount: "승률 58%" },
  { name: "민정살림", region: "제주 · 쌍둥이", text: "아이돌봄 본인부담금 지원, 여기서 보고 신청했어요. 맞벌이 아니어도 된다는 걸 몰랐으면 그냥 지나쳤을 거예요.", amount: "월 100,000원" },
];

export default function LandingPage() {
  return (
    <div className="bg-canvas text-ink">
      {/* 플로팅 내비 */}
      <header className="sticky top-4 z-40 px-4">
        <div className="mx-auto max-w-6xl h-14 rounded-full bg-paper/90 backdrop-blur shadow-card flex items-center px-5 gap-6">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-5 text-[14px] font-semibold text-ink-2" aria-label="랜딩 메뉴">
            {[["#value", "서비스"], ["#how", "어떻게 벌어요"], ["#features", "기능"], ["#reviews", "후기"], ["#brands", "광고주"]].map(([h, l]) => <a key={h} href={h} className="hover:text-red transition-colors cursor-pointer">{l}</a>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="hidden sm:block"><Button size="sm" variant="ghost">앱 둘러보기</Button></Link>
            <Link href="/login"><Button size="sm">시작하기</Button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 md:pt-24 md:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label text-red mb-4">3040 주부를 위한 생활경제 커뮤니티</p>
              <h1 className="display text-[38px] sm:text-[48px] md:text-[60px] leading-[1.12] break-keep">
                주부의 일상이<br /><span className="text-red">돈</span>이 되는 곳
              </h1>
              <p className="mt-6 text-[16px] md:text-[18px] text-ink-2 max-w-lg leading-relaxed break-keep">
                현명한 소비도, 소소한 공부도 모두 재테크가 됩니다. 지원금을 찾고, 영수증을 인증하고, 체험단 미션을 하고, 매매일지를 쓰는 하루가 포인트와 실제 수익으로 이어져요.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login"><Button size="lg">3초 만에 시작하기<LineIcon name="arrowRight" className="h-4 w-4" /></Button></Link>
                <Link href="/"><Button size="lg" variant="secondary">앱 둘러보기</Button></Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-2">
                {["가입 시 1,000P", "종목 추천 없음", "선입금 캠페인 차단", "자녀 정보 미수집"].map((t) => <li key={t} className="inline-flex items-center gap-1.5"><LineIcon name="check" className="h-4 w-4 text-red" />{t}</li>)}
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <FloatIn className="relative">
              <Phone src="/landing/app-home.webp" alt="주부테크 앱 홈 화면" priority />
              <div className="absolute -left-10 top-16 hidden sm:block rounded-xl bg-paper shadow-card px-3.5 py-2.5">
                <p className="label text-ink-3">이번 주 첫 수익</p>
                <p className="num text-[18px] font-extrabold text-red"><CountUp to={187000} prefix="+" suffix="원" /></p>
              </div>
              <div className="absolute -right-6 bottom-24 hidden sm:block rounded-xl bg-stage text-paper shadow-card px-3.5 py-2.5">
                <p className="label text-paper/60">이달 지급 포인트</p>
                <p className="num text-[18px] font-extrabold"><CountUp to={4183000} suffix="P" /></p>
              </div>
            </FloatIn>
          </div>
        </div>
      </section>

      {/* 활동 티커 */}
      <div className="border-y border-hairline bg-paper overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee" aria-hidden>
          {Array.from({ length: 2 }).flatMap((_, k) => [["서연맘", "+187,000원 인증"], ["지혜의숲", "+412,000원 인증"], ["하은이네", "AI 검수 부업 후기"], ["민정살림", "아이돌봄 지원금 신청"], ["유진의 가계부", "파킹통장 3.5% 이동"], ["그린테이블", "밀키트 체험단 15명 모집"]].map(([n, t], i) => (
            <span key={`${k}-${i}`} className="inline-flex items-center gap-2 px-6 py-3 text-[13px]"><span className="h-1.5 w-1.5 rounded-full bg-red" /><b>{n}</b> 님 · {t}</span>
          )))}
        </div>
      </div>

      {/* 숫자 */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[["이번 달 소득 회원", 1284, "명"], ["누적 지급 포인트", 38200000, "P"], ["진행 캠페인", 27, "건"], ["기록된 매매일지", 9410, "건"]].map(([k, v, s]) => (
              <div key={k as string} className="rounded-xl bg-paper shadow-soft p-5"><p className="label text-ink-3">{k as string}</p><p className="num text-[26px] md:text-[30px] font-extrabold mt-1 text-ink"><CountUp to={v as number} suffix={s as string} /></p></div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-3">* 서비스 오픈 준비 중인 데모 수치입니다.</p>
        </Reveal>
      </section>

      {/* 5 가치 */}
      <section id="value" className="mx-auto max-w-6xl px-4 py-10 md:py-16 scroll-mt-24">
        <Reveal>
          <p className="label text-red">서비스</p>
          <h2 className="display text-[28px] md:text-[40px] mt-2 break-keep">아끼고, 공부하고, 벌고, 불리고,<br className="hidden md:block" /> 다시 일하는 다섯 가지 루프</h2>
        </Reveal>
        <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.k} as="li" delay={i * 0.06} className={cn("rounded-xl p-5 shadow-soft", v.k === "EARN" ? "bg-red text-paper shadow-red" : "bg-paper")}>
              <span className={cn("h-11 w-11 rounded-2xl inline-flex items-center justify-center", v.k === "EARN" ? "bg-paper/15" : "bg-inset text-red")}><LineIcon name={v.icon} className="h-6 w-6" /></span>
              <p className={cn("display text-[20px] mt-4", v.k === "EARN" ? "" : "text-red")}>{v.k} <span className={cn("text-[14px] font-semibold", v.k === "EARN" ? "text-paper/80" : "text-ink-2")}>{v.ko}</span></p>
              <p className={cn("text-[13px] mt-1.5 leading-relaxed break-keep", v.k === "EARN" ? "text-paper/85" : "text-ink-2")}>{v.desc}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 어떻게 */}
      <section id="how" className="bg-stage text-paper py-16 md:py-24 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="label text-red">어떻게 돈이 되나요</p>
            <h2 className="display text-[28px] md:text-[40px] mt-2 break-keep">정보를 알려주는 곳에서,<br />돈 벌 기회를 주는 곳으로</h2>
          </Reveal>
          <ol className="mt-10 grid md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} as="li" delay={i * 0.08} className="rounded-2xl bg-paper/[.06] border border-paper/10 p-6">
                <div className="flex items-center justify-between"><span className="num text-[13px] font-bold text-red">{s.n}</span><span className="h-10 w-10 rounded-xl bg-paper/10 inline-flex items-center justify-center"><LineIcon name={s.icon} className="h-5 w-5 text-red" /></span></div>
                <p className="display text-[20px] mt-5">{s.title}</p>
                <p className="text-[14px] text-paper/70 mt-2 leading-relaxed break-keep">{s.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 기능 */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:py-24 space-y-16 scroll-mt-24">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} className={cn("grid lg:grid-cols-12 gap-8 items-center", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
            <div className="lg:col-span-6">
              <p className="label text-red">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="display text-[26px] md:text-[34px] mt-2">{f.title}</h3>
              <p className="mt-3 text-[15px] md:text-[16px] text-ink-2 leading-relaxed break-keep max-w-md">{f.desc}</p>
              <ul className="mt-5 space-y-2">{f.bullets.map((b) => <li key={b} className="flex items-center gap-2 text-[14px]"><span className="h-5 w-5 rounded-full bg-red-100 text-red inline-flex items-center justify-center"><LineIcon name="check" className="h-3 w-3" strokeWidth={2} /></span>{b}</li>)}</ul>
              <Link href={f.href} className="inline-block mt-6"><Button variant="ink">{f.cta}<LineIcon name="arrowRight" className="h-4 w-4" /></Button></Link>
            </div>
            <div className="lg:col-span-6 flex justify-center"><div className="rounded-3xl bg-inset p-8 md:p-10"><Phone src={f.img} alt={`주부테크 ${f.title} 화면`} /></div></div>
          </Reveal>
        ))}
      </section>

      {/* 후기 */}
      <section id="reviews" className="bg-paper py-16 md:py-24 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="label text-red">회원 이야기</p>
            <h2 className="display text-[28px] md:text-[40px] mt-2">작은 활동이 진짜 수익이 된 순간</h2>
          </Reveal>
          <ul className="mt-8 grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} as="li" delay={i * 0.08} className="rounded-2xl bg-canvas p-6 flex flex-col">
                <p className="num text-[22px] font-extrabold text-red">{r.amount}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink break-keep flex-1">“{r.text}”</p>
                <div className="mt-5 flex items-center gap-3"><Avatar name={r.name} /><div><p className="text-[14px] font-bold">{r.name}</p><p className="text-[12px] text-ink-3">{r.region}</p></div></div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 광고주 */}
      <section id="brands" className="mx-auto max-w-6xl px-4 py-16 md:py-24 scroll-mt-24">
        <Reveal className="rounded-3xl bg-stage text-paper p-8 md:p-14 grid lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
          <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red/30 blur-3xl" aria-hidden />
          <div className="lg:col-span-7 relative">
            <p className="label text-red">For Brands</p>
            <h2 className="display text-[26px] md:text-[36px] mt-2 break-keep">구매 결정권을 가진 주부에게,<br />진짜 후기로 닿으세요</h2>
            <p className="mt-4 text-[15px] text-paper/70 leading-relaxed break-keep max-w-lg">식품·생활가전·육아·반려·금융·지역 매장. 캠페인 등록 → 주부테크 검수 → 맞춤 추천 → 결과 보고서까지, 셀프 등록 5분이면 충분해요.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/advertiser/campaigns/new"><Button size="lg">캠페인 열기</Button></Link><Link href="/advertiser"><Button size="lg" variant="soft" className="bg-paper/10 text-paper hover:bg-paper/20">광고주 센터</Button></Link></div>
          </div>
          <ul className="lg:col-span-5 grid grid-cols-2 gap-3 relative">
            {[["도달", "구매력 검증된 3040 주부"], ["콘텐츠", "릴스·블로그·영수증 후기"], ["세분화", "지역 · 생애주기 · 관심사"], ["보고", "도달·참여·UGC 통합 리포트"]].map(([k, v]) => <li key={k} className="rounded-xl bg-paper/[.06] border border-paper/10 p-4"><p className="label text-red">{k}</p><p className="text-[14px] mt-1 break-keep">{v}</p></li>)}
          </ul>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <Reveal><p className="label text-red">자주 묻는 질문</p><h2 className="display text-[26px] md:text-[34px] mt-2">궁금한 점</h2></Reveal>
        <Faq />
      </section>

      {/* 최종 CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal className="rounded-3xl bg-red text-paper p-10 md:p-16 text-center shadow-red">
          <h2 className="display text-[28px] md:text-[44px] break-keep">오늘 장본 영수증 한 장으로<br />시작해 보세요</h2>
          <p className="mt-3 text-paper/85 text-[15px]">가입 즉시 1,000P. 첫 인증까지 3분.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/login"><Button size="lg" variant="ink">카카오 · 네이버로 시작</Button></Link><Link href="/"><Button size="lg" variant="soft" className="bg-paper/15 text-paper hover:bg-paper/25">먼저 둘러보기</Button></Link></div>
        </Reveal>
      </section>

      <footer className="border-t border-hairline bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-[1fr_auto] text-[13px]">
          <div><Logo size="md" /><p className="mt-3 text-ink-2">주부의 일상이 돈이 되는 곳 · <a href="https://instagram.com/jubutech2026" className="text-red font-semibold">@jubutech2026</a></p><p className="mt-2 text-[12px] text-ink-3 max-w-xl leading-relaxed">주부테크는 금융투자상품의 종목 추천이나 투자자문을 제공하지 않습니다. 모든 금융 정보에는 출처와 기준일을 표기하며, 광고·협찬 콘텐츠는 [광고] [체험단]으로 표시합니다.</p></div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-semibold text-ink-2 md:flex-col md:items-end">{[["/", "앱 홈"], ["/campaigns", "체험단"], ["/stock", "매매일지"], ["/advertiser", "광고·제휴"], ["/design-system", "디자인 시스템"]].map(([h, l]) => <li key={h}><Link href={h} className="hover:text-red">{l}</Link></li>)}</ul>
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-8 text-[12px] text-ink-3">© 2026 JubuTech</p>
      </footer>
    </div>
  );
}
