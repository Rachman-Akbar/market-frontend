import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/utils";

export const ColumnVisibilityMenu = memo(function ColumnVisibilityMenu({ columns = [], visibleKeys = [], onToggle, onShowAll, onReset, onApplyDefault, selectionEnabled = false, selectedCount = 0, onToggleSelection }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [tooltip, setTooltip] = useState(false);
  const visibleSet = new Set(visibleKeys);
  const hasColumns = columns.length > 0;

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

  if (!hasColumns && !onToggleSelection) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        title="Pilih kolom tabel yang ditampilkan atau disembunyikan"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200",
          open && "bg-slate-700 text-white hover:bg-slate-700",
        )}
        aria-expanded={open}
        aria-label="Atur kolom tabel"
      >
        <span className="material-symbols-outlined text-[19px]">view_column</span>
        <span className="hidden md:inline">Pilih Kolom</span>
        <span className="material-symbols-outlined text-[17px]">keyboard_arrow_down</span>
      </button>

      {tooltip && !open ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-[130] mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-bold text-white shadow-lg ring-1 ring-white/10">
          Atur kolom yang tampil & disembunyikan
          <span className="absolute bottom-full left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
        </span>
      ) : null}

      {open ? (
        <div className="absolute right-0 top-full z-[110] mt-1 w-72 overflow-hidden bg-white ring-1 ring-slate-200">
          {onToggleSelection ? (
            <div className="border-b border-slate-100 p-2">
              <button
                type="button"
                onClick={onToggleSelection}
                className={cn(
                  "flex w-full items-center gap-3 px-2 py-2 text-left text-sm transition-colors",
                  selectionEnabled ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-slate-700 hover:bg-slate-50",
                )}
                aria-pressed={selectionEnabled}
              >
                <span className="material-symbols-outlined text-[19px]">{selectionEnabled ? "deselect" : "select_all"}</span>
                <span className="min-w-0 flex-1 font-bold">{selectionEnabled ? "Matikan pemilihan data" : "Pilih data"}</span>
                {selectionEnabled && selectedCount > 0 ? <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-black">{selectedCount}</span> : null}
              </button>
            </div>
          ) : null}
          {hasColumns ? (
            <>
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
              {onApplyDefault ? (
                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    title="Jadikan pilihan kolom saat ini sebagai tampilan default"
                    onClick={onApplyDefault}
                    className="flex h-9 w-full items-center justify-center gap-2 bg-slate-800 px-3 text-xs font-extrabold text-white transition-colors hover:bg-slate-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark</span>
                    Terapkan sebagai Default
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});