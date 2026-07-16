import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import { useWishlist } from "@/features/order/wishlist/context/WishlistContext";
import { Button } from "@/shared/components/ui/Button";

export default function WishlistPage() {
  const {
    items,
    removeItem,
  } = useWishlist();

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-800">
        Wishlist ({items.length})
      </h2>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          <Heart
            size={48}
            className="mx-auto mb-3"
          />

          <p>Wishlist kosong</p>

          <Button
            asChild
            className="mt-4"
          >
            <Link to="/">Mulai Belanja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <ProductCard
              key={`${item.productId}-${item.variantId || 0}`}
              id={item.productId}
              productId={item.productId}
              variantId={item.variantId}
              slug={item.slug}
              name={item.productName || item.name}
              image={
                item.image ||
                item.imageUrl ||
                item.thumbnail
              }
              price={item.price}
              originalPrice={item.originalPrice}
              rating={item.rating}
              sold={item.sold}
              location={
                item.location ||
                item.storeName ||
                "Official Store"
              }
              stock={item.stock}
              variants={item.variants}
              default_variant={item.defaultVariant}
              wishlistBtn
              onWishlistToggle={() =>
                removeItem(
                  item.productId,
                  item.variantId,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}