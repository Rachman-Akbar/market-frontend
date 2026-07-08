export function SellerStoreProfileCard({ store }) {
  if (!store) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 text-3xl font-extrabold text-white shadow-lg shadow-emerald-500/20">
          SG
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-950">{store.name}</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{store.status}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-400">/{store.slug}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{store.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Rating", value: store.rating },
              { label: "Followers", value: store.followers.toLocaleString("id-ID") },
              { label: "Response", value: store.responseRate },
              { label: "Kota", value: store.city },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
