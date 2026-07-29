import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { invalidateCatalogResources } from "@/features/catalog/application/cache/invalidateCatalogResources";

export const adminCatalogGroupKeys = { all: ["admin", "catalog-groups"] };

function normalizeCatalogGroup(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
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

export function useAdminCatalogGroups() {
  return useQuery({ queryKey: adminCatalogGroupKeys.all, queryFn: getAdminCatalogGroups });
}

function useInvalidatingMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => invalidateCatalogResources(
      queryClient,
      [adminCatalogGroupKeys.all, ["catalog", "catalog-groups"], ["catalog", "categories"], ["catalog", "products"]],
      ["/catalog-groups", "/categories", "/products"],
    ),
  });
}

export function useCreateAdminCatalogGroup() {
  return useInvalidatingMutation(createAdminCatalogGroup);
}

export function useUpdateAdminCatalogGroup() {
  return useInvalidatingMutation(({ id, values }) => updateAdminCatalogGroup(id, values));
}

export function useDeleteAdminCatalogGroup() {
  return useInvalidatingMutation(deleteAdminCatalogGroup);
}

export function getCatalogGroupError(error) {
  return getApiMessage(error, "Catalog group gagal diproses.");
}
