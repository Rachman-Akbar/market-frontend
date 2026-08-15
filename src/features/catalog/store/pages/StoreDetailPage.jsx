import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductGrid } from "@/features/catalog/product/components/ProductGrid";
import { StoreBannerCarousel } from "@/features/catalog/store/components/StoreBannerCarousel";
import { getStorefrontError, useStoreBanners, useStoreById, useStoreBySlug, useStoreProducts } from "@/features/catalog/store/services/storefrontService";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { toTitleCase } from "@/shared/utils/textFormatter";
import { usePublicShowcases } from "@/features/advanced/services/advancedMarketplaceService";
import { normalizeProduct } from "@/features/catalog/product/services/productService";

export default function StoreDetailPage({ storeOverride = null, embedded = false }) {
  const { slug, id } = useParams();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [activeShowcaseId, setActiveShowcaseId] = useState("all");
  const loadMoreRef = useRef(null);
  const deferredSearch = useDeferredValue(search.trim());
  const storeBySlugQuery = useStoreBySlug(slug, { enabled: Boolean(slug) });
  const storeByIdQuery = useStoreById(id, { enabled: Boolean(id) });
  const storeQuery = slug ? storeBySlugQuery : storeByIdQuery;
  const store = storeOverride || storeQuery.data;
  const bannersQuery = useStoreBanners(store?.id);
  const showcasesQuery = usePublicShowcases(store?.id);
  const showcases = useMemo(() => (showcasesQuery.data?.rows || []).map((showcase) => ({ ...showcase, products: (showcase.products || []).map((product) => normalizeProduct({ ...product, store })) })), [showcasesQuery.data, store]);
  const activeShowcase = useMemo(() => activeShowcaseId === "all" ? null : showcases.find((showcase) => String(showcase.id) === String(activeShowcaseId)) || null, [activeShowcaseId, showcases]);
  const productsQuery = useStoreProducts(store?.id, {
    per_page: 24,
    ...(deferredSearch ? { search: deferredSearch } : {}),
  });
  const products = useMemo(() => {
    const rows = productsQuery.data?.pages?.flatMap((page) => page?.rows || []) || [];
    const seen = new Set();

    return rows.filter((product) => {
      const key = String(product?.id ?? product?.slug ?? "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [productsQuery.data]);
  const location = useMemo(() => [store?.city, store?.province].filter(Boolean).join(", "), [store?.city, store?.province]);
  const displayedProducts = useMemo(() => {
    if (!activeShowcase) return products;
    const needle = searchDraft.trim().toLowerCase();
    if (!needle) return activeShowcase.products || [];
    return (activeShowcase.products || []).filter((product) => String(product.name || "").toLowerCase().includes(needle) || String(product.sku || "").toLowerCase().includes(needle));
  }, [activeShowcase, products, searchDraft]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || activeShowcase || !productsQuery.hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || productsQuery.isFetchingNextPage) return;
        productsQuery.fetchNextPage();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeShowcase, productsQuery.fetchNextPage, productsQuery.hasNextPage, productsQuery.isFetchingNextPage]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!activeShowcase) setSearch(searchDraft.trim());
  };

  const selectShowcase = (id) => {
    setActiveShowcaseId(String(id));
    setSearchDraft("");
    setSearch("");
  };

  if (!storeOverride && storeQuery.isLoading) {
    return <main className="mx-auto max-w-[1200px] px-4 py-12"><AsyncState loading /></main>;
  }

  if ((!storeOverride && storeQuery.error) || !store) {
    return <main className="mx-auto max-w-[1200px] px-4 py-12"><AsyncState error={getStorefrontError(storeQuery.error)} /></main>;
  }

  return (
    <main className={embedded ? "space-y-6" : "mx-auto max-w-[1200px] space-y-6 px-4 py-6"}>
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
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Dimuat</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-lg font-extrabold text-slate-800">Aktif</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
            </div>
          </div>
        </div>
      </section>

      {showcases.length ? (
        <section className="border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Etalase Toko</h2>
              <p className="mt-0.5 text-xs text-slate-500">Pilih etalase untuk melihat kelompok produk yang kamu cari.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{showcases.length} etalase</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => selectShowcase("all")} className={`shrink-0 border px-4 py-2 text-sm font-extrabold transition ${activeShowcaseId === "all" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>Semua Produk</button>
            {showcases.map((showcase) => <button key={showcase.id} type="button" onClick={() => selectShowcase(showcase.id)} className={`shrink-0 border px-4 py-2 text-sm font-extrabold transition ${String(activeShowcaseId) === String(showcase.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>{showcase.name}<span className={`ml-2 text-[11px] ${String(activeShowcaseId) === String(showcase.id) ? "text-emerald-100" : "text-slate-400"}`}>{showcase.products_count ?? showcase.products?.length ?? 0}</span></button>)}
          </div>
          {activeShowcase?.description ? <p className="mt-3 border-l-2 border-emerald-500 pl-3 text-sm text-slate-500">{activeShowcase.description}</p> : null}
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{activeShowcase ? activeShowcase.name : `Produk dari ${toTitleCase(store.name)}`}</h2>
            <p className="mt-1 text-sm text-slate-500">{activeShowcase ? `${displayedProducts.length} produk dalam etalase ini.` : "Hanya produk active dan published yang ditampilkan."}</p>
          </div>
          <form onSubmit={submitSearch} className="flex w-full max-w-sm items-center border border-slate-200 bg-white px-3 py-2.5">
            <span className="material-symbols-outlined mr-2 text-[19px] text-slate-400">search</span>
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              className="w-full text-sm outline-none"
              placeholder={activeShowcase ? "Cari di etalase ini..." : "Cari produk lalu tekan Enter"}
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
          empty={!productsQuery.isLoading && !displayedProducts.length}
          emptyText={activeShowcase ? "Produk pada etalase ini belum tersedia." : "Produk toko belum tersedia."}
        />
        {displayedProducts.length ? <ProductGrid products={displayedProducts} /> : null}
        <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center py-4 text-xs font-semibold text-slate-400">
          {!activeShowcase && productsQuery.isFetchingNextPage
            ? "Lihat produk berikutnya"
            : !activeShowcase && productsQuery.hasNextPage
              ? "Geser ke bawah untuk melihat produk berikutnya"
              : !activeShowcase && products.length
                ? "Semua produk toko sudah ditampilkan"
                : ""}
        </div>
      </section>
    </main>
  );
}
