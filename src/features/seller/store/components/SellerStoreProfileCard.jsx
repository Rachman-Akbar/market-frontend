import { assetUrl } from "@/features/seller/store/services/sellerStoreService";

export function SellerStoreProfileCard({ store }) {
  if (!store) return null;
  const initials = store.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {store.bannerUrl ? <img src={assetUrl(store.bannerUrl)} alt={store.name} className="h-48 w-full object-cover" /> : null}
      <div className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex h-24 w-24 overflow-hidden items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 text-3xl font-extrabold text-white shadow-lg shadow-emerald-500/20">
            {store.logo ? <img src={assetUrl(store.logo)} alt={store.name} className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-950">{store.name}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${store.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{store.isActive ? "Aktif" : "Nonaktif"}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-400">/{store.slug}</p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{store.description || store.shortDescription || "Deskripsi toko belum diisi."}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Telepon", value: store.phone || "-" },
                { label: "Email", value: store.email || "-" },
                { label: "Kota", value: store.city || "-" },
                { label: "Provinsi", value: store.province || "-" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">{item.label}</p>
                  <p className="mt-1 break-words text-sm font-extrabold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
