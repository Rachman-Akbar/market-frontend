import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

export const adminCategoryKeys = { all: ["admin", "categories"] };

function flatten(rows = [], depth = 0, parentName = "", parentPath = [], result = []) {
  rows.forEach((row) => {
    const name = row.name || "";
    const pathNames = [...parentPath, name].filter(Boolean);
    const children = Array.isArray(row.children) ? row.children : [];
    const normalized = {
      id: Number(row.id || 0),
      catalogGroupId: Number(row.catalog_group_id || 0),
      parentId: row.parent_id ? Number(row.parent_id) : null,
      name,
      slug: row.slug || "",
      fullSlug: row.full_slug || "",
      imageUrl: resolveMediaUrl(row.image_url || ""),
      iconUrl: resolveMediaUrl(row.icon_url || ""),
      level: depth + 1,
      sortOrder: Number(row.sort_order || 0),
      productsCount: Number(row.products_count || 0),
      isActive: Boolean(row.is_active ?? true),
      isVisibleInMenu: Boolean(row.is_visible_in_menu ?? true),
      parentName,
      pathNames,
      path: pathNames.join(" / "),
      depth,
      hasChildren: children.length > 0,
      childrenCount: children.length,
      raw: row,
    };
    result.push(normalized);
    flatten(children, depth + 1, normalized.name, pathNames, result);
  });
  return result;
}

export async function getAdminCategories() {
  const response = await apiClient.get("/api/v1/catalog/categories/manage");
  return flatten(unwrapCollection(response.data));
}

function serialize(values) {
  return {
    catalog_group_id: Number(values.catalogGroupId) || null,
    parent_id: Number(values.parentId) || null,
    name: values.name,
    slug: values.slug || null,
    image_url: values.imageUrl || null,
    icon_url: values.iconUrl || null,
    sort_order: Number(values.sortOrder || 0),
    is_active: Boolean(values.isActive),
    is_visible_in_menu: Boolean(values.isVisibleInMenu),
  };
}

export async function createAdminCategory(values) {
  const response = await apiClient.post("/api/v1/catalog/categories", serialize(values));
  return unwrapApiData(response.data);
}

export async function updateAdminCategory(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/categories/${id}`, serialize(values));
  return unwrapApiData(response.data);
}

export async function deleteAdminCategory(id) {
  return apiClient.delete(`/api/v1/catalog/categories/${id}`);
}

export function useAdminCategoryList() {
  return useQuery({ queryKey: adminCategoryKeys.all, queryFn: getAdminCategories });
}

function useCategoryMutation(mutationFn) {
  return useMutation({ mutationFn });
}

export function useCreateAdminCategory() {
  return useCategoryMutation(createAdminCategory);
}

export function useUpdateAdminCategory() {
  return useCategoryMutation(({ id, values }) => updateAdminCategory(id, values));
}

export function useDeleteAdminCategory() {
  return useCategoryMutation(deleteAdminCategory);
}

export function getCategoryError(error) {
  return getApiMessage(error, "Kategori gagal diproses.");
}
