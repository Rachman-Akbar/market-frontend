import { Link } from "react-router-dom";
import { formatPrice } from "@/shared/utils/utils";

export function ProductCard({
  slug = "#",
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
  wishlistBtn,
}) {
  const displayTitle = title || name || "Produk";
  const displayPrice =
    price_label ||
    (typeof price === "string" && price.startsWith("Rp") ? price : formatPrice(price));
  const displayImage = image || thumbnail;
  const displayDiscount = discountPct || badge;
  const promoText =
    badgeVariant === "flash" ? "Bisa COD" : "Hemat s.d 15% Pakai Bonus";

  return (
    <Link
      to={`/products/${slug}`}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden bg-white text-[#222222]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[4px] bg-[#f5f5f5]">
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
            <div className="relative rounded-r-[7px] bg-[#ff4056] px-[7px] py-[3px] text-[11px] font-extrabold leading-none text-white shadow-sm">
              {displayDiscount}
              <span className="absolute -bottom-[4px] left-0 h-0 w-0 border-l-[4px] border-t-[4px] border-l-transparent border-t-[#b72031]" />
            </div>
          </div>
        ) : null}

        {wishlistBtn ? (
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <span
              className="material-symbols-outlined text-[17px] text-[#ff4056]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[100px] flex-1 flex-col px-[5px] pb-[7px] pt-[7px]">
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

        <div className="mt-[4px] truncate text-[10px] font-bold leading-[13px] text-[#ff5a00]">
          {promoText}
        </div>

        <div className="mt-[3px] flex min-w-0 items-center gap-[3px]">
          <span
            className="material-symbols-outlined text-[14px] leading-none text-[#ffc400]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="min-w-0 truncate text-[12px] leading-[15px] text-[#5f6f8f]">
            {rating || "4.8"} {sold ? `· ${sold} terjual` : "| 10rb+ terjual"}
          </span>
        </div>

        <div className="mt-[3px] flex min-w-0 items-center gap-[3px] pr-5">
          <span
            className="material-symbols-outlined text-[14px] leading-none text-[#00aa5b]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span className="min-w-0 truncate text-[12px] leading-[15px] text-[#5f6f8f]">
            {location || "Official Store"}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="absolute bottom-[6px] right-[4px] flex h-5 w-5 items-center justify-center text-[#8a99b5]"
        onClick={(event) => event.preventDefault()}
      >
        <span className="material-symbols-outlined text-[18px] leading-none">
          more_horiz
        </span>
      </button>
    </Link>
  );
}