import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { normalizeSellerProduct, serializeSellerProduct } from "@/features/seller/product/services/sellerProductService";
import { getManagedStores } from "@/features/catalog/store/services/storeManagementService";
import { invalidateCatalogResources } from "@/features/catalog/application/cache/invalidateCatalogResources";

export const adminProductKeys = {
  all: ["admin", "products"],
  list: (params = {}) => ["admin", "products", "list", params],
  stores: ["admin", "products", "stores"],
};

function normalizePagination(payload) {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : unwrapCollection(payload);
  return {
    rows: rows.map(normalizeSellerProduct),
    meta: payload?.meta || source?.meta || { current_page: 1, last_page: 1, total: rows.length },
  };
}

export async function getAdminProducts(params = {}) {
  const response = await apiClient.get("/api/v1/catalog/admin/products", { params });
  return normalizePagination(response.data);
}

export async function createAdminProduct(values) {
  const response = await apiClient.post("/api/v1/catalog/admin/products", serializeSellerProduct(values));
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function updateAdminProduct(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/admin/products/${id}`, serializeSellerProduct(values));
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function deleteAdminProduct(id) {
  return apiClient.delete(`/api/v1/catalog/admin/products/${id}`);
}

export async function getAdminProductStores() {
  return getManagedStores({ per_page: 100 });
}

export function useAdminProducts(params = {}) {
  return useQuery({ queryKey: adminProductKeys.list(params), queryFn: () => getAdminProducts(params) });
}

export function useAdminProductStores() {
  return useQuery({ queryKey: adminProductKeys.stores, queryFn: getAdminProductStores, staleTime: 5 * 60 * 1000 });
}

function useProductMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => invalidateCatalogResources(
      queryClient,
      [adminProductKeys.all, ["seller", "products"], ["catalog", "products"], ["storefront", "stores"]],
      ["/products"],
    ),
  });
}

export function useCreateAdminProduct() { return useProductMutation(createAdminProduct); }
export function useUpdateAdminProduct() { return useProductMutation(({ id, values }) => updateAdminProduct(id, values)); }
export function useDeleteAdminProduct() { return useProductMutation(deleteAdminProduct); }
export function getAdminProductError(error) { return getApiMessage(error, "Produk gagal diproses oleh admin."); }
