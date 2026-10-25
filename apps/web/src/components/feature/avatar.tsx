import { cn } from "@/lib/utils";

const palette = ["bg-red text-paper", "bg-stage text-paper", "bg-rose-soft text-red-700", "bg-sage-soft text-success", "bg-butter-soft text-warning", "bg-sky-soft text-info"];
export function Avatar({ name, size = "md", className, image }: { name: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string; image?: string }) {
  const s = { xs: "h-5 w-5 text-[10px]", sm: "h-7 w-7 text-[12px]", md: "h-9 w-9 text-[14px]", lg: "h-12 w-12 text-[18px]", xl: "h-20 w-20 text-[30px]" }[size];
  const tone = palette[name.charCodeAt(0) % palette.length];
  if (image) return <span className={cn("inline-block rounded-full overflow-hidden shrink-0 bg-inset", s, className)} aria-hidden><img src={image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /></span>;
  return <span className={cn("inline-flex items-center justify-center rounded-full font-bold shrink-0", s, tone, className)} aria-hidden>{name[0]}</span>;
}
