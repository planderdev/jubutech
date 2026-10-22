import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, action, className }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 py-6 md:py-8", className)}>
      <div>
        {eyebrow && <p className="label text-red mb-2">{eyebrow}</p>}
        <h1 className="display text-[26px] md:text-[34px]">{title}</h1>
        {description && <p className="mt-2 text-[14px] md:text-[15px] text-ink-2 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
