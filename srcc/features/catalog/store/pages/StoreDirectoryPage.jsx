import { useDeferredValue, useState } from "react";
import { StoreCard } from "@/features/catalog/store/components/StoreCard";
import { getStorefrontError, useStores } from "@/features/catalog/store/services/storefrontService";
import { AsyncState } from "@/shared/components/feedback/AsyncState";

export default function StoreDirectoryPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const storesQuery = useStores(deferredSearch ? { search: deferredSearch } : {});
  const stores = storesQuery.data || [];

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-10 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">Jelajahi Toko</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">Temukan official store dan seller pilihan</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">Pilih toko, lihat banner campaign khusus toko, lalu jelajahi produk aktif yang telah dipublikasikan.</p>
        <div className="mt-6 flex max-w-xl items-center rounded-2xl bg-white px-4 py-3 text-slate-700 shadow-lg"><span className="material-symbols-outlined mr-2 text-slate-400">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Cari nama toko" /></div>
      </section>
      <div className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Daftar Toko</h2><p className="mt-1 text-sm text-slate-500">Banner tidak ditampilkan di homepage dan hanya tersedia pada detail toko.</p></div></div><AsyncState loading={storesQuery.isLoading} error={storesQuery.error ? getStorefrontError(storesQuery.error) : ""} empty={!storesQuery.isLoading && !stores.length} emptyText="Toko aktif belum tersedia." />{stores.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{stores.map((store) => <StoreCard key={store.id} store={store} />)}</div> : null}</div>
    </main>
  );
}
