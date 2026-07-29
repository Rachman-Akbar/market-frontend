import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePromotionHighlights } from "@/features/catalog/promotion/services/promotionService";

function PromotionLink({ promotion, children }) {
  if (/^https?:\/\//i.test(promotion.href)) {
    return <a href={promotion.href} target="_blank" rel="noreferrer" className="inline-flex rounded-lg border border-white/40 bg-white/20 px-5 py-2.5 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/30">{children}</a>;
  }

  return <Link to={promotion.href} className="inline-flex rounded-lg border border-white/40 bg-white/20 px-5 py-2.5 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/30">{children}</Link>;
}

export function PromotionCarousel() {
  const [active, setActive] = useState(0);
  const promotionsQuery = usePromotionHighlights();
  const promotions = promotionsQuery.data || [];
  const promotion = promotions[Math.min(active, Math.max(0, promotions.length - 1))];

  useEffect(() => {
    if (active >= promotions.length) setActive(0);
  }, [active, promotions.length]);

  useEffect(() => {
    if (promotions.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % promotions.length), 6500);
    return () => window.clearInterval(timer);
  }, [promotions.length]);

  if (promotionsQuery.isLoading) return <section className="aspect-[12/3] min-h-[180px] animate-pulse rounded-xl bg-slate-100" />;
  if (!promotion) return null;

  return (
    <section className="relative aspect-[12/3] min-h-[180px] w-full overflow-hidden rounded-xl bg-slate-900 shadow-sm">
      <picture className="absolute inset-0"><source media="(max-width: 640px)" srcSet={promotion.mobileImageUrl || promotion.imageUrl} /><img src={promotion.imageUrl} alt={promotion.title} className="h-full w-full object-cover" fetchPriority="high" /></picture>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
      <div className="relative flex h-full max-w-xl flex-col justify-center px-6 py-8 text-white sm:px-12 lg:px-16">
        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide backdrop-blur">{promotion.badge}</span>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{promotion.title}</h2>
        <p className="mt-2 hidden text-sm text-white/85 sm:block">{promotion.subtitle}</p>
        <div className="mt-4"><PromotionLink promotion={promotion}>{promotion.cta}</PromotionLink></div>
      </div>
      {promotions.length > 1 ? <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">{promotions.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-2 bg-white/40"}`} aria-label={`Buka promo ${item.title}`} />)}</div> : null}
    </section>
  );
}
