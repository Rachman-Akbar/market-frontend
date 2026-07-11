import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCategoryHref, useCategoriesMenu } from "@/features/catalog/category/services/categoryService";

const TABS = ["Pulsa", "Paket Data", "Listrik PLN", "Roaming"];

function flattenCategories(categories = []) {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);
}

export function CategorySection() {
  const [activeTab, setActiveTab] = useState(0);
  const categoriesQuery = useCategoriesMenu();
  const quickLinks = useMemo(
    () => flattenCategories(categoriesQuery.data?.data || []).slice(0, 7),
    [categoriesQuery.data]
  );

  return (
    <div className="bg-white border border-gray-100 p-4" style={{ borderRadius: 5 }}>
      <div className="grid grid-cols-2 divide-x divide-gray-100" style={{ borderRadius: 5 }}>
        <div className="p-5">
          <h3 className="text-base font-bold mb-3">Kategori Populer</h3>

          <div
            className="relative overflow-hidden flex items-center justify-between px-6 py-4 mb-0"
            style={{ borderRadius: 5, background: "linear-gradient(135deg, #03ac0e 0%, #028a0b 100%)", minHeight: 96 }}
          >
            <div className="text-white z-10">
              <p className="text-xs font-semibold opacity-90">Yuk, belanja di Tokopedia</p>
              <p className="text-xs opacity-75 mb-3">Barang lengkap dari beragam kategori</p>
              <button
                className="px-4 py-1.5 border border-white/60 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                style={{ borderRadius: 5 }}
              >
                Cek Sekarang
              </button>
            </div>

            <div className="absolute right-4 bottom-0 opacity-90">
              <span className="material-symbols-outlined text-[52px]">shopping_bag</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-bold">Top Up &amp; Tagihan</h3>
            <a href="#" className="text-[#03ac0e] text-xs font-semibold hover:underline">Lihat Semua</a>
          </div>

          <div className="flex items-center border-b border-gray-100 mb-4">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px ${
                  i === activeTab
                    ? "text-[#03ac0e] border-[#03ac0e]"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
            <button className="ml-auto p-1 text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 items-end">
            <div>
              <p className="text-xs text-gray-500 mb-1">Jenis Produk Listrik</p>
              <select
                className="w-full px-2 py-2 border border-gray-200 text-xs focus:outline-none focus:border-[#03ac0e]"
                style={{ borderRadius: 5 }}
              >
                <option value="">Pilih layanan</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">No. Meter/ID Pel</p>
              <input
                type="text"
                placeholder="Masukan Nomor"
                className="w-full px-2 py-2 border border-gray-200 text-xs focus:outline-none focus:border-[#03ac0e]"
                style={{ borderRadius: 5 }}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Nominal</p>
              <div className="flex gap-1">
                <select
                  className="flex-1 px-2 py-2 border border-gray-200 text-xs focus:outline-none focus:border-[#03ac0e]"
                  style={{ borderRadius: 5 }}
                >
                  <option value="">Pilih nominal</option>
                </select>
                <button
                  className="px-3 py-2 bg-gray-100 text-gray-400 text-xs font-semibold border border-gray-200 cursor-not-allowed"
                  style={{ borderRadius: 5 }}
                >
                  Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {quickLinks.map((item) => (
          <Link
            key={item.id || item.slug}
            to={getCategoryHref(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-xs text-gray-700 hover:border-[#03ac0e] hover:text-[#03ac0e] transition-colors whitespace-nowrap flex-shrink-0"
            style={{ borderRadius: 20 }}
          >
            <span className="material-symbols-outlined text-[14px] text-[#03ac0e]">category</span>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
