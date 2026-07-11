import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { getCategoryByPath, getProductsByCategoryPath } from "@/features/catalog/category/services/categoryService";
import { normalizeProduct } from "@/features/catalog/product/services/productService";

const DEFAULT_LIMIT = 20;
const INITIAL_FILTERS = {
  categories: [],
  locations: [],
  couriers: [],
  minPrice: "",
  maxPrice: "",
};

function titleFromSlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function mapSort(value) {
  if (value === "newest") return "newest";
  if (value === "price_asc") return "price_asc";
  if (value === "price_desc") return "price_desc";
  return "relevance";
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params["*"] || params.slug || "";
  const scrollerRef = useRef(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    setPage(1);
    setFilters(INITIAL_FILTERS);
  }, [slug]);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  const productParams = useMemo(() => ({
    page,
    per_page: DEFAULT_LIMIT,
    sort: mapSort(sort),
    category_ids: filters.categories.length ? filters.categories.join(",") : undefined,
    locations: filters.locations.length ? filters.locations.join(",") : undefined,
    couriers: filters.couriers.length ? filters.couriers.join(",") : undefined,
    min_price: filters.minPrice || undefined,
    max_price: filters.maxPrice || undefined,
  }), [filters, page, sort]);

  const categoryQuery = useQuery({
    queryKey: ["catalog", "category", "path", slug],
    queryFn: () => getCategoryByPath(slug),
    enabled: Boolean(slug),
    staleTime: 300000,
  });

  const productsQuery = useQuery({
    queryKey: ["catalog", "category", "products", slug, productParams],
    queryFn: () => getProductsByCategoryPath(slug, productParams),
    enabled: Boolean(slug),
    staleTime: 60000,
    placeholderData: (previous) => previous,
  });

  const category = categoryQuery.data || null;
  const products = useMemo(
    () => (productsQuery.data?.data || []).map(normalizeProduct),
    [productsQuery.data]
  );
  const meta = productsQuery.data?.meta || null;
  const rawFacets = productsQuery.data?.raw?.facets || productsQuery.data?.raw?.data?.facets || {};
  const categoryName = category?.name || titleFromSlug(slug) || "Kategori";
  const childCategories = category?.children || [];
  const categoryBubbles = childCategories.filter((item) => item.image_url);
  const sidebarCategories = childCategories;
  const locations = useMemo(() => unique([
    ...(Array.isArray(rawFacets.locations) ? rawFacets.locations.map((item) => typeof item === "string" ? item : item?.name || item?.value) : []),
    ...products.map((product) => product.location),
  ]), [products, rawFacets.locations]);
  const totalProducts = meta?.total || meta?.total_items || products.length;
  const totalPages = meta?.last_page || meta?.total_pages || 1;
  const loading = categoryQuery.isLoading || productsQuery.isLoading;
  const error = productsQuery.error?.message || categoryQuery.error?.message || "";

  return (
    <div className="w-full">
      <section className="bg-[#03ac0e] text-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">{categoryName}</h2>
          {!!categoryBubbles.length && (
            <div className="relative group">
              <div ref={scrollerRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth">
                {categoryBubbles.map((bubble) => (
                  <div key={bubble.id || bubble.slug} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border-2 border-transparent hover:border-[#76ff64] transition-all">
                      <img src={bubble.image_url} alt={bubble.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-center w-20">{bubble.name}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white text-[#1b1c1c] rounded-full shadow-lg flex items-center justify-center hover:bg-[#f6f3f2] transition-colors" onClick={() => scrollerRef.current?.scrollBy({ left: 200, behavior: "smooth" })}>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <nav className="text-xs text-[#3e4a39] mb-6">
          <span>Beranda</span><span className="mx-2">&gt;</span><span>Kategori Utama</span>
          {category?.parent_id && <><span className="mx-2">&gt;</span><span>Sub Kategori</span></>}
          <span className="mx-2">&gt;</span><span className="text-[#1b1c1c] font-bold">{categoryName}</span>
        </nav>

        <div className="flex gap-4">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <FilterSidebar showCategories categories={sidebarCategories} locations={locations} filters={filters} onChange={setFilters} />
          </aside>

          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#3e4a39]">Menampilkan {totalProducts} produk untuk "{categoryName}"</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Urutkan:</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="border border-[#bccbb4] rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-[#006e04] bg-white">
                  <option value="relevance">Paling Sesuai</option>
                  <option value="newest">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {loading && <div className="text-sm text-gray-500 py-8">Memuat produk...</div>}
            {error && <div className="text-sm text-red-500 py-8">{error}</div>}
            {!loading && !error && !products.length && <div className="text-sm text-gray-500 py-8">Produk belum tersedia.</div>}
            {!loading && !error && !!products.length && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {products.map((product) => <ProductCard key={product.id || product.slug} {...product} />)}
              </div>
            )}

            <Pagination current={meta?.current_page || page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
