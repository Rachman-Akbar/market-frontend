const BASE_BUTTON = "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

const SOFT_BASE_BUTTON = "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

const TONES = {
  emerald: "border-emerald-700 bg-emerald-600 hover:bg-emerald-700",
  teal: "border-teal-700 bg-teal-600 hover:bg-teal-700",
  slate: "border-slate-500 bg-slate-500 hover:bg-slate-700",
  rose: "border-rose-700 bg-rose-600 hover:bg-rose-700",
  indigo: "border-indigo-700 bg-indigo-600 hover:bg-indigo-700",
};

const SOFT_TONES = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  teal: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
  slate: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
  rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
};

const ICON_TONES = {
  emerald: "bg-white/20 text-white",
  teal: "bg-white/20 text-white",
  slate: "bg-white/20 text-white",
  rose: "bg-white/20 text-white",
  indigo: "bg-white/20 text-white",
};

const SOFT_ICON_TONES = {
  emerald: "bg-emerald-100 text-emerald-700",
  teal: "bg-teal-100 text-teal-700",
  slate: "bg-white text-slate-600 ring-1 ring-slate-200",
  rose: "bg-rose-100 text-rose-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export function OrderFormLayout({ aside, children, compact = false }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
      <div className="w-full min-w-0 flex-1">{children}</div>
      <aside className={`hidden shrink-0 flex-col lg:sticky lg:top-4 lg:flex ${compact ? "w-28 gap-2" : "w-40 gap-3"}`}>{aside}</aside>
    </div>
  );
}

export function OrderFormActionButton({ icon, label, tone = "slate", variant = "filled", type = "button", onClick, disabled = false }) {
  const soft = variant === "soft";
  const base = soft ? SOFT_BASE_BUTTON : BASE_BUTTON;
  const tones = soft ? SOFT_TONES[tone] : TONES[tone];
  const iconTones = soft ? SOFT_ICON_TONES[tone] : ICON_TONES[tone];

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${tones}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTones}`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </span>
      <span className="w-full min-w-0 truncate text-[11px] font-bold leading-tight">{label}</span>
    </button>
  );
}