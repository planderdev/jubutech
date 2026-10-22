import { cn } from "@/lib/utils";

export function Card({ className, lift, children, as: Tag = "div", ...rest }: React.HTMLAttributes<HTMLElement> & { lift?: boolean; as?: "div" | "article" | "section" }) {
  return (
    <Tag className={cn("bg-paper rounded-xl shadow-soft", lift && "lift", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ index, title, more, href, className }: { index?: string; title: string; more?: string; href?: string; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-4", className)}>
      <div className="flex items-baseline gap-2.5">
        {index && <span className="label text-red">{index}</span>}
        <h2 className="display text-[22px] md:text-[26px]">{title}</h2>
      </div>
      {href && (
        <a href={href} className="label text-ink-3 hover:text-red">
          {more ?? "더보기"} →
        </a>
      )}
    </div>
  );
}
