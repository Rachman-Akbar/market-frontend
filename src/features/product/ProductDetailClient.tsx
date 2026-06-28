"use client";
import { useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { VariantSelector } from "./VariantSelector";
import { CheckoutSidebar } from "./CheckoutSidebar";
import { ReviewSection } from "./ReviewSection";

const DETAIL_TABS = ["Detail Produk", "Panduan"];

export function ProductDetailClient() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-[#03ac0e] font-semibold">
        <div className="flex items-center flex-wrap gap-1">
          {["Home", "Olahraga", "Perlengkapan Lari", "Sepatu Lari Pria"].map((crumb) => (
            <span key={crumb} className="after:content-['>'] after:mx-2 after:text-gray-400">
              <a href="#" className="hover:underline">{crumb}</a>
            </span>
          ))}
          <span className="text-gray-400">Sepatu Saganext Phoenix Running Rin...</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <section className="lg:col-span-4">
          <ImageGallery />
        </section>

        {/* Product Info */}
        <section className="lg:col-span-5">
          <h1 className="text-xl font-bold leading-tight mb-1">
            Sepatu Saganext Phoenix Running Ringan TPU Plat Series - PHOENIX Citroen, 37
          </h1>

          {/* Stats */}
          <div className="flex items-center text-sm mb-4 gap-2">
            <span className="text-gray-500">
              Terjual <span className="text-gray-800 font-semibold">10 rb+</span>
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold">4.8</span>
              <span className="text-gray-500">(2.096 rating)</span>
            </div>
          </div>

          <div className="text-3xl font-bold mb-6">Rp162.000</div>
          <hr className="mb-6 border-gray-100" />

          <VariantSelector />

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex gap-8">
              {DETAIL_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    i === activeTab
                      ? "border-[#03ac0e] text-[#03ac0e] font-bold"
                      : "border-transparent text-gray-500 hover:text-[#03ac0e]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Detail content */}
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-1 gap-2">
              {[
                ["Kondisi:", "Baru"],
                ["Berat Satuan:", "1 kg"],
                ["Min. Beli:", "1 Buah"],
                ["Kategori:", "Sepatu Lari Pria"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-500 w-24">{label}</span>
                  <span className="font-bold">{val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="leading-relaxed">
                ✨ Sepatu Saganext Running Phoenix Series adalah pilihan tepat untuk aktivitas lari Anda.
                Dengan desain yang sporty, sepatu ini memberikan kenyamanan maksimal.
              </p>
              <div>
                <h3 className="font-bold mb-1">Fitur Utama</h3>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Desain Sporty: Meningkatkan kenyamanan saat berlari.</li>
                  <li>Kenyamanan Maksimal: Cocok untuk berbagai jarak lari.</li>
                  <li>Pilihan Tepat: Ideal untuk pemula dan penggemar lari.</li>
                </ul>
              </div>
              <button className="text-[#03ac0e] font-bold">Lihat Selengkapnya</button>
            </div>

            <hr className="border-gray-100" />

            {/* Store info */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuClEJBp5Ci3V4TUSNMOga2SQYQpV6xA77-Pg1gPr23xbWU-tVBSkRRlqWJC2K0mKw2JkmVXWK0cVUyVpgRU14rtu5IPRyFeP1JlePYHvNHkp9-obXtxvd-h3smMZwq4T-JoY5Rjolb_matnL4dtcW_ib2-bzsE8vbLjt1P2XF6BlQ6mgs857n9fUGQ_hVWcYBilbOqPXKva6Byjtreg72p-MFXpymPKMK5gCqZrafeJ5-R0RXif63TVKmmDCM8sNiHZwYEjg8ztcciW"
                    alt="store"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">Saganext</span>
                    <svg className="w-4 h-4 text-[#03ac0e]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    4.8 (7 rb)
                  </div>
                </div>
              </div>
              <button className="px-6 py-1.5 border border-[#03ac0e] text-[#03ac0e] font-bold rounded-lg hover:bg-gray-50">
                Follow
              </button>
            </div>
          </div>
        </section>

        {/* Checkout Sidebar */}
        <aside className="lg:col-span-3">
          <CheckoutSidebar />
        </aside>

        {/* Reviews — full width */}
        <div className="lg:col-span-9">
          <ReviewSection />
        </div>
      </div>
    </main>
  );
}
