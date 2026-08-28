import { useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapCollection } from "@/core/utils/apiClient";
import { toBoolean } from "@/core/utils/boolean";

export const storeContextKeys = {
  stores: (params = {}) => ["admin", "store-context", "stores", params],
  store: (id) => ["admin", "store-context", id],
  stats: (id, period) => ["admin", "store-context", id, "stats", period],
  orderTrend: (id, period) => ["admin", "store-context", id, "order-trend", period],
  orders: (id, params = {}) => ["admin", "store-context", id, "orders", params],
  products: (id, params = {}) => ["admin", "store-context", id, "products", params],
  settlements: (id, params = {}) => ["admin", "store-context", id, "settlements", params],
};

function normalizePage(payload) {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : unwrapCollection(payload);
  return {
    rows,
    meta: payload?.meta || source?.meta || {
      current_page: source?.current_page || 1,
      last_page: source?.last_page || 1,
      total: source?.total || rows.length,
    },
  };
}

export function normalizeStore(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    status: row.status || "pending",
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    ownerName: row.owner?.name || row.owner_name || "",
    ownerEmail: row.owner?.email || row.owner_email || "",
    avatar: row.avatar || null,
    raw: row,
  };
}

export async function getStoreContextStores(params = {}) {
  const response = await apiClient.get("/api/v1/admin/stores/context", { params });
  return normalizePage(response.data);
}

export async function getStoreContextStats(storeId, period = "monthly") {
  const response = await apiClient.get(`/api/v1/admin/stores/context/${storeId}/stats`, { params: { period } });
  return response.data?.data || response.data;
}

export async function getStoreContextOrderTrend(storeId, period = "monthly") {
  const response = await apiClient.get(`/api/v1/admin/stores/context/${storeId}/order-trend`, { params: { period } });
  return response.data?.data || response.data;
}

export async function getStoreContextOrders(storeId, params = {}) {
  const response = await apiClient.get(`/api/v1/admin/stores/context/${storeId}/orders`, { params });
  return normalizePage(response.data);
}

export async function getStoreContextProducts(storeId, params = {}) {
  const response = await apiClient.get(`/api/v1/admin/stores/context/${storeId}/products`, { params });
  return normalizePage(response.data);
}

export async function getStoreContextSettlements(storeId, params = {}) {
  const response = await apiClient.get(`/api/v1/admin/stores/context/${storeId}/settlements`, { params });
  return normalizePage(response.data);
}

export function useStoreContextStores(params = {}) {
  return useQuery({
    queryKey: storeContextKeys.stores(params),
    queryFn: () => getStoreContextStores(params),
  });
}

export function useStoreContextStats(storeId, period = "monthly") {
  return useQuery({
    queryKey: storeContextKeys.stats(storeId, period),
    queryFn: () => getStoreContextStats(storeId, period),
    enabled: Boolean(storeId),
  });
}

export function useStoreContextOrderTrend(storeId, period = "monthly") {
  return useQuery({
    queryKey: storeContextKeys.orderTrend(storeId, period),
    queryFn: () => getStoreContextOrderTrend(storeId, period),
    enabled: Boolean(storeId),
  });
}

export function useStoreContextOrders(storeId, params = {}) {
  return useQuery({
    queryKey: storeContextKeys.orders(storeId, params),
    queryFn: () => getStoreContextOrders(storeId, params),
    enabled: Boolean(storeId),
  });
}

export function useStoreContextProducts(storeId, params = {}) {
  return useQuery({
    queryKey: storeContextKeys.products(storeId, params),
    queryFn: () => getStoreContextProducts(storeId, params),
    enabled: Boolean(storeId),
  });
}

export function useStoreContextSettlements(storeId, params = {}) {
  return useQuery({
    queryKey: storeContextKeys.settlements(storeId, params),
    queryFn: () => getStoreContextSettlements(storeId, params),
    enabled: Boolean(storeId),
  });
}

export function getStoreContextError(error, fallback = "Data toko gagal dimuat.") {
  return getApiMessage(error, fallback);
}
