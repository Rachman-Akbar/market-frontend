import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/utils";

export const ColumnVisibilityMenu = memo(function ColumnVisibilityMenu({ columns = [], visibleKeys = [], onToggle, onShowAll, onReset }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const visibleSet = new Set(visibleKeys);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!columns.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200",
          open && "bg-slate-700 text-white hover:bg-slate-700",
        )}
        aria-label="Atur kolom tabel"
      >
        <span className="material-symbols-outlined text-[19px]">view_column</span>
        <span className="hidden md:inline">Kolom</span>
        <span className="material-symbols-outlined text-[17px]">keyboard_arrow_down</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[110] mt-1 w-72 overflow-hidden bg-white ring-1 ring-slate-200">
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Tampilkan kolom</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onShowAll} className="px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50">Semua</button>
              <button type="button" onClick={onReset} className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100">Reset</button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {columns.map((column) => (
              <label key={column.key} className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={visibleSet.has(column.key)}
                  onChange={() => onToggle?.(column.key)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="min-w-0 flex-1 truncate">{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
