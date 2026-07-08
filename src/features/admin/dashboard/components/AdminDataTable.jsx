import { formatDate } from "@/core/utils/numberFormat";

const statusClass = {
  Dibayar: "bg-emerald-50 text-emerald-700",
  Diproses: "bg-blue-50 text-blue-700",
  Review: "bg-amber-50 text-amber-700",
  Dikirim: "bg-sky-50 text-sky-700",
};

export function AdminDataTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Pesanan terbaru</h2>
          <p className="text-sm text-slate-500">Monitoring order, channel, dan status pembayaran</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Invoice</th>
              <th className="px-5 py-3 font-bold">Pembeli</th>
              <th className="px-5 py-3 font-bold">Seller</th>
              <th className="px-5 py-3 font-bold">Channel</th>
              <th className="px-5 py-3 text-right font-bold">Total</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-bold text-slate-900">{row.id}</td>
                <td className="px-5 py-4 text-slate-600">{row.buyer}</td>
                <td className="px-5 py-4 text-slate-600">{row.seller}</td>
                <td className="px-5 py-4 text-slate-500">{row.channel}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">{row.total}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || "bg-slate-100 text-slate-600"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
