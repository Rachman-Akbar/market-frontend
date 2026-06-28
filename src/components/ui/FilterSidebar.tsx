"use client";
import { useState } from "react";

interface FilterSidebarProps {
  showCategories?: boolean;
  categories?: string[];
}

const locations = ["DKI Jakarta", "Jabodetabek", "Bandung", "Surabaya"];
const deliveries = ["Instan (3 Jam)", "Same Day"];

export function FilterSidebar({ showCategories, categories }: FilterSidebarProps) {
  const [locationOpen, setLocationOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-100 p-4 sticky top-24" style={{ borderRadius: 5 }}>
      <h3 className="text-lg font-bold text-[#1b1c1c] mb-4">Filter</h3>

      {/* Categories */}
      {showCategories && categories && (
        <div className="mb-6">
          <h4 className="text-xs font-bold mb-2">Kategori</h4>
          <ul className="space-y-2">
            {categories.map((cat, i) => (
              <li
                key={cat}
                className={`text-sm cursor-pointer ${i === 0 ? "text-[#006e04] font-bold" : "text-[#3e4a39] hover:text-[#006e04]"}`}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lokasi */}
      <div className="border-b border-[#bccbb4] pb-4 mb-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setLocationOpen(!locationOpen)}
        >
          <span className="text-xs font-bold">Lokasi</span>
          <span className="material-symbols-outlined text-sm">{locationOpen ? "expand_less" : "expand_more"}</span>
        </div>
        {locationOpen && (
          <div className="space-y-3">
            {locations.map((loc) => (
              <label key={loc} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded text-[#006e04] focus:ring-[#006e04] h-4 w-4 border-[#6d7b67]"
                />
                <span className="text-sm group-hover:text-[#006e04] transition-colors">{loc}</span>
              </label>
            ))}
            <button className="text-[#006e04] text-xs font-bold mt-1 hover:underline">Lihat Selengkapnya</button>
          </div>
        )}
      </div>

      {/* Pengiriman */}
      <div className="border-b border-[#bccbb4] pb-4 mb-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setDeliveryOpen(!deliveryOpen)}
        >
          <span className="text-xs font-bold">Pengiriman</span>
          <span className="material-symbols-outlined text-sm">{deliveryOpen ? "expand_less" : "expand_more"}</span>
        </div>
        {deliveryOpen && (
          <div className="space-y-3">
            {deliveries.map((d) => (
              <label key={d} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded text-[#006e04] focus:ring-[#006e04] h-4 w-4 border-[#6d7b67]"
                />
                <span className="text-sm group-hover:text-[#006e04] transition-colors">{d}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Harga */}
      <div className="pb-4">
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setPriceOpen(!priceOpen)}
        >
          <span className="text-xs font-bold">Harga</span>
          <span className="material-symbols-outlined text-sm">{priceOpen ? "expand_less" : "expand_more"}</span>
        </div>
        {priceOpen && (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3e4a39] text-xs">Rp</span>
              <input
                className="w-full pl-8 pr-3 py-1.5 border border-[#bccbb4] rounded-lg text-xs focus:ring-[#006e04] focus:border-[#006e04] outline-none"
                placeholder="Harga Minimum"
                type="text"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3e4a39] text-xs">Rp</span>
              <input
                className="w-full pl-8 pr-3 py-1.5 border border-[#bccbb4] rounded-lg text-xs focus:ring-[#006e04] focus:border-[#006e04] outline-none"
                placeholder="Harga Maksimum"
                type="text"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
