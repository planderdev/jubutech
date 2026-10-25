"use client";
import { motion, useReducedMotion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** 스크롤 진입 시 페이드업 — prefers-reduced-motion 이면 즉시 표시 */
export function Reveal({ children, delay = 0, className, as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay }} className={className}>
      {children}
    </M>
  );
}

/** 숫자 카운트업 */
export function CountUp({ to, suffix = "", prefix = "", className }: { to: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  // SSR/크롤러에는 최종값을 보여주고, 뷰포트 진입 시 0→값으로 카운트업
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!inView || reduce) return;
    mv.set(0); setV(0);
    const c = animate(mv, to, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, reduce, mv]);
  return <span ref={ref} className={className}>{prefix}{v.toLocaleString("ko-KR")}{suffix}</span>;
}

/** 히어로 폰 목업 — 살짝 떠오르는 진입 + 호버 시 정지 */
export function FloatIn({ children, className, delay = 0.15 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay }} className={className}>
      {children}
    </motion.div>
  );
}
