import { cn } from "@/lib/utils";

/**
 * 주부테크 라인 아이콘 — 레드 단선(stroke 1.2 — 2026-10-08 얇은 로고에 맞춰 1.5에서 조정, round cap/join, no fill)
 * 무드보드의 "MADE IDEAL / DAILY PICKS" 손그림 일러스트 조형 원칙을 따른다.
 */
const paths: Record<string, React.ReactNode> = {
  home: <><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></>,
  info: <><path d="M5 4h11l3 3v13H5z" /><path d="M8 9h8M8 12.5h8M8 16h5" /></>,
  community: <><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M3.5 19c.5-3.5 2.8-5.5 5.5-5.5s5 2 5.5 5.5" /><path d="M15 19c.2-2.2 1.4-3.8 3.3-4.2" /></>,
  campaign: <><path d="M4 9.5 15 6v12L4 14.5z" /><path d="M4 9.5v5" /><path d="M15 9.5c1.7 0 3 1.1 3 2.5s-1.3 2.5-3 2.5" /><path d="M6.5 14.5 8 19" /></>,
  my: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" /></>,
  stock: <><path d="M3 18 9 11l4 3.5L20 6" /><path d="M16 6h4v4" /></>,
  receipt: <><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" /><path d="M9 8h6M9 11.5h6M9 15h4" /></>,
  coin: <><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" /><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></>,
  basket: <><path d="M3 10h18l-2 9H5z" /><path d="M8 10l3-6M16 10l-3-6" /><path d="M9 14v2M12 14v2M15 14v2" /></>,
  baby: <><circle cx="12" cy="9" r="5" /><path d="M9.5 8.5v.5M14.5 8.5v.5" /><path d="M10 11.5c1 1 3 1 4 0" /><path d="M12 4c0-1.5 1-2 2-2" /><path d="M6 21c1-3.5 3.3-5 6-5s5 1.5 6 5" /></>,
  paw: <><ellipse cx="12" cy="15" rx="4" ry="3.2" /><circle cx="7" cy="10" r="1.6" /><circle cx="10.2" cy="6.8" r="1.6" /><circle cx="13.8" cy="6.8" r="1.6" /><circle cx="17" cy="10" r="1.6" /></>,
  gift: <><path d="M4 10h16v10H4z" /><path d="M4 7h16v3H4z" /><path d="M12 7v13" /><path d="M12 7c-1.5-3-5-3-5-1s3.5 1 5 1zm0 0c1.5-3 5-3 5-1s-3.5 1-5 1z" /></>,
  ribbon: <><path d="M12 12c-2 0-6-2-6-4.5S8.5 4 12 7c3.5-3 6-1.5 6 .5S14 12 12 12z" /><path d="M9 12l-3 8 3.5-2 2.5 2M15 12l3 8-3.5-2-2.5 2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m20 20-5-5" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7" /></>,
  heart: <><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></>,
  comment: <><path d="M4 5h16v11H9l-5 4z" /></>,
  arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  calendar: <><path d="M4 6h16v14H4z" /><path d="M4 10h16M8 3v5M16 3v5" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  chevronLeft: <><path d="m15 5-7 7 7 7" /></>,
  chevronRight: <><path d="m9 5 7 7-7 7" /></>,
  bag: <><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  bulb: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M8.5 14A5.5 5.5 0 1 1 15.5 14c-.8.8-1.5 1.5-1.5 3h-4c0-1.5-.7-2.2-1.5-3z" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  edit: <><path d="m4 20 4-1L19 8l-3-3L5 16z" /><path d="m14 7 3 3" /></>,
  trash: <><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" /></>,
  noodle: <><path d="M4 12h16v2a8 8 0 0 1-16 0z" /><path d="M8 12V6M12 12V5M16 12V6" /><path d="M7 4c1 1 3 1 4 0s3-1 4 0" /></>,
  chef: <><path d="M8 10a4 4 0 1 1 8 0v1H8z" /><path d="M9 11v4h6v-4" /><path d="M7 18c1.5-1 3-1.5 5-1.5s3.5.5 5 1.5" /><path d="M12 6V4" /></>,
  hand: <><path d="M8 13V6a1.5 1.5 0 0 1 3 0v6" /><path d="M11 12V5a1.5 1.5 0 0 1 3 0v7" /><path d="M14 12V7a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-6 7-3 0-4.5-1.5-6.5-4.5L5 12a1.4 1.4 0 0 1 2.4-1.5L8 12" /></>,
  bank: <><path d="M4 10 12 5l8 5H4z" /><path d="M6 10v7M10 10v7M14 10v7M18 10v7" /><path d="M4 19h16" /></>,
  card: <><path d="M3 7h18v11H3z" /><path d="M3 11h18" /><path d="M7 15h4" /></>,
  study: <><path d="M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z" /><path d="M20 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z" /></>,
  star: <><path d="m12 4 2.4 5 5.6.7-4 3.8 1 5.5-5-2.7-5 2.7 1-5.5-4-3.8L9.6 9z" /></>,
  share: <><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></>,
  filter: <><path d="M4 6h16l-6 7v5l-4 2v-7z" /></>,
  camera: <><path d="M4 8h4l1.5-2h5L16 8h4v11H4z" /><circle cx="12" cy="13" r="3" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11 7.3" /><path d="M14 10a4 4 0 0 0-5.7 0L6 12.3a4 4 0 0 0 5.7 5.7l1.3-1.3" /></>,
  building: <><path d="M5 21V4h9v17M14 9h5v12" /><path d="M8 8h3M8 12h3M8 16h3M16 13h1M16 17h1" /></>,
  cat: <><path d="M6 9 5 4l4 3h6l4-3-1 5a7 7 0 1 1-12 0z" /><path d="M9.5 12h.01M14.5 12h.01" /><path d="M11 14.5c.5.5 1.5.5 2 0" /></>,
};

export type LineIconName = keyof typeof paths;

export function LineIcon({ name, className, strokeWidth = 1.2, title }: { name: LineIconName; className?: string; strokeWidth?: number; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(paths) as LineIconName[];
