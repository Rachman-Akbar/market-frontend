import { memo, useEffect, useRef, useState } from "react";

export const BulkActionsMenu = memo(function BulkActionsMenu({ selectedCount = 0, actions = [], disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const availableActions = actions.filter((action) => !action.hidden);
  const canOpenWithoutSelection = availableActions.some((action) => action.requiresSelection === false);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!availableActions.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled || (!selectedCount && !canOpenWithoutSelection)}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center justify-center gap-2 bg-slate-100 px-3 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="material-symbols-outlined text-[19px]">checklist</span>
        <span>{selectedCount ? `${selectedCount} dipilih` : "Bulk Action"}</span>
        <span className="material-symbols-outlined text-[17px]">keyboard_arrow_down</span>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-[110] mt-1 min-w-60 bg-white py-1 ring-1 ring-slate-200">
          {availableActions.map((action) => {
            const actionDisabled = action.disabled || (action.requiresSelection !== false && selectedCount === 0);
            return (
              <button
                key={action.key}
                type="button"
                disabled={actionDisabled}
                onClick={() => {
                  if (actionDisabled) return;
                  setOpen(false);
                  action.onClick?.();
                }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${action.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span className="material-symbols-outlined text-[18px]">{action.icon || "bolt"}</span>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
