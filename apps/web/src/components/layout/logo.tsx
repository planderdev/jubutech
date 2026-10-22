import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import wordmark from "../../../public/logo/jubutech-wordmark.png";
import wordmarkWhite from "../../../public/logo/jubutech-wordmark-white.png";
import wordmarkInk from "../../../public/logo/jubutech-wordmark-ink.png";
import wordmarkEn from "../../../public/logo/jubutech-wordmark-en.png";
import wordmarkEnWhite from "../../../public/logo/jubutech-wordmark-en-white.png";
import wordmarkEnInk from "../../../public/logo/jubutech-wordmark-en-ink.png";

/**
 * 공식 워드마크 (public/logo/jubutech-wordmark.png — `npm run logo` 로 design/logo-source.png 에서 생성)
 * 기본은 영문 워드마크 JUBUTECH(2026-10-08 사용자 요청). lang="ko"면 한글 "주부테크". light: 블랙/레드 배경용 흰색판 · ink: 잉크 단색판 · stamp: 레드 면 위 흰 워드마크
 */
export function Logo({ className, size = "md", stamp, light, ink, lang = "en" }: { className?: string; size?: "sm" | "md" | "lg" | "xl"; stamp?: boolean; light?: boolean; ink?: boolean; lang?: "en" | "ko" }) {
  const h = { sm: 20, md: 24, lg: 32, xl: 44 }[size];
  const set = lang === "en" ? { base: wordmarkEn, white: wordmarkEnWhite, ink: wordmarkEnInk } : { base: wordmark, white: wordmarkWhite, ink: wordmarkInk };
  const src = stamp || light ? set.white : ink ? set.ink : set.base;
  const img = <Image src={src} alt="주부테크" height={h} width={Math.round(h * (set.base.width / set.base.height))} priority className="block w-auto" style={{ height: h }} />;
  if (stamp)
    return (
      <Link href="/" className={cn("inline-flex items-center bg-red rounded-md px-2.5 py-1.5", className)} aria-label="주부테크 홈">{img}</Link>
    );
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="주부테크 홈">{img}</Link>
  );
}

/** 앱 아이콘(레드 라운드 스퀘어 + '주') — 아바타/파비콘 대용 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return <Image src="/logo/app-icon-192.png" alt="" width={size} height={size} className={cn("rounded-[22%]", className)} aria-hidden />;
}
