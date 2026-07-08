import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/features/order/wishlist/context/WishlistContext";
import { formatPrice } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/Button";

const COLORS = ["bg-orange-100", "bg-blue-100", "bg-green-100", "bg-purple-100", "bg-pink-100"];

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-lg mb-4">Wishlist ({items.length})</h2>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <Heart size={48} className="mx-auto mb-3" />
          <p>Wishlist kosong</p>
          <Button asChild className="mt-4"><Link to="/">Mulai Belanja</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, idx) => {
            const bg = COLORS[idx % COLORS.length];
            return (
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                <div className={`${bg} h-36 flex items-center justify-center`}>
                  <ShoppingBag size={36} className="text-gray-400" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.productName}</p>
                  <p className="text-orange-500 font-bold mt-1 text-sm">{formatPrice(item.price)}</p>
                  <div className="flex gap-2 mt-2">
                    <Button asChild size="sm" className="flex-1 text-xs">
                      <Link to={`/products/${item.productId}`}>Beli</Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.productId, item.variantId)} className="text-red-400 hover:text-red-600 px-2">
                      <Heart size={14} className="fill-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
