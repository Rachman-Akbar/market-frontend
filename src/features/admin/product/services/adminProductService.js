import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { normalizeSellerProduct, serializeSellerProduct } from "@/features/seller/product/services/sellerProductService";
import { normalizeAdminStore } from "@/features/admin/store/services/adminStoreService";
import { invalidateCatalogQueries } from "@/features/catalog/application/cache/catalogQueryClient";
import { beginOptimisticEntityUpdate, mergeOptimisticValues, rollbackOptimisticEntityUpdate } from "@/shared/utils/optimisticQueryData";

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
  const response = await apiClient.post("/api/v1/catalog/admin/products", serializeSellerProduct(values, { includeAdminFields: true }));
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function updateAdminProduct(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/admin/products/${id}`, serializeSellerProduct(values, { includeAdminFields: true }));
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function deleteAdminProduct(id) {
  return apiClient.delete(`/api/v1/catalog/admin/products/${id}`);
}

export async function getAdminProductStores() {
  const response = await apiClient.get("/api/v1/seller/admin/stores", { params: { per_page: 100 } });
  const source = response.data?.data?.data ?? response.data?.data ?? [];
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : [];
  return rows.map(normalizeAdminStore);
}

function refreshAdminProductQueries(queryClient) {
  invalidateCatalogQueries("products");
  queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
  queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
  queryClient.invalidateQueries({ queryKey: ["catalog", "products"] });
  queryClient.invalidateQueries({ queryKey: ["storefront"] });
  queryClient.invalidateQueries({ queryKey: ["order", "wishlist"] });
}

export function useAdminProducts(params = {}) {
  return useQuery({
    queryKey: adminProductKeys.list(params),
    queryFn: () => getAdminProducts(params),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useAdminProductStores() {
  return useQuery({
    queryKey: adminProductKeys.stores,
    queryFn: getAdminProductStores,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminProduct,
    onSettled: () => refreshAdminProductQueries(queryClient),
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateAdminProduct(id, values),
    onMutate: ({ id, values }) => beginOptimisticEntityUpdate(
      queryClient,
      adminProductKeys.all,
      id,
      (row) => mergeOptimisticValues(row, values),
    ),
    onError: (_error, _variables, context) => rollbackOptimisticEntityUpdate(queryClient, context),
    onSettled: () => refreshAdminProductQueries(queryClient),
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminProduct,
    onSettled: () => refreshAdminProductQueries(queryClient),
  });
}

export function getAdminProductError(error) {
  return getApiMessage(error, "Produk gagal diproses oleh admin.");
}
