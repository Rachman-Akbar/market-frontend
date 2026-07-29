import { memo, useEffect, useState } from "react";

export const StoreBannerCarousel = memo(function StoreBannerCarousel({ banners, fallback }) {
  const [active, setActive] = useState(0);
  const items = banners.length ? banners : fallback ? [{ id: "fallback", name: "Banner toko", imageUrl: fallback }] : [];

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [active, items.length]);

  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 6000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[active];

  return (
    <section className="relative aspect-[12/3] min-h-[170px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />
      {items.length > 1 ? <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">{items.map((banner, index) => <button key={banner.id} type="button" onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-2 bg-white/50"}`} aria-label={`Buka ${banner.name}`} />)}</div> : null}
    </section>
  );
});
