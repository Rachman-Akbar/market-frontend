export function CategoryAdminToolbar({ query, onQueryChange }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">search</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Cari nama kategori, group, atau slug"
          className="h-11 w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
        />
      </div>
      <div className="flex flex-wrap gap-[5px]">
        <button className="rounded-[10px] border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Import CSV</button>
        <button className="rounded-[10px] bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700">Tambah Kategori</button>
      </div>
    </div>
  );
}
