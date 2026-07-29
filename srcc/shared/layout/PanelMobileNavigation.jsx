import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

export const PanelMobileNavigation = memo(function PanelMobileNavigation({ items, activeClassName }) {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="flex items-center justify-around gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors",
                active ? activeClassName : "hover:bg-slate-100 hover:text-slate-800",
              )}
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
