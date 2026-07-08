export function SellerMetricCard({ item }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-950">{item.value}</h3>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
          <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700">
        <span className="material-symbols-outlined text-[16px]">trending_up</span>
        {item.change} dari periode lalu
      </div>
    </div>
  );
}
