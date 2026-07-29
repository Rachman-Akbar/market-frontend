import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getCategories } from "@/features/catalog/category/services/categoryService";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

export const sellerProductKeys = {
  all: ["seller", "products"],
  list: (params = {}) => ["seller", "products", "list", params],
  categories: ["seller", "products", "categories"],
  attributes: ["seller", "products", "attributes"],
};

function normalizeImage(image = {}) {
  return {
    id: image.id ?? image.url,
    url: resolveMediaUrl(image.url || image.image_url || ""),
    altText: image.alt_text || image.altText || "",
    isPrimary: Boolean(image.is_primary ?? image.isPrimary),
    sortOrder: Number(image.sort_order ?? image.sortOrder ?? 0),
  };
}

function normalizeVariant(variant = {}) {
  return {
    id: variant.id ? Number(variant.id) : null,
    sku: variant.sku || "",
    name: variant.name || "",
    price: Number(variant.price || 0),
    stock: Number(variant.stock || 0),
    isDefault: Boolean(variant.is_default ?? variant.isDefault),
    values: (variant.values || []).map((value) => ({
      attributeId: Number(value.attribute_id || value.attribute?.id || 0),
      attributeName: value.attribute?.name || "",
      value: value.value || "",
    })),
  };
}

export function normalizeSellerProduct(row = {}) {
  const variants = (row.variants || []).map(normalizeVariant);
  const images = (row.images || []).map(normalizeImage);
  const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0] || {};
  const categoryIds = (row.category_ids || row.categories || [])
    .map((category) => Number(category?.id ?? category))
    .filter(Boolean);

  return {
    id: Number(row.id || 0),
    storeId: Number(row.store_id || row.storeId || row.store?.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    description: row.description || "",
    brand: row.brand || "",
    categoryId: Number(row.primary_category_id || categoryIds[0] || 0),
    categoryIds,
    sku: row.sku || defaultVariant.sku || "",
    price: Number(row.price ?? defaultVariant.price ?? 0),
    stock: Number(row.stock ?? defaultVariant.stock ?? 0),
    status: row.status || "draft",
    isActive: Boolean(row.is_active ?? true),
    thumbnail: resolveMediaUrl(row.thumbnail || images.find((image) => image.isPrimary)?.url || images[0]?.url || ""),
    images,
    variants,
    mode: variants.length > 1 || variants.some((variant) => variant.values.length) ? "variant" : "simple",
    raw: row,
  };
}

function normalizePagination(payload) {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : unwrapCollection(payload);

  return {
    rows: rows.map(normalizeSellerProduct),
    meta: payload?.meta || source?.meta || {
      current_page: source?.current_page || 1,
      last_page: source?.last_page || 1,
      per_page: source?.per_page || rows.length,
      total: source?.total || rows.length,
    },
  };
}

function serializeImage(image, index) {
  return {
    url: String(image.url || "").trim(),
    alt_text: String(image.altText || "").trim() || null,
    is_primary: index === 0,
    sort_order: index,
  };
}

function serializeVariant(variant, index) {
  return {
    ...(variant.id ? { id: Number(variant.id) } : {}),
    sku: String(variant.sku || "").trim(),
    name: String(variant.name || "").trim(),
    price: Number(variant.price || 0),
    stock: Number(variant.stock || 0),
    is_default: index === 0,
    values: (variant.values || [])
      .filter((value) => Number(value.attributeId) && String(value.value || "").trim())
      .map((value) => ({
        attribute_id: Number(value.attributeId),
        value: String(value.value).trim(),
      })),
  };
}

