import { memo } from "react";

const TABS = [
  { id: "general", label: "Umum", icon: "description" },
  { id: "variant", label: "Variant", icon: "tune" },
  { id: "images", label: "Gambar", icon: "image" },
  { id: "stock", label: "Stok", icon: "inventory_2" },
];

export const ProductEditorTabs = memo(function ProductEditorTabs({ activeTab, onChange, errorTabs = [] }) {
  const errorSet = new Set(errorTabs);

  return (
    <div className="overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 pt-2 sm:px-5">
      <div className="flex min-w-max items-end gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex h-10 min-w-28 items-center justify-center gap-2 rounded-t-lg border px-4 text-sm font-bold transition-colors ${active ? "border-slate-200 border-b-white bg-white text-slate-900" : "border-transparent bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}
              aria-current={active ? "page" : undefined}
            >
              {active ? <span className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-emerald-500" /> : null}
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {errorSet.has(tab.id) ? <span className="h-2 w-2 rounded-full bg-red-500" aria-label="Tab memiliki error" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
});
