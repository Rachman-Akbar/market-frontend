import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { getProducts } from "@/features/catalog/product/services/productService";

const FILTER_TABS = ["Semua", "Official Store", "Power Merchant", "Diskon"];

export default function SearchClient() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getProducts({ search: query, q: query, page: 1 })
      .then((result) => {
        if (!mounted) return;
        setProducts(result.data);
        setMeta(result.meta);
      })
      .catch((err) => {
        if (!mounted) return;
        setProducts([]);
        setMeta(null);
        setError(err.message || "Gagal memuat hasil pencarian");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-4">
      <div className="flex gap-4">
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <FilterSidebar />
        </aside>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-4 border border-gray-100" style={{ borderRadius: 5 }}>
            <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
              {FILTER_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`whitespace-nowrap text-sm transition-colors ${
                    i === activeTab
                      ? "text-[#006e04] font-bold border-b-2 border-[#006e04] pb-1"
                      : "text-[#3e4a39] hover:text-[#006e04]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-xs text-[#3e4a39] whitespace-nowrap">Urutkan:</span>
              <select className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer text-[#1b1c1c]">
                <option>Paling Sesuai</option>
                <option>Ulasan Terbanyak</option>
                <option>Harga Terendah</option>
                <option>Harga Tertinggi</option>
                <option>Terbaru</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-[#3e4a39] mb-4">
            Menampilkan hasil pencarian untuk <strong className="text-[#1b1c1c]">"{query || "Semua Produk"}"</strong>
          </p>
          {loading && <div className="text-sm text-gray-500 py-8">Memuat hasil pencarian...</div>}
          {error && <div className="text-sm text-red-500 py-8">{error}</div>}
          {!loading && !error && !products.length && <div className="text-sm text-gray-500 py-8">Produk tidak ditemukan.</div>}
          {!loading && !error && !!products.length && (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id || p.slug} {...p} />
              ))}
            </div>
          )}
          <Pagination current={meta?.current_page || 1} total={meta?.last_page || meta?.total_pages || 1} />
        </div>
      </div>
    </main>
  );
}
