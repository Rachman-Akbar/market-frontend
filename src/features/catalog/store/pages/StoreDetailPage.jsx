import { useDeferredValue, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductGrid } from "@/features/catalog/product/components/ProductGrid";
import { StoreBannerCarousel } from "@/features/catalog/store/components/StoreBannerCarousel";
import { getStorefrontError, useStoreBanners, useStoreById, useStoreBySlug, useStoreProducts } from "@/features/catalog/store/services/storefrontService";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { toTitleCase } from "@/shared/utils/textFormatter";

export default function StoreDetailPage() {
  const { slug, id } = useParams();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const storeBySlugQuery = useStoreBySlug(slug, { enabled: Boolean(slug) });
  const storeByIdQuery = useStoreById(id, { enabled: Boolean(id) });
  const storeQuery = slug ? storeBySlugQuery : storeByIdQuery;
  const store = storeQuery.data;
  const bannersQuery = useStoreBanners(store?.id);
  const productsQuery = useStoreProducts(store?.id, {
    ...(deferredSearch ? { search: deferredSearch } : {}),
  });
  const products = productsQuery.data?.rows || [];
  const location = useMemo(() => [store?.city, store?.province].filter(Boolean).join(", "), [store?.city, store?.province]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchDraft.trim());
  };

  if (storeQuery.isLoading) {
    return <main className="mx-auto max-w-[1200px] px-4 py-12"><AsyncState loading /></main>;
  }

  if (storeQuery.error || !store) {
    return <main className="mx-auto max-w-[1200px] px-4 py-12"><AsyncState error={getStorefrontError(storeQuery.error)} /></main>;
  }

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6">
      <StoreBannerCarousel banners={bannersQuery.data || []} fallback={store.bannerUrl} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-2xl font-extrabold text-emerald-700">
              {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : store.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-950">{toTitleCase(store.name)}</h1>
                <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{location || "Marketplace Indonesia"}</p>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{store.shortDescription || store.description || "Toko aktif dengan produk pilihan."}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:flex">
            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-lg font-extrabold text-emerald-700">{products.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Produk</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-lg font-extrabold text-slate-800">Aktif</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Produk dari {toTitleCase(store.name)}</h2>
            <p className="mt-1 text-sm text-slate-500">Hanya produk active dan published yang ditampilkan.</p>
          </div>
          <form onSubmit={submitSearch} className="flex w-full max-w-sm items-center border border-slate-200 bg-white px-3 py-2.5">
            <span className="material-symbols-outlined mr-2 text-[19px] text-slate-400">search</span>
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              className="w-full text-sm outline-none"
              placeholder="Cari produk lalu tekan Enter"
            />
            {searchDraft ? (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                }}
                className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-slate-700"
                aria-label="Hapus pencarian"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            ) : null}
          </form>
        </div>
        <AsyncState
          loading={productsQuery.isLoading}
          error={productsQuery.error ? getStorefrontError(productsQuery.error) : ""}
          empty={!productsQuery.isLoading && !products.length}
          emptyText="Produk toko belum tersedia."
        />
        {products.length ? <ProductGrid products={products} /> : null}
      </section>
    </main>
  );
}
