const BASE_BUTTON = "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

const TONES = {
  emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100",
  teal: "border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-100",
  slate: "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100",
  rose: "border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100",
  indigo: "border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100",
};

const ICON_TONES = {
  emerald: "bg-emerald-100/80 text-emerald-700",
  teal: "bg-teal-100/80 text-teal-700",
  slate: "bg-slate-200/70 text-slate-600",
  rose: "bg-rose-100/80 text-rose-700",
  indigo: "bg-indigo-100/80 text-indigo-700",
};

export function OrderFormLayout({ aside, children }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
      <div className="w-full min-w-0 flex-1">{children}</div>
      <aside className="hidden w-40 shrink-0 flex-col gap-3 lg:sticky lg:top-4 lg:flex">{aside}</aside>
    </div>
  );
}

export function OrderFormActionButton({ icon, label, tone = "slate", type = "button", onClick, disabled = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${BASE_BUTTON} ${TONES[tone]}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </span>
      <span className="w-full min-w-0 truncate text-[11px] font-bold leading-tight">{label}</span>
    </button>
  );
}