import { cn } from "@/shared/utils/utils";

export function FormEditorLayout({ actions, className = "", contentClassName = "", children, asCard = true }) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:gap-5", className)}>
      <div className={cn("w-full min-w-0 flex-1", contentClassName)}>
        {asCard ? <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">{children}</div> : children}
      </div>
      {actions ? (
        <aside className="hidden w-44 shrink-0 lg:sticky lg:top-5 lg:block">{actions}</aside>
      ) : null}
    </div>
  );
}