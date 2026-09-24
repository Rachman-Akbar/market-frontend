const FILLED_BASE = "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

const SOFT_BASE = "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

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

function FormDockButton({ icon, label, tone = "slate", variant = "soft", type = "button", onClick, disabled = false }) {
  const soft = variant === "soft";
  const base = soft ? SOFT_BASE : FILLED_BASE;
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

export function FormActionDock({ tone = "emerald", save = { icon: "save", label: "Simpan" }, disabled = false, onDelete, deleteLabel = "Hapus", extraActions = [], showSave = true, className = "" }) {
  return (
    <div aria-label="Aksi" className={`flex flex-col gap-3 ${className}`}>
      {showSave ? <FormDockButton type="submit" disabled={disabled} icon={save.icon} label={save.label} tone={tone} /> : null}
      {extraActions.map((action) => (
        <FormDockButton key={`${action.label}-${action.icon}`} icon={action.icon} label={action.label} tone={action.tone || "slate"} onClick={action.onClick} />
      ))}
      {onDelete ? <FormDockButton icon="delete" label={deleteLabel} tone="rose" onClick={onDelete} /> : null}
    </div>
  );
}