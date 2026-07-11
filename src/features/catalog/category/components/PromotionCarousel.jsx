import { useState } from "react";
import { Link } from "react-router-dom";
import { usePromotionHighlights } from "@/features/catalog/promotion/services/promotionService";

export function PromotionCarousel() {
  const [active, setActive] = useState(0);
  const promotionsQuery = usePromotionHighlights();
  const promotions = promotionsQuery.data || [];
  const promotion = promotions[Math.min(active, Math.max(0, promotions.length - 1))];

  if (!promotion) return null;

  return (
    <section className="relative w-full aspect-[12/3] rounded-xl overflow-hidden shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-r ${promotion.color} flex items-center px-16`}>
        <div className="max-w-md text-white space-y-4 z-10">
          <h2 className="text-2xl font-bold leading-tight">{promotion.title}</h2>
          <p className="text-base opacity-90">{promotion.subtitle}</p>
          <Link to={promotion.href} className="inline-flex px-8 py-3 bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold rounded-lg hover:bg-white/30 transition-all">{promotion.cta}</Link>
        </div>
        {promotion.image ? <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none flex items-center justify-center overflow-hidden"><div className="w-[120%] h-[120%] rotate-12 opacity-80 bg-cover bg-center" style={{ backgroundImage: `url('${promotion.image}')` }} /></div> : null}
      </div>
      <div className="absolute bottom-4 left-16 flex gap-1.5">
        {promotions.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} className={`w-2 h-2 rounded-full transition-all ${index === active ? "bg-white" : "bg-white/40"}`} aria-label={`Buka promo ${item.title}`} />)}
      </div>
    </section>
  );
}
