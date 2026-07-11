export function AdminMiniChart({ values = [] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Tren pendapatan</h2>
          <p className="text-sm text-slate-500">12 bulan terakhir</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Data API</span>
      </div>
      <div className="flex h-64 items-end gap-3 rounded-2xl bg-slate-50 p-4">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-teal-600 to-emerald-300 shadow-sm transition hover:opacity-80"
              style={{ height: `${Math.max(18, (value / max) * 210)}px` }}
            />
            <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
