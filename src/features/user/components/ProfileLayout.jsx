import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { User, Package, Heart, MapPin } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/shared/utils/utils";

const NAV = [
  { href: "/profile", label: "Akun Saya", icon: User, exact: true },
  { href: "/profile/orders", label: "Pesanan Saya", icon: Package },
  { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile/addresses", label: "Alamat", icon: MapPin },
];

export default function ProfileLayout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-4 gap-6">
        
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                {user?.name?.[0] ?? "G"}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{user?.name ?? "Tamu"}</p>
                <p className="text-xs text-gray-500">{user?.email ?? "Belum login"}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {NAV.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href} to={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      active ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
