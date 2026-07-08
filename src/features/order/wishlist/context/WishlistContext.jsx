import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "marketku_wishlist_items";

function getStoredItems() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getStoredItems());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((current) => {
      const exists = current.some((row) => row.productId === item.productId && row.variantId === item.variantId);
      return exists ? current : [...current, item];
    });
  };

  const removeItem = (productId, variantId) => {
    setItems((current) => current.filter((row) => !(row.productId === productId && row.variantId === variantId)));
  };

  const toggleItem = (item) => {
    setItems((current) => {
      const exists = current.some((row) => row.productId === item.productId && row.variantId === item.variantId);
      if (exists) return current.filter((row) => !(row.productId === item.productId && row.variantId === item.variantId));
      return [...current, item];
    });
  };

  const value = useMemo(() => ({ items, addItem, removeItem, toggleItem }), [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist harus digunakan di dalam WishlistProvider");
  return context;
}
