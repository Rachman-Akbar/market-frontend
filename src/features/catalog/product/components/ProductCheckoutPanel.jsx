import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatPrice } from "@/shared/utils/utils";
import { useCart } from "@/features/order/cart/context/CartContext";
import { useWishlist } from "@/features/order/wishlist/context/WishlistContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getApiMessage } from "@/core/utils/apiClient";

export function ProductCheckoutPanel({ product, variant }) {
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [buyingNow, setBuyingNow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addItem, mutating: cartMutating } = useCart();
  const { toggleItem, hasItem, mutating: wishlistMutating } = useWishlist();
  const activeVariant = variant || product?.default_variant || null;
  const variantId = Number(activeVariant?.id || activeVariant?.variant_id || 0);
  const productId = Number(product?.id || 0);
  const price = Number(activeVariant?.price || product?.price || 0);
  const stock = Number(activeVariant?.stock ?? product?.stock ?? 0);
  const image = product?.image || product?.thumbnail;
  const variantName = activeVariant?.name || product?.name || "Produk";
  const wished = hasItem(productId);

  const requireLogin = () => {
    if (isAuthenticated) return true;
    navigate("/auth/login", {
      state: { from: { pathname: location.pathname, search: location.search } },
    });
    return false;
  };

  const handleAddCart = async () => {
    if (!requireLogin()) return;
    if (!variantId) {
      setMessage("Pilih varian produk terlebih dahulu.");
      return;
    }

    try {
      setMessage("");
      await addItem({ productId, variantId, quantity: qty });
      setMessage("Produk berhasil ditambahkan ke keranjang.");
    } catch (error) {
      setMessage(
        getApiMessage(error, "Produk gagal ditambahkan ke keranjang."),
      );
    }
  };

  const handleBuyNow = async () => {
    if (!requireLogin()) return;
    if (!variantId) {
      setMessage("Pilih varian produk terlebih dahulu.");
      return;
    }

    try {
      setBuyingNow(true);
      setMessage("");
      const cart = await addItem({ productId, variantId, quantity: qty });
      const cartItem = cart.items.find(
        (item) => Number(item.variantId) === variantId,
      );

      if (!cartItem?.cartItemId) {
        navigate("/cart");
        return;
      }

      navigate("/checkout", {
        state: {
          cartItemIds: [cartItem.cartItemId],
          buyNow: true,
        },
      });
    } catch (error) {
      setMessage(getApiMessage(error, "Checkout langsung gagal diproses."));
    } finally {
      setBuyingNow(false);
    }
  };

  const handleWishlist = async () => {
    if (!requireLogin()) return;

    try {
      setMessage("");
      await toggleItem({ productId });
      setMessage(
        wished
          ? "Produk dihapus dari wishlist."
          : "Produk ditambahkan ke wishlist.",
      );
    } catch (error) {
      setMessage(getApiMessage(error, "Wishlist gagal diperbarui."));
    }
  };

  return (
    <div className="sticky border border-gray-200 rounded-xl p-4 shadow-sm top-20">
      <h2 className="font-bold text-sm mb-4">Atur jumlah dan catatan</h2>

      <div className="flex items-center gap-3 mb-4">
        <img
          src={image}
          alt={variantName}
          className="w-12 h-12 rounded-md object-cover"
        />
        <span className="text-sm text-gray-700 truncate">{variantName}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border border-gray-200 rounded-lg h-9">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 text-gray-300 font-bold hover:text-[#10B981]"
          >
            -
          </button>
          <input
            type="text"
            value={qty}
            readOnly
            className="w-10 text-center border-none text-sm p-0 focus:ring-0"
          />
          <button
            onClick={() =>
              setQty((q) => (stock ? Math.min(stock, q + 1) : q + 1))
            }
            className="px-3 text-[#10B981] font-bold"
          >
            +
          </button>
        </div>
        <span className="text-sm">
          Stok: <span className="font-bold">{stock}</span>
        </span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Subtotal</span>
        <span className="text-lg font-bold">{formatPrice(price * qty)}</span>
      </div>

      <div className="space-y-2 mb-6">
        <button
          type="button"
          disabled={cartMutating || buyingNow || !stock}
          onClick={handleBuyNow}
          className="w-full rounded-lg bg-[#10B981] py-2.5 font-bold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buyingNow ? "Menyiapkan Checkout..." : "Beli Sekarang"}
        </button>
        <button
          type="button"
          disabled={cartMutating || buyingNow || !stock}
          onClick={handleAddCart}
          className="w-full rounded-lg border border-[#10B981] bg-white py-2.5 font-bold text-[#047857] transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cartMutating && !buyingNow ? "Menambahkan..." : "+ Keranjang"}
        </button>
        {message ? <p className="text-xs text-gray-600">{message}</p> : null}
      </div>

      <div className="flex justify-around items-center text-xs font-bold text-gray-600">
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-[#10B981]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Chat
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <button
          type="button"
          disabled={wishlistMutating}
          onClick={handleWishlist}
          className="flex items-center gap-1.5 hover:text-[#10B981] disabled:opacity-60"
        >
          <svg
            className="w-4 h-4"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Wishlist
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-[#10B981]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
