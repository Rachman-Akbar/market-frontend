import { Link } from "react-router-dom";

export function PromotionHighlightCard({ promotion }) {
  return (
    <Link
      to={promotion.href}
      className={`group relative min-h-[260px] overflow-hidden bg-gradient-to-br ${promotion.color} text-white`}
      style={{ borderRadius: 12 }}
    >
      {promotion.image ? (
        <img
          src={promotion.image}
          alt={promotion.title}
          className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-500 group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
            {promotion.badge}
          </span>
          <h2 className="mt-4 max-w-[360px] text-3xl font-extrabold leading-tight">
            {promotion.title}
          </h2>
          <p className="mt-2 max-w-[420px] text-sm text-white/85">
            {promotion.subtitle}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition group-hover:translate-x-1">
          {promotion.cta}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </span>
      </div>
    </Link>
  );
}
