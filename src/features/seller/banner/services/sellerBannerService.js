import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";
import { useAuth } from "@/features/auth/context/AuthContext";

export const sellerBannerKeys = { all: ["seller", "banners"] };

function normalizeBanner(row = {}) {
  return {
    id: Number(row.id || 0),
    storeId: Number(row.store_id || row.storeId || row.store?.id || 0),
    name: row.name || "",
    imageUrl: resolveMediaUrl(row.image_url || row.imageUrl || ""),
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    raw: row,
  };
}

function serialize(values) {
  return {
    name: values.name,
    image_url: values.imageUrl,
    sort_order: Number(values.sortOrder || 0),
    is_active: Boolean(values.isActive),
  };
}

export async function getSellerBanners() {
  const response = await apiClient.get("/api/v1/catalog/banners/manage");
  return unwrapCollection(response.data).map(normalizeBanner);
}

export async function createSellerBanner(values) {
  const response = await apiClient.post("/api/v1/catalog/banners", serialize(values));
  return normalizeBanner(unwrapApiData(response.data));
}

export async function updateSellerBanner(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/banners/${id}`, serialize(values));
  return normalizeBanner(unwrapApiData(response.data));
}

export async function deleteSellerBanner(id) {
  return apiClient.delete(`/api/v1/catalog/banners/${id}`);
}

export function useSellerBanners() {
  const { store, activeRole } = useAuth();
  const storeId = Number(store?.id || 0);
  return useQuery({
    queryKey: [...sellerBannerKeys.all, storeId],
    queryFn: async () => {
      const rows = await getSellerBanners();
      return storeId ? rows.filter((row) => row.storeId === storeId) : [];
    },
    enabled: Boolean(activeRole === "seller" && storeId),
  });
}

function useBannerMutation(mutationFn) {
  return useMutation({ mutationFn });
}

export function useCreateSellerBanner() { return useBannerMutation(createSellerBanner); }
export function useUpdateSellerBanner() { return useBannerMutation(({ id, values }) => updateSellerBanner(id, values)); }
export function useDeleteSellerBanner() { return useBannerMutation(deleteSellerBanner); }
export function getSellerBannerError(error) { return getApiMessage(error, "Banner gagal diproses."); }
