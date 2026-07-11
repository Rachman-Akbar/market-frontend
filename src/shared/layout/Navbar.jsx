import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useSellerStore } from "@/features/seller/store/services/sellerStoreService";
import { useSellerOrders } from "@/features/order/ordering/orderService";
import { formatPrice } from "@/shared/utils/utils";
import { CategoryDropdown } from "@/features/catalog/category/components/CategoryDropdown";

function openIndependentPortal(path, windowName) {
  window.open(path, windowName, "noopener,noreferrer");
}

function openSellerPortal() {
  const sellerWindow = window.open(
    "/auth/role-switch?redirect=%2Fseller",
    "marketku-seller"
  );

  if (sellerWindow) {
    try {
      sellerWindow.opener = null;
    } catch {
      return sellerWindow;
    }
  }

  return sellerWindow;
}

function StoreTooltip({ onOpenSeller, canReadSellerData }) {
  const storeQuery = useSellerStore();
  const store = storeQuery.data;
  const ordersQuery = useSellerOrders(canReadSellerData ? store?.id : 0, { per_page: 100 });
  const orders = ordersQuery.data?.data || [];
  const paidOrders = orders.filter((order) => ["paid", "success", "settlement"].includes(String(order.paymentStatus || "").toLowerCase()));
  const revenue = paidOrders.reduce((total, order) => total + Number(order.totalItemsPrice || 0), 0);
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const sales = days.map((_, index) => orders.filter((order) => {
    if (!order.createdAt) return false;
    const day = new Date(order.createdAt).getDay();
    return (day + 6) % 7 === index;
  }).length);
  const max = Math.max(...sales, 1);

  return (
    <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden border border-gray-200 bg-white z-[95]" style={{ borderRadius: 5, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
      <div className="bg-[#03ac0e] px-4 py-3">
        <p className="text-xs font-bold text-white">Performa Toko Minggu Ini</p>
        <p className="mt-0.5 text-[10px] text-white/80">{store?.name || "Daftarkan toko Anda"}</p>
      </div>
      <div className="px-4 py-3">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[{ label: "Pesanan", value: orders.length.toLocaleString("id-ID") }, { label: "Pendapatan", value: formatPrice(revenue) }, { label: "Status", value: store?.isActive ? "Aktif" : "-" }].map((item) => (
            <div key={item.label} className="text-center"><p className="truncate text-[11px] font-bold text-gray-800">{item.value}</p><p className="text-[10px] text-gray-400">{item.label}</p></div>
          ))}
        </div>
        <div className="flex h-16 items-end gap-1">
          {sales.map((value, index) => <div key={days[index]} className="flex flex-1 flex-col items-center gap-0.5"><div className="w-full rounded-sm bg-[#03ac0e]/80" style={{ height: `${Math.max(2, (value / max) * 48)}px` }} /><span className="text-[9px] text-gray-400">{days[index]}</span></div>)}
        </div>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <button type="button" onClick={onOpenSeller} className="block w-full text-center text-xs font-bold text-[#03ac0e] hover:underline">
            Kelola Toko →
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileTooltip({ onClose, roles }) {
  const items = [
    { icon: "person", label: "Profil Saya", path: "/profile", mode: "shared" },
    { icon: "receipt_long", label: "Pesanan Saya", path: "/profile/orders", mode: "shared" },
    { icon: "favorite", label: "Wishlist", path: "/profile/wishlist", mode: "shared" },
    { icon: "location_on", label: "Alamat Saya", path: "/profile/addresses", mode: "shared" },
    { icon: "chat", label: "Chat", path: "/chat/login?redirect=%2Fchat", mode: "independent", windowName: "marketku-chat" },
  ];

  if (roles.includes("admin")) {
    items.push({ icon: "admin_panel_settings", label: "Admin", path: "/admin/login", mode: "independent", windowName: "marketku-admin" });
  }

  function open(item) {
    if (item.mode === "independent") {
      openIndependentPortal(item.path, item.windowName);
    } else {
      window.open(item.path, "_blank");
    }

    onClose();
  }

  return (
    <div
      className="absolute right-0 top-full mt-2 w-52 border border-gray-200 bg-white py-1 z-[95]"
      style={{ borderRadius: 5, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => open(item)}
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
  const { user, roles, activeRole } = useAuth();
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

  function handleOpenSeller() {
    setStoreHover(false);
    openSellerPortal();
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
                  <button
                    type="button"
                    onClick={handleOpenSeller}
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
                  </button>

                  <div
                    className={`origin-top-right transition-all duration-200 ${
                      storeHover
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }`}
                  >
                    <StoreTooltip onOpenSeller={handleOpenSeller} canReadSellerData={activeRole === "seller"} />
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
                    <ProfileTooltip onClose={() => setProfileHover(false)} roles={roles} />
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
