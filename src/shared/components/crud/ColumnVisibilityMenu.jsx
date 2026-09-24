import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ActionIconButton } from "@/shared/components/crud/ActionIconButton";
import { cn } from "@/shared/utils/utils";

export const ColumnVisibilityMenu = memo(function ColumnVisibilityMenu({ columns = [], visibleKeys = [], onToggle, onShowAll, onReset, onApplyDefault, selectionEnabled = false, selectedCount = 0, onToggleSelection }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const visibleSet = new Set(visibleKeys);
  const selectableColumns = columns;
  const hasColumns = selectableColumns.length > 0;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredColumns = normalizedQuery ? selectableColumns.filter((column) => String(column.label).toLowerCase().includes(normalizedQuery)) : selectableColumns;

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 288;
      const margin = 8;
      const left = Math.max(margin, Math.min(rect.right - width, window.innerWidth - width - margin));
      const menuHeight = menuRef.current?.getBoundingClientRect().height || 420;
      const below = rect.bottom + 5;
      const above = rect.top - 5 - menuHeight;
      const top = below + menuHeight > window.innerHeight - margin && above > margin ? above : Math.max(margin, below);
      setPosition({ top, left });
    };

    const close = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    updatePosition();
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", escape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  if (!hasColumns && !onToggleSelection) return null;

  return (
    <div ref={rootRef}>
      <ActionIconButton
        icon="view_column"
        title="Atur kolom tabel"
        tooltip={false}
        active={open}
        onClick={() => setOpen((current) => { const next = !current; if (next) setQuery(""); return next; })}
      />

      {open && typeof document !== "undefined" ? createPortal(
        <div ref={menuRef} className="fixed z-[300] w-72 overflow-hidden bg-white ring-1 ring-slate-200 shadow-xl" style={{ top: position.top, left: position.left }}>
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
              <div className="border-b border-slate-100 px-3 py-2">
                <label className="relative block">
                  <span className="material-symbols-outlined pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">search</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari kolom..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredColumns.length ? filteredColumns.map((column) => (
                  <label key={column.key} className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={visibleSet.has(column.key)}
                      onChange={() => onToggle?.(column.key)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="min-w-0 flex-1 truncate">{column.label}</span>
                  </label>
                )) : (
                  <p className="px-2 py-6 text-center text-xs font-semibold text-slate-400">Kolom tidak ditemukan.</p>
                )}
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
        </div>,
        document.body,
      ) : null}
    </div>
  );
});