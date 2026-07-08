const toneMap = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
};

export function AdminStatCard({ item }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-950">{item.value}</h3>
        </div>
        <div className={`rounded-2xl p-3 ring-1 ${toneMap[item.tone] || toneMap.emerald}`}>
          <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700">
        <span className="material-symbols-outlined text-[16px]">trending_up</span>
        {item.change} dari bulan lalu
      </div>
    </div>
  );
}
