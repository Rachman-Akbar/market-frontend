import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

export const adminBannerKeys = { list: (params = {}) => ["admin", "banners", params] };

export function normalizeAdminBanner(row = {}) {
  return {
    id: Number(row.id || 0),
    storeId: Number(row.store_id || row.storeId || 0),
    storeName: row.store_name || row.storeName || "",
    name: row.name || "",
    imageUrl: resolveMediaUrl(row.image_url || row.imageUrl || ""),
    sortOrder: Number(row.sort_order || row.sortOrder || 0),
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    raw: row,
  };
}

function serialize(values) {
  return {
    store_id: Number(values.storeId || 0),
    name: values.name,
    image_url: values.imageUrl,
    sort_order: Number(values.sortOrder || 0),
    is_active: Boolean(values.isActive),
  };
}

export async function getAdminBanners(params = {}) {
  const response = await apiClient.get("/api/v1/catalog/banners/admin/manage", { params });
  return unwrapCollection(response.data).map(normalizeAdminBanner);
}

export async function createAdminBanner(values) {
  const response = await apiClient.post("/api/v1/catalog/banners/admin", serialize(values));
  return normalizeAdminBanner(unwrapApiData(response.data));
}

export async function updateAdminBanner(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/banners/admin/${id}`, serialize(values));
  return normalizeAdminBanner(unwrapApiData(response.data));
}

export async function deleteAdminBanner(id) {
  return apiClient.delete(`/api/v1/catalog/banners/admin/${id}`);
}

export function useAdminBanners(params = {}) {
  return useQuery({ queryKey: adminBannerKeys.list(params), queryFn: () => getAdminBanners(params) });
}

export function useCreateAdminBanner() { return useMutation({ mutationFn: createAdminBanner }); }
export function useUpdateAdminBanner() { return useMutation({ mutationFn: ({ id, values }) => updateAdminBanner(id, values) }); }
export function useDeleteAdminBanner() { return useMutation({ mutationFn: deleteAdminBanner }); }
export function getAdminBannerError(error) { return getApiMessage(error, "Banner gagal diproses oleh admin."); }
