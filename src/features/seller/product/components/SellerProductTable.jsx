import { formatPrice } from "@/shared/utils/utils";

const statusClass = {
  active: "border-emerald-200 text-emerald-700",
  review: "border-amber-200 text-amber-700",
  inactive: "border-slate-200 text-slate-500",
};

const statusLabel = {
  active: "Aktif",
  review: "Review",
  inactive: "Nonaktif",
};

export function SellerProductTable({
  rows = [],
  onEdit,
  onDelete,
  deletingId,
}) {
  if (!rows.length) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center text-sm text-slate-500">
        Belum ada produk seller yang tersedia.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Produk</th>
              <th className="px-5 py-3 font-bold">SKU</th>
              <th className="px-5 py-3 font-bold">Kategori</th>
              <th className="px-5 py-3 text-right font-bold">Harga</th>
              <th className="px-5 py-3 text-center font-bold">Stok</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-emerald-50/40">
                <td className="px-5 py-4">
                  <div className="flex min-w-[240px] items-center gap-3">
                    {row.thumbnail ? (
                      <img
                        src={row.thumbnail}
                        alt={row.name}
                        className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-[#10B981]">
                        <span className="material-symbols-outlined">
                          inventory_2
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-extrabold text-slate-900">
                        {row.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Terjual {row.sold.toLocaleString("id-ID")} • Rating{" "}
                        {row.rating}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-500">
                  {row.sku || "-"}
                </td>
                <td className="px-5 py-4 text-slate-600">{row.category}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">
                  {formatPrice(row.price)}
                </td>
                <td className="px-5 py-4 text-center font-bold text-slate-700">
                  {row.stock}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass[row.status] || statusClass.inactive}`}
                  >
                    {statusLabel[row.status] || row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#047857] transition hover:bg-emerald-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      disabled={deletingId === row.id}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === row.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
