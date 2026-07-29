import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { assetUrl } from "@/features/seller/store/services/sellerStoreService";

export const promotionManagementKeys = {
  public: ["catalog", "promotions", "public"],
  admin: ["admin", "promotions"],
  seller: ["seller", "promotions"],
};

export function normalizePromotion(row = {}) {
  const action = row.click_action || "none";
  const targetId = row.target_id ? Number(row.target_id) : null;
  const href = row.resolved_url || (action === "url" ? row.target_url : "/promotions") || "/promotions";

  return {
    id: Number(row.id || 0),
    storeId: row.store_id ? Number(row.store_id) : null,
    storeName: row.store_name || "",
    name: row.name || "",
    title: row.name || "Promosi",
    subtitle: row.store_name ? `Campaign dari ${row.store_name}` : "Campaign pilihan untuk buyer Ziip",
    badge: row.store_name ? "Promo Seller" : "Promo Pilihan",
    cta: "Lihat Promo",
    imageUrl: assetUrl(row.image_url || ""),
    mobileImageUrl: assetUrl(row.mobile_image_url || row.image_url || ""),
    clickAction: action,
    targetId,
    targetUrl: row.target_url || "",
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active ?? true),
    approvalStatus: row.approval_status || "approved",
    rejectionReason: row.rejection_reason || "",
    submittedAt: row.submitted_at || null,
    approvedAt: row.approved_at || null,
    approvedBy: row.approved_by || null,
    href,
  };
}

function serialize(values) {
  return {
    ...(values.storeId ? { store_id: Number(values.storeId) } : {}),
    name: values.name,
    image_url: values.imageUrl,
    mobile_image_url: values.mobileImageUrl || null,
    click_action: values.clickAction || "none",
    target_id: ["product", "category"].includes(values.clickAction) ? Number(values.targetId) || null : null,
    target_url: values.clickAction === "url" ? values.targetUrl || null : null,
    sort_order: Number(values.sortOrder || 0),
    is_active: Boolean(values.isActive),
  };
}

async function list(url, params = {}) {
  const response = await apiClient.get(url, { params });
  return unwrapCollection(response.data).map(normalizePromotion);
}

async function create(url, values) {
  const response = await apiClient.post(url, serialize(values));
  return normalizePromotion(unwrapApiData(response.data));
}

async function update(url, id, values) {
  const response = await apiClient.put(`${url}/${id}`, serialize(values));
  return normalizePromotion(unwrapApiData(response.data));
}

async function remove(url, id) {
  return apiClient.delete(`${url}/${id}`);
}

export async function getPublicPromotions() { return list("/api/v1/catalog/promotions"); }
export async function getAdminPromotions(params = {}) { return list("/api/v1/catalog/promotions/manage", params); }
export async function getSellerPromotions(params = {}) { return list("/api/v1/seller/promotions/manage", params); }
export async function createAdminPromotion(values) { return create("/api/v1/catalog/promotions", values); }
export async function updateAdminPromotion(id, values) { return update("/api/v1/catalog/promotions", id, values); }
export async function deleteAdminPromotion(id) { return remove("/api/v1/catalog/promotions", id); }
export async function createSellerPromotion(values) { return create("/api/v1/seller/promotions", values); }
export async function updateSellerPromotion(id, values) { return update("/api/v1/seller/promotions", id, values); }
export async function deleteSellerPromotion(id) { return remove("/api/v1/seller/promotions", id); }

export async function approvePromotion(id) {
  const response = await apiClient.patch(`/api/v1/catalog/promotions/${id}/approve`);
  return normalizePromotion(unwrapApiData(response.data));
}

export async function rejectPromotion({ id, reason }) {
  const response = await apiClient.patch(`/api/v1/catalog/promotions/${id}/reject`, { reason });
  return normalizePromotion(unwrapApiData(response.data));
}

export function usePublicPromotions() {
  return useQuery({ queryKey: promotionManagementKeys.public, queryFn: getPublicPromotions, staleTime: 5 * 60 * 1000 });
}

export function useAdminPromotions(params = {}) {
  return useQuery({ queryKey: [...promotionManagementKeys.admin, params], queryFn: () => getAdminPromotions(params) });
}

export function useSellerPromotions(params = {}) {
  return useQuery({ queryKey: [...promotionManagementKeys.seller, params], queryFn: () => getSellerPromotions(params) });
}

function usePromotionMutation(mutationFn, keys) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
}

const allKeys = [promotionManagementKeys.public, promotionManagementKeys.admin, promotionManagementKeys.seller];
export function useCreateAdminPromotion() { return usePromotionMutation(createAdminPromotion, allKeys); }
export function useUpdateAdminPromotion() { return usePromotionMutation(({ id, values }) => updateAdminPromotion(id, values), allKeys); }
export function useDeleteAdminPromotion() { return usePromotionMutation(deleteAdminPromotion, allKeys); }
export function useCreateSellerPromotion() { return usePromotionMutation(createSellerPromotion, allKeys); }
export function useUpdateSellerPromotion() { return usePromotionMutation(({ id, values }) => updateSellerPromotion(id, values), allKeys); }
export function useDeleteSellerPromotion() { return usePromotionMutation(deleteSellerPromotion, allKeys); }
export function useApprovePromotion() { return usePromotionMutation(approvePromotion, allKeys); }
export function useRejectPromotion() { return usePromotionMutation(rejectPromotion, allKeys); }
export function getPromotionError(error) { return getApiMessage(error, "Promosi gagal diproses."); }
