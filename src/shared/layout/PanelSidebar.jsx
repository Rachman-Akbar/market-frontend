import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/utils";
import { usePanelTabs } from "@/shared/layout/tabs";

export const PanelSidebar = memo(function PanelSidebar({
  items,
  homeHref,
  title,
  sidebarClassName,
  activeClassName,
}) {
  const tabs = usePanelTabs();
  const [hoveredHref, setHoveredHref] = useState("");
  const visibleItems = items.filter((item) => !item.hiddenInSidebar);

  const openMenu = (event, item) => {
    if (!tabs) return;
    event.preventDefault();
    tabs.openParent(item, { openCreate: !item.exact, resetToCreate: !item.exact });
  };

  const dashboard = items.find((item) => item.href === homeHref);

  return (
    <aside className={cn("hidden text-white lg:block", sidebarClassName)}>
      <div className="sticky top-0 flex h-screen w-[64px] flex-col items-center py-2">
        <Link
          to={homeHref}
          onClick={(event) => dashboard && openMenu(event, dashboard)}
          className={cn(
            "mb-3 flex h-11 w-11 items-center justify-center text-white transition-colors hover:bg-white/10",
            tabs?.activeParentId === homeHref && activeClassName,
          )}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
        </Link>

        <nav className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-1 py-1">
          {visibleItems.map((item) => {
            const active = tabs?.activeParentId === item.href;
            const hovered = hoveredHref === item.href;

            return (
              <div key={item.href} className="relative flex w-full justify-center">
                <Link
                  to={item.href}
                  onClick={(event) => openMenu(event, item)}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref("")}
                  onFocus={() => setHoveredHref(item.href)}
                  onBlur={() => setHoveredHref("")}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-white",
                    active && activeClassName,
                  )}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
                </Link>

                <div
                  className={cn(
                    "pointer-events-none absolute left-[52px] top-1/2 z-[80] -translate-y-1/2 whitespace-nowrap bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 transition-all duration-150",
                    hovered && "translate-x-1 opacity-100",
                  )}
                  role="tooltip"
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>

        <Link to="/" className="mt-2 flex h-11 w-11 items-center justify-center text-slate-300 transition-colors hover:bg-white/10 hover:text-white" aria-label="Kembali ke marketplace" title="Marketplace">
          <span className="material-symbols-outlined text-[21px]">storefront</span>
        </Link>
      </div>
    </aside>
  );
});
