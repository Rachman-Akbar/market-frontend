import { memo } from "react";

export const TableLayoutHint = memo(function TableLayoutHint({ onReset }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 px-1 pb-2 text-[11px] font-semibold text-slate-400">
      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">drag_indicator</span>Tarik header untuk pindah kolom</span>
      <span className="hidden sm:inline">•</span>
      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">width</span>Tarik sisi kanan untuk ubah lebar</span>
      {onReset ? <button type="button" onClick={onReset} className="ml-1 font-extrabold text-emerald-700 hover:text-emerald-800">Reset kolom</button> : null}
    </div>
  );
});
