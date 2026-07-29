import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PanelHeader } from "@/shared/layout/PanelHeader";
import { PanelMobileNavigation } from "@/shared/layout/PanelMobileNavigation";
import { PanelSidebar } from "@/shared/layout/PanelSidebar";
import { PanelTabBar, PanelTabsProvider } from "@/shared/layout/tabs";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/products", label: "Produk", icon: "inventory_2" },
  { href: "/admin/catalog-groups", label: "Catalog Group", icon: "category" },
  { href: "/admin/categories", label: "Kategori", icon: "account_tree" },
  { href: "/admin/vouchers", label: "Voucher", icon: "confirmation_number" },
  { href: "/admin/promotions", label: "Promosi", icon: "campaign" },
  { href: "/admin/users", label: "User", icon: "group" },
  { href: "/admin/roles", label: "Role", icon: "admin_panel_settings" },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[72px_1fr]">
        <PanelSidebar
          items={ADMIN_NAV_ITEMS}
          homeHref="/admin"
          eyebrow="MarketKu"
          title="Admin Control"
          description="Operasional platform marketplace"
          footerTitle="Sistem sehat"
          footerText="API, payment, dan order queue berjalan normal."
          sidebarClassName="border-slate-800/20 bg-[#0f172a]"
          activeClassName="bg-teal-400 text-slate-950"
          eyebrowClassName="text-teal-200"
          footerClassName="bg-slate-900"
        />
        <PanelTabsProvider items={ADMIN_NAV_ITEMS}>
        <div className="min-w-0">
          <PanelHeader
            eyebrow="Admin Panel"
            title="Platform Management"
            userName={user?.name || "Admin"}
            roleLabel="Super Admin"
            searchPlaceholder="Cari order, produk, seller, atau tiket"
            accentTextClassName="text-teal-700"
            avatarClassName="bg-teal-500"
            focusClassName="focus-within:border-teal-500"
            notificationClassName="hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            mobileNavigation={(
              <PanelMobileNavigation
                items={ADMIN_NAV_ITEMS}
                activeClassName="border-teal-400 bg-teal-50 text-teal-700"
              />
            )}
          />
          <PanelTabBar accent="teal" />
          <main className="min-w-0 px-4 py-5 pb-20 sm:px-6 lg:px-8 lg:pb-5">
            <Outlet />
          </main>
        </div>
        </PanelTabsProvider>
      </div>
    </div>
  );
}
