import { useState } from "react";

const deliveryOptions = [
  { value: "jne", label: "JNE" },
  { value: "jnt", label: "J&T" },
  { value: "sicepat", label: "SiCepat" },
  { value: "express", label: "Express Internal" },
];

function toggleValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function FilterSidebar({ showCategories = true, categories = [], locations = [], filters, onChange }) {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const update = (patch) => onChange?.({ ...filters, ...patch });

  return (
    <div className="bg-white border border-gray-100 p-4 sticky top-24" style={{ borderRadius: 5 }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1b1c1c]">Filter</h3>
        <button type="button" onClick={() => onChange?.({ categories: [], locations: [], couriers: [], minPrice: "", maxPrice: "" })} className="text-xs font-bold text-[#006e04] hover:underline">Reset</button>
      </div>

      {showCategories && categories.length > 0 ? (
        <div className="border-b border-[#bccbb4] pb-4 mb-4">
          <button type="button" className="mb-3 flex w-full items-center justify-between" onClick={() => setCategoryOpen((value) => !value)}>
            <span className="text-xs font-bold">Kategori</span>
            <span className="material-symbols-outlined text-sm">{categoryOpen ? "expand_less" : "expand_more"}</span>
          </button>
          {categoryOpen ? (
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {categories.map((category) => (
                <label key={category.id || category.slug} className="flex cursor-pointer items-center gap-2 group">
                  <input type="checkbox" checked={filters.categories.includes(String(category.id))} onChange={() => update({ categories: toggleValue(filters.categories, String(category.id)) })} className="rounded text-[#006e04] focus:ring-[#006e04] h-4 w-4 border-[#6d7b67]" />
                  <span className="text-sm group-hover:text-[#006e04] transition-colors">{category.name}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {locations.length > 0 ? (
        <div className="border-b border-[#bccbb4] pb-4 mb-4">
          <button type="button" className="flex w-full items-center justify-between mb-3" onClick={() => setLocationOpen((value) => !value)}>
            <span className="text-xs font-bold">Lokasi</span>
            <span className="material-symbols-outlined text-sm">{locationOpen ? "expand_less" : "expand_more"}</span>
          </button>
          {locationOpen ? (
            <div className="space-y-3">
              {locations.map((location) => (
                <label key={location} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={filters.locations.includes(location)} onChange={() => update({ locations: toggleValue(filters.locations, location) })} className="rounded text-[#006e04] focus:ring-[#006e04] h-4 w-4 border-[#6d7b67]" />
                  <span className="text-sm group-hover:text-[#006e04] transition-colors">{location}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="border-b border-[#bccbb4] pb-4 mb-4">
        <button type="button" className="flex w-full items-center justify-between mb-3" onClick={() => setDeliveryOpen((value) => !value)}>
          <span className="text-xs font-bold">Pengiriman</span>
          <span className="material-symbols-outlined text-sm">{deliveryOpen ? "expand_less" : "expand_more"}</span>
        </button>
        {deliveryOpen ? (
          <div className="space-y-3">
            {deliveryOptions.map((delivery) => (
              <label key={delivery.value} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={filters.couriers.includes(delivery.value)} onChange={() => update({ couriers: toggleValue(filters.couriers, delivery.value) })} className="rounded text-[#006e04] focus:ring-[#006e04] h-4 w-4 border-[#6d7b67]" />
                <span className="text-sm group-hover:text-[#006e04] transition-colors">{delivery.label}</span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pb-4">
        <button type="button" className="flex w-full items-center justify-between mb-3" onClick={() => setPriceOpen((value) => !value)}>
          <span className="text-xs font-bold">Harga</span>
          <span className="material-symbols-outlined text-sm">{priceOpen ? "expand_less" : "expand_more"}</span>
        </button>
        {priceOpen ? (
          <div className="space-y-3">
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3e4a39] text-xs">Rp</span><input value={filters.minPrice} onChange={(event) => update({ minPrice: event.target.value.replace(/\D/g, "") })} className="w-full pl-8 pr-3 py-1.5 border border-[#bccbb4] rounded-lg text-xs focus:ring-[#006e04] focus:border-[#006e04] outline-none" placeholder="Harga Minimum" inputMode="numeric" /></div>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3e4a39] text-xs">Rp</span><input value={filters.maxPrice} onChange={(event) => update({ maxPrice: event.target.value.replace(/\D/g, "") })} className="w-full pl-8 pr-3 py-1.5 border border-[#bccbb4] rounded-lg text-xs focus:ring-[#006e04] focus:border-[#006e04] outline-none" placeholder="Harga Maksimum" inputMode="numeric" /></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
