const statusClass = {
  active: "bg-emerald-50 text-emerald-700",
  review: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-100 text-slate-500",
};

const statusLabel = {
  active: "Aktif",
  review: "Review",
  inactive: "Nonaktif",
};

export function CatalogGroupBoard({ rows = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {rows.map((row) => (
        <article key={row.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 ring-1 ring-teal-100">
              <span className="material-symbols-outlined text-[26px]">category</span>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || statusClass.inactive}`}>
              {statusLabel[row.status] || row.status}
            </span>
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-slate-950">{row.name}</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">/{row.slug}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Kategori</p>
              <p className="mt-1 text-lg font-extrabold text-slate-950">{row.categories}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Produk</p>
              <p className="mt-1 text-lg font-extrabold text-slate-950">{row.products.toLocaleString("id-ID")}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
            <span>{row.owner}</span>
            <span>Sort {row.sortOrder}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
