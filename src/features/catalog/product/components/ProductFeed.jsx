import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { getProducts } from "@/features/catalog/product/services/productService";
import { useCatalogGroups } from "@/features/catalog/cataloggroup/services/catalogGroupService";

const DEFAULT_LIMIT = 12;

function getNextPage(meta) {
  const current = Number(meta?.current_page ?? meta?.page ?? 1);
  const last = Number(meta?.last_page ?? meta?.total_pages ?? current);
  return current < last ? current + 1 : undefined;
}

export function ProductFeed() {
  const [activeTab, setActiveTab] = useState(0);
  const groupsQuery = useCatalogGroups({ is_active: 1, include_categories: 0 });
  const groups = useMemo(() => (groupsQuery.data?.data || []).slice(0, 6), [groupsQuery.data]);
  const selectedGroup = activeTab > 0 ? groups[activeTab - 1] || null : null;
  const selectedGroupKey = selectedGroup ? String(selectedGroup.id ?? selectedGroup.slug) : "all";
  const tabs = useMemo(() => ["For You", ...groups.map((group) => group.name)], [groups]);

  const productsQuery = useInfiniteQuery({
    queryKey: ["catalog", "product-feed", selectedGroupKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getProducts({
      catalog_group_id: selectedGroup?.id,
      catalog_group_slug: selectedGroup?.slug,
      page: pageParam,
      per_page: DEFAULT_LIMIT,
    }),
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    staleTime: 60000,
  });

  const products = useMemo(() => {
    const rows = productsQuery.data?.pages.flatMap((page) => page.data || []) || [];
    const unique = new Map();
    rows.forEach((item) => unique.set(String(item.id ?? item.slug), item));
    return [...unique.values()];
  }, [productsQuery.data]);

  const handleTabClick = useCallback((index) => {
    setActiveTab((current) => (current === index ? current : index));
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar border-b border-[#bccbb4] pb-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(index)}
            className={`whitespace-nowrap pb-2 text-base transition-colors ${index === activeTab ? "font-bold text-[#006e04] border-b-2 border-[#006e04]" : "text-[#3e4a39] hover:text-[#006e04]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {productsQuery.isLoading && <div className="text-sm text-gray-500 py-8">Memuat produk...</div>}
      {productsQuery.error && <div className="text-sm text-red-500 py-8">{productsQuery.error.message || "Gagal memuat produk"}</div>}
      {!productsQuery.isLoading && !productsQuery.error && !products.length && <div className="text-sm text-gray-500 py-8">Produk belum tersedia.</div>}
      {!productsQuery.isLoading && !productsQuery.error && !!products.length && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => <ProductCard key={product.id || product.slug} {...product} />)}
        </div>
      )}

      {!productsQuery.isLoading && !productsQuery.error && productsQuery.hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => productsQuery.fetchNextPage()}
            disabled={productsQuery.isFetchingNextPage}
            className="px-12 py-2 border border-[#bccbb4] text-[#1b1c1c] font-bold rounded-lg hover:bg-[#f6f3f2] transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {productsQuery.isFetchingNextPage ? "Memuat..." : "Lihat Selengkapnya"}
          </button>
        </div>
      )}
    </section>
  );
}
