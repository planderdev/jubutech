import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "stamp" | "ink" | "danger" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[.98]";

const variants: Record<Variant, string> = {
  primary: "bg-red text-paper hover:bg-red-700 shadow-red",
  ink: "bg-stage text-paper hover:bg-ink-2",
  secondary: "bg-paper text-ink border border-hairline hover:border-ink-3 shadow-soft",
  soft: "bg-inset text-ink-2 hover:bg-hairline",
  ghost: "bg-transparent text-ink-2 hover:bg-ink/5",
  danger: "bg-red-100 text-red hover:bg-red-200",
  stamp: "bg-red text-paper text-[11px] font-bold rounded-full px-2.5 py-1",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-sm",
  md: "h-11 px-5 text-[15px] rounded-md",
  lg: "h-[52px] px-7 text-[16px] rounded-lg",
  icon: "h-10 w-10 rounded-md",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", full, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], variant === "stamp" ? "" : sizes[size], full && "w-full", className)} {...props} />
  ),
);
Button.displayName = "Button";
