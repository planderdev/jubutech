export const fmtWon = (n: number) => `${n.toLocaleString("ko-KR")}원`;
export const fmtNum = (n: number) => n.toLocaleString("ko-KR");
export const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
export const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const dday = (iso: string) => {
  const ms = new Date(iso + "T23:59:59").getTime() - Date.now();
  const d = Math.ceil(ms / 86400000);
  return d < 0 ? "마감" : d === 0 ? "D-DAY" : `D-${d}`;
};
export const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return iso.slice(5, 10).replace("-", ".");
};

/** 수익차곡식 손익 표기: ±14.99만원 / ±5,000원 */
export const fmtManwon = (n: number, sign = true) => {
  const a = Math.abs(n);
  const s = n > 0 && sign ? "+" : n < 0 ? "-" : "";
  if (a >= 100000000) return `${s}${(a / 100000000).toFixed(2).replace(/\.?0+$/, "")}억원`;
  if (a >= 10000) return `${s}${(a / 10000).toFixed(2).replace(/\.?0+$/, "")}만원`;
  return `${s}${a.toLocaleString("ko-KR")}원`;
};
