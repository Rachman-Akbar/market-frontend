import { Link, Outlet, useLocation } from "react-router-dom";
import { BellRing, Heart, MessageCircle, Package, TicketPercent, UserRound, UsersRound, WalletCards } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { cn } from "@/shared/utils/utils";

const NAV_ITEMS = [
  { href: "/profile/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile/groups", label: "Chat Group", icon: UsersRound },
  { href: "/profile/notifications", label: "Notifikasi", icon: BellRing },
  { href: "/profile/payments", label: "Pembayaran", icon: WalletCards },
  { href: "/profile/vouchers", label: "Voucher", icon: TicketPercent },
  { href: "/profile/orders", label: "Pesanan", icon: Package },
  { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
];

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProfileLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const initial = user?.name?.slice(0, 1)?.toUpperCase() || "R";
  const profileActive = pathname === "/profile" || pathname.startsWith("/profile/addresses") || pathname.startsWith("/profile/security");

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f7f8fa] text-slate-900">
      <aside className={profileLayout.rail}>
        <nav className="flex w-full flex-col items-center gap-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                to={href}
                title={label}
                aria-label={label}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all",
                  active ? "bg-[#fff1ec] text-[#ee4d2d]" : "text-slate-500 hover:bg-[#fff7f3] hover:text-[#ee4d2d]"
                )}
              >
                <Icon size={20} />
                {active && <span className="absolute -right-[10px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-[#ee4d2d]" />}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/profile"
          title={user?.name || "Profile"}
          aria-label="Profile"
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all",
            profileActive ? "bg-[#ee4d2d] text-white" : "bg-[#111b21] text-white hover:bg-[#ee4d2d]"
          )}
        >
          {profileActive ? <UserRound size={20} /> : <span className="text-sm font-bold">{initial}</span>}
          {profileActive && <span className="absolute -right-[10px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-[#ee4d2d]" />}
        </Link>
      </aside>

      <main className="flex min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
