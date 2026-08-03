import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/utils";
import { usePanelTabs } from "@/shared/layout/tabs";

export const PanelSidebar = memo(function PanelSidebar({
  items,
  homeHref,
  title,
  sidebarClassName,
  activeClassName,
  showHomeLink = true,
  showMarketplaceLink = true,
}) {
  const tabs = usePanelTabs();
  const dashboard = items.find((item) => item.href === homeHref);
  const groups = useMemo(() => {
    const grouped = new Map();

    items
      .filter((item) => !item.hiddenInSidebar)
      .forEach((item) => {
        const groupName = item.group || "Menu";
        if (!grouped.has(groupName)) grouped.set(groupName, []);
        grouped.get(groupName).push(item);
      });

    return Array.from(grouped, ([name, groupItems]) => ({ name, items: groupItems }));
  }, [items]);

  const openMenu = (event, item) => {
    if (!tabs) return;
    event.preventDefault();
    const openCreate = !item.exact && !item.noChildTabs;
    tabs.openParent(item, { openCreate, resetToCreate: openCreate });
  };

  const menuClassName = (active) => cn(
    "flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
    active && activeClassName,
  );

  return (
    <aside className={cn("hidden text-white lg:block", sidebarClassName)} aria-label={title}>
      <div className="sticky top-0 flex h-screen w-[248px] flex-col overflow-hidden">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigasi</p>
          <p className="mt-1 truncate text-sm font-extrabold text-white">{title}</p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
          {showHomeLink && dashboard ? (
            <Link
              to={homeHref}
              onClick={(event) => openMenu(event, dashboard)}
              className={menuClassName(tabs?.activeParentId === homeHref)}
              aria-current={tabs?.activeParentId === homeHref ? "page" : undefined}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Dashboard</span>
            </Link>
          ) : null}

          {groups.map((group) => (
            <section key={group.name} aria-label={group.name}>
              <p className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                {group.name}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = tabs?.activeParentId === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={(event) => openMenu(event, item)}
                      className={menuClassName(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        {showMarketplaceLink ? (
          <div className="border-t border-white/10 p-3">
            <Link to="/" className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <span>Kembali ke Marketplace</span>
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
});
