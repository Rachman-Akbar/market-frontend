import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

export function PanelHeader({
  eyebrow,
  title,
  userName,
  roleLabel,
  searchPlaceholder,
  actionHref,
  actionLabel,
  accentTextClassName,
  avatarClassName,
  focusClassName,
  actionClassName,
  notificationClassName,
  mobileNavigation,
}) {
  const initial = userName?.slice(0, 1)?.toUpperCase() || "U";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", accentTextClassName)}>
              {eyebrow}
            </p>
            <h1 className="truncate text-base font-extrabold text-slate-950">{title}</h1>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <div className={cn(
              "flex w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white",
              focusClassName,
            )}>
              <span className="material-symbols-outlined mr-2 text-[20px] text-slate-400">
                search
              </span>
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actionHref ? (
              <Link
                to={actionHref}
                className={cn("hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition sm:inline-flex", actionClassName)}
              >
                {actionLabel}
              </Link>
            ) : null}
            <button
              type="button"
              className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition", notificationClassName)}
              aria-label="Notifikasi"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white",
                avatarClassName,
              )}>
                {initial}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[120px] truncate text-xs font-extrabold text-slate-900">
                  {userName}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      {mobileNavigation}
    </>
  );
}
