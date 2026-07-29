import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PanelHeader } from "@/shared/layout/PanelHeader";
import { PanelMobileNavigation } from "@/shared/layout/PanelMobileNavigation";
import { PanelSidebar } from "@/shared/layout/PanelSidebar";
import { PanelTabBar, PanelTabsProvider } from "@/shared/layout/tabs";

export const SELLER_NAV_ITEMS = [
  { href: "/seller", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/seller/products", label: "Produk", icon: "inventory_2" },
  { href: "/seller/banners", label: "Banner", icon: "view_carousel" },
  { href: "/seller/vouchers", label: "Voucher", icon: "confirmation_number" },
  { href: "/seller/promotions", label: "Promosi", icon: "campaign" },
  { href: "/seller/store", label: "Toko", icon: "storefront" },
];

export default function SellerLayout() {
  const { user, store } = useAuth();
  const storeHref = store?.slug ? `/stores/${store.slug}` : "/stores";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[72px_1fr]">
        <PanelSidebar
          items={SELLER_NAV_ITEMS}
          homeHref="/seller"
          eyebrow="Seller Center"
          title="Ziip Store"
          description="Kelola penjualan dan performa toko"
          footerTitle="Tips hari ini"
          footerText="Naikkan foto produk utama untuk meningkatkan klik dari feed."
          sidebarClassName="border-emerald-950/10 bg-[#102a43]"
          activeClassName="bg-emerald-400 text-slate-950"
          eyebrowClassName="text-emerald-200"
        />
        <PanelTabsProvider items={SELLER_NAV_ITEMS}>
        <div className="min-w-0">
          <PanelHeader
            eyebrow="Seller Center"
            title={store?.name || "Official Store"}
            userName={user?.name || "Seller"}
            roleLabel="Store Owner"
            searchPlaceholder="Cari produk, campaign, atau pelanggan"
            actionHref={storeHref}
            actionLabel="Lihat Toko"
            accentTextClassName="text-emerald-700"
            avatarClassName="bg-emerald-500"
            focusClassName="focus-within:border-emerald-500"
            actionClassName="hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            notificationClassName="hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            mobileNavigation={(
              <PanelMobileNavigation
                items={SELLER_NAV_ITEMS}
                activeClassName="border-emerald-400 bg-emerald-50 text-emerald-700"
              />
            )}
          />
          <PanelTabBar accent="emerald" />
          <main className="min-w-0 px-4 py-5 pb-20 sm:px-6 lg:px-8 lg:pb-5">
            <Outlet />
          </main>
        </div>
        </PanelTabsProvider>
      </div>
    </div>
  );
}
