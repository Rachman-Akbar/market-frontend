import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { useProducts } from "@/features/catalog/product/services/productService";
import { getCategories } from "@/features/catalog/category/services/categoryService";

const FILTER_TABS = ["Semua", "Official Store", "Power Merchant", "Diskon"];
const DEFAULT_LIMIT = 20;
const initialFilters = { categories: [], locations: [], couriers: [], minPrice: "", maxPrice: "" };

function flattenCategories(rows = [], result = []) {
  rows.forEach((row) => {
    result.push({ id: row.id, name: row.name, slug: row.slug });
    flattenCategories(row.children || [], result);
  });
  return result;
}

export default function SearchClient() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedFilters(filters), 350);
    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => setPage(1), [query, activeTab, sort, debouncedFilters]);

  const params = useMemo(() => ({
    search: query || undefined,
    q: query || undefined,
    page,
    per_page: DEFAULT_LIMIT,
    category_ids: debouncedFilters.categories.length ? debouncedFilters.categories : undefined,
    locations: debouncedFilters.locations.length ? debouncedFilters.locations : undefined,
    couriers: debouncedFilters.couriers.length ? debouncedFilters.couriers : undefined,
    min_price: debouncedFilters.minPrice || undefined,
    max_price: debouncedFilters.maxPrice || undefined,
    store_type: activeTab === 1 ? "official" : activeTab === 2 ? "power_merchant" : undefined,
    has_discount: activeTab === 3 ? 1 : undefined,
    sort,
  }), [activeTab, debouncedFilters, page, query, sort]);

  const productsQuery = useProducts(params);
  const categoriesQuery = useQuery({ queryKey: ["catalog", "categories", "filter"], queryFn: getCategories, staleTime: 300000 });
  const products = productsQuery.data?.data || [];
  const meta = productsQuery.data?.meta || null;
  const categories = useMemo(() => flattenCategories(categoriesQuery.data?.data || [], []), [categoriesQuery.data]);
  const locations = useMemo(() => {
    const facetLocations = productsQuery.data?.facets?.locations;
    if (Array.isArray(facetLocations)) return facetLocations.map((item) => typeof item === "string" ? item : item.name || item.value).filter(Boolean);
    return [...new Set(products.map((product) => product.location).filter(Boolean))];
  }, [products, productsQuery.data?.facets]);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-4">
      <div className="flex gap-4">
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <FilterSidebar filters={filters} onChange={setFilters} categories={categories} locations={locations} />
        </aside>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-4 border border-gray-100" style={{ borderRadius: 5 }}>
            <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
              {FILTER_TABS.map((tab, index) => (
                <button key={tab} type="button" onClick={() => setActiveTab(index)} className={`whitespace-nowrap text-sm transition-colors ${index === activeTab ? "text-[#006e04] font-bold border-b-2 border-[#006e04] pb-1" : "text-[#3e4a39] hover:text-[#006e04]"}`}>{tab}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-xs text-[#3e4a39] whitespace-nowrap">Urutkan:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer text-[#1b1c1c]">
                <option value="relevance">Paling Sesuai</option>
                <option value="rating_desc">Ulasan Terbanyak</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="latest">Terbaru</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-[#3e4a39] mb-4">Menampilkan hasil pencarian untuk <strong className="text-[#1b1c1c]">"{query || "Semua Produk"}"</strong></p>
          {productsQuery.isLoading ? <div className="text-sm text-gray-500 py-8">Memuat hasil pencarian...</div> : null}
          {productsQuery.error ? <div className="text-sm text-red-500 py-8">{productsQuery.error.message}</div> : null}
          {!productsQuery.isLoading && !productsQuery.error && !products.length ? <div className="text-sm text-gray-500 py-8">Produk tidak ditemukan.</div> : null}
          {!productsQuery.isLoading && !productsQuery.error && products.length ? <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">{products.map((product) => <ProductCard key={product.id || product.slug} {...product} />)}</div> : null}
          <Pagination current={meta?.current_page || page} total={meta?.last_page || meta?.total_pages || 1} onChange={setPage} />
        </div>
      </div>
    </main>
  );
}
