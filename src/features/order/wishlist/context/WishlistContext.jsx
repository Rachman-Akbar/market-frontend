import { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/utils/apiClient";
import { useAuth } from "@/features/auth/context/AuthContext";

const WishlistContext = createContext(null);
const WISHLIST_KEY = ["order", "wishlist"];

function normalizeWishlistItem(item = {}) {
  return {
    id: Number(item.id ?? item.product_id ?? 0),
    productId: Number(item.product_id ?? item.id ?? 0),
    variantId: Number(item.default_variant_id ?? item.variant_id ?? 0),
    productName: item.name || item.product_name || "Produk",
    storeName: item.store_name || "Toko",
    slug: item.slug || "",
    brand: item.brand || "",
    price: Number(item.price || 0),
    stock: Number(item.stock || 0),
    imageUrl: item.thumbnail || item.image || "",
    status: item.status || "",
  };
}

async function fetchWishlist() {
  const response = await apiClient.get("/api/v1/order/wishlist");
  const rows = response.data?.data || [];
  return Array.isArray(rows) ? rows.map(normalizeWishlistItem) : [];
}

async function addWishlistItem(productId) {
  await apiClient.post("/api/v1/order/wishlist", { product_id: Number(productId) });
  return Number(productId);
}

async function removeWishlistItem(productId) {
  await apiClient.delete(`/api/v1/order/wishlist/${productId}`);
  return Number(productId);
}

export function WishlistProvider({ children }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const wishlistQuery = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
    staleTime: 120000,
  });

  const addMutation = useMutation({
    mutationFn: addWishlistItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
  const removeMutation = useMutation({
    mutationFn: removeWishlistItem,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_KEY });
      const previous = queryClient.getQueryData(WISHLIST_KEY) || [];
      queryClient.setQueryData(WISHLIST_KEY, previous.filter((row) => row.productId !== productId));
      return { previous };
    },
    onError: (_error, _productId, context) => queryClient.setQueryData(WISHLIST_KEY, context?.previous || []),
    onSettled: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });

  const items = wishlistQuery.data || [];
  const value = useMemo(
    () => ({
      items,
      loading: wishlistQuery.isLoading,
      addItem: (item) => addMutation.mutateAsync(Number(item.productId ?? item.id)),
      removeItem: (productId) => removeMutation.mutateAsync(Number(productId)),
      toggleItem: async (item) => {
        const productId = Number(item.productId ?? item.id);
        const exists = items.some((row) => row.productId === productId);
        return exists ? removeMutation.mutateAsync(productId) : addMutation.mutateAsync(productId);
      },
      hasItem: (productId) => items.some((row) => row.productId === Number(productId)),
      mutating: addMutation.isPending || removeMutation.isPending,
    }),
    [addMutation, items, removeMutation, wishlistQuery.isLoading]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist harus digunakan di dalam WishlistProvider");
  return context;
}
