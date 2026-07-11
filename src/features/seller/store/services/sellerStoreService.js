import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData } from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  addressKeys,
  createAddress,
  getAddresses,
  updateAddress,
} from "@/features/profile/address/addressService";

export const sellerStoreKeys = {
  all: ["seller", "stores"],
  detail: (id) => ["seller", "stores", "detail", String(id || "")],
};

export function normalizeStore(row = {}) {
  const detail = row.detail || {};

  return {
    id: Number(row.id || 0),
    userId: String(row.user_id || row.userId || ""),
    name: row.name || row.store_name || "",
    slug: row.slug || "",
    description: row.description || "",
    shortDescription: row.short_description || row.shortDescription || "",
    phone: row.phone || "",
    email: row.email || "",
    city: row.city || "",
    province: row.province || "",
    address: row.address || "",
    isActive: Boolean(row.is_active ?? row.isActive),
    logo: row.logo || "",
    bannerUrl: row.banner_url || row.bannerUrl || "",
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    detail: {
      ownerName: detail.owner_name || detail.ownerName || "",
      ownerPhone: detail.owner_phone || detail.ownerPhone || "",
      description: detail.description || "",
      shippingPolicy: detail.shipping_policy || detail.shippingPolicy || "",
      returnPolicy: detail.return_policy || detail.returnPolicy || "",
      openDays: detail.open_days || detail.openDays || "",
      openTime: detail.open_time || detail.openTime || "",
      closeTime: detail.close_time || detail.closeTime || "",
      whatsappUrl: detail.whatsapp_url || detail.whatsappUrl || "",
      instagramUrl: detail.instagram_url || detail.instagramUrl || "",
      tiktokUrl: detail.tiktok_url || detail.tiktokUrl || "",
      websiteUrl: detail.website_url || detail.websiteUrl || "",
    },
  };
}

export function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = String(
    import.meta.env.VITE_ASSET_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      ""
  ).replace(/\/$/, "");
  const normalizedPath = String(path).replace(/^\/+/, "");

  if (normalizedPath.startsWith("storage/")) {
    return `${base}/${normalizedPath}`;
  }

  return `${base}/storage/${normalizedPath}`;
}

export async function getSellerStoreData(id) {
  const response = await apiClient.get(`/api/v1/seller/stores/${id}`);
  return normalizeStore(unwrapApiData(response.data));
}

export async function updateSellerStore({ id, formData }) {
  const response = await apiClient.post(`/api/v1/seller/stores/${id}`, formData);
  return normalizeStore(unwrapApiData(response.data));
}

export async function saveSellerStoreAddress(values) {
  const rows = await getAddresses("store");
  const current = rows[0];

  return current
    ? updateAddress(current.id, values, "store")
    : createAddress(values, "store");
}

export function useSellerStore() {
  const { store, isAuthenticated } = useAuth();
  const id = store?.id || 0;

  return useQuery({
    queryKey: sellerStoreKeys.detail(id),
    queryFn: () => getSellerStoreData(id),
    enabled: Boolean(isAuthenticated && id),
    staleTime: 120000,
  });
}

export function useSellerStoreAddress() {
  const { isAuthenticated, activeRole, store } = useAuth();

  return useQuery({
    queryKey: addressKeys.store,
    queryFn: async () => (await getAddresses("store"))[0] || null,
    enabled: Boolean(isAuthenticated && activeRole === "seller" && store?.id),
    staleTime: 300000,
  });
}

export function useUpdateSellerStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSellerStore,
    onSuccess: (store) => {
      queryClient.setQueryData(sellerStoreKeys.detail(store.id), store);
      queryClient.invalidateQueries({ queryKey: sellerStoreKeys.all });
    },
  });
}

export function useSaveSellerStoreAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSellerStoreAddress,
    onSuccess: (address) => {
      queryClient.setQueryData(addressKeys.store, [address]);
    },
  });
}

export function getSellerStoreError(error) {
  return getApiMessage(error, "Data toko gagal diproses.");
}
