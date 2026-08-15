import { memo } from "react";

const TABS = [
  { id: "general", label: "Umum", icon: "description" },
  { id: "variant", label: "Variant", icon: "tune" },
  { id: "images", label: "Gambar", icon: "image" },
  { id: "stock", label: "Stok", icon: "inventory_2" },
  { id: "costing", label: "HPP & Harga Jual", icon: "calculate" },
];

export const ProductEditorTabs = memo(function ProductEditorTabs({ activeTab, onChange, errorTabs = [] }) {
  const errorSet = new Set(errorTabs);

  return (
    <div className="overflow-x-auto bg-slate-100 px-4 pt-1 sm:px-5">
      <div className="flex min-w-max items-end gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex h-10 min-w-28 items-center justify-center gap-2 px-4 text-sm font-bold transition-colors ${active ? "bg-white text-slate-900" : "bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900"}`}
              aria-current={active ? "page" : undefined}
            >
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
