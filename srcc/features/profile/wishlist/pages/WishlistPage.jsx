import { useMemo, useState } from "react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { useWishlist } from "@/features/order/wishlist/context/WishlistContext";
import { useCart } from "@/features/order/cart/context/CartContext";
import { formatPrice } from "@/shared/utils/utils";

export default function WishlistPage() {
  const [keyword, setKeyword] = useState("");
  const { items, loading, removeItem } = useWishlist();
  const { addItem } = useCart();
  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return search
      ? items.filter((item) =>
          `${item.productName} ${item.storeName}`
            .toLowerCase()
            .includes(search),
        )
      : items;
  }, [items, keyword]);

  return (
    <section className={profileLayout.contentShell}>
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>
              Wishlist product
            </span>
            <h2 className={profileLayout.contentTitle}>Wishlist</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>
              Produk favorit yang tersimpan pada akun Anda.
            </p>
          </div>
          <label className={`${profileLayout.searchBox} w-full sm:max-w-xs`}>
            <Search size={17} className="mr-2" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              type="search"
              placeholder="Cari wishlist"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <hr className={profileLayout.divider} />

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">
            Memuat wishlist...
          </p>
        ) : null}
        {!loading &&
          filteredItems.map((item) => (
            <div key={item.productId} className="min-h-[104px] py-6">
              <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#D1FAE5] text-[#10B981]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Heart size={22} />
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/products/${item.slug || item.productId}`}
                    className="text-base font-semibold text-slate-950 hover:text-[#10B981]"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-sm text-slate-500">{item.storeName}</p>
                  <p className="mt-1 text-sm font-semibold text-[#10B981]">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: 1,
                      })
                    }
                    className={profileLayout.primaryButton}
                  >
                    <ShoppingCart size={16} /> Beli
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className={profileLayout.secondaryButton}
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <hr className="mt-6 border-[#e5e7eb]" />
            </div>
          ))}

        {!loading && !filteredItems.length ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#D1FAE5] text-[#10B981]">
              <Heart size={34} />
            </div>
            <h3 className="text-xl font-light text-slate-950">
              Wishlist kosong
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Produk yang Anda sukai akan tampil di sini.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
