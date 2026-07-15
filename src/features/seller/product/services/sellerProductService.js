import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  getApiMessage,
  unwrapApiData,
  unwrapCollection,
} from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getCategories } from "@/features/catalog/category/services/categoryService";

export const sellerProductKeys = {
  all: ["seller", "products"],
  list: (params = {}) => ["seller", "products", "list", params],
  categories: ["seller", "products", "categories"],
};

function normalizeImage(image = {}) {
  if (typeof image === "string") {
    return { id: image, url: image, isPrimary: false };
  }

  return {
    id: image.id ?? image.uuid ?? image.url,
    url: image.url || image.image_url || image.path || "",
    isPrimary: Boolean(image.is_primary),
  };
}

export function normalizeSellerProduct(row = {}) {
  const categories = Array.isArray(row.categories)
    ? row.categories
    : Array.isArray(row.product_categories)
      ? row.product_categories
      : [];
  const images = Array.isArray(row.images)
    ? row.images.map(normalizeImage)
    : Array.isArray(row.product_images)
      ? row.product_images.map(normalizeImage)
      : [];
  const primaryCategory =
    row.primary_category ||
    categories.find((item) => item.is_primary || item.pivot?.is_primary) ||
    categories[0] ||
    {};
  const directThumbnail = row.thumbnail || row.image || row.image_url || "";

  return {
    id: Number(row.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    sku: row.sku || "",
    description: row.description || "",
    categoryId: Number(
      row.primary_category_id ||
        primaryCategory.id ||
        primaryCategory.category_id ||
        0,
    ),
    category:
      row.category_name ||
      row.primary_category_name ||
      primaryCategory.name ||
      "-",
    price: Number(row.price ?? row.base_price ?? 0),
    stock: Number(row.stock ?? row.stock_quantity ?? 0),
    weight: Number(row.weight ?? row.weight_grams ?? 0),
    sold: Number(row.sold || row.sold_count || 0),
    rating: Number(row.rating || row.rating_average || 0),
    status:
      row.is_active === false || row.status === "inactive"
        ? "inactive"
        : row.status === "draft" || row.status === "review"
          ? "review"
          : "active",
    isActive: row.is_active !== false && row.status !== "inactive",
    thumbnail:
      directThumbnail ||
      images.find((image) => image.isPrimary)?.url ||
      images[0]?.url ||
      "",
    images,
    raw: row,
  };
}

function normalizePagination(payload) {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const rows = Array.isArray(source)
    ? source
    : Array.isArray(source.data)
      ? source.data
      : unwrapCollection(payload);

  return {
    rows: rows.map(normalizeSellerProduct),
    meta: payload?.meta ||
      source?.meta || {
        current_page: source?.current_page || 1,
        last_page: source?.last_page || 1,
        per_page: source?.per_page || rows.length,
        total: source?.total || rows.length,
      },
  };
}

function appendValue(formData, key, value) {
  if (value === undefined || value === null) return;
  formData.append(key, String(value));
}

function buildProductFormData(values = {}) {
  const formData = new FormData();
  const categoryId = Number(values.categoryId || values.category_id || 0);

  appendValue(formData, "name", String(values.name || "").trim());
  appendValue(formData, "sku", String(values.sku || "").trim());
  appendValue(formData, "description", String(values.description || "").trim());
  appendValue(formData, "price", Number(values.price || 0));
  appendValue(formData, "stock", Number(values.stock || 0));
  appendValue(formData, "weight", Number(values.weight || 0));
  appendValue(formData, "is_active", values.isActive ? 1 : 0);
  appendValue(formData, "status", values.isActive ? "active" : "inactive");

  if (categoryId) {
    appendValue(formData, "primary_category_id", categoryId);
    appendValue(formData, "category_id", categoryId);
    appendValue(formData, "category_ids[]", categoryId);
  }

  Array.from(values.images || []).forEach((file) => {
    formData.append("images[]", file);
  });

  return formData;
}

function flattenCategories(rows = [], depth = 0, result = []) {
  rows.forEach((row) => {
    result.push({
      id: Number(row.id || 0),
      name: `${"— ".repeat(depth)}${row.name || "Kategori"}`,
      rawName: row.name || "Kategori",
    });
    flattenCategories(row.children || [], depth + 1, result);
  });

  return result;
}

export async function getSellerProducts(params = {}) {
  const response = await apiClient.get("/api/v1/seller/products", { params });
  return normalizePagination(response.data);
}

export async function createSellerProduct(values) {
  const response = await apiClient.post(
    "/api/v1/seller/products",
    buildProductFormData(values),
  );
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function updateSellerProduct(id, values) {
  const formData = buildProductFormData(values);
  formData.append("_method", "PUT");
  const response = await apiClient.post(
    `/api/v1/seller/products/${id}`,
    formData,
  );
  return normalizeSellerProduct(unwrapApiData(response.data));
}

export async function deleteSellerProduct(id) {
  const response = await apiClient.delete(`/api/v1/seller/products/${id}`);
  return response.data;
}

export async function getSellerProductCategories() {
  const result = await getCategories();
  return flattenCategories(result.data || []);
}

export function useSellerProducts(params = {}) {
  const { isAuthenticated, activeRole } = useAuth();

  return useQuery({
    queryKey: sellerProductKeys.list(params),
    queryFn: () => getSellerProducts(params),
    enabled: Boolean(isAuthenticated && activeRole === "seller"),
    staleTime: 30000,
  });
}

export function useSellerProductCategories() {
  return useQuery({
    queryKey: sellerProductKeys.categories,
    queryFn: getSellerProductCategories,
    staleTime: 300000,
  });
}

export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSellerProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all }),
  });
}

export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => updateSellerProduct(id, values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all }),
  });
}

export function useDeleteSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSellerProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all }),
  });
}

export function getSellerProductError(error) {
  return getApiMessage(error, "Produk gagal diproses.");
}
