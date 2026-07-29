import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/utils";
import { usePanelTabs } from "@/shared/layout/tabs/PanelTabsContext";

export const PanelTabBar = memo(function PanelTabBar({ accent = "teal" }) {
  const context = usePanelTabs();
  const activeRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [context?.activeTabId]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeWithEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [menuOpen]);

  if (!context) return null;

  const accentClass = accent === "emerald"
    ? "border-emerald-500 text-emerald-800 bg-white"
    : "border-teal-500 text-teal-800 bg-white";

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200 bg-slate-100/95 px-3 pt-2 backdrop-blur sm:px-5">
      <div className="flex min-w-0 items-end">
        <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-full flex-nowrap items-end gap-1 whitespace-nowrap">
            {context.tabs.map((tab) => {
              const active = tab.id === context.activeTabId;
              return (
                <button
                  key={tab.id}
                  ref={active ? activeRef : null}
                  type="button"
                  onClick={() => context.activateTab(tab.id)}
                  className={cn(
                    "group flex h-9 min-w-[92px] max-w-[230px] flex-[1_1_180px] items-center gap-2 overflow-hidden rounded-t-md border border-b-0 px-3 text-xs font-bold transition-colors",
                    active ? accentClass : "border-transparent bg-slate-200/80 text-slate-600 hover:bg-slate-50",
                  )}
                  title={tab.label}
                >
                  <span className="material-symbols-outlined shrink-0 text-[16px]">
                    {tab.type === "list" ? "list_alt" : tab.type === "create" ? "add_circle" : "edit_square"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left">{tab.label}</span>
                  {tab.closable ? (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Tutup ${tab.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        context.closeTab(tab.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          context.closeTab(tab.id);
                        }
                      }}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={menuRef} className="relative ml-1 shrink-0 border-l border-slate-200 pl-1">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-9 min-w-11 items-center justify-center gap-0.5 rounded-t-md px-2 text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            aria-label="Tampilkan semua tab"
            aria-expanded={menuOpen}
            title="Semua tab"
          >
            <span className="text-[11px] font-bold tabular-nums">{context.tabs.length}</span>
            <span className="material-symbols-outlined text-[19px]">keyboard_arrow_down</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+1px)] z-50 w-72 overflow-hidden rounded-b-md border border-slate-200 bg-white py-1">
              <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Tab terbuka
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {context.tabs.map((tab) => {
                  const active = tab.id === context.activeTabId;
                  return (
                    <div
                      key={tab.id}
                      className={cn(
                        "flex min-w-0 items-center gap-2 px-2 py-1",
                        active ? "bg-teal-50" : "hover:bg-slate-50",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          context.activateTab(tab.id);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-2 text-left text-sm",
                          active ? "font-bold text-teal-800" : "text-slate-700",
                        )}
                        title={tab.label}
                      >
                        <span className="material-symbols-outlined shrink-0 text-[17px]">
                          {tab.type === "list" ? "list_alt" : tab.type === "create" ? "add_circle" : "edit_square"}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                      {tab.closable ? (
                        <button
                          type="button"
                          onClick={() => context.closeTab(tab.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          aria-label={`Tutup ${tab.label}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});
