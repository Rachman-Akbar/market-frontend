const BASE_BUTTON = "flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0";

const TONES = {
  emerald: "border-emerald-200 bg-emerald-50/40 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white disabled:hover:border-emerald-200 disabled:hover:bg-emerald-50/40 disabled:hover:text-emerald-700",
  teal: "border-teal-200 bg-teal-50/40 text-teal-700 hover:border-teal-600 hover:bg-teal-600 hover:text-white disabled:hover:border-teal-200 disabled:hover:bg-teal-50/40 disabled:hover:text-teal-700",
  slate: "border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-600 hover:bg-slate-600 hover:text-white disabled:hover:border-slate-200 disabled:hover:bg-slate-50/40 disabled:hover:text-slate-600",
  rose: "border-rose-200 bg-rose-50/40 text-rose-600 hover:border-rose-600 hover:bg-rose-600 hover:text-white disabled:hover:border-rose-200 disabled:hover:bg-rose-50/40 disabled:hover:text-rose-600",
  indigo: "border-indigo-200 bg-indigo-50/40 text-indigo-700 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white disabled:hover:border-indigo-200 disabled:hover:bg-indigo-50/40 disabled:hover:text-indigo-700",
};

export function FormActionDock({ tone = "emerald", save = { icon: "save", label: "Simpan" }, disabled = false, onDelete, deleteLabel = "Hapus", extraActions = [], showSave = true, className = "" }) {
  return (
    <div className={`fixed right-8 top-24 z-40 hidden w-40 flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50 lg:flex ${className}`}>
      {extraActions.map((action) => (
        <button key={`${action.label}-${action.icon}`} type="button" onClick={action.onClick} className={`${BASE_BUTTON} ${TONES[action.tone || "slate"]}`}>
          <span className="material-symbols-outlined text-[19px]">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
      {onDelete ? (
        <button type="button" onClick={onDelete} className={`${BASE_BUTTON} ${TONES.rose}`}>
          <span className="material-symbols-outlined text-[19px]">delete</span>
          <span>{deleteLabel}</span>
        </button>
      ) : null}
      {showSave ? (
        <button type="submit" disabled={disabled} className={`${BASE_BUTTON} ${TONES[tone]}`}>
          <span className="material-symbols-outlined text-[19px]">{save.icon}</span>
          <span>{save.label}</span>
        </button>
      ) : null}
    </div>
  );
}