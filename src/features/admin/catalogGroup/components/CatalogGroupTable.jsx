export function CatalogGroupTable({ rows = [] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-extrabold text-slate-950">Detail catalog group</h2>
        <p className="text-sm text-slate-500">Kontrol sort order, owner, dan sinkronisasi group katalog.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Nama</th>
              <th className="px-5 py-3 font-bold">Slug</th>
              <th className="px-5 py-3 font-bold">Owner</th>
              <th className="px-5 py-3 text-center font-bold">Urutan</th>
              <th className="px-5 py-3 text-right font-bold">Produk</th>
              <th className="px-5 py-3 font-bold">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-extrabold text-slate-900">{row.name}</td>
                <td className="px-5 py-4 text-slate-500">{row.slug}</td>
                <td className="px-5 py-4 text-slate-600">{row.owner}</td>
                <td className="px-5 py-4 text-center font-bold text-slate-700">{row.sortOrder}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">{row.products.toLocaleString("id-ID")}</td>
                <td className="px-5 py-4 text-slate-500">{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
