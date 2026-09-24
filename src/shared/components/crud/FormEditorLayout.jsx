import { cn } from "@/shared/utils/utils";

export function FormEditorLayout({ actions, className = "", contentClassName = "", children, asCard = true, bare = false }) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start", !bare && "p-5 sm:p-6", className)}>
      <div className={cn("w-full min-w-0 flex-1", contentClassName)}>
        {asCard ? <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-300/60">{children}</div> : children}
      </div>
      {actions ? (
        <aside className="hidden w-40 shrink-0 flex-col gap-3 lg:sticky lg:top-4 lg:flex">{actions}</aside>
      ) : null}
    </div>
  );
}