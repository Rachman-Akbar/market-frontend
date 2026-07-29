import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

export const PanelSidebar = memo(function PanelSidebar({
  items,
  homeHref,
  title,
  sidebarClassName,
  activeClassName,
}) {
  const { pathname } = useLocation();
  const [hoveredHref, setHoveredHref] = useState("");

  return (
    <aside className={cn("hidden border-r border-white/10 text-white lg:block", sidebarClassName)}>
      <div className="sticky top-0 flex h-screen w-[72px] flex-col items-center py-3">
        <Link
          to={homeHref}
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sm font-black tracking-tight transition-colors hover:bg-white/15"
          aria-label={title}
          title={title}
        >
          {title?.slice(0, 2)?.toUpperCase() || "MK"}
        </Link>

        <nav className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-1">
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const hovered = hoveredHref === item.href;

            return (
              <div key={item.href} className="relative flex w-full justify-center">
                <Link
                  to={item.href}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref("")}
                  onFocus={() => setHoveredHref(item.href)}
                  onBlur={() => setHoveredHref("")}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white",
                    active && activeClassName,
                  )}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
                </Link>

                <div
                  className={cn(
                    "pointer-events-none absolute left-[54px] top-1/2 z-[80] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 transition-all duration-150",
                    hovered && "translate-x-1 opacity-100",
                  )}
                  role="tooltip"
                >
                  {item.label}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950" />
                </div>
              </div>
            );
          })}
        </nav>

        <Link
          to="/"
          className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Kembali ke marketplace"
          title="Marketplace"
        >
          <span className="material-symbols-outlined text-[21px]">storefront</span>
        </Link>
      </div>
    </aside>
  );
});
