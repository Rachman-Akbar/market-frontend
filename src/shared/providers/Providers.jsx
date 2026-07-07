import { AuthProvider } from "@/features/auth/context/AuthContext";
import { CartProvider } from "@/features/order/context/CartContext";
import { WishlistProvider } from "@/features/order/context/WishlistContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
