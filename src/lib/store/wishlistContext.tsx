"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { WishlistItem } from "@/lib/types";

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  isWishlisted: (productId: string, variantId: string) => boolean;
  toggle: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items]);

  const isWishlisted = (productId: string, variantId: string) =>
    items.some((i) => i.productId === productId && i.variantId === variantId);

  const addItem = (item: WishlistItem) => {
    if (!isWishlisted(item.productId, item.variantId)) setItems((prev) => [...prev, item]);
  };

  const removeItem = (productId: string, variantId: string) =>
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));

  const toggle = (item: WishlistItem) =>
    isWishlisted(item.productId, item.variantId) ? removeItem(item.productId, item.variantId) : addItem(item);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
