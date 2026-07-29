import { memo } from "react";

export const EntityToolbar = memo(function EntityToolbar({
  query,
  onQueryChange,
  onCreate,
  onRefresh,
  refreshing = false,
  createLabel = "Tambah Data",
  placeholder = "Cari data...",
  filters,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-500 focus-within:bg-white">
        <span className="material-symbols-outlined text-[19px] text-slate-400">search</span>
        <input
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
        />
      </div>
      {filters}
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60"
      >
        <span className={`material-symbols-outlined text-[19px] ${refreshing ? "animate-spin" : ""}`}>refresh</span>
        Refresh
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white hover:bg-emerald-700"
      >
        <span className="material-symbols-outlined text-[19px]">add</span>
        {createLabel}
      </button>
    </div>
  );
});
