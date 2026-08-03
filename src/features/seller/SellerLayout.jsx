import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PanelHeader } from "@/shared/layout/PanelHeader";
import { PanelMobileNavigation } from "@/shared/layout/PanelMobileNavigation";
import { PanelSidebar } from "@/shared/layout/PanelSidebar";
import { PanelTabBar, PanelTabsProvider } from "@/shared/layout/tabs";

export const SELLER_NAV_ITEMS = [
  { href: "/seller", label: "Dashboard", icon: "dashboard", exact: true, hiddenInSidebar: true },
  { href: "/seller/products", label: "Product", icon: "inventory_2", group: "Persediaan" },
  { href: "/seller/stock", label: "Stock", icon: "warehouse", group: "Persediaan" },
  { href: "/seller/vouchers", label: "Voucher", icon: "confirmation_number", group: "Penjualan" },
  { href: "/seller/promotions", label: "Promosi", icon: "campaign", group: "Penjualan" },
  { href: "/seller/orders", label: "Pesanan", icon: "receipt_long", group: "Penjualan" },
  { href: "/seller/customers", label: "Pelanggan", icon: "person_search", group: "Penjualan" },
  { href: "/seller/order-operations", label: "Order", icon: "shopping_bag", group: "Penjualan" },
  { href: "/seller/cashflow", label: "Pemasukan dan Pengeluaran", icon: "account_balance_wallet", group: "Finance" },
  { href: "/seller/receivables-payables", label: "Hutang dan Piutang", icon: "payments", group: "Finance" },
  { href: "/seller/store", label: "Informasi", icon: "store", group: "Toko", noChildTabs: true },
  { href: "/seller/banners", label: "Banner", icon: "view_carousel", group: "Toko" },
  { href: "/seller/store-preview", label: "Preview Toko", icon: "preview", group: "Toko", noChildTabs: true },
];

export default function SellerLayout() {
  const { user, store } = useAuth();

  return (
    <PanelTabsProvider items={SELLER_NAV_ITEMS}>
      <div className="min-h-screen bg-slate-50">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
          <PanelSidebar items={SELLER_NAV_ITEMS} homeHref="/seller" title="Ziip Store" sidebarClassName="border-emerald-950/10 bg-[#102a43]" activeClassName="bg-emerald-400 text-slate-950" showHomeLink={false} showMarketplaceLink={false} />
          <div className="min-w-0">
            <PanelHeader eyebrow="Seller Center" title={store?.name || "Official Store"} userName={user?.name || "Seller"} roleLabel="Store Owner" actionHref="/seller/store-preview" actionLabel="Preview Toko" accentTextClassName="text-emerald-700" avatarClassName="bg-emerald-500" actionClassName="hover:bg-emerald-50 hover:text-emerald-700" notificationClassName="hover:bg-emerald-50 hover:text-emerald-700" mobileNavigation={<PanelMobileNavigation items={SELLER_NAV_ITEMS} activeClassName="bg-emerald-50 text-emerald-700" />} />
            <PanelTabBar />
            <main className="min-w-0 px-3 py-3 pb-20 sm:px-4 lg:pb-3"><Outlet /></main>
          </div>
        </div>
      </div>
    </PanelTabsProvider>
  );
}
