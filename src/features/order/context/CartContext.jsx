import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "marketku_cart_items";

function getStoredItems() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getStoredItems());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((current) => {
      const existing = current.find((row) => row.productId === item.productId && row.variantId === item.variantId);
      if (!existing) return [...current, { ...item, quantity: item.quantity || 1 }];
      return current.map((row) =>
        row.productId === item.productId && row.variantId === item.variantId
          ? { ...row, quantity: row.quantity + (item.quantity || 1) }
          : row
      );
    });
  };

  const updateQty = (productId, variantId, quantity) => {
    setItems((current) =>
      current
        .map((row) => (row.productId === productId && row.variantId === variantId ? { ...row, quantity } : row))
        .filter((row) => row.quantity > 0)
    );
  };

  const removeItem = (productId, variantId) => {
    setItems((current) => current.filter((row) => !(row.productId === productId && row.variantId === variantId)));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const value = useMemo(() => ({ items, subtotal, addItem, updateQty, removeItem, clearCart }), [items, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus digunakan di dalam CartProvider");
  return context;
}
