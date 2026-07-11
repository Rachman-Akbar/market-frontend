import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/utils/apiClient";
import { useSellerStore } from "@/features/seller/store/services/sellerStoreService";

export const sellerProductKeys = {
  byStore: (slug, params = {}) => ["seller", "products", slug, params],
};

function normalizeProduct(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    sku: row.sku || "-",
    category: row.category_name || row.primary_category_name || "-",
    price: Number(row.price || 0),
    stock: Number(row.stock || 0),
    sold: Number(row.sold || row.sold_count || 0),
    rating: Number(row.rating || row.rating_average || 0),
    status: row.is_active === false || row.status === "inactive" ? "inactive" : row.status === "draft" || row.status === "review" ? "review" : "active",
    thumbnail: row.thumbnail || "",
  };
}

export async function getSellerProductRows(slug, params = {}) {
  const response = await apiClient.get(`/api/v1/seller/stores/slug/${slug}/products`, { params });
  const source = response.data?.data ?? response.data ?? {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : [];
  return {
    rows: rows.map(normalizeProduct),
    meta: response.data?.meta || source.meta || null,
  };
}

export function useSellerProducts(params = {}) {
  const storeQuery = useSellerStore();
  const slug = storeQuery.data?.slug || "";
  return useQuery({
    queryKey: sellerProductKeys.byStore(slug, params),
    queryFn: () => getSellerProductRows(slug, params),
    enabled: Boolean(slug),
    staleTime: 60000,
  });
}
