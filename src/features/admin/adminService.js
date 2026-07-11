import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";
import { getCatalogGroups } from "@/features/catalog/cataloggroup/services/catalogGroupService";
import { getCategories } from "@/features/catalog/category/services/categoryService";
import { formatPrice } from "@/shared/utils/utils";

const keys = {
  dashboard: ["admin", "dashboard"],
  catalogGroups: ["admin", "catalog-groups"],
  categories: ["admin", "categories"],
};

function normalizeStatus(value = "") {
  const status = String(value).toLowerCase();
  if (["paid", "success", "settlement", "completed"].includes(status)) return "Dibayar";
  if (["processing", "packed"].includes(status)) return "Diproses";
  if (["shipped", "delivery"].includes(status)) return "Dikirim";
  if (["cancelled", "failed", "expired"].includes(status)) return "Dibatalkan";
  return status ? status.replace(/_/g, " ") : "Pending";
}

function flattenCategories(rows = [], parents = new Map(), groups = new Map(), result = []) {
  rows.forEach((row) => {
    const groupId = String(row.catalog_group_id ?? "");
    result.push({
      id: row.id ?? row.key,
      group: groups.get(groupId) || row.raw?.catalog_group?.name || "-",
      name: row.name,
      slug: row.slug,
      level: Number(row.level || 1),
      parent: parents.get(String(row.parent_id ?? "")) || "-",
      products: Number(row.raw?.products_count ?? row.raw?.product_count ?? 0),
      status: row.is_active === false ? "inactive" : "active",
      visibility: row.is_visible_in_menu === false ? "Disembunyikan" : "Menu",
    });
    parents.set(String(row.id), row.name);
    flattenCategories(row.children || [], parents, groups, result);
  });
  return result;
}

async function getAdminDashboardData() {
  const [usersResponse, storesResponse, ordersResponse] = await Promise.all([
    apiClient.get("/api/v1/identity/users", { params: { per_page: 100 } }),
    apiClient.get("/api/v1/seller/stores", { params: { per_page: 100 } }),
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
      .filter((store) => store.is_active === false || String(store.status || "").toLowerCase() === "review")
      .slice(0, 6)
      .map((store) => ({
        id: String(store.id),
        type: "Seller",
        title: store.name || store.store_name || "Toko",
        owner: store.email || store.owner_name || "Seller",
        priority: "Normal",
        status: store.is_active === false ? "Nonaktif" : "Perlu Review",
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

async function getCatalogGroupAdminRows() {
  const { data } = await getCatalogGroups({ per_page: 100 });
  return data.map((row) => ({
    id: row.id ?? row.key,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    categories: Number(row.raw?.categories_count ?? row.raw?.category_count ?? 0),
    products: Number(row.raw?.products_count ?? row.raw?.product_count ?? 0),
    status: row.is_active ? "active" : "inactive",
    owner: row.raw?.owner?.name || row.raw?.owner_name || "Catalog",
    updatedAt: row.raw?.updated_at || "-",
  }));
}

async function getCategoryAdminRows() {
  const [{ data: categoryTree }, { data: groups }] = await Promise.all([
    getCategories(),
    getCatalogGroups({ per_page: 100 }),
  ]);
  const groupMap = new Map(groups.map((group) => [String(group.id), group.name]));
  return flattenCategories(categoryTree, new Map(), groupMap, []);
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: getAdminDashboardData,
    staleTime: 60000,
  });
}

export function useAdminCatalogGroups() {
  return useQuery({
    queryKey: keys.catalogGroups,
    queryFn: getCatalogGroupAdminRows,
    staleTime: 300000,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: keys.categories,
    queryFn: getCategoryAdminRows,
    staleTime: 300000,
  });
}
