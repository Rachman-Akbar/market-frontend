import { cn } from "@/shared/utils/utils";

export function isInactiveRow(row) {
  return row?.is_active === false || row?.isActive === false;
}

export function BannedStamp({ className = "", overlay = false, title = "Nonaktif" }) {
  const stamp = (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={cn(
        "inline-flex h-12 w-12 -rotate-12 items-center justify-center rounded-full border-2 border-rose-400/80 bg-rose-50/80 text-rose-500 ring-4 ring-rose-200/40",
        className,
      )}
    >
      <span className="material-symbols-outlined text-[24px]">block</span>
    </span>
  );

  if (!overlay) return stamp;

  return (
    <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">{stamp}</span>
  );
}