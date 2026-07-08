const statusClass = {
  active: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-blue-50 text-blue-700",
  inactive: "bg-slate-100 text-slate-500",
};

const statusLabel = {
  active: "Aktif",
  scheduled: "Terjadwal",
  inactive: "Nonaktif",
};

export function SellerBannerCard({ banner }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img src={banner.image} alt={banner.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${statusClass[banner.status] || statusClass.inactive}`}>
          {statusLabel[banner.status] || banner.status}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-950">{banner.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{banner.placement}</p>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">CTR {banner.ctr}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="font-bold text-slate-700">Mulai</p>
            <p className="mt-1">{banner.startsAt}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="font-bold text-slate-700">Akhir</p>
            <p className="mt-1">{banner.endsAt}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
