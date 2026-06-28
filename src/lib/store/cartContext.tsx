"use client";
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; productId: string; variantId: string }
  | { type: "UPDATE_QTY"; productId: string; variantId: string; quantity: number }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex(
        (i) => i.productId === action.item.productId && i.variantId === action.item.variantId
      );
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], quantity: items[idx].quantity + action.item.quantity };
        return { items };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => !(i.productId === action.productId && i.variantId === action.variantId)) };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.productId === action.productId && i.variantId === action.variantId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQty: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed: CartState = JSON.parse(saved);
        parsed.items.forEach((item) => dispatch({ type: "ADD", item }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const value: CartContextValue = {
    ...state,
    addItem: (item) => dispatch({ type: "ADD", item }),
    removeItem: (productId, variantId) => dispatch({ type: "REMOVE", productId, variantId }),
    updateQty: (productId, variantId, quantity) => dispatch({ type: "UPDATE_QTY", productId, variantId, quantity }),
    clearCart: () => dispatch({ type: "CLEAR" }),
    totalItems: state.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
