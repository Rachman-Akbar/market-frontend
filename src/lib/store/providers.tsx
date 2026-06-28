"use client";
import { CartProvider } from "@/lib/store/cartContext";
import { WishlistProvider } from "@/lib/store/wishlistContext";
import { AuthProvider } from "@/lib/store/authContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
