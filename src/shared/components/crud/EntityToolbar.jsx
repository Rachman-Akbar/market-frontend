import { memo, useEffect, useState } from "react";
import { BulkActionsMenu } from "@/shared/components/crud/BulkActionsMenu";
import { ColumnVisibilityMenu } from "@/shared/components/crud/ColumnVisibilityMenu";

export const EntityToolbar = memo(function EntityToolbar({
  query,
  onQueryChange,
  onCreate,
  onRefresh,
  refreshing = false,
  createLabel = "Tambah Data",
  placeholder = "Cari data lalu tekan Enter",
  filters,
  hideCreate = false,
  selectionEnabled = false,
  selectedCount = 0,
  onToggleSelection,
  bulkActions = [],
  columns = [],
  visibleColumns = [],
  onToggleColumn,
  onShowAllColumns,
  onResetColumns,
  hasActiveFilters = false,
  onClearFilters,
}) {
  const [draft, setDraft] = useState(query || "");

  useEffect(() => {
    setDraft(query || "");
  }, [query]);

  const submitSearch = (event) => {
    event.preventDefault();
    onQueryChange?.(draft.trim());
  };

  const clearSearch = () => {
    setDraft("");
    onQueryChange?.("");
  };

  const clearAll = () => {
    setDraft("");
    onQueryChange?.("");
    onClearFilters?.();
  };

  return (
    <div className="mb-3 flex min-w-0 flex-col gap-2 bg-white py-2 xl:flex-row xl:items-center">
      <form onSubmit={submitSearch} className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center bg-slate-50 px-3 ring-1 ring-inset ring-slate-200 focus-within:bg-white focus-within:ring-emerald-500">
          <span className="material-symbols-outlined shrink-0 text-[19px] text-slate-400">search</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
          {draft ? (
            <button type="button" onClick={clearSearch} className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700" aria-label="Hapus pencarian">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}
          <button type="submit" className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-emerald-700" aria-label="Cari">
            <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
          </button>
        </div>
      </form>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {filters}
        {(hasActiveFilters || query) && onClearFilters ? (
          <button type="button" onClick={clearAll} className="inline-flex h-10 items-center justify-center gap-2 bg-amber-50 px-3 text-sm font-bold text-amber-800 hover:bg-amber-100">
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            Clear Filter
          </button>
        ) : null}
        {onToggleSelection ? (
          <button type="button" onClick={onToggleSelection} className={`inline-flex h-10 w-10 items-center justify-center transition-colors ${selectionEnabled ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`} aria-label={selectionEnabled ? "Matikan pemilihan data" : "Aktifkan pemilihan data"} title={selectionEnabled ? "Matikan pemilihan data" : "Pilih data"}>
            <span className="material-symbols-outlined text-[19px]">check_box</span>
          </button>
        ) : null}
        <BulkActionsMenu selectedCount={selectedCount} actions={bulkActions} />
        <ColumnVisibilityMenu columns={columns} visibleKeys={visibleColumns} onToggle={onToggleColumn} onShowAll={onShowAllColumns} onReset={onResetColumns} />
        <button type="button" onClick={onRefresh}  className="inline-flex h-10 items-center justify-center gap-2 bg-slate-100 px-3 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-60">
          <span className={`material-symbols-outlined text-[19px] `}>refresh</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
        {!hideCreate ? (
          <button type="button" onClick={onCreate} className="inline-flex h-10 items-center justify-center gap-2 bg-emerald-600 px-4 text-sm font-extrabold text-white hover:bg-emerald-700">
            <span className="material-symbols-outlined text-[19px]">add</span>
            {createLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
});
