import { Link, Outlet, useLocation } from "react-router-dom";
import { User, Package, Heart, MapPin, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/shared/utils/utils";

const NAV = [
  { href: "/profile", label: "Akun Saya", icon: User, exact: true },
  { href: "/profile/orders", label: "Pesanan Saya", icon: Package },
  { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile/addresses", label: "Alamat", icon: MapPin },
  { href: "/profile/chat", label: "Chat", icon: MessageCircle },
];

function ProfileHeader() {
  const { user } = useAuth();
  const initial = user?.name?.slice(0, 1)?.toUpperCase() || "G";

  return (
    <header className="sticky top-0 z-40 border-b border-[#0b5f55]/20 bg-[#075e54] text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold">Akun Saya</h1>
            <p className="truncate text-xs text-white/70">Profil, pesanan, alamat, wishlist, dan chat</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
            <span className="material-symbols-outlined text-[21px]">search</span>
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
            <span className="material-symbols-outlined text-[21px]">more_vert</span>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-sm font-extrabold text-[#063c35] ring-2 ring-white/20">{initial}</div>
        </div>
      </div>
    </header>
  );
}

export default function ProfileLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const initial = user?.name?.slice(0, 1)?.toUpperCase() || "G";

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <ProfileHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <aside>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-[#075e54] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-extrabold ring-2 ring-white/20">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold">{user?.name ?? "Tamu"}</p>
                    <p className="truncate text-xs text-white/75">{user?.email ?? "Belum login"}</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <Settings size={18} className="text-[#128c7e]" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Pusat akun</p>
                    <p className="text-xs text-slate-500">Profil, alamat, pesanan, dan chat.</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {NAV.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      to={href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        active ? "bg-[#e7f6ef] text-[#075e54]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon size={17} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}