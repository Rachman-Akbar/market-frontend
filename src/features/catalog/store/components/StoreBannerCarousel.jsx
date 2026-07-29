import { memo, useEffect, useMemo, useState } from "react";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

export const StoreBannerCarousel = memo(function StoreBannerCarousel({ banners = [], fallback = "" }) {
  const [active, setActive] = useState(0);
  const [failedIds, setFailedIds] = useState(() => new Set());
  const fallbackUrl = resolveMediaUrl(fallback);
  const bannerSignature = banners.map((banner) => `${banner.id}:${banner.imageUrl}`).join("|");

  useEffect(() => {
    setFailedIds(new Set());
    setActive(0);
  }, [bannerSignature, fallbackUrl]);

  const items = useMemo(() => {
    const available = banners
      .map((banner) => ({ ...banner, imageUrl: resolveMediaUrl(banner.imageUrl) }))
      .filter((banner) => banner.imageUrl && !failedIds.has(String(banner.id)));

    if (available.length) return available;
    if (!fallbackUrl || failedIds.has("fallback")) return [];

    return [{ id: "fallback", name: "Banner toko", imageUrl: fallbackUrl }];
  }, [banners, failedIds, fallbackUrl]);

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
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-full w-full object-cover"
        onError={() => {
          setFailedIds((current) => {
            const next = new Set(current);
            next.add(String(item.id));
            return next;
          });
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />
      {items.length > 1 ? <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">{items.map((banner, index) => <button key={banner.id} type="button" onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-2 bg-white/50"}`} aria-label={`Buka ${banner.name}`} />)}</div> : null}
    </section>
  );
});
