import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { toBoolean } from "@/core/utils/boolean";
import { invalidateCatalogQueries } from "@/features/catalog/application/cache/catalogQueryClient";
import { beginOptimisticEntityUpdate, mergeOptimisticValues, rollbackOptimisticEntityUpdate } from "@/shared/utils/optimisticQueryData";

export const adminCatalogGroupKeys = { all: ["admin", "catalog-groups"] };

function normalizeCatalogGroup(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
    raw: row,
  };
}

export async function getAdminCatalogGroups() {
  const response = await apiClient.get("/api/v1/catalog/catalog-groups/manage");
  return unwrapCollection(response.data).map(normalizeCatalogGroup);
}

export async function createAdminCatalogGroup(values) {
  const response = await apiClient.post("/api/v1/catalog/catalog-groups", {
    name: values.name,
    slug: values.slug || null,
    is_active: Boolean(values.isActive),
  });
  return normalizeCatalogGroup(unwrapApiData(response.data));
}

export async function updateAdminCatalogGroup(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/catalog-groups/${id}`, {
    name: values.name,
    slug: values.slug || null,
    is_active: Boolean(values.isActive),
  });
  return normalizeCatalogGroup(unwrapApiData(response.data));
}

export async function deleteAdminCatalogGroup(id) {
  return apiClient.delete(`/api/v1/catalog/catalog-groups/${id}`);
}

function refreshCatalogGroupQueries(queryClient) {
  invalidateCatalogQueries("catalog-groups");
  invalidateCatalogQueries("categories");
  queryClient.invalidateQueries({ queryKey: adminCatalogGroupKeys.all });
  queryClient.invalidateQueries({ queryKey: ["catalog", "catalog-groups"] });
  queryClient.invalidateQueries({ queryKey: ["catalog", "categories"] });
}

export function useAdminCatalogGroups() {
  return useQuery({
    queryKey: adminCatalogGroupKeys.all,
    queryFn: getAdminCatalogGroups,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useCreateAdminCatalogGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCatalogGroup,
    onSettled: () => refreshCatalogGroupQueries(queryClient),
  });
}

export function useUpdateAdminCatalogGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateAdminCatalogGroup(id, values),
    onMutate: ({ id, values }) => beginOptimisticEntityUpdate(
      queryClient,
      adminCatalogGroupKeys.all,
      id,
      (row) => mergeOptimisticValues(row, values),
    ),
    onError: (_error, _variables, context) => rollbackOptimisticEntityUpdate(queryClient, context),
    onSettled: () => refreshCatalogGroupQueries(queryClient),
  });
}

export function useDeleteAdminCatalogGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminCatalogGroup,
    onSettled: () => refreshCatalogGroupQueries(queryClient),
  });
}

export function getCatalogGroupError(error) {
  return getApiMessage(error, "Catalog group gagal diproses.");
}
