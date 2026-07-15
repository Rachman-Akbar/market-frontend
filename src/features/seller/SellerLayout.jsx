import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/shared/utils/utils";

const NAV_ITEMS = [
  { href: "/seller", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/seller/products", label: "Produk", icon: "inventory_2" },
  { href: "/seller/banners", label: "Banner", icon: "view_carousel" },
  { href: "/seller/store", label: "Toko", icon: "storefront" },
  { href: "/seller/orders", label: "Pesanan", icon: "receipt_long" },
];

function SellerSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden border-r border-emerald-950/10 bg-[#102a43] text-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-5">
        <Link
          to="/seller"
          className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 transition hover:bg-white/[0.14]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
            Seller Center
          </p>
          <h2 className="mt-2 text-lg font-extrabold">Saganext Store</h2>
          <p className="mt-1 text-xs text-slate-300">
            Kelola penjualan dan performa toko
          </p>
        </Link>

        <nav className="mt-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs font-bold text-emerald-200">Tips hari ini</p>
          <p className="mt-1 text-xs text-slate-300">
            Naikkan foto produk utama untuk meningkatkan klik dari feed.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SellerHeader() {
  const { user } = useAuth();
  const initial = user?.name?.slice(0, 1)?.toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
            Seller Center
          </p>
          <h1 className="truncate text-base font-extrabold text-slate-950">
            Saganext Official Store
          </h1>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="flex w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
            <span className="material-symbols-outlined mr-2 text-[20px] text-slate-400">
              search
            </span>
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Cari produk, pesanan, campaign, atau pelanggan"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
          >
            Lihat Toko
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-extrabold text-white">
              {initial}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[120px] truncate text-xs font-extrabold text-slate-900">
                {user?.name || "Seller"}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">
                Store Owner
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <SellerSidebar />
        <div className="min-w-0">
          <SellerHeader />
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
