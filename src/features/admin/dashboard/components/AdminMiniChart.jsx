import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function AdminMiniChart({ values = [] }) {
  const data = values.map((value, index) => ({ name: String(index + 1), value: Number(value || 0) }));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Tren pendapatan</h2>
          <p className="text-sm text-slate-500">12 bulan terakhir</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Data API</span>
      </div>
      <div className="h-64 rounded-2xl bg-slate-50 p-4">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="adminMiniFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ stroke: "rgba(148,163,184,0.4)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }}
                formatter={(value) => Number(value).toLocaleString("id-ID")}
              />
              <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={2} fill="url(#adminMiniFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-slate-500">Belum ada data.</p>
        )}
      </div>
    </div>
  );
}
