const statusClass = {
  "Perlu Dikirim": "bg-amber-50 text-amber-700",
  "Siap Pickup": "bg-blue-50 text-blue-700",
  Dikirim: "bg-sky-50 text-sky-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

export function SellerOrderTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-extrabold text-slate-950">Pesanan perlu perhatian</h2>
        <p className="text-sm text-slate-500">Antrian order terbaru dari pembeli.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Order</th>
              <th className="px-5 py-3 font-bold">Pembeli</th>
              <th className="px-5 py-3 font-bold">Produk</th>
              <th className="px-5 py-3 text-center font-bold">Qty</th>
              <th className="px-5 py-3 text-right font-bold">Total</th>
              <th className="px-5 py-3 font-bold">Kurir</th>
              <th className="px-5 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-extrabold text-slate-900">{row.id}</td>
                <td className="px-5 py-4 text-slate-600">{row.buyer}</td>
                <td className="px-5 py-4 text-slate-600">{row.product}</td>
                <td className="px-5 py-4 text-center font-bold text-slate-700">{row.qty}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">{row.total}</td>
                <td className="px-5 py-4 text-slate-500">{row.courier}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || "bg-slate-100 text-slate-600"}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
