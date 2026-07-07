import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { getProducts } from "@/features/catalog/product/services/productService";
import { getCatalogGroups } from "@/features/catalog/cataloggroup/services/catalogGroupService";

export function ProductFeed() {
  const [activeTab, setActiveTab] = useState(0);
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabs = useMemo(() => ["For You", ...groups.map((group) => group.name)], [groups]);

  useEffect(() => {
    let mounted = true;

    getCatalogGroups({ is_active: 1 })
      .then((result) => {
        if (mounted) setGroups(result.data.slice(0, 6));
      })
      .catch(() => {
        if (mounted) setGroups([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const selectedGroup = groups[activeTab - 1];
    const params = selectedGroup
      ? { catalog_group_id: selectedGroup.id, catalog_group_slug: selectedGroup.slug, limit: 12 }
      : { limit: 12 };

    setLoading(true);
    setError("");

    getProducts(params)
      .then((result) => {
        if (mounted) setProducts(result.data);
      })
      .catch((err) => {
        if (mounted) {
          setProducts([]);
          setError(err.message || "Gagal memuat produk");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeTab, groups]);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar border-b border-[#bccbb4] pb-2">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`whitespace-nowrap pb-2 text-base transition-colors ${
              i === activeTab
                ? "font-bold text-[#006e04] border-b-2 border-[#006e04]"
                : "text-[#3e4a39] hover:text-[#006e04]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-gray-500 py-8">Memuat produk...</div>}
      {error && <div className="text-sm text-red-500 py-8">{error}</div>}
      {!loading && !error && !products.length && <div className="text-sm text-gray-500 py-8">Produk belum tersedia.</div>}
      {!loading && !error && !!products.length && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id || p.slug} {...p} />
          ))}
        </div>
      )}

      <div className="flex justify-center py-4">
        <button className="px-12 py-2 border border-[#bccbb4] text-[#1b1c1c] font-bold rounded-lg hover:bg-[#f6f3f2] transition-all">
          Lihat Selengkapnya
        </button>
      </div>
    </section>
  );
}
