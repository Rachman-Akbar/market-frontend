import { useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { normalizeProduct } from "@/features/catalog/product/services/productService";
import { assetUrl } from "@/features/seller/store/services/sellerStoreService";

export const storefrontKeys = {
  stores: (params = {}) => ["storefront", "stores", params],
  detail: (slug) => ["storefront", "stores", "detail", String(slug || "")],
  products: (slug, params = {}) => ["storefront", "stores", String(slug || ""), "products", params],
  banners: (storeId) => ["storefront", "stores", String(storeId || ""), "banners"],
};

export function normalizeStorefront(row = {}) {
  const detail = row.detail || {};
  return {
    id: Number(row.id || 0),
    name: row.name || row.store_name || "Toko",
    slug: row.slug || "",
    logo: assetUrl(row.logo || ""),
    bannerUrl: assetUrl(row.banner_url || row.bannerUrl || ""),
    description: row.description || detail.description || "",
    shortDescription: row.short_description || row.shortDescription || "",
    phone: row.phone || "",
    email: row.email || "",
    city: row.city || "",
    province: row.province || "",
    address: row.address || "",
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    detail: {
      openDays: detail.open_days || detail.openDays || "",
      openTime: detail.open_time || detail.openTime || "",
      closeTime: detail.close_time || detail.closeTime || "",
      shippingPolicy: detail.shipping_policy || detail.shippingPolicy || "",
      returnPolicy: detail.return_policy || detail.returnPolicy || "",
      whatsappUrl: detail.whatsapp_url || detail.whatsappUrl || "",
      instagramUrl: detail.instagram_url || detail.instagramUrl || "",
      websiteUrl: detail.website_url || detail.websiteUrl || "",
    },
  };
}

function normalizeBanner(row = {}) {
  return {
    id: Number(row.id || 0),
    storeId: Number(row.store_id || 0),
    name: row.name || "Banner toko",
    imageUrl: assetUrl(row.image_url || ""),
    sortOrder: Number(row.sort_order || 0),
  };
}

export async function getStores(params = {}) {
  const response = await apiClient.get("/api/v1/seller/stores", { params });
  return unwrapCollection(response.data).map(normalizeStorefront);
}

export async function getStoreBySlug(slug) {
  const response = await apiClient.get(`/api/v1/seller/stores/slug/${encodeURIComponent(slug)}`);
  return normalizeStorefront(unwrapApiData(response.data));
}

export async function getStoreProducts(slug, params = {}) {
  const response = await apiClient.get(`/api/v1/seller/stores/slug/${encodeURIComponent(slug)}/products`, { params });
  const payload = response.data?.data ?? response.data ?? {};
  const rows = Array.isArray(payload) ? payload : payload.data || [];
  return {
    rows: rows.map(normalizeProduct),
    meta: response.data?.meta || payload.meta || {
      current_page: payload.current_page || 1,
      last_page: payload.last_page || 1,
      total: payload.total || rows.length,
    },
  };
}

export async function getStoreBanners(storeId) {
  const response = await apiClient.get("/api/v1/catalog/banners", { params: { store_id: storeId } });
  return unwrapCollection(response.data).map(normalizeBanner);
}

export function useStores(params = {}, options = {}) {
  return useQuery({
    queryKey: storefrontKeys.stores(params),
    queryFn: () => getStores(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useStoreBySlug(slug) {
  return useQuery({ queryKey: storefrontKeys.detail(slug), queryFn: () => getStoreBySlug(slug), enabled: Boolean(slug), staleTime: 2 * 60 * 1000 });
}

export function useStoreProducts(slug, params = {}) {
  return useQuery({ queryKey: storefrontKeys.products(slug, params), queryFn: () => getStoreProducts(slug, params), enabled: Boolean(slug), staleTime: 60 * 1000 });
}

export function useStoreBanners(storeId) {
  return useQuery({ queryKey: storefrontKeys.banners(storeId), queryFn: () => getStoreBanners(storeId), enabled: Boolean(storeId), staleTime: 2 * 60 * 1000 });
}

export function getStorefrontError(error) {
  return getApiMessage(error, "Data toko gagal dimuat.");
}
