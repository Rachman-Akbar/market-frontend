import { useAuth } from "@/features/auth/context/AuthContext";
import { NotificationCenterPanel } from "@/shared/notifications/NotificationCenterPage";
import { PanelHeader } from "@/shared/layout/PanelHeader";
import { PanelMobileNavigation } from "@/shared/layout/PanelMobileNavigation";
import { PanelSidebar } from "@/shared/layout/PanelSidebar";
import { PanelTabBar, PanelTabsProvider } from "@/shared/layout/tabs";
import { RouteOutletBoundary } from "@/shared/layout/RouteOutletBoundary";

export const SELLER_NAV_ITEMS = [
  { href: "/seller", label: "Dashboard", icon: "dashboard", exact: true, hiddenInSidebar: true },
  { href: "/seller/products", label: "Product", icon: "inventory_2", group: "Persediaan" },
  { href: "/seller/stock", label: "Stock", icon: "warehouse", group: "Persediaan" },
  { href: "/seller/vouchers", label: "Voucher", icon: "confirmation_number", group: "Penjualan" },
  { href: "/seller/promotions", label: "Promosi", icon: "campaign", group: "Penjualan" },
  { href: "/seller/promotion-payments", label: "Pembayaran Promosi", icon: "paid", group: "Penjualan", hiddenInSidebar: true },
  { href: "/seller/orders", label: "Pesanan", icon: "receipt_long", group: "Penjualan" },
  { href: "/seller/customers", label: "Pelanggan", icon: "person_search", group: "Penjualan" },
  { href: "/seller/order-operations", label: "Order", icon: "shopping_bag", group: "Penjualan" },
  { href: "/seller/reviews", label: "Review", icon: "reviews", group: "Penjualan" },
  { href: "/seller/cashflow", label: "Pemasukan dan Pengeluaran", icon: "account_balance_wallet", group: "Finance" },
  { href: "/seller/receivables-payables", label: "Hutang dan Piutang", icon: "payments", group: "Finance" },
  { href: "/seller/store", label: "Informasi", icon: "store", group: "Toko", noChildTabs: true },
  { href: "/seller/showcases", label: "Etalase", icon: "view_module", group: "Toko" },
  { href: "/seller/banners", label: "Banner", icon: "view_carousel", group: "Toko" },
  { href: "/seller/store-preview", label: "Preview Toko", icon: "preview", group: "Toko", noChildTabs: true },
  { href: "/seller/planner", label: "Jadwal", icon: "calendar_month", bottom: true, iconColor: "#06b6d4" },
  { href: "/seller/chat", label: "Chat", icon: "forum", bottom: true, iconColor: "#3b82f6" },
  { href: "/seller/help", label: "Bantuan", icon: "support_agent", bottom: true, iconColor: "#ec4899", dividerBefore: true },
];

export default function SellerLayout() {
  const { user, store } = useAuth();

  return (
    <PanelTabsProvider items={SELLER_NAV_ITEMS}>
      <div className="h-dvh bg-slate-50">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[76px_minmax(0,1fr)]">
          <PanelSidebar items={SELLER_NAV_ITEMS} homeHref="/seller" title="Ziip Store" sidebarClassName="border-emerald-950/10 bg-[#102a43]" activeClassName="bg-emerald-400 text-slate-950" showHomeLink={false} showMarketplaceLink={false} />
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <PanelHeader eyebrow="Seller Center" title={store?.name || "Official Store"} storeName={store?.name || "Official Store"} userName={user?.name || "Seller"} roleLabel="Store Owner" accentTextClassName="text-emerald-700" avatarClassName="bg-emerald-500" notificationClassName="hover:bg-emerald-50 hover:text-emerald-700" notificationPanel={({ close }) => <NotificationCenterPanel onClose={close} />} mobileNavigation={<PanelMobileNavigation items={SELLER_NAV_ITEMS} activeClassName="bg-emerald-50 text-emerald-700" />} backToMarketplace />
            <PanelTabBar />
            <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 pb-20 sm:px-4 lg:pb-3">
              <RouteOutletBoundary className="w-full min-w-0 max-w-full" />
            </main>
          </div>
        </div>
      </div>
    </PanelTabsProvider>
  );
}
