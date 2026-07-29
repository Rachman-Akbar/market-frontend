import { memo } from "react";
import { Link } from "react-router-dom";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const StoreCard = memo(function StoreCard({ store }) {
  return (
    <Link to={`/stores/${store.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 ">
      <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <div className="px-5 pb-5">
        <div className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-xl font-extrabold text-emerald-700 ">
          {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" loading="lazy" /> : store.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-slate-900 group-hover:text-emerald-700">{toTitleCase(store.name)}</h2><p className="mt-1 text-xs text-slate-500">Toko aktif dan produk terverifikasi</p></div><span className="material-symbols-outlined text-emerald-600">arrow_forward</span></div>
      </div>
    </Link>
  );
});
