import { cn } from "@/lib/utils";

type Tone = "red" | "ink" | "sage" | "butter" | "rose" | "sky" | "mute" | "outline" | "up" | "down";

const tones: Record<Tone, string> = {
  red: "bg-red text-paper",
  ink: "bg-stage text-paper",
  sage: "bg-sage-soft text-success",
  butter: "bg-butter-soft text-warning",
  rose: "bg-rose-soft text-red-700",
  sky: "bg-sky-soft text-info",
  mute: "bg-inset text-ink-3",
  outline: "bg-paper text-ink-2 border border-hairline",
  up: "bg-red-100 text-red",
  down: "bg-sky-soft text-info",
};

export function Badge({ tone = "outline", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-[5px] text-[11px] font-semibold leading-none whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}
