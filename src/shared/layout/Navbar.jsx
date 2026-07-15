import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useCart } from "@/features/order/cart/context/CartContext";
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
    "ziip-seller",
    "noopener,noreferrer",
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
  const ordersQuery = useSellerOrders(canReadSellerData ? store?.id : 0, {
    per_page: 100,
  });
  const orders = ordersQuery.data?.data || [];
  const paidOrders = orders.filter((order) =>
    ["paid", "success", "settlement"].includes(
      String(order.paymentStatus || "").toLowerCase(),
    ),
  );
  const revenue = paidOrders.reduce(
    (total, order) => total + Number(order.totalItemsPrice || 0),
    0,
  );
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const sales = days.map(
    (_, index) =>
      orders.filter((order) => {
        if (!order.createdAt) return false;
        const day = new Date(order.createdAt).getDay();
        return (day + 6) % 7 === index;
      }).length,
  );
  const max = Math.max(...sales, 1);

  return (
    <div className="absolute right-0 top-full z-[95] mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-bold text-[#047857]">
          Performa Toko Minggu Ini
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {store?.name || "Daftarkan toko Anda"}
        </p>
      </div>
      <div className="px-4 py-3">
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { label: "Pesanan", value: orders.length.toLocaleString("id-ID") },
            { label: "Pendapatan", value: formatPrice(revenue) },
            { label: "Status", value: store?.isActive ? "Aktif" : "-" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="truncate text-[11px] font-bold text-slate-800">
                {item.value}
              </p>
              <p className="text-[10px] text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="flex h-16 items-end gap-1">
          {sales.map((value, index) => (
            <div
              key={days[index]}
              className="flex flex-1 flex-col items-center gap-0.5"
            >
              <div
                className="w-full rounded-sm bg-[#10B981]"
                style={{ height: `${Math.max(2, (value / max) * 48)}px` }}
              />
              <span className="text-[9px] text-slate-400">{days[index]}</span>
            </div>
          ))}
        </div>
        <hr className="my-3 border-slate-100" />
        <button
          type="button"
          onClick={onOpenSeller}
          className="block w-full text-center text-xs font-bold text-[#10B981] hover:text-[#047857]"
        >
          Kelola Toko
        </button>
      </div>
    </div>
  );
}

function ProfileTooltip({ onClose, onLogout, roles, loading }) {
  const sharedItems = [
    { icon: "person", label: "Profil Saya", path: "/profile" },
    { icon: "location_on", label: "Alamat Saya", path: "/profile/addresses" },
  ];

  const independentItems = [
    {
      icon: "chat",
      label: "Chat",
      path: "/chat/login?redirect=%2Fchat",
      windowName: "ziip-chat",
    },
  ];

  if (roles.includes("admin")) {
    independentItems.push({
      icon: "admin_panel_settings",
      label: "Admin",
      path: "/admin/login",
      windowName: "ziip-admin",
    });
  }

  return (
    <div className="absolute right-0 top-full z-[95] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
      {sharedItems.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-[#047857]"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-500">
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}

      {independentItems.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            openIndependentPortal(item.path, item.windowName);
            onClose();
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-[#047857]"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-500">
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}

      <hr className="my-1 border-slate-100" />
      <button
        type="button"
        onClick={onLogout}
        disabled={loading}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        {loading ? "Keluar..." : "Logout"}
      </button>
    </div>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, roles, activeRole, logout, loading } = useAuth();
  const { totalItems } = useCart();
  const [query, setQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [storeHover, setStoreHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  function handleSearch(event) {
    event.preventDefault();

    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleOpenSeller() {
    setStoreHover(false);
    openSellerPortal();
  }

  async function handleLogout() {
    setProfileHover(false);
    await logout?.();
    queryClient.clear();
    navigate("/", { replace: true });
  }

  function toggleCategory(event) {
    event.preventDefault();
    event.stopPropagation();
    setStoreHover(false);
    setProfileHover(false);
    setCategoryOpen((current) => !current);
  }

  return (
    <header className="relative sticky top-0 z-[80] border-b border-slate-100 bg-white">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-8 max-w-[1200px] items-center justify-between px-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#10B981]">
              smartphone
            </span>
            <span>
              <strong className="text-slate-700">
                Gratis Ongkir + Banyak Promo
              </strong>{" "}
              belanja di aplikasi
            </span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
          </div>
          <div className="hidden items-center gap-5 lg:flex">
            {["Tentang Ziip", "Pusat Edukasi Seller", "Promo", "Ziip Care"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="whitespace-nowrap transition-colors hover:text-[#10B981]"
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
          <Link
            to="/"
            className="flex-shrink-0 text-[22px] font-bold leading-none text-[#10B981]"
          >
            Ziip
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
              className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${categoryOpen ? "rotate-180" : "rotate-0"}`}
            >
              expand_more
            </span>
          </button>

          <form onSubmit={handleSearch} className="min-w-0 flex-1">
            <div className="flex items-center rounded-lg border border-slate-300 px-3 py-2 transition-all focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-emerald-100">
              <span className="material-symbols-outlined mr-2 flex-shrink-0 text-[20px] text-slate-400">
                search
              </span>
              <input
                className="w-full min-w-0 border-none bg-transparent text-sm outline-none focus:ring-0"
                placeholder="Cari di Ziip"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </form>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              to="/cart"
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-[#10B981]"
              aria-label={`Cart${totalItems ? `, ${totalItems} item` : ""}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                shopping_cart
              </span>
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-sm">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              ) : null}
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
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-[#10B981] hover:text-[#047857]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      storefront
                    </span>
                    <span className="hidden lg:inline">Toko</span>
                  </button>
                  <div
                    className={`origin-top-right transition-all duration-200 ${storeHover ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
                  >
                    <StoreTooltip
                      onOpenSeller={handleOpenSeller}
                      canReadSellerData={activeRole === "seller"}
                    />
                  </div>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => {
                    setCategoryOpen(false);
                    setProfileHover(true);
                  }}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <Link
                    to="/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-emerald-50"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#10B981] text-sm font-bold text-white">
                      {(user.name || "G").charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[72px] truncate text-sm text-slate-700 lg:inline">
                      {(user.name || "Guest").split(" ")[0]}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      expand_more
                    </span>
                  </Link>
                  <div
                    className={`origin-top-right transition-all duration-200 ${profileHover ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
                  >
                    <ProfileTooltip
                      onClose={() => setProfileHover(false)}
                      onLogout={handleLogout}
                      roles={roles}
                      loading={loading}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mx-1 h-6 w-px bg-slate-200" />
                <Link
                  to="/auth/login"
                  className="whitespace-nowrap rounded-lg border border-[#10B981] px-4 py-1.5 text-sm font-bold text-[#047857] transition-all hover:bg-emerald-50"
                >
                  Masuk
                </Link>
                <Link
                  to="/auth/register"
                  className="whitespace-nowrap rounded-lg bg-[#10B981] px-4 py-1.5 text-sm font-bold text-white transition-all hover:bg-[#059669]"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <CategoryDropdown
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
      />
    </header>
  );
}
