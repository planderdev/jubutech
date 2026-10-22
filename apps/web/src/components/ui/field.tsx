import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ children, hint, required, className }: { children: React.ReactNode; hint?: string; required?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between mb-1.5", className)}>
      <span className="label text-ink-2">
        {children}
        {required && <span className="text-red ml-1">*</span>}
      </span>
      {hint && <span className="text-[12px] text-ink-3">{hint}</span>}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn("field", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn("field min-h-[96px] resize-y", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select ref={ref} className={cn("field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23141210%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_12px_center] pr-8", className)} {...p}>
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({ label, hint, required, children, error }: { label: string; hint?: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <label className="block">
      <Label hint={hint} required={required}>{label}</Label>
      {children}
      {error && <p className="mt-1 text-[12px] text-red">{error}</p>}
    </label>
  );
}
