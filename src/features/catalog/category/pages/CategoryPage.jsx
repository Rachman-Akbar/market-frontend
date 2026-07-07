import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { getCategoryByPath, getProductsByCategoryPath } from "@/features/catalog/category/services/categoryService";
import { normalizeProduct } from "@/features/catalog/product/services/productService";

function titleFromSlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function collectCategoryNames(categories = []) {
  return categories.map((category) => category.name).filter(Boolean);
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params["*"] || params.slug || "";
  const scrollerRef = useRef(null);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.allSettled([
      getCategoryByPath(slug),
      getProductsByCategoryPath(slug, { page: 1 }),
    ])
      .then(([categoryResult, productsResult]) => {
        if (!mounted) return;

        if (categoryResult.status === "fulfilled") {
          setCategory(categoryResult.value);
        } else {
          setCategory(null);
        }

        if (productsResult.status === "fulfilled") {
          setProducts(productsResult.value.data.map(normalizeProduct));
          setMeta(productsResult.value.meta);
        } else {
          setProducts([]);
          setMeta(null);
          setError(productsResult.reason?.message || "Gagal memuat produk kategori");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const categoryName = category?.name || titleFromSlug(slug) || "Kategori";
  const childCategories = category?.children || [];
  const categoryBubbles = childCategories.filter((item) => item.image_url);
  const sidebarCategories = useMemo(() => collectCategoryNames(childCategories), [childCategories]);
  const totalProducts = meta?.total || meta?.total_items || products.length;
  const totalPages = meta?.last_page || meta?.total_pages || 1;

  return (
    <div className="w-full">
      <section className="bg-[#03ac0e] text-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">{categoryName}</h2>
          {!!categoryBubbles.length && (
            <div className="relative group">
              <div
                ref={scrollerRef}
                className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
              >
                {categoryBubbles.map((bubble) => (
                  <div key={bubble.id || bubble.slug} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border-2 border-transparent hover:border-[#76ff64] transition-all">
                      <img src={bubble.image_url} alt={bubble.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-center w-20">{bubble.name}</span>
                  </div>
                ))}
              </div>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white text-[#1b1c1c] rounded-full shadow-lg flex items-center justify-center hover:bg-[#f6f3f2] transition-colors"
                onClick={() => scrollerRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <nav className="text-xs text-[#3e4a39] mb-6">
          <span>Beranda</span>
          <span className="mx-2">&gt;</span>
          <span>Kategori Utama</span>
          {category?.parent_id && (
            <>
              <span className="mx-2">&gt;</span>
              <span>Sub Kategori</span>
            </>
          )}
          <span className="mx-2">&gt;</span>
          <span className="text-[#1b1c1c] font-bold">{categoryName}</span>
        </nav>

        <div className="flex gap-4">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <FilterSidebar showCategories categories={sidebarCategories} />
          </aside>

          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#3e4a39]">Menampilkan {totalProducts} produk untuk "{categoryName}"</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Urutkan:</span>
                <select className="border border-[#bccbb4] rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-[#006e04] bg-white">
                  <option>Paling Sesuai</option>
                  <option>Terbaru</option>
                  <option>Harga Terendah</option>
                  <option>Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {loading && <div className="text-sm text-gray-500 py-8">Memuat produk...</div>}
            {error && <div className="text-sm text-red-500 py-8">{error}</div>}
            {!loading && !error && !products.length && <div className="text-sm text-gray-500 py-8">Produk belum tersedia.</div>}
            {!loading && !error && !!products.length && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id || p.slug} {...p} />
                ))}
              </div>
            )}

            <Pagination current={meta?.current_page || 1} total={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
