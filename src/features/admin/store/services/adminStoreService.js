import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapCollection } from "@/core/utils/apiClient";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

export const adminStoreKeys = {
  list: (params = {}) => ["admin", "stores", params],
};

export function normalizeAdminStore(row = {}) {
  return {
    id: Number(row.id || 0),
    userId: row.user_id || row.userId || "",
    ownerName: row.owner_name || row.ownerName || row.owner?.name || "",
    ownerEmail: row.owner_email || row.ownerEmail || row.owner?.email || "",
    name: row.name || "",
    slug: row.slug || "",
    description: row.description || "",
    shortDescription: row.short_description || row.shortDescription || "",
    phone: row.phone || "",
    email: row.email || "",
    city: row.city || "",
    province: row.province || "",
    address: row.address || "",
    logo: resolveMediaUrl(row.logo || ""),
    bannerUrl: resolveMediaUrl(row.banner_url || row.bannerUrl || ""),
    status: row.status || "pending",
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    raw: row,
  };
}

function normalizePage(payload) {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : unwrapCollection(payload);
  return {
    rows: rows.map(normalizeAdminStore),
    meta: payload?.meta || source?.meta || {
      current_page: source?.current_page || 1,
      last_page: source?.last_page || 1,
      total: source?.total || rows.length,
    },
  };
}

export async function getAdminStores(params = {}) {
  const response = await apiClient.get("/api/v1/seller/admin/stores", { params });
  return normalizePage(response.data);
}

export async function updateAdminStore(id, values) {
  const response = await apiClient.put(`/api/v1/seller/admin/stores/${id}`, {
    name: values.name,
    phone: values.phone || null,
    email: values.email || null,
    city: values.city || null,
    province: values.province || null,
    status: values.status,
    is_active: Boolean(values.isActive),
  });
  return normalizeAdminStore(response.data?.data || response.data);
}

export async function updateAdminStoreStatus(id, status, isActive) {
  const response = await apiClient.patch(`/api/v1/seller/admin/stores/${id}/status`, {
    status,
    ...(isActive === undefined ? {} : { is_active: Boolean(isActive) }),
  });
  return normalizeAdminStore(response.data?.data || response.data);
}

export function useAdminStores(params = {}) {
  return useQuery({ queryKey: adminStoreKeys.list(params), queryFn: () => getAdminStores(params) });
}

export function useUpdateAdminStore() {
  return useMutation({ mutationFn: ({ id, values }) => updateAdminStore(id, values) });
}

export function useUpdateAdminStoreStatus() {
  return useMutation({ mutationFn: ({ id, status, isActive }) => updateAdminStoreStatus(id, status, isActive) });
}

export function getAdminStoreError(error) {
  return getApiMessage(error, "Data toko gagal diproses.");
}
