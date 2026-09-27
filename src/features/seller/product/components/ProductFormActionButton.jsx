const BASE_BUTTON = "group relative flex aspect-square w-full items-center justify-center rounded-[5px] transition-colors";

const TONES = {
  emerald: { box: "bg-emerald-50 hover:bg-emerald-100", icon: "text-emerald-600", tooltip: "#10b981" },
  teal: { box: "bg-teal-50 hover:bg-teal-100", icon: "text-teal-600", tooltip: "#14b8a6" },
  slate: { box: "bg-slate-100 hover:bg-slate-200", icon: "text-slate-600", tooltip: "#64748b" },
  rose: { box: "bg-rose-50 hover:bg-rose-100", icon: "text-rose-600", tooltip: "#f43f5e" },
  indigo: { box: "bg-indigo-50 hover:bg-indigo-100", icon: "text-indigo-600", tooltip: "#6366f1" },
};

const DISABLED_TONE = "bg-slate-100 text-slate-400";

export function ProductFormActionButton({ icon, label, tone = "slate", type = "button", onClick, disabled = false }) {
  const palette = TONES[tone] || TONES.slate;
  const tooltipColor = disabled ? "#94a3b8" : palette.tooltip;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`${BASE_BUTTON} ${disabled ? DISABLED_TONE : `${palette.box} ${palette.icon}`}`}
    >
      <span className="material-symbols-outlined leading-none" style={{ fontSize: "88px" }}>{icon}</span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-bold text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: tooltipColor }}
      >
        {label}
        <span className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45" style={{ backgroundColor: tooltipColor }} />
      </span>
    </button>
  );
}