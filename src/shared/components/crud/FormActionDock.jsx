const SOFT_BASE_BUTTON =
  "flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:-translate-y-0";

const SOFT_TONES = {
  emerald: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100",
  teal: "border-teal-300 bg-teal-50 text-teal-800 hover:border-teal-400 hover:bg-teal-100",
  slate: "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
  rose: "border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100",
  indigo: "border-indigo-300 bg-indigo-50 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100",
};

const SOFT_ICON_TONES = {
  emerald: "bg-emerald-100 text-emerald-700",
  teal: "bg-teal-100 text-teal-700",
  slate: "bg-white text-slate-600 ring-1 ring-slate-200",
  rose: "bg-rose-100 text-rose-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export function FormActionDock({ tone = "emerald", save = { icon: "save", label: "Simpan" }, disabled = false, onDelete, deleteLabel = "Hapus", extraActions = [], showSave = true, className = "" }) {
  return (
    <div aria-label="Aksi" className={`w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/50 ${className}`}>
      <p className="px-1 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Aksi</p>
      <div className="flex flex-col gap-2">
        {showSave ? (
          <button type="submit" disabled={disabled} className={`${SOFT_BASE_BUTTON} ${SOFT_TONES[tone]}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SOFT_ICON_TONES[tone]}`}>
              <span className="material-symbols-outlined text-[18px]">{save.icon}</span>
            </span>
            <span>{save.label}</span>
          </button>
        ) : null}
        {extraActions.map((action) => (
          <button key={`${action.label}-${action.icon}`} type="button" onClick={action.onClick} className={`${SOFT_BASE_BUTTON} ${SOFT_TONES[action.tone || "slate"]}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SOFT_ICON_TONES[action.tone || "slate"]}`}>
              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
            </span>
            <span>{action.label}</span>
          </button>
        ))}
        {onDelete ? (
          <button type="button" onClick={onDelete} className={`${SOFT_BASE_BUTTON} ${SOFT_TONES.rose}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SOFT_ICON_TONES.rose}`}>
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </span>
            <span>{deleteLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}