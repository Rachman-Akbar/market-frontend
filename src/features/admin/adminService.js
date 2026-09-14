import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";
import { formatPrice } from "@/shared/utils/utils";

const keys = {
  dashboard: ["admin", "dashboard"],
};

function normalizeStatus(value = "") {
  const status = String(value).toLowerCase();
  if (["paid", "success", "settlement", "completed"].includes(status)) return "Dibayar";
  if (["processing", "packed"].includes(status)) return "Diproses";
  if (["shipped", "delivery"].includes(status)) return "Dikirim";
  if (["cancelled", "failed", "expired"].includes(status)) return "Dibatalkan";
  return status ? status.replace(/_/g, " ") : "Pending";
}

async function getAdminDashboardData() {
  const [usersResponse, storesResponse, ordersResponse] = await Promise.all([
    apiClient.get("/api/v1/identity/users", { params: { per_page: 100 } }),
    apiClient.get("/api/v1/seller/stores/manage", { params: { per_page: 100 } }),
    apiClient.get("/api/v1/order/orderings", { params: { per_page: 100 } }),
  ]);

  const users = unwrapCollection(usersResponse.data);
  const stores = unwrapCollection(storesResponse.data);
  const orders = unwrapCollection(ordersResponse.data);
  const paidOrders = orders.filter((order) => ["paid", "success", "settlement"].includes(String(order.payment_status || "").toLowerCase()));
  const gmv = paidOrders.reduce((total, order) => total + Number(order.grand_total ?? order.total_amount ?? 0), 0);

  const monthlyMap = new Map();
  orders.forEach((order) => {
    const date = order.created_at ? new Date(order.created_at) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(order.grand_total ?? order.total_amount ?? 0));
  });

  const revenueSeries = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, value]) => value);

  return {
    stats: [
      { key: "gmv", label: "GMV Terbayar", value: formatPrice(gmv), change: `${paidOrders.length} transaksi`, tone: "emerald", icon: "monitoring" },
      { key: "orders", label: "Pesanan", value: orders.length.toLocaleString("id-ID"), change: "Data API", tone: "blue", icon: "receipt_long" },
      { key: "sellers", label: "Seller", value: stores.length.toLocaleString("id-ID"), change: "Toko terdaftar", tone: "teal", icon: "storefront" },
      { key: "users", label: "Pengguna", value: users.length.toLocaleString("id-ID"), change: "Akun terdaftar", tone: "amber", icon: "group" },
    ],
    revenueSeries,
    moderationQueue: stores
      .filter((store) => ["pending", "suspended"].includes(String(store.status || "").toLowerCase()) || store.is_active === false)
      .slice(0, 6)
      .map((store) => ({
        id: String(store.id),
        type: "Seller",
        title: store.name || store.store_name || "Toko",
        owner: store.email || store.owner_name || "Seller",
        priority: "Normal",
        status: String(store.status || "").toLowerCase() === "pending" ? "Menunggu Persetujuan" : String(store.status || "").toLowerCase() === "suspended" ? "Ditangguhkan" : "Nonaktif",
      })),
    recentOrders: orders.slice(0, 10).map((order) => ({
      id: order.order_number || String(order.id),
      buyer: order.user?.name || order.customer_name || order.user_id || "Buyer",
      seller: (order.sub_orders || []).map((subOrder) => subOrder.store_name).filter(Boolean).join(", ") || "-",
      total: formatPrice(Number(order.grand_total ?? order.total_amount ?? 0)),
      status: normalizeStatus(order.payment_status || order.status),
      channel: order.payment_method || "Marketplace",
      createdAt: order.created_at || null,
    })),
  };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: getAdminDashboardData,
    staleTime: 60000,
  });
}

const monitorKeys = {
  overview: (period) => ["admin", "monitor", "overview", period],
};

export async function getAdminMonitorOverview(period = "monthly") {
  const [statsResponse, topStoresResponse, trendResponse] = await Promise.all([
    apiClient.get("/api/v1/admin/dashboard/stats", { params: { period } }),
    apiClient.get("/api/v1/admin/dashboard/top-stores", { params: { period, limit: 10 } }),
    apiClient.get("/api/v1/admin/dashboard/order-trend", { params: { period } }),
  ]);

  const stats = statsResponse.data?.data ?? statsResponse.data ?? {};
  const topStores = Array.isArray(topStoresResponse.data?.data)
    ? topStoresResponse.data.data
    : Array.isArray(topStoresResponse.data)
      ? topStoresResponse.data
      : (topStoresResponse.data?.data?.data || []);
  const trendData = trendResponse.data?.data ?? trendResponse.data ?? {};

  return {
    period,
    start_date: stats.start_date || trendData.start_date || null,
    stats,
    topStores: topStores.map((store) => ({
      store_id: Number(store.store_id || 0),
      store_name: store.store_name || "Toko",
      order_count: Number(store.order_count || 0),
      revenue: Number(store.revenue || 0),
    })),
    trend: Array.isArray(trendData.trend) ? trendData.trend : [],
  };
}

export function useAdminMonitorOverview(period = "monthly") {
  return useQuery({
    queryKey: monitorKeys.overview(period),
    queryFn: () => getAdminMonitorOverview(period),
    staleTime: 60000,
  });
}
