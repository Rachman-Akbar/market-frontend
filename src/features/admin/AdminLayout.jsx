import { useAuth } from "@/features/auth/context/AuthContext";
import { AdminNotificationDrawer } from "@/features/admin/notifications/components/AdminNotificationDrawer";
import { AdminRealtimeNotificationProvider, useAdminRealtimeNotifications } from "@/features/admin/notifications/context/AdminRealtimeNotificationContext";
import { PanelHeader } from "@/shared/layout/PanelHeader";
import { PanelMobileNavigation } from "@/shared/layout/PanelMobileNavigation";
import { PanelSidebar } from "@/shared/layout/PanelSidebar";
import { PanelTabBar, PanelTabsProvider } from "@/shared/layout/tabs";
import { RouteOutletBoundary } from "@/shared/layout/RouteOutletBoundary";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true, hiddenInSidebar: true },
  { href: "/admin/products", label: "Product", icon: "inventory_2", group: "Persediaan" },
  { href: "/admin/stock", label: "Stock", icon: "warehouse", group: "Persediaan" },
  { href: "/admin/vouchers", label: "Voucher", icon: "confirmation_number", group: "Penjualan" },
  { href: "/admin/promotions", label: "Promosi", icon: "campaign", group: "Penjualan" },
  { href: "/admin/promotion-payments", label: "Pembayaran Promosi", icon: "paid", group: "Penjualan" },
  { href: "/admin/orders", label: "Pesanan", icon: "receipt_long", group: "Penjualan" },
  { href: "/admin/customers", label: "Pelanggan", icon: "person_search", group: "Penjualan" },
  { href: "/admin/order-operations", label: "Order", icon: "shopping_bag", group: "Penjualan" },
  { href: "/admin/reviews", label: "Review", icon: "reviews", group: "Penjualan" },
  { href: "/admin/cashflow", label: "Pemasukan dan Pengeluaran", icon: "account_balance_wallet", group: "Finance" },
  { href: "/admin/receivables-payables", label: "Hutang dan Piutang", icon: "payments", group: "Finance" },
  { href: "/admin/store-information", label: "Informasi", icon: "store", group: "Toko" },
  { href: "/admin/showcases", label: "Etalase", icon: "view_module", group: "Toko" },
  { href: "/admin/banners", label: "Banner", icon: "view_carousel", group: "Toko" },
  { href: "/admin/store-preview", label: "Preview Toko", icon: "preview", group: "Toko" },
  { href: "/admin/categories", label: "Category", icon: "account_tree", group: "Aplikasi" },
  { href: "/admin/catalog-groups", label: "Catalog Group", icon: "category", group: "Aplikasi" },
  { href: "/admin/users", label: "User", icon: "group", group: "Manajemen" },
  { href: "/admin/stores", label: "Toko", icon: "storefront", group: "Manajemen" },
  { href: "/admin/missions", label: "Mission", icon: "military_tech", group: "Aplikasi" },
  { href: "/admin/announcements", label: "Announcement", icon: "campaign", group: "Aplikasi" },
  { href: "/admin/chat", label: "Chat", icon: "chat", group: "Bantuan" },
  { href: "/admin/help", label: "Help", icon: "support_agent", group: "Bantuan" },
  { href: "/admin/roles", label: "Role", icon: "admin_panel_settings", group: "Manajemen", hiddenInSidebar: true },
];

function AdminLayoutContent() {
  const { user } = useAuth();
  const realtime = useAdminRealtimeNotifications();

  return (
    <PanelTabsProvider items={ADMIN_NAV_ITEMS}>
      <div className="min-h-screen bg-slate-50">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
          <PanelSidebar items={ADMIN_NAV_ITEMS} homeHref="/admin" title="Admin Control" sidebarClassName="border-slate-800/20 bg-[#0f172a]" activeClassName="bg-teal-400 text-slate-950" badges={realtime.badges} />
          <div className="min-w-0 max-w-full overflow-x-hidden">
            <PanelHeader
              eyebrow="Admin Panel"
              title="Platform Management"
              userName={user?.name || "Admin"}
              roleLabel="Super Admin"
              accentTextClassName="text-teal-700"
              avatarClassName="bg-teal-500"
              notificationClassName="hover:bg-teal-50 hover:text-teal-700"
              notificationCount={realtime.unreadCount}
              notificationConnected={realtime.connected}
              onNotificationClick={() => realtime.setOpen(true)}
              mobileNavigation={<PanelMobileNavigation items={ADMIN_NAV_ITEMS} activeClassName="bg-teal-50 text-teal-700" badges={realtime.badges} />}
            />
            <PanelTabBar />
            <main className="min-w-0 max-w-full overflow-x-hidden px-3 py-3 pb-20 sm:px-4 lg:pb-3"><RouteOutletBoundary className="w-full min-w-0 max-w-full" /></main>
          </div>
        </div>
        <AdminNotificationDrawer />
      </div>
    </PanelTabsProvider>
  );
}

export default function AdminLayout() {
  return (
    <AdminRealtimeNotificationProvider>
      <AdminLayoutContent />
    </AdminRealtimeNotificationProvider>
  );
}