export function serializeSellerProduct(values = {}, options = {}) {
  const images = (values.images || []).filter((image) => String(image.url || "").trim());
  const categoryId = Number(values.categoryId || 0) || null;
  const includeAdminFields = Boolean(options.includeAdminFields);
  const payload = {
    ...(includeAdminFields && values.storeId ? { store_id: Number(values.storeId) } : {}),
    name: String(values.name || "").trim(),
    description: String(values.description || "").trim() || null,
    brand: String(values.brand || "").trim() || null,
    primary_category_id: categoryId,
    category_ids: categoryId ? [categoryId] : [],
    thumbnail: String(values.thumbnail || images[0]?.url || "").trim() || null,
    ...(includeAdminFields ? { status: values.status || "draft" } : {}),
    is_active: Boolean(values.isActive),
    images: images.map(serializeImage),
  };

  if (values.mode === "variant") {
    payload.variants = (values.variants || []).map(serializeVariant);
  } else {
    payload.sku = String(values.sku || "").trim() || null;
    payload.price = Number(values.price || 0);
    payload.stock = Number(values.stock || 0);
    payload.variants = [
      serializeVariant(
        {
          id: values.variants?.[0]?.id,
          sku: values.sku,
          name: values.name,
          price: values.price,
          stock: values.stock,
          isDefault: true,
          values: [],
        },
        0,
      ),
    ];
  }

  return payload;
}

function flattenCategories(rows = [], depth = 0, parentPath = [], result = []) {
  rows.forEach((row) => {
    const rawName = row.name || "Kategori";
    const pathNames = [...parentPath, rawName];
    result.push({
      id: Number(row.id || 0),
      name: rawName,
      rawName,
      depth,
      level: depth + 1,
      parentId: row.parent_id ? Number(row.parent_id) : null,
      parentName: parentPath[parentPath.length - 1] || "",
      pathNames,
      path: pathNames.join(" / "),
    });
    flattenCategories(row.children || [], depth + 1, pathNames, result);
  });
  return result;
}

export async function getSellerProducts(params = {}) {
  const response = await apiClient.get("/api/v1/catalog/seller/products", { params });
  return normalizePagination(response.data);
}

export async function createSellerProduct(values) {
  const response = await apiClient.post("/api/v1/catalog/seller/products", serializeSellerProduct(values));
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function updateSellerProduct(id, values) {
  const response = await apiClient.put(`/api/v1/catalog/seller/products/${id}`, serializeSellerProduct(values));
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function deleteSellerProduct(id) {
  const response = await apiClient.delete(`/api/v1/catalog/seller/products/${id}`);
  return response.data;
}

export async function getSellerProductCategories() {
  const result = await getCategories();
  return flattenCategories(result.data || []);
}

export async function getSellerProductAttributes() {
  const response = await apiClient.get("/api/v1/catalog/products/attributes");
  return unwrapCollection(response.data).map((attribute) => ({
    id: Number(attribute.id),
    name: attribute.name || "Atribut",
    type: attribute.type || "text",
  }));
}

export function useSellerProducts(params = {}) {
  const { isAuthenticated, activeRole, store } = useAuth();
  const storeId = Number(store?.id || 0);
  const scopedParams = { ...params, ...(storeId ? { store_id: storeId } : {}) };

  return useQuery({
    queryKey: sellerProductKeys.list(scopedParams),
    queryFn: async () => {
      const result = await getSellerProducts(scopedParams);
      return {
        ...result,
        rows: storeId ? result.rows.filter((row) => row.storeId === storeId) : [],
      };
    },
    enabled: Boolean(isAuthenticated && activeRole === "seller" && storeId),
    staleTime: 60 * 1000,
  });
}

export function useSellerProductCategories(options = {}) {
  return useQuery({ queryKey: sellerProductKeys.categories, queryFn: getSellerProductCategories, staleTime: 5 * 60 * 1000, ...options });
}

export function useSellerProductAttributes(options = {}) {
  return useQuery({ queryKey: sellerProductKeys.attributes, queryFn: getSellerProductAttributes, staleTime: 5 * 60 * 1000, ...options });
}

export function useCreateSellerProduct() {
  return useMutation({ mutationFn: createSellerProduct });
}

export function useUpdateSellerProduct() {
  return useMutation({
    mutationFn: ({ id, values }) => updateSellerProduct(id, values),
  });
}

export function useDeleteSellerProduct() {
  return useMutation({ mutationFn: deleteSellerProduct });
}

export function getSellerProductError(error) {
  return getApiMessage(error, "Produk gagal diproses.");
}
