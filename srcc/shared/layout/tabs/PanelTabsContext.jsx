import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toTitleCase } from "@/shared/utils/textFormatter";

const PanelTabsContext = createContext(null);

const getScope = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  return `/${parts.slice(0, 2).join("/")}`;
};

const createListTab = (scope, label) => ({
  id: `${scope}:list`,
  scope,
  type: "list",
  label: label || "List",
  closable: false,
  entity: null,
});

export function PanelTabsProvider({ children, items = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const scope = getScope(location.pathname);
  const menu = items.find((item) => item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href));
  const listLabel = menu?.label ? `${menu.label} List` : "List";
  const [tabsByScope, setTabsByScope] = useState({});
  const [activeByScope, setActiveByScope] = useState({});

  useEffect(() => {
    setTabsByScope((current) => current[scope]
      ? current
      : { ...current, [scope]: [createListTab(scope, listLabel)] });
    setActiveByScope((current) => current[scope]
      ? current
      : { ...current, [scope]: `${scope}:list` });
  }, [listLabel, scope]);

  const tabs = tabsByScope[scope] || [createListTab(scope, listLabel)];
  const activeTabId = activeByScope[scope] || `${scope}:list`;
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const activateTab = useCallback((tabId) => {
    setActiveByScope((current) => ({ ...current, [scope]: tabId }));
  }, [scope]);

  const openCreateTab = useCallback((options = {}) => {
    const id = `${scope}:create:${Date.now()}`;
    const tab = {
      id,
      scope,
      type: "create",
      label: options.label || `Tambah ${menu?.label || "Data"}`,
      closable: true,
      entity: null,
    };
    setTabsByScope((current) => ({ ...current, [scope]: [...(current[scope] || [createListTab(scope, listLabel)]), tab] }));
    setActiveByScope((current) => ({ ...current, [scope]: id }));
    return id;
  }, [listLabel, menu?.label, scope]);

  const openEditTab = useCallback((entity, options = {}) => {
    const entityId = entity?.id ?? entity?.slug ?? Date.now();
    const id = `${scope}:edit:${entityId}`;
    const label = options.label || `Edit ${toTitleCase(entity?.name || entity?.title || entity?.code || menu?.label || "Data")}`;
    setTabsByScope((current) => {
      const scopeTabs = current[scope] || [createListTab(scope, listLabel)];
      const exists = scopeTabs.some((tab) => tab.id === id);
      return {
        ...current,
        [scope]: exists
          ? scopeTabs.map((tab) => tab.id === id ? { ...tab, entity, label } : tab)
          : [...scopeTabs, { id, scope, type: "edit", label, closable: true, entity }],
      };
    });
    setActiveByScope((current) => ({ ...current, [scope]: id }));
    return id;
  }, [listLabel, menu?.label, scope]);

  const closeTab = useCallback((tabId) => {
    setTabsByScope((current) => {
      const scopeTabs = current[scope] || [];
      const index = scopeTabs.findIndex((tab) => tab.id === tabId);
      const nextTabs = scopeTabs.filter((tab) => tab.id !== tabId);
      if (activeByScope[scope] === tabId) {
        const fallback = nextTabs[Math.max(0, index - 1)] || nextTabs[0];
        setActiveByScope((active) => ({ ...active, [scope]: fallback?.id || `${scope}:list` }));
      }
      return { ...current, [scope]: nextTabs.length ? nextTabs : [createListTab(scope, listLabel)] };
    });
  }, [activeByScope, listLabel, scope]);

  const closeActiveTab = useCallback(() => {
    if (activeTab?.closable) closeTab(activeTab.id);
    else activateTab(`${scope}:list`);
  }, [activateTab, activeTab, closeTab, scope]);

  const openList = useCallback(() => activateTab(`${scope}:list`), [activateTab, scope]);

  useEffect(() => {
    const handler = (event) => {
      if (!event.ctrlKey) return;
      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        openCreateTab();
      }
      if (event.key.toLowerCase() === "w") {
        event.preventDefault();
        closeActiveTab();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeActiveTab, openCreateTab]);

  const value = useMemo(() => ({
    scope,
    tabs,
    activeTab,
    activeTabId,
    activateTab,
    openCreateTab,
    openEditTab,
    closeTab,
    closeActiveTab,
    openList,
    navigate,
  }), [activateTab, activeTab, activeTabId, closeActiveTab, closeTab, navigate, openCreateTab, openEditTab, openList, scope, tabs]);

  return <PanelTabsContext.Provider value={value}>{children}</PanelTabsContext.Provider>;
}

export function usePanelTabs() {
  return useContext(PanelTabsContext);
}
