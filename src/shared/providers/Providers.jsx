import { AuthProvider } from "@/features/auth/context/AuthContext";
import { CartProvider } from "@/features/order/cart/context/CartContext";
import { WishlistProvider } from "@/features/order/wishlist/context/WishlistContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
