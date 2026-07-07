import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CategoryDropdown } from "@/features/catalog/category/components/CategoryDropdown";

const SALES = [12, 19, 8, 24, 17, 30, 22];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MAX = Math.max(...SALES);

function StoreTooltip() {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-64 overflow-hidden border border-gray-200 bg-white z-[95]"
      style={{ borderRadius: 5, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
    >
      <div className="bg-[#03ac0e] px-4 py-3">
        <p className="text-xs font-bold text-white">Performa Toko Minggu Ini</p>
        <p className="mt-0.5 text-[10px] text-white/80">Saganext Official Store</p>
      </div>

      <div className="px-4 py-3">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { label: "Pesanan", value: "132" },
            { label: "Pendapatan", value: "4.2jt" },
            { label: "Rating", value: "4.9★" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-[11px] font-bold text-gray-800">{item.value}</p>
              <p className="text-[10px] text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex h-16 items-end gap-1">
          {SALES.map((value, index) => (
            <div key={DAYS[index]} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className="w-full rounded-sm bg-[#03ac0e]/80"
                style={{ height: `${(value / MAX) * 48}px` }}
              />
              <span className="text-[9px] text-gray-400">{DAYS[index]}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <Link
            to="/seller"
            className="block w-full text-center text-xs font-bold text-[#03ac0e] hover:underline"
          >
            Kelola Toko →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileTooltip({ onClose }) {
  function open(path) {
    window.open(path, "_blank");
    onClose();
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 w-52 border border-gray-200 bg-white py-1 z-[95]"
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
          type="button"
          onClick={() => open(item.path)}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          <span className="material-symbols-outlined text-[18px] text-gray-500">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [storeHover, setStoreHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const profileRef = useRef(null);

  function handleSearch(event) {
    event.preventDefault();

    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleProfileClick() {
    window.open("/profile", "_blank");
  }

  function toggleCategory(event) {
    event.preventDefault();
    event.stopPropagation();
    setStoreHover(false);
    setProfileHover(false);
    setCategoryOpen((prev) => !prev);
  }

  return (
    <header className="sticky top-0 z-[80] bg-white relative">
      <div className="bg-gray-50">
        <div className="mx-auto flex h-8 max-w-[1200px] items-center justify-between px-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#006e04]">
              smartphone
            </span>
            <span>
              <strong className="text-gray-700">Gratis Ongkir + Banyak Promo</strong>{" "}
              belanja di aplikasi
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </div>

          <div className="flex items-center gap-5">
            {["Tentang Tokopedia", "Pusat Edukasi Seller", "Promo", "Tokopedia Care"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="whitespace-nowrap transition-colors hover:text-[#006e04]"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
          <Link
            to="/"
            className="flex-shrink-0 text-[22px] font-bold leading-none text-[#00aa13]"
          >
            tokopedia
          </Link>

          <button
            type="button"
            data-category-trigger="true"
            aria-expanded={categoryOpen}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={toggleCategory}
            className={`btn-kategori-trigger ${categoryOpen ? "is-active" : ""}`}
          >
            <span>Kategori</span>
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                categoryOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              expand_more
            </span>
          </button>

          <form onSubmit={handleSearch} className="min-w-0 flex-1">
            <div
              className="flex items-center border border-gray-300 px-3 py-2 transition-all focus-within:border-[#006e04]"
              style={{ borderRadius: 5 }}
            >
              <span className="material-symbols-outlined mr-2 flex-shrink-0 text-[20px] text-gray-400">
                search
              </span>
              <input
                className="w-full min-w-0 border-none bg-transparent text-sm outline-none focus:ring-0"
                placeholder="Cari di Tokopedia"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </form>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              to="/cart"
              className="p-2 text-gray-600 hover:bg-gray-100"
              style={{ borderRadius: 5 }}
            >
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            </Link>

            {user ? (
              <>
                <div
                  className="relative"
                  onMouseEnter={() => {
                    setCategoryOpen(false);
                    setStoreHover(true);
                  }}
                  onMouseLeave={() => setStoreHover(false)}
                >
                  <Link
                    to="/seller"
                    className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[#006e04] hover:text-[#006e04]"
                    style={{ borderRadius: 5 }}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        strokeLinejoin="round"
                      />
                      <path d="M9 22V12h6v10" strokeLinejoin="round" />
                    </svg>
                    <span className="hidden lg:inline">Toko</span>
                  </Link>

                  <div
                    className={`origin-top-right transition-all duration-200 ${
                      storeHover
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }`}
                  >
                    <StoreTooltip />
                  </div>
                </div>

                <div
                  ref={profileRef}
                  className="relative"
                  onMouseEnter={() => {
                    setCategoryOpen(false);
                    setProfileHover(true);
                  }}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex items-center gap-1.5 px-2 py-1.5 transition-colors hover:bg-gray-100"
                    style={{ borderRadius: 5 }}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#03ac0e] text-sm font-bold text-white">
                      {(user.name || "G").charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[72px] truncate text-sm text-gray-700 lg:inline">
                      {(user.name || "Guest").split(" ")[0]}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-gray-400">
                      expand_more
                    </span>
                  </button>

                  <div
                    className={`origin-top-right transition-all duration-200 ${
                      profileHover
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }`}
                  >
                    <ProfileTooltip onClose={() => setProfileHover(false)} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mx-1 h-6 w-px bg-gray-200" />
                <Link
                  to="/auth/login"
                  className="whitespace-nowrap border border-[#006e04] px-4 py-1.5 text-sm font-bold text-[#006e04] transition-all hover:bg-green-50"
                  style={{ borderRadius: 5 }}
                >
                  Masuk
                </Link>
                <Link
                  to="/auth/register"
                  className="whitespace-nowrap bg-[#03ac0e] px-4 py-1.5 text-sm font-bold text-white transition-all hover:bg-[#028a0b]"
                  style={{ borderRadius: 5 }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <CategoryDropdown open={categoryOpen} onClose={() => setCategoryOpen(false)} />
    </header>
  );
}