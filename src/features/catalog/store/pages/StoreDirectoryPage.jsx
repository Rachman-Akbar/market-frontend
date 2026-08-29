import { useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { StoreCard } from "@/features/catalog/store/components/StoreCard";
import { Skeleton, SkeletonLine } from "@/shared/components/feedback/Skeleton";
import { getStorefrontError, useStores } from "@/features/catalog/store/services/storefrontService";
import { AsyncState } from "@/shared/components/feedback/AsyncState";

function StoreSkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <Skeleton className="h-24 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function StoreDirectoryPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchDraft, setSearchDraft] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const deferredSearch = useDeferredValue(search.trim());
  const storesQuery = useStores(deferredSearch ? { search: deferredSearch } : {});
  const stores = storesQuery.data || [];

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchDraft.trim());
  };

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-10 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">Jelajahi Toko</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">Temukan official store dan seller pilihan</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">Pilih toko, lihat banner campaign khusus toko, lalu jelajahi produk aktif yang telah dipublikasikan.</p>
        <form onSubmit={submitSearch} className="mt-6 flex max-w-xl items-center rounded-2xl bg-white px-4 py-3 text-slate-700">
          <span className="material-symbols-outlined mr-2 text-slate-400">search</span>
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Cari nama toko lalu tekan Enter"
          />
          {searchDraft ? (
            <button
              type="button"
              onClick={() => {
                setSearchDraft("");
                setSearch("");
              }}
              className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700"
              aria-label="Hapus pencarian"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}
        </form>
      </section>

      <div className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Daftar Toko</h2>
            <p className="mt-1 text-sm text-slate-500">Banner tidak ditampilkan di homepage dan hanya tersedia pada detail toko.</p>
          </div>
        </div>
        <AsyncState
          loading={false}
          error={storesQuery.error ? getStorefrontError(storesQuery.error) : ""}
          empty={!storesQuery.isLoading && !stores.length}
          emptyText="Toko aktif belum tersedia."
        />
        {storesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => <StoreSkeletonCard key={i} />)}
          </div>
        ) : null}
        {stores.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stores.map((store) => <StoreCard key={store.id} store={store} />)}
          </div>
        ) : null}
      </div>
    </main>
  );
}
