import { formatPrice } from "@/shared/utils/utils";

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

export function SellerProductTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Produk</th>
              <th className="px-5 py-3 font-bold">SKU</th>
              <th className="px-5 py-3 font-bold">Kategori</th>
              <th className="px-5 py-3 text-right font-bold">Harga</th>
              <th className="px-5 py-3 text-center font-bold">Stok</th>
              <th className="px-5 py-3 text-center font-bold">Terjual</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-400">Rating {row.rating}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-500">{row.sku}</td>
                <td className="px-5 py-4 text-slate-600">{row.category}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">{formatPrice(row.price)}</td>
                <td className="px-5 py-4 text-center font-bold text-slate-700">{row.stock}</td>
                <td className="px-5 py-4 text-center text-slate-600">{row.sold.toLocaleString("id-ID")}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || statusClass.inactive}`}>{statusLabel[row.status] || row.status}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
