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
  "Master Data": "database",
  Bantuan: "support_agent",
  Manajemen: "admin_panel_settings",
};

const GROUP_THEMES = {
  Persediaan: { color: "#f43f5e" },
  Penjualan: { color: "#f97316" },
  Finance: { color: "#eab308" },
  Toko: { color: "#10b981" },
  Operasional: { color: "#06b6d4" },
  "Master Data": { color: "#3b82f6" },
  Manajemen: { color: "#8b5cf6" },
  Bantuan: { color: "#ec4899" },
};

const DEFAULT_THEME = { color: "#94a3b8" };

function rgba(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function themeFor(name) {
  return GROUP_THEMES[name] || DEFAULT_THEME;
}

export const PanelSidebar = memo(function PanelSidebar({
  items,
  homeHref,
  title,
  sidebarClassName,
  showHomeLink = true,
  showMarketplaceLink = true,
  badges = {},
}) {
  const tabs = usePanelTabs();
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredHref, setHoveredHref] = useState(null);
  const railRef = useRef(null);
  const panelRef = useRef(null);
  const groupButtonRefs = useRef(new Map());

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

  const showGroupTip = (event, group) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const color = themeFor(group.name).color;
    setTooltip({
      label: group.name,
      color,
      left: rect.right + 10,
      top: rect.top + rect.height / 2 - 10,
    });
  };

  const clearTip = () => setTooltip(null);

  const railButtonClassName = (active) => cn(
    "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all",
    active ? "text-white" : "text-slate-400 hover:bg-white/10 hover:text-white",
  );

  const activeParentId = tabs?.activeParentId || "";
  const groupActive = (item) => activeParentId === item.href;
  const groupBadge = (groupItems) => groupItems.reduce((sum, item) => sum + Math.max(0, Number(badges[item.href] || 0)), 0);

  const openGroupEntry = openGroup ? groups.find((entry) => entry.name === openGroup) : null;
  const panelTop = Math.max(
    0,
    Math.min(openGroup ? groupButtonRefs.current.get(openGroup)?.offsetTop || 0 : 0, window.innerHeight - 460),
  );

  return (
    <aside ref={railRef} className={cn("relative hidden text-white lg:block", sidebarClassName)} aria-label={title}>
      <div className="sticky top-0 relative flex h-screen w-[76px] flex-col overflow-hidden border-r border-white/10">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(70% 28% at 50% 0%, rgba(255,255,255,0.16), transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.05), transparent 28%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-3 border-b border-white/10 px-2 py-4">
          <button
            type="button"
            onMouseEnter={(event) => showTip(event, title)}
            onMouseLeave={clearTip}
            onClick={() => homeHref && tabs && tabs.navigate(homeHref)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-colors hover:bg-white/20"
          >
            M
          </button>
        </div>

        <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
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
            const theme = themeFor(group.name);
            const active = group.items.some(groupActive);
            const badge = groupBadge(group.items);

            return (
              <button
                key={group.name}
                type="button"
                ref={(element) => {
                  if (element) groupButtonRefs.current.set(group.name, element);
                  else groupButtonRefs.current.delete(group.name);
                }}
                onMouseEnter={(event) => showGroupTip(event, group)}
                onMouseLeave={clearTip}
                onClick={() => setOpenGroup((current) => (current === group.name ? null : group.name))}
                className={railButtonClassName(active)}
                style={active ? { backgroundColor: theme.color, boxShadow: `0 8px 20px -4px ${rgba(theme.color, 0.6)}, inset 0 1px 0 rgba(255,255,255,0.3)` } : undefined}
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
          <div className="relative border-t border-white/10 p-2">
            <Link
              to="/"
              onMouseEnter={(event) => showTip(event, "Kembali ke Marketplace")}
              onMouseLeave={clearTip}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </Link>
          </div>
        ) : null}
      </div>

      {openGroupEntry ? (
        <div
          ref={panelRef}
          onMouseLeave={clearTip}
          className="absolute left-full z-40 ml-2"
          style={{ top: panelTop }}
        >
          {(() => {
            const group = openGroupEntry;
            const icon = GROUP_ICONS[group.name] || group.items[0]?.icon || "menu";
            const theme = themeFor(group.name);
            const softBackground = rgba(theme.color, 0.13);

            return (
              <div
                className="w-[340px] max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border bg-white p-2 shadow-2xl ring-1 ring-slate-900/5"
                style={{
                  borderColor: rgba(theme.color, 0.3),
                  boxShadow: `0 24px 56px -12px ${rgba(theme.color, 0.28)}, 0 8px 24px -12px rgba(15, 23, 42, 0.45)`,
                }}
              >
                <div className="flex items-center gap-2 px-2 pb-2 pt-1.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: softBackground }}>
                    <span className="material-symbols-outlined text-[15px]" style={{ color: theme.color }}>{icon}</span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: theme.color }}>{group.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item) => {
                    const active = activeParentId === item.href;
                    const itemBadge = Math.max(0, Number(badges[item.href] || 0));
                    const hovered = hoveredHref === item.href;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={(event) => openMenu(event, item)}
                        onMouseEnter={() => setHoveredHref(item.href)}
                        onMouseLeave={() => setHoveredHref(null)}
                        className={cn(
                          "relative flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-3 text-center transition-shadow",
                          active ? "text-white" : "text-slate-600",
                        )}
                        style={
                          active
                            ? { backgroundColor: theme.color, boxShadow: `0 10px 26px -8px ${rgba(theme.color, 0.55)}` }
                            : hovered
                              ? { backgroundColor: rgba(theme.color, 0.09) }
                              : undefined
                        }
                        aria-current={active ? "page" : undefined}
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={active ? { backgroundColor: "rgba(255,255,255,0.22)" } : { backgroundColor: softBackground }}
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ color: active ? "#ffffff" : theme.color }}
                          >
                            {item.icon}
                          </span>
                        </span>
                        <span className="w-full min-w-0 truncate text-[11px] font-bold leading-tight">{item.label}</span>
                        {itemBadge > 0 ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{Math.min(99, itemBadge)}</span> : null}
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
          style={{ left: tooltip.left, top: tooltip.top, backgroundColor: tooltip.color || "#0f172a" }}
          className={cn(
            "pointer-events-none fixed z-50 rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-lg ring-1 ring-white/10",
            tooltip.above ? "-translate-x-1/2 -translate-y-full" : "-translate-y-1/2",
          )}
        >
          {tooltip.above ? (
            <span
              className="absolute bottom-[-4px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
              style={{ backgroundColor: tooltip.color || "#0f172a" }}
            />
          ) : (
            <span
              className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
              style={{ backgroundColor: tooltip.color || "#0f172a" }}
            />
          )}
          {tooltip.label}
        </span>
      ) : null}
    </aside>
  );
});