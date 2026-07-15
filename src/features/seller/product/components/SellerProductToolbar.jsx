export function SellerProductToolbar({
  query,
  onQueryChange,
  onCreate,
  refreshing,
  onRefresh,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 bg-white pb-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
          search
        </span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Cari produk, SKU, kategori"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-[#10B981] hover:text-[#047857] disabled:opacity-60"
        >
          {refreshing ? "Memuat..." : "Refresh Data"}
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#059669]"
        >
          Tambah Produk
        </button>
      </div>
    </div>
  );
}
