import { memo, useEffect, useState } from "react";
import { ActionIconButton } from "@/shared/components/crud/ActionIconButton";
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
  onApplyDefaultColumns,
  hasActiveFilters = false,
  onClearFilters,
}) {
  const [draft, setDraft] = useState(query || "");
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setDraft(query || "");
  }, [query]);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh?.();
    window.setTimeout(() => setSpinning(false), 900);
  };

  const isRefreshing = refreshing || spinning;

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
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
          {draft ? (
            <button type="button" onClick={clearSearch} className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700" aria-label="Hapus pencarian">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}
        </div>
      </form>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {filters}
        {(hasActiveFilters || query) && onClearFilters ? (
          <ActionIconButton icon="filter_alt_off" title="Hapus filter" onClick={clearAll} />
        ) : null}
        <ColumnVisibilityMenu
          columns={columns}
          visibleKeys={visibleColumns}
          onToggle={onToggleColumn}
          onShowAll={onShowAllColumns}
          onReset={onResetColumns}
          onApplyDefault={onApplyDefaultColumns}
          selectionEnabled={selectionEnabled}
          selectedCount={selectedCount}
          onToggleSelection={onToggleSelection}
        />
        <BulkActionsMenu selectedCount={selectedCount} actions={bulkActions} />
        <ActionIconButton
          icon="refresh"
          title={isRefreshing ? "Memuat..." : "Segarkan data"}
          iconClassName={isRefreshing ? "animate-spin" : undefined}
          onClick={handleRefresh}
          disabled={isRefreshing || !onRefresh}
        />
        {!hideCreate ? (
          <ActionIconButton icon="add" title={`Tambah${createLabel && createLabel !== "Tambah Data" ? ` ${createLabel.replace(/^Tambah\s*/i, "")}` : " data"}`} onClick={onCreate} variant="primary" />
        ) : null}
      </div>
    </div>
  );
});
