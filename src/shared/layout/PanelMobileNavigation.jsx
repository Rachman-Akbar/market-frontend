import { memo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/utils";
import { usePanelTabs } from "@/shared/layout/tabs";

export const PanelMobileNavigation = memo(function PanelMobileNavigation({ items, activeClassName }) {
  const tabs = usePanelTabs();
  const visibleItems = items.filter((item) => !item.hiddenInSidebar);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
      <div className="flex items-center gap-1 overflow-x-auto">
        {visibleItems.map((item) => {
          const active = tabs?.activeParentId === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={(event) => {
                if (!tabs) return;
                event.preventDefault();
                tabs.openParent(item, { openCreate: !item.exact, resetToCreate: !item.exact });
              }}
              className={cn("flex h-11 min-w-11 shrink-0 items-center justify-center text-slate-500 transition-colors", active ? activeClassName : "hover:bg-slate-100 hover:text-slate-800")}
              aria-label={item.label}
              title={item.label}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
