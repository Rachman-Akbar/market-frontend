"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/store/authContext";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";

// Mini bar chart
const SALES = [12, 19, 8, 24, 17, 30, 22];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MAX = Math.max(...SALES);

function StoreTooltip() {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 z-50 overflow-hidden"
      style={{ borderRadius: 5, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
    >
      <div className="bg-[#03ac0e] px-4 py-3">
        <p className="text-white text-xs font-bold">Performa Toko Minggu Ini</p>
        <p className="text-white/80 text-[10px] mt-0.5">Saganext Official Store</p>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Pesanan", value: "132" },
            { label: "Pendapatan", value: "4.2jt" },
            { label: "Rating", value: "4.9★" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[11px] font-bold text-gray-800">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-1 h-16">
          {SALES.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full bg-[#03ac0e]/80 rounded-sm"
                style={{ height: `${(v / MAX) * 48}px` }}
              />
              <span className="text-[9px] text-gray-400">{DAYS[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link href="/seller" className="block w-full text-center text-xs font-bold text-[#03ac0e] hover:underline">
            Kelola Toko →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileTooltip({ onClose }: { onClose: () => void }) {
  function open(path: string) {
    window.open(path, "_blank");
    onClose();
  }
  return (
    <div
      className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 z-50 py-1"
      style={{ borderRadius: 5, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
    >
      {[
        { icon: "person", label: "Profil Saya", path: "/profile" },
        { icon: "receipt_long", label: "Pesanan Saya", path: "/profile/orders" },
        { icon: "favorite", label: "Wishlist", path: "/profile/wishlist" },
        { icon: "location_on", label: "Alamat Saya", path: "/profile/addresses" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => open(item.path)}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-left"
        >
          <span className="material-symbols-outlined text-[18px] text-gray-500">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [storeHover, setStoreHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleProfileClick() {
    window.open("/profile", "_blank");
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-8 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#006e04]">smartphone</span>
            <span><strong className="text-gray-700">Gratis Ongkir + Banyak Promo</strong> belanja di aplikasi</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>
          <div className="flex items-center gap-5">
            {["Tentang Tokopedia", "Pusat Edukasi Seller", "Promo", "Tokopedia Care"].map((item) => (
              <a key={item} href="#" className="hover:text-[#006e04] transition-colors whitespace-nowrap">{item}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Main header — relative for dropdown */}
      <div className="relative bg-white">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="text-[22px] font-bold text-[#006e04] flex-shrink-0 leading-none">
            tokopedia
          </Link>

          {/* Kategori toggle */}
          <button
            onClick={() => setCategoryOpen((o) => !o)}
            className={`flex items-center gap-1 text-sm font-semibold whitespace-nowrap px-3 py-1.5 transition-colors border ${
              categoryOpen
                ? "border-[#03ac0e] text-[#03ac0e] bg-[#f0fff0]"
                : "border-gray-300 text-gray-700 hover:border-[#03ac0e] hover:text-[#03ac0e]"
            }`}
            style={{ borderRadius: 5 }}
          >
            Kategori
            <span className="material-symbols-outlined text-[16px]">
              {categoryOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0">
            <div
              className="flex items-center border border-gray-300 px-3 py-2 focus-within:border-[#006e04] transition-all"
              style={{ borderRadius: 5 }}
            >
              <span className="material-symbols-outlined text-gray-400 text-[20px] mr-2 flex-shrink-0">search</span>
              <input
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm min-w-0"
                placeholder="Cari di Tokopedia"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/cart" className="p-2 hover:bg-gray-100 text-gray-600" style={{ borderRadius: 5 }}>
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            </Link>

            {user ? (
              <>
                {/* Toko with hover chart */}
                <div
                  className="relative"
                  onMouseEnter={() => setStoreHover(true)}
                  onMouseLeave={() => setStoreHover(false)}
                >
                  <Link
                    href="/seller"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-[#006e04] border border-gray-200 hover:border-[#006e04] transition-colors"
                    style={{ borderRadius: 5 }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinejoin="round" />
                      <path d="M9 22V12h6v10" strokeLinejoin="round" />
                    </svg>
                    <span className="hidden lg:inline">Toko</span>
                  </Link>
                  <div className={`transition-all duration-200 origin-top-right ${storeHover ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                    <StoreTooltip />
                  </div>
                </div>

                {/* Profile — hover shows modal, click opens new tab */}
                <div
                  ref={profileRef}
                  className="relative"
                  onMouseEnter={() => setProfileHover(true)}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 transition-colors"
                    style={{ borderRadius: 5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#03ac0e] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 max-w-[72px] truncate hidden lg:inline">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-gray-400">expand_more</span>
                  </button>

                  <div className={`transition-all duration-200 origin-top-right ${profileHover ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                    <ProfileTooltip onClose={() => setProfileHover(false)} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 border border-[#006e04] text-[#006e04] text-sm font-bold hover:bg-green-50 transition-all whitespace-nowrap"
                  style={{ borderRadius: 5 }}
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 bg-[#03ac0e] text-white text-sm font-bold hover:bg-[#028a0b] transition-all whitespace-nowrap"
                  style={{ borderRadius: 5 }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Category Dropdown — positioned relative to this div */}
        <CategoryDropdown open={categoryOpen} onClose={() => setCategoryOpen(false)} />
      </div>

      {/* Location bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-1 flex items-center justify-end gap-1 text-xs text-gray-500">
          <span className="material-symbols-outlined text-[14px] text-[#006e04]">location_on</span>
          <span>Dikirim ke <strong className="text-gray-800">Jakarta Pusat</strong></span>
          <span className="material-symbols-outlined text-[14px] cursor-pointer">expand_more</span>
        </div>
      </div>
    </header>
  );
}
