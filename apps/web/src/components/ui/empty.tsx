import { LineIcon, type LineIconName } from "@/components/ui/line-icon";

export function EmptyState({ icon = "receipt", title, description, action }: { icon?: LineIconName; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-paper shadow-soft px-6 py-12 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-inset flex items-center justify-center">
        <LineIcon name={icon} className="h-8 w-8 text-red" />
      </div>
      <p className="display text-[18px]">{title}</p>
      {description && <p className="mt-1 text-[14px] text-ink-2">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
