import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/utils/utils";
import { usePanelTabs } from "@/shared/layout/tabs";

const GROUP_ICONS = {
  Persediaan: "inventory_2",
  Penjualan: "point_of_sale",
  Finance: "account_balance_wallet",
  Toko: "store",
  Operasional: "event_note",
  Aplikasi: "apps",
  Bantuan: "support_agent",
  Manajemen: "admin_panel_settings",
};

export const PanelSidebar = memo(function PanelSidebar({
  items,
  homeHref,
  title,
  sidebarClassName,
  activeClassName,
  showHomeLink = true,
  showMarketplaceLink = true,
  badges = {},
}) {
  const tabs = usePanelTabs();
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const railRef = useRef(null);
  const panelRef = useRef(null);

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

  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!openGroup) return;
    const handler = (event) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
        return;
      }
    };
    const pointer = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      if (railRef.current?.contains(event.target)) return;
      setOpenGroup(null);
    };
    window.addEventListener("keydown", handler);
    document.addEventListener("pointerdown", pointer);
    return () => {
      window.removeEventListener("keydown", handler);
      document.removeEventListener("pointerdown", pointer);
    };
  }, [openGroup]);

  const openMenu = (event, item) => {
    if (event) event.preventDefault();
    if (!tabs) return;
    tabs.openParent(item, { openCreate: false });
    setOpenGroup(null);
  };

  const showTip = (event, label) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({ label, left: rect.right + 10, top: rect.top + rect.height / 2 });
  };

  const clearTip = () => setTooltip(null);

  const railButtonClassName = (active) => cn(
    "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
    active ? activeClassName : "text-slate-300 hover:bg-white/10 hover:text-white",
  );

  const activeParentId = tabs?.activeParentId || "";
  const groupActive = (item) => activeParentId === item.href;
  const groupBadge = (groupItems) => groupItems.reduce((sum, item) => sum + Math.max(0, Number(badges[item.href] || 0)), 0);

  return (
    <aside ref={railRef} className={cn("relative hidden text-white lg:block", sidebarClassName)} aria-label={title}>
      <div className="sticky top-0 flex h-screen w-[76px] flex-col overflow-hidden border-r">
        <div className="flex flex-col items-center gap-3 border-b border-white/10 px-2 py-4">
          <button
            type="button"
            onMouseEnter={(event) => showTip(event, title)}
            onMouseLeave={clearTip}
            onClick={() => homeHref && tabs && tabs.navigate(homeHref)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-white transition-colors hover:bg-white/20"
          >
            M
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
          {showHomeLink && dashboard ? (
            <button
              type="button"
              onMouseEnter={(event) => showTip(event, "Dashboard")}
              onMouseLeave={clearTip}
              onClick={(event) => openMenu(event, dashboard)}
              className={railButtonClassName(activeParentId === homeHref)}
              aria-current={activeParentId === homeHref ? "page" : undefined}
            >
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              {groupBadge([dashboard]) > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{Math.min(99, groupBadge([dashboard]))}</span> : null}
            </button>
          ) : null}

          {groups.map((group) => {
            const icon = GROUP_ICONS[group.name] || group.items[0]?.icon || "menu";
            const active = group.items.some(groupActive);
            const badge = groupBadge(group.items);

            return (
              <button
                key={group.name}
                type="button"
                onMouseEnter={(event) => showTip(event, group.name)}
                onMouseLeave={clearTip}
                onClick={() => setOpenGroup((current) => (current === group.name ? null : group.name))}
                className={railButtonClassName(active)}
                aria-label={group.name}
                aria-expanded={openGroup === group.name}
              >
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
                {badge > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{Math.min(99, badge)}</span> : null}
              </button>
            );
          })}
        </nav>

        {showMarketplaceLink ? (
          <div className="border-t border-white/10 p-2">
            <Link
              to="/"
              onMouseEnter={(event) => showTip(event, "Kembali ke Marketplace")}
              onMouseLeave={clearTip}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </Link>
          </div>
        ) : null}
      </div>

      {openGroup ? (
        <div ref={panelRef} className="absolute left-full top-0 z-40 h-screen">
          {(() => {
            const group = groups.find((entry) => entry.name === openGroup);
            if (!group) return null;
            const icon = GROUP_ICONS[group.name] || group.items[0]?.icon || "menu";

            return (
              <div className="m-2 flex h-[calc(100vh-1rem)] w-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Menu</p>
                      <p className="text-sm font-extrabold text-slate-900">{group.name}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setOpenGroup(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700" aria-label="Tutup menu">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto p-2">
                  {group.items.map((item) => {
                    const active = activeParentId === item.href;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={(event) => openMenu(event, item)}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors",
                          active ? activeClassName : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {Math.max(0, Number(badges[item.href] || 0)) > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">{Math.min(99, Number(badges[item.href] || 0))}</span> : null}
                        <span className="material-symbols-outlined text-[16px] text-slate-300">chevron_right</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      {tooltip ? (
        <span
          role="tooltip"
          style={{ left: tooltip.left, top: tooltip.top }}
          className="pointer-events-none fixed z-50 -translate-y-1/2 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-lg ring-1 ring-white/10"
        >
          <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900" />
          {tooltip.label}
        </span>
      ) : null}
    </aside>
  );
});