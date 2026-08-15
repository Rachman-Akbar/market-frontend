import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils/utils";

function emptyValue(type) {
  if (type === "range") return { min: "", max: "" };
  return "";
}

function hasFilterValue(type, value) {
  if (type === "range") return Boolean(value?.min !== "" || value?.max !== "");
  return value !== "" && value !== null && value !== undefined;
}

export const TableHeaderFilter = memo(function TableHeaderFilter({
  label,
  sortKey,
  sortBy,
  sortDirection = "asc",
  onSortChange,
  filterType,
  filterValue,
  onFilterChange,
  options = [],
  placeholder = "Cari nilai",
  minPlaceholder = "Minimum",
  maxPlaceholder = "Maksimum",
  className,
  headerProps,
  columnKey,
  columnStyle,
  onResizeStart,
  onResetWidth,
  dragging = false,
  dropTarget = false,
}) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [draft, setDraft] = useState(filterValue ?? emptyValue(filterType));
  const activeSort = Boolean(sortKey && sortBy === sortKey);
  const activeFilter = hasFilterValue(filterType, filterValue);

  useEffect(() => {
    if (open) setDraft(filterValue ?? emptyValue(filterType));
  }, [filterType, filterValue, open]);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 280;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setPosition({ top: rect.bottom + 5, left });
    };

    const close = (event) => {
      if (buttonRef.current?.contains(event.target)) return;
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

  const normalizedOptions = useMemo(
    () => options.map((option) => ({
      value: String(option?.value ?? ""),
      label: String(option?.label ?? option?.value ?? ""),
    })),
    [options],
  );

  const applyFilter = () => {
    onFilterChange?.(draft);
    setOpen(false);
  };

  const clearFilter = () => {
    const nextValue = emptyValue(filterType);
    setDraft(nextValue);
    onFilterChange?.(nextValue);
    setOpen(false);
  };

  const setSort = (direction) => {
    onSortChange?.(sortKey, direction);
    setOpen(false);
  };

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed z-[300] w-[280px] border border-slate-200 bg-white p-2 text-sm shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      {sortKey ? (
        <div className="space-y-1 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setSort("asc")}
            className={cn(
              "flex h-9 w-full items-center gap-2 px-2 text-left font-semibold text-slate-700 hover:bg-slate-50",
              activeSort && sortDirection === "asc" && "bg-emerald-50 text-emerald-800",
            )}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            Urutkan naik
          </button>
          <button
            type="button"
            onClick={() => setSort("desc")}
            className={cn(
              "flex h-9 w-full items-center gap-2 px-2 text-left font-semibold text-slate-700 hover:bg-slate-50",
              activeSort && sortDirection === "desc" && "bg-emerald-50 text-emerald-800",
            )}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            Urutkan turun
          </button>
        </div>
      ) : null}

      {filterType ? (
        <div className="pt-2">
          <p className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">Filter {label}</p>

          {filterType === "text" ? (
            <input
              value={draft || ""}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilter();
              }}
              autoFocus
              placeholder={placeholder}
              className="h-10 w-full border border-slate-200 px-3 outline-none focus:border-emerald-500"
            />
          ) : null}

          {filterType === "select" ? (
            <div className="max-h-56 overflow-y-auto border border-slate-200 py-1">
              <button
                type="button"
                onClick={() => setDraft("")}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
                  draft === "" && "bg-emerald-50 font-bold text-emerald-800",
                )}
              >
                <span className="material-symbols-outlined text-[17px]">select_all</span>
                Semua
              </button>
              {normalizedOptions.map((option) => (
                <button
                  key={`${option.value}:${option.label}`}
                  type="button"
                  onClick={() => setDraft(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
                    String(draft ?? "") === option.value && "bg-emerald-50 font-bold text-emerald-800",
                  )}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {String(draft ?? "") === option.value ? "check_box" : "check_box_outline_blank"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          {filterType === "range" ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={draft?.min ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, min: event.target.value }))}
                placeholder={minPlaceholder}
                className="h-10 min-w-0 border border-slate-200 px-3 outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                min="0"
                value={draft?.max ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, max: event.target.value }))}
                placeholder={maxPlaceholder}
                className="h-10 min-w-0 border border-slate-200 px-3 outline-none focus:border-emerald-500"
              />
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={clearFilter}
              className="h-9 px-3 text-xs font-extrabold text-slate-600 hover:bg-slate-100"
            >
              Hapus Filter
            </button>
            <button
              type="button"
              onClick={applyFilter}
              className="h-9 bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-700"
            >
              Terapkan
            </button>
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <th
      {...headerProps}
      style={columnStyle}
      className={cn("group relative select-none whitespace-nowrap px-4 py-3", dragging && "opacity-45", dropTarget && !dragging && "bg-emerald-50", className)}
      title="Tarik header untuk mengubah urutan kolom. Tarik garis kanan untuk mengubah lebar."
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center gap-1.5 text-left font-extrabold transition-colors hover:text-emerald-700",
          (activeSort || activeFilter) && "text-emerald-700",
        )}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined shrink-0 cursor-grab text-[16px] text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">drag_indicator</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {activeSort ? (
          <span className="material-symbols-outlined text-[16px]">
            {sortDirection === "asc" ? "arrow_upward" : "arrow_downward"}
          </span>
        ) : null}
        <span className={cn("material-symbols-outlined text-[17px]", activeFilter ? "font-fill" : "")}>filter_alt</span>
      </button>
      <button
        type="button"
        aria-label={`Ubah lebar kolom ${label}`}
        onPointerDown={(event) => onResizeStart?.(event, columnKey)}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onResetWidth?.(columnKey);
        }}
        draggable={false}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none border-0 bg-transparent p-0 outline-none before:absolute before:right-[3px] before:top-[18%] before:h-[64%] before:w-px before:bg-slate-300 before:opacity-0 before:transition-opacity hover:before:opacity-100 group-hover:before:opacity-100"
      />
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </th>
  );
});
