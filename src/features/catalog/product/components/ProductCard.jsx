import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  LoaderCircle,
  ShoppingCart,
} from "lucide-react";
import { formatPrice } from "@/shared/utils/utils";

export function ProductCard({
  id,
  productId,
  variantId,
  slug,
  image,
  thumbnail,
  badge,
  badgeVariant = "official",
  title,
  name,
  price,
  price_label,
  discountPct,
  originalPrice,
  rating,
  sold,
  location,
  storeName,
  stock,
  wishlistBtn = false,
  onWishlistToggle,
  showAddToCart = false,
  onAddToCart,
  addToCartLabel = "Masukkan Cart",
}) {
  const [cartStatus, setCartStatus] =
    useState("idle");
  const [cartMessage, setCartMessage] =
    useState("");

  const resolvedProductId = Number(
    productId ?? id ?? 0,
  );

  const displayTitle =
    title || name || "Produk";

  const displayPrice =
    price_label ||
    (typeof price === "string" &&
    price.startsWith("Rp")
      ? price
      : formatPrice(price));

  const displayImage = image || thumbnail;

  const displayDiscount =
    discountPct || badge;

  const displayLocation =
    location || storeName || "Official Store";

  const promoText =
    badgeVariant === "flash"
      ? "Bisa COD"
      : "Hemat s.d 15% Pakai Bonus";

  const productHref = useMemo(() => {
    const target =
      slug ||
      resolvedProductId ||
      "#";

    return `/products/${target}`;
  }, [resolvedProductId, slug]);

  const stockNumber = Number(stock);
  const hasStockInformation =
    stock !== undefined &&
    stock !== null &&
    stock !== "";

  const isOutOfStock =
    hasStockInformation && stockNumber <= 0;

  const isAdding = cartStatus === "loading";

  useEffect(() => {
    if (
      cartStatus !== "success" &&
      cartStatus !== "error"
    ) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCartStatus("idle");
      setCartMessage("");
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [cartStatus]);

  const handleWishlistToggle = async (
    event,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onWishlistToggle) {
      return;
    }

    await onWishlistToggle({
      id: resolvedProductId,
      productId: resolvedProductId,
      variantId: Number(variantId || 0),
    });
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !onAddToCart ||
      isAdding ||
      isOutOfStock
    ) {
      return;
    }

    setCartStatus("loading");
    setCartMessage("");

    try {
      await onAddToCart({
        id: resolvedProductId,
        productId: resolvedProductId,
        variantId: Number(variantId || 0),
        quantity: 1,
      });

      setCartStatus("success");
      setCartMessage(
        "Produk berhasil dimasukkan ke cart.",
      );
    } catch (error) {
      setCartStatus("error");
      setCartMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Produk gagal dimasukkan ke cart.",
      );
    }
  };

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[4px] border border-[#e5e7eb] bg-white text-[#222222] transition hover:border-[#a7f3d0] hover:shadow-sm">
      <Link
        to={productHref}
        aria-label={`Lihat ${displayTitle}`}
        className="absolute inset-0 z-0 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
      />

      <div className="pointer-events-none relative z-[1] aspect-square w-full overflow-hidden rounded-[4px] bg-[#f5f5f5]">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5] text-[11px] text-[#999999]">
            No Image
          </div>
        )}

        {displayDiscount ? (
          <div className="absolute left-0 top-2 z-10">
            <div className="relative rounded-r-[7px] bg-[#10B981] px-[7px] py-[3px] text-[11px] font-extrabold leading-none text-white shadow-sm">
              {displayDiscount}
              <span className="absolute -bottom-[4px] left-0 h-0 w-0 border-l-[4px] border-t-[4px] border-l-transparent border-t-[#047857]" />
            </div>
          </div>
        ) : null}

        {wishlistBtn ? (
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="pointer-events-auto absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#ef4444] shadow-sm transition hover:scale-105"
          >
            <Heart
              size={17}
              className="fill-current"
            />
          </button>
        ) : null}
      </div>

      <div className="pointer-events-none relative z-[1] flex min-h-[112px] flex-1 flex-col px-[7px] pb-[8px] pt-[7px]">
        <h4 className="block min-w-0 truncate text-[13px] font-normal leading-[17px] text-[#111111]">
          {displayTitle}
        </h4>

        <div className="mt-[4px] flex min-w-0 items-baseline gap-[4px]">
          <span className="truncate text-[15px] font-extrabold leading-[18px] text-[#111111]">
            {displayPrice}
          </span>

          {originalPrice ? (
            <span className="truncate text-[11px] leading-[14px] text-[#b7b7b7] line-through">
              {originalPrice}
            </span>
          ) : null}
        </div>

        <div className="mt-[4px] truncate text-[10px] font-bold leading-[13px] text-[#10B981]">
          {promoText}
        </div>

        <div className="mt-[3px] flex min-w-0 items-center gap-[3px]">
          <span
            className="material-symbols-outlined text-[14px] leading-none text-[#ffc400]"
            style={{
              fontVariationSettings: "'FILL' 1",
            }}
          >
            star
          </span>

          <span className="min-w-0 truncate text-[12px] leading-[15px] text-[#5f6f8f]">
            {rating || "4.8"}{" "}
            {sold
              ? `· ${sold} terjual`
              : "| 10rb+ terjual"}
          </span>
        </div>

        <div className="mt-[3px] flex min-w-0 items-center gap-[3px]">
          <span
            className="material-symbols-outlined text-[14px] leading-none text-[#10B981]"
            style={{
              fontVariationSettings: "'FILL' 1",
            }}
          >
            verified
          </span>

          <span className="min-w-0 truncate text-[12px] leading-[15px] text-[#5f6f8f]">
            {displayLocation}
          </span>
        </div>

        {showAddToCart ? (
          <div className="pointer-events-auto mt-auto pt-3">
            <button
              type="button"
              disabled={
                isAdding || isOutOfStock
              }
              onClick={handleAddToCart}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#10B981] px-3 text-xs font-bold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:bg-[#d1d5db]"
            >
              {isAdding ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <ShoppingCart size={15} />
              )}

              {isAdding
                ? "Menambahkan..."
                : isOutOfStock
                  ? "Stok Habis"
                  : cartStatus === "success"
                    ? "Berhasil Ditambahkan"
                    : addToCartLabel}
            </button>

            {cartMessage ? (
              <p
                className={`mt-2 line-clamp-2 text-center text-[10px] leading-4 ${
                  cartStatus === "error"
                    ? "text-red-600"
                    : "text-[#047857]"
                }`}
              >
                {cartMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {!showAddToCart ? (
        <button
          type="button"
          className="pointer-events-auto absolute bottom-[6px] right-[4px] z-20 flex h-5 w-5 items-center justify-center text-[#8a99b5]"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">
            more_horiz
          </span>
        </button>
      ) : null}
    </article>
  );
}