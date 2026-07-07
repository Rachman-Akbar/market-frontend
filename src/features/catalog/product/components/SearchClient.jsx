import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";

const FILTER_TABS = ["Semua", "Official Store", "Power Merchant", "Diskon"];

const SEARCH_PRODUCTS = [
  { slug: "asus-rog-g14", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlOWmULJdLITIf7GX2zt9YKS14uIG5RgpUzTshzs4kCOQJELvC-dj9u8BKYH76xoH_BbPKrs5A5LzQqHIMIz2G-IhyzgpVGP4__YyQQFFfs-5l8PCCJ258lnMKjm_sT746AnGBVWeBMuAfwOyyfuOkMBVbLD3N7kU4KlZxa6AohRemjeS6wxpzF1e7I-kBmxHR_GxOcUKlkUR2JQLzSnRUkIT3DIFQP9qchvuNWyy4d4XWoN7ezE8GfkbZFFUOjTNXdTc11UxYbTjG", title: "ASUS ROG Zephyrus G14 GA401 - Ryzen 7 16GB 512GB RTX3050", price: "Rp18.499.000", discountPct: "12%", originalPrice: "Rp21.000.000", location: "Jakarta Barat", rating: "4.9", sold: "250+" },
  { slug: "macbook-air-m2", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjOnxalT0nkYQ4vIUl6slQ63O07AEyQUZHjgLcjgQIXJIc2y08TQ2CKcUjxldsZI7BhA8ZV2smAWKwKJ4jD0XXXtSEXt_7CPdD-U7q3P-MPSye9CbnpjYaGlrvmFFM_UmbQkHecMF7bp36jjC80sUnQz4rMrafPb8At-xwFWjgHXLkHDixkGAOUjaQshFHxXvjbsXUsl_K0qxnsAqP9BEk8ew29KIC9zFv_kuPCluN9NiVhOA5tBmF3_k_S0tPB3fdmjgMhQrEKsyh", title: "MacBook Air M2 2023 Chip 13 inch 8GB 256GB - Midnight", price: "Rp15.999.000", discountPct: "5%", originalPrice: "Rp16.800.000", location: "Jakarta Pusat", rating: "5.0", sold: "1rb+" },
  { slug: "lenovo-legion-5-pro", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g8TAueZpOG52DaWTa5PvX-Ney2daHFw4JOCr5IFGvCcio3lV5GhzCpRzIs42uO32WWHdV2YmYa1-Vz1qJEWOucWVIaBgVgg16S2YOTu0gYmyId3UmeOr16E6sP82iEKmATAyna5rI-V9-ytYQloLYKD4yTcSErd2DTXnFPgJyIOteI6XQzi3BwaDUWJTvOuzT7B17httykmbSdkogdvz98QUa2lxKeuF9pBIMOQTaR7EupV9fN5pFibNexF0NkHZI14-r4o3k38t", title: "Lenovo Legion 5 Pro i7 12700H 16GB 1TB RTX3060 W11", price: "Rp22.150.000", discountPct: "8%", originalPrice: "Rp24.000.000", location: "Jakarta Utara", rating: "4.8", sold: "100+" },
  { slug: "acer-nitro-v15", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3SeGOng6SofW6LCc91SwbZo6OCM1T2J5bUQtdJwfZffqpCRbkA1sJswPyEBLW078fKf27D0MAWoO4zgKoxIVIxdSFrKD_0g5pKcfFi6JwBzfBb68_tpXknLiainNoQ9rx9Pc82Vp6EZ_OYE3S_SUd1huhSVAUtOjQqkLLFREJG8lbsxq8qpoQk63TQUBKCHSFIasyJ6sw0CEn8Hq2GT12VlDY0k-KdIhArs_0nCAHJyuj3C8lkH_Q8xy01zGt-wq9ybRcZytu6ouC", title: "Acer Nitro V 15 Intel Core i5-13420H 8GB 512GB RTX2050", price: "Rp10.899.000", discountPct: "15%", originalPrice: "Rp12.500.000", location: "Tangerang", rating: "4.7", sold: "500+" },
  { slug: "msi-katana-gf66", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbhYlGeSi9kXV-2ArftF996xK8bQ1FHoVnspTE6nts-NVd2TJ-MqvvMdgBSZEoV-u_NHkp8qDjynnFJ7Qsb2chJN04otWUTH3gibXM6ZhxbZKgogm5b2lfqROLvaGxHm8vcUPLXMH6TNFW3phCTZjtPSQM1h39T_ovp2MYLgxOKTNbbIofNqJmDcy_d3I7ze3k5pURFgCNOjIInu-IBn1ATXyVjSII_3WKN0zqmRm5TbobN-Y22sZy9jwg8b6Da2-xxRHkDB-YSnWT", title: "MSI Katana GF66 i7-12700H 16GB 512GB RTX3050Ti", price: "Rp14.200.000", discountPct: "10%", originalPrice: "Rp15.700.000", location: "Bekasi", rating: "4.9", sold: "75+" },
  { slug: "hp-victus-15", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiV_217qUqrYxzibo8VH0snSl3Sr0a9tHSzUTa3lGhXVzzb81W3z5W9l7p9qrVMPpfvYeDB4lwv_U3Mm3BOZbfuyXY1t3u9xq_26YKuAAJLUhH7hivt5p2QJz92adb23aNxBxcfWy7tTpTyvpnCgit_LCDIJ8Kzi0kBatBbXQfmcbOxkI7DIReENVNJsKT0QaNzFmM5iRSFHSmEOxIsnTE6mHWs0W9D1GSkP7t5u2uTLVAHNp3H76NzQJ1gsyDa9-Jfx2YQDvZizMH", title: "HP Victus 15 Ryzen 5 5600H 8GB 512GB RX6500M", price: "Rp9.499.000", discountPct: "20%", originalPrice: "Rp11.870.000", location: "Depok", rating: "4.6", sold: "1.2rb+" },
  { slug: "dell-g15-5520", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjOnxalT0nkYQ4vIUl6slQ63O07AEyQUZHjgLcjgQIXJIc2y08TQ2CKcUjxldsZI7BhA8ZV2smAWKwKJ4jD0XXXtSEXt_7CPdD-U7q3P-MPSye9CbnpjYaGlrvmFFM_UmbQkHecMF7bp36jjC80sUnQz4rMrafPb8At-xwFWjgHXLkHDixkGAOUjaQshFHxXvjbsXUsl_K0qxnsAqP9BEk8ew29KIC9zFv_kuPCluN9NiVhOA5tBmF3_k_S0tPB3fdmjgMhQrEKsyh", title: "Dell G15 5520 i5-12500H 16GB 512GB RTX3050", price: "Rp13.750.000", location: "Jakarta Selatan", rating: "4.8", sold: "30+" },
  { slug: "razer-blade-14", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlOWmULJdLITIf7GX2zt9YKS14uIG5RgpUzTshzs4kCOQJELvC-dj9u8BKYH76xoH_BbPKrs5A5LzQqHIMIz2G-IhyzgpVGP4__YyQQFFfs-5l8PCCJ258lnMKjm_sT746AnGBVWeBMuAfwOyyfuOkMBVbLD3N7kU4KlZxa6AohRemjeS6wxpzF1e7I-kBmxHR_GxOcUKlkUR2JQLzSnRUkIT3DIFQP9qchvuNWyy4d4XWoN7ezE8GfkbZFFUOjTNXdTc11UxYbTjG", title: "Razer Blade 14 QHD 165Hz Ryzen 9 5900HX RTX3070", price: "Rp34.500.000", discountPct: "5%", originalPrice: "Rp36.300.000", location: "Jakarta Pusat", rating: "5.0", sold: "15" },
  { slug: "axioo-pongo-725", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g8TAueZpOG52DaWTa5PvX-Ney2daHFw4JOCr5IFGvCcio3lV5GhzCpRzIs42uO32WWHdV2YmYa1-Vz1qJEWOucWVIaBgVgg16S2YOTu0gYmyId3UmeOr16E6sP82iEKmATAyna5rI-V9-ytYQloLYKD4yTcSErd2DTXnFPgJyIOteI6XQzi3BwaDUWJTvOuzT7B17httykmbSdkogdvz98QUa2lxKeuF9pBIMOQTaR7EupV9fN5pFibNexF0NkHZI14-r4o3k38t", title: "Axioo Pongo 725 Intel Core i7-12650H RTX2050 16GB", price: "Rp9.999.000", discountPct: "15%", originalPrice: "Rp11.750.000", location: "Bandung", rating: "4.7", sold: "100+" },
  { slug: "infinix-inbook-x2", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3SeGOng6SofW6LCc91SwbZo6OCM1T2J5bUQtdJwfZffqpCRbkA1sJswPyEBLW078fKf27D0MAWoO4zgKoxIVIxdSFrKD_0g5pKcfFi6JwBzfBb68_tpXknLiainNoQ9rx9Pc82Vp6EZ_OYE3S_SUd1huhSVAUtOjQqkLLFREJG8lbsxq8qpoQk63TQUBKCHSFIasyJ6sw0CEn8Hq2GT12VlDY0k-KdIhArs_0nCAHJyuj3C8lkH_Q8xy01zGt-wq9ybRcZytu6ouC", title: "Infinix INBook X2 Intel Core i3-1115G4 8GB 256GB", price: "Rp5.299.000", discountPct: "25%", originalPrice: "Rp7.000.000", location: "Medan", rating: "4.5", sold: "2.1rb+" },
];

export default function SearchClient() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "Laptop Gaming";
  const [activeTab, setActiveTab] = useState(0);

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
            Menampilkan hasil pencarian untuk <strong className="text-[#1b1c1c]">"{query}"</strong>
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {SEARCH_PRODUCTS.map((p) => (
              <ProductCard key={p.slug} {...p} />
            ))}
          </div>
          <Pagination current={1} total={5} />
        </div>
      </div>
    </main>
  );
}
