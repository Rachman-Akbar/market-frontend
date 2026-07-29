import { memo } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const SellerBannerCard = memo(function SellerBannerCard({ banner, onEdit, onDelete }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition-colors hover:border-emerald-300">
      <div className="relative aspect-[3/1] overflow-hidden bg-slate-100"><img src={banner.imageUrl} alt={banner.name} className="h-full w-full object-cover" loading="lazy" /><div className="absolute left-3 top-3"><StatusBadge status={banner.isActive ? "active" : "inactive"} /></div></div>
      <div className="flex items-center justify-between gap-3 p-5"><div><h2 className="font-extrabold text-slate-950">{toTitleCase(banner.name)}</h2><p className="mt-1 text-xs text-slate-500">Urutan {banner.sortOrder}</p></div><RowActions onEdit={() => onEdit(banner)} onDelete={() => onDelete(banner)} /></div>
    </article>
  );
});
