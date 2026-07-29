import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createAppQueryClient } from "@/core/api/queryClient";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { CartProvider } from "@/features/order/cart/context/CartContext";
import { WishlistProvider } from "@/features/order/wishlist/context/WishlistContext";

export function Providers({ children }) {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
