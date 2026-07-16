import { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiData } from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getProductById,
  getProductVariants,
} from "@/features/catalog/product/services/productService";

const CartContext = createContext(null);
const CART_KEY = ["order", "cart"];

function normalizeCartItem(item = {}) {
  const attributes =
    item.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {};

  const variantLabel = Object.values(attributes).filter(Boolean).join(", ");

  return {
    cartItemId: Number(item.cart_item_id ?? item.id ?? 0),
    productId: Number(item.product_id ?? 0),
    variantId: Number(item.variant_id ?? item.product_variant_id ?? 0),
    productName: item.product_name || item.name || "Produk",
    variantLabel: item.variant_label || variantLabel || item.sku || "",
    storeId: Number(item.store_id ?? 0),
    storeName: item.store_name || "Toko",
    sku: item.sku || "",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    subtotal: Number(item.subtotal || 0),
    stock: Number(item.stock ?? 0),
    imageUrl: item.thumbnail || item.image || item.image_url || "",
    attributes,
  };
}

function normalizeCart(payload = {}) {
  const source = unwrapApiData(payload) || {};

  const rawItems = Array.isArray(source)
    ? source
    : Array.isArray(source.items)
      ? source.items
      : Array.isArray(source.cart_items)
        ? source.cart_items
        : [];

  const items = rawItems.map(normalizeCartItem);

  return {
    items,
    totalItems: Number(
      source.total_items ??
        source.totalItems ??
        items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    ),
    totalPrice: Number(
      source.total_price ??
        source.totalPrice ??
        source.subtotal ??
        items.reduce(
          (sum, item) =>
            sum + Number(item.price || 0) * Number(item.quantity || 0),
          0,
        ),
    ),
  };
}

async function resolveVariantId(item = {}) {
  const directVariantId = Number(
    item.variantId ?? item.variant_id ?? item.product_variant_id ?? 0,
  );

  if (directVariantId > 0) {
    return directVariantId;
  }

  const productId = Number(item.productId ?? item.product_id ?? item.id ?? 0);

  if (!productId) {
    throw new Error("Produk tidak valid karena product ID tidak ditemukan.");
  }

  try {
    const product = await getProductById(productId);
    const productVariantId = Number(
      product?.default_variant?.id ??
        product?.variants?.find((variant) => Boolean(variant.is_default))?.id ??
        product?.variants?.[0]?.id ??
        0,
    );

    if (productVariantId > 0) {
      return productVariantId;
    }
  } catch {}

  try {
    const variantsResponse = await getProductVariants(productId);
    const variants = variantsResponse?.data || [];
    const defaultVariant =
      variants.find((variant) => Boolean(variant.is_default)) ||
      variants[0] ||
      null;
    const fallbackVariantId = Number(defaultVariant?.id || 0);

    if (fallbackVariantId > 0) {
      return fallbackVariantId;
    }
  } catch {}

  throw new Error(
    "Varian produk tidak ditemukan. Silakan buka detail produk dan pilih varian terlebih dahulu.",
  );
}

async function fetchCart() {
  const response = await apiClient.get("/api/v1/order/carts");

  return normalizeCart(response.data);
}

async function addCartItem(item) {
  const variantId = await resolveVariantId(item);
  const quantity = Math.max(1, Number(item.quantity || 1));

  const response = await apiClient.post("/api/v1/order/carts/items", {
    items: [
      {
        product_variant_id: variantId,
        quantity,
      },
    ],
  });

  return response.data;
}

async function updateCartItem({ variantId, quantity }) {
  const response = await apiClient.patch(
    `/api/v1/order/carts/items/${Number(variantId)}`,
    {
      quantity: Number(quantity),
    },
  );

  return response.data;
}

async function removeCartItem(variantId) {
  const response = await apiClient.delete(
    `/api/v1/order/carts/items/${Number(variantId)}`,
  );

  return response.data;
}

async function clearRemoteCart() {
  const response = await apiClient.delete("/api/v1/order/carts");

  return response.data;
}

export function CartProvider({ children }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const cartQuery = useQuery({
    queryKey: CART_KEY,
    queryFn: fetchCart,
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const synchronizeCart = async () => {
    await queryClient.invalidateQueries({
      queryKey: CART_KEY,
    });
  };

  const addMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: synchronizeCart,
  });

  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: synchronizeCart,
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: synchronizeCart,
  });

  const clearMutation = useMutation({
    mutationFn: clearRemoteCart,
    onSuccess: synchronizeCart,
  });

  const cart = cartQuery.data || {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };

  const value = useMemo(
    () => ({
      items: cart.items,
      subtotal: cart.totalPrice,
      totalItems: cart.totalItems,
      loading: cartQuery.isLoading,
      error: cartQuery.error,
      addItem: (item) => addMutation.mutateAsync(item),
      updateQty: (_productId, variantId, quantity) =>
        updateMutation.mutateAsync({
          variantId,
          quantity,
        }),
      removeItem: (_productId, variantId) =>
        removeMutation.mutateAsync(variantId),
      clearCart: () => clearMutation.mutateAsync(),
      refreshCart: () => cartQuery.refetch(),
      mutating:
        addMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending ||
        clearMutation.isPending,
    }),
    [
      addMutation,
      cart.items,
      cart.totalItems,
      cart.totalPrice,
      cartQuery.error,
      cartQuery.isLoading,
      cartQuery.refetch,
      clearMutation,
      removeMutation,
      updateMutation,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }

  return context;
}
