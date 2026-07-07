import { catalogRequest, safeArray, unwrapCollection, unwrapData } from "@/features/catalog/services/catalogApi";
import { formatPrice } from "@/shared/utils/utils";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Cpath d='M180 385h240l-74-94-54 68-42-52-70 78Z' fill='%23d1d5db'/%3E%3Ccircle cx='235' cy='235' r='35' fill='%23d1d5db'/%3E%3C/svg%3E";

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function numberValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatSold(value) {
  if (value === undefined || value === null || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (number >= 1000) return `${Math.floor(number / 1000)}rb+`;
  return `${number}+`;
}

export function normalizeVariant(variant = {}) {
  const values = safeArray(variant.values || variant.attribute_values || variant.variant_values).map((value) => ({
    id: value.id,
    attribute_id: value.attribute_id,
    attribute_name: value.attribute_name || value.attribute?.name || value.name || `Atribut ${value.attribute_id ?? ""}`.trim(),
    value: value.value || value.label || value.name || "",
    raw: value,
  }));

  return {
    id: variant.id,
    product_id: variant.product_id,
    store_id: variant.store_id,
    sku: variant.sku || "",
    name: variant.name || variant.title || "Varian Produk",
    price: numberValue(variant.price),
    stock: numberValue(variant.stock),
    is_default: Boolean(variant.is_default),
    values,
    raw: variant,
  };
}

function normalizeImages(product = {}) {
  const images = safeArray(product.images || product.product_images).map((image) => ({
    id: image.id,
    url: image.url || image.image_url || image.src || "",
    alt_text: image.alt_text || image.alt || product.name || "Product",
    is_primary: Boolean(image.is_primary),
    sort_order: Number(image.sort_order || 0),
  })).filter((image) => image.url);

  const directImage = firstValue(product.thumbnail, product.image, product.image_url, product.picture_url);
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  if (directImage && !sorted.some((image) => image.url === directImage)) {
    sorted.unshift({ id: "thumbnail", url: directImage, alt_text: product.name || "Product", is_primary: true, sort_order: -1 });
  }

  return sorted.length ? sorted : [{ id: "placeholder", url: PLACEHOLDER_IMAGE, alt_text: product.name || "Product", is_primary: true, sort_order: 0 }];
}

export function normalizeProduct(product = {}) {
  const variants = safeArray(product.variants || product.product_variants).map(normalizeVariant);
  const defaultVariant = variants.find((variant) => variant.is_default) || variants[0] || null;
  const price = numberValue(firstValue(product.price, product.min_price, product.default_price, defaultVariant?.price));
  const images = normalizeImages(product);
  const categories = safeArray(product.categories || product.product_categories || product.category_list).map((category) => ({
    id: category.id || category.category_id,
    name: category.name || category.category?.name || "Kategori",
    slug: category.slug || category.category?.slug || "",
    full_slug: category.full_slug || category.category?.full_slug || category.slug || category.category?.slug || "",
    is_primary: Boolean(category.is_primary),
    raw: category,
  }));
  const primaryCategory = product.primary_category || categories.find((category) => category.is_primary) || categories[0] || null;

  return {
    id: product.id,
    store_id: product.store_id,
    primary_category_id: product.primary_category_id,
    slug: product.slug || String(product.id ?? ""),
    name: product.name || product.title || "Produk",
    title: product.name || product.title || "Produk",
    description: product.description || "",
    brand: product.brand || product.brand_name || "",
    thumbnail: images[0]?.url || PLACEHOLDER_IMAGE,
    image: images[0]?.url || PLACEHOLDER_IMAGE,
    images,
    status: product.status || "",
    is_active: product.is_active ?? true,
    price,
    price_label: formatPrice(price),
    stock: numberValue(firstValue(product.stock, product.total_stock, defaultVariant?.stock)),
    variants,
    default_variant: defaultVariant,
    categories,
    primary_category: primaryCategory,
    rating: firstValue(product.rating, product.average_rating, product.rating_average, ""),
    sold: formatSold(firstValue(product.sold, product.sold_count, product.total_sold, "")),
    location: firstValue(product.location, product.city, product.store?.city, product.store?.location, ""),
    raw: product,
  };
}

export async function getProducts(params = {}) {
  const payload = await catalogRequest("/products", { params });
  const { items, meta } = unwrapCollection(payload);
  return {
    data: items.map(normalizeProduct),
    meta,
  };
}

export async function getProductById(id) {
  const payload = await catalogRequest(`/products/${id}`);
  return normalizeProduct(unwrapData(payload));
}

export async function getProductBySlug(slug) {
  const payload = await catalogRequest(`/products/slug/${encodeURIComponent(slug)}`);
  return normalizeProduct(unwrapData(payload));
}

export async function getProductVariants(productId) {
  const payload = await catalogRequest(`/products/${productId}/variants`);
  const { items, meta } = unwrapCollection(payload);
  return {
    data: items.map(normalizeVariant),
    meta,
  };
}

export async function getProductAttributes(params = {}) {
  const payload = await catalogRequest("/products/attributes", { params });
  const { items, meta } = unwrapCollection(payload);
  return { data: items, meta };
}
