import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PanelHeader } from "@/shared/layout/PanelHeader";
import { PanelMobileNavigation } from "@/shared/layout/PanelMobileNavigation";
import { PanelSidebar } from "@/shared/layout/PanelSidebar";
import { PanelTabBar, PanelTabsProvider } from "@/shared/layout/tabs";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true, hiddenInSidebar: true },
  { href: "/admin/stores", label: "Toko", icon: "storefront" },
  { href: "/admin/products", label: "Produk", icon: "inventory_2" },
  { href: "/admin/catalog-groups", label: "Catalog Group", icon: "category" },
  { href: "/admin/categories", label: "Kategori", icon: "account_tree" },
  { href: "/admin/vouchers", label: "Voucher", icon: "confirmation_number" },
  { href: "/admin/promotions", label: "Promosi", icon: "campaign" },
  { href: "/admin/banners", label: "Banner", icon: "view_carousel" },
  { href: "/admin/orders", label: "Pesanan", icon: "receipt_long" },
  { href: "/admin/users", label: "User", icon: "group" },
  { href: "/admin/roles", label: "Role", icon: "admin_panel_settings" },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <PanelTabsProvider items={ADMIN_NAV_ITEMS}>
      <div className="min-h-screen bg-slate-50">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[64px_1fr]">
          <PanelSidebar items={ADMIN_NAV_ITEMS} homeHref="/admin" title="Admin Control" sidebarClassName="border-slate-800/20 bg-[#0f172a]" activeClassName="bg-teal-400 text-slate-950" />
          <div className="min-w-0">
            <PanelHeader eyebrow="Admin Panel" title="Platform Management" userName={user?.name || "Admin"} roleLabel="Super Admin" accentTextClassName="text-teal-700" avatarClassName="bg-teal-500" notificationClassName="hover:bg-teal-50 hover:text-teal-700" mobileNavigation={<PanelMobileNavigation items={ADMIN_NAV_ITEMS} activeClassName="bg-teal-50 text-teal-700" />} />
            <PanelTabBar />
            <main className="min-w-0 px-3 py-3 pb-20 sm:px-4 lg:pb-3"><Outlet /></main>
          </div>
        </div>
      </div>
    </PanelTabsProvider>
  );
}
