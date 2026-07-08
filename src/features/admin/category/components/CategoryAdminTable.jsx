const statusClass = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  review: "bg-amber-50 text-amber-700",
};

const statusLabel = {
  active: "Aktif",
  inactive: "Nonaktif",
  review: "Review",
};

export function CategoryAdminTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Kategori</th>
              <th className="px-5 py-3 font-bold">Group</th>
              <th className="px-5 py-3 font-bold">Parent</th>
              <th className="px-5 py-3 text-center font-bold">Level</th>
              <th className="px-5 py-3 text-right font-bold">Produk</th>
              <th className="px-5 py-3 font-bold">Visibilitas</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="font-extrabold text-slate-900">{row.name}</p>
                  <p className="text-xs text-slate-400">/{row.slug}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{row.group}</td>
                <td className="px-5 py-4 text-slate-500">{row.parent}</td>
                <td className="px-5 py-4 text-center font-bold text-slate-700">{row.level}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">{row.products.toLocaleString("id-ID")}</td>
                <td className="px-5 py-4 text-slate-500">{row.visibility}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || statusClass.inactive}`}>
                    {statusLabel[row.status] || row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="rounded-xl px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-50">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
