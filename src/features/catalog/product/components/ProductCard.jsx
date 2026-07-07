import { Link } from "react-router-dom";


export function ProductCard({
  slug = "#",
  image,
  badge,
  badgeVariant = "official",
  title,
  price,
  discountPct,
  originalPrice,
  rating,
  sold,
  location,
  wishlistBtn,
}) {
  const badgeClass =
    badgeVariant === "flash" ? "bg-[#03ac0e] text-white" : "bg-[#b02f00] text-white";

  return (
    <Link to={`/products/${slug}`}
      className="bg-white overflow-hidden transition-all group cursor-pointer flex flex-col h-full border border-gray-100 hover:border-gray-300"
      style={{ borderRadius: 5 }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <div className={`absolute top-0 left-0 px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
            {badge}
          </div>
        )}
        {wishlistBtn && (
          <div className="absolute top-2 right-2 bg-white/80 p-1 border border-gray-200" style={{ borderRadius: 5 }}>
            <span className="material-symbols-outlined text-[16px] text-gray-500">favorite</span>
          </div>
        )}
      </div>
      <div className="p-2 space-y-1 flex flex-col flex-grow">
        <h4 className="text-sm line-clamp-2 min-h-[40px] group-hover:text-[#006e04] transition-colors leading-tight">{title}</h4>
        <div className="text-sm font-bold leading-5">{price}</div>
        {discountPct && (
          <div className="flex items-center gap-1">
            <span className="bg-[#ffdad6] text-[#ba1a1a] px-1 text-[10px] font-bold">{discountPct}</span>
            {originalPrice && <span className="text-xs text-gray-400 line-through">{originalPrice}</span>}
          </div>
        )}
        {(rating || sold || location) && (
          <div className="mt-auto pt-1 space-y-0.5">
            {(rating || sold) && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xs text-gray-400">{rating} {sold && `| ${sold} terjual`}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-0.5 text-xs text-gray-400">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {location}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
