import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toTitleCase } from "@/shared/utils/textFormatter";

const PanelTabsContext = createContext(null);

function matchMenu(items, pathname) {
  const matches = items.filter((item) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  return matches.sort((left, right) => right.href.length - left.href.length)[0] || items[0] || null;
}

function createParentTab(item, index = 0) {
  return {
    id: item.href,
    href: item.href,
    label: item.label,
    icon: item.icon,
    exact: Boolean(item.exact),
    noChildTabs: Boolean(item.noChildTabs),
    pinned: Boolean(item.pinned || item.exact),
    closable: item.closable !== false && !item.exact && !item.pinned,
  };
}

function createListTab(parent) {
  return {
    id: `${parent.id}:list`,
    parentId: parent.id,
    type: "list",
    label: "Daftar",
    closable: false,
    entity: null,
  };
}

function createDefaultChildren(parent, openCreate = false) {
  if (parent.exact || parent.noChildTabs) return [];
  const list = createListTab(parent);
  if (!openCreate) return [list];
  return [
    list,
    {
      id: `${parent.id}:create:default`,
      parentId: parent.id,
      type: "create",
      label: "Data Baru",
      closable: true,
      entity: null,
    },
  ];
}

export function PanelTabsProvider({ children, items = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMenu = matchMenu(items, location.pathname);
  const dashboardItem = items[0] || initialMenu;
  const dashboardParent = dashboardItem ? createParentTab(dashboardItem, 0) : null;
  const initialParent = initialMenu ? createParentTab(initialMenu, items.indexOf(initialMenu)) : dashboardParent;
  const [parentTabs, setParentTabs] = useState(() => {
    if (!dashboardParent) return [];
    return initialParent?.id !== dashboardParent.id ? [dashboardParent, initialParent] : [dashboardParent];
  });
  const [activeParentId, setActiveParentId] = useState(initialParent?.id || dashboardParent?.id || "");
  const [childrenByParent, setChildrenByParent] = useState(() => {
    const state = {};
    if (dashboardParent) state[dashboardParent.id] = createDefaultChildren(dashboardParent, false);
    if (initialParent && !state[initialParent.id]) state[initialParent.id] = createDefaultChildren(initialParent, false);
    return state;
  });
  const [listRevisionByParent, setListRevisionByParent] = useState({});
  const [activeChildByParent, setActiveChildByParent] = useState(() => {
    const state = {};
    if (dashboardParent) state[dashboardParent.id] = "";
    if (initialParent) state[initialParent.id] = initialParent.exact ? "" : `${initialParent.id}:list`;
    return state;
  });

  const ensureParent = useCallback((item, options = {}) => {
    if (!item) return null;
    const parent = createParentTab(item, items.indexOf(item));
    const openCreate = options.openCreate === true;

    setParentTabs((current) => current.some((tab) => tab.id === parent.id) ? current : [...current, parent]);
    setChildrenByParent((current) => current[parent.id]
      ? current
      : { ...current, [parent.id]: createDefaultChildren(parent, openCreate) });
    setActiveChildByParent((current) => current[parent.id]
      ? current
      : { ...current, [parent.id]: openCreate ? `${parent.id}:create:default` : `${parent.id}:list` });
    setActiveParentId(parent.id);
    return parent;
  }, [items]);

  useEffect(() => {
    const item = matchMenu(items, location.pathname);
    if (!item) return;
    ensureParent(item, { openCreate: false });
  }, [ensureParent, items, location.pathname]);

  const activeParent = parentTabs.find((tab) => tab.id === activeParentId) || parentTabs[0] || null;
  const tabs = activeParent ? (childrenByParent[activeParent.id] || createDefaultChildren(activeParent, false)) : [];
  const activeTabId = activeParent ? (activeChildByParent[activeParent.id] || (activeParent.exact ? "" : `${activeParent.id}:list`)) : "";
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0] || null;

  const openParent = useCallback((item, options = {}) => {
    const parent = ensureParent(item, { openCreate: options.openCreate === true });
    if (!parent) return;
    if (options.resetToCreate && !item.exact) {
      const createId = `${parent.id}:create:default`;
      setChildrenByParent((current) => {
        const childTabs = current[parent.id] || createDefaultChildren(parent, true);
        return childTabs.some((tab) => tab.id === createId)
          ? current
          : { ...current, [parent.id]: [...childTabs, { id: createId, parentId: parent.id, type: "create", label: "Data Baru", closable: true, entity: null }] };
      });
      setActiveChildByParent((current) => ({ ...current, [parent.id]: createId }));
    }
    navigate(item.href);
  }, [ensureParent, navigate]);

  const activateParent = useCallback((parentId) => {
    const parent = parentTabs.find((tab) => tab.id === parentId);
    if (!parent) return;
    setActiveParentId(parentId);
    navigate(parent.href);
  }, [navigate, parentTabs]);

  const closeParent = useCallback((parentId) => {
    const index = parentTabs.findIndex((tab) => tab.id === parentId);
    const target = parentTabs[index];
    if (!target?.closable || target?.pinned) return;
    const nextTabs = parentTabs.filter((tab) => tab.id !== parentId);
    setParentTabs(nextTabs);
    setChildrenByParent((current) => {
      const next = { ...current };
      delete next[parentId];
      return next;
    });
    setActiveChildByParent((current) => {
      const next = { ...current };
      delete next[parentId];
      return next;
    });
    if (activeParentId === parentId) {
      const fallback = nextTabs[Math.max(0, index - 1)] || nextTabs[0];
      if (fallback) {
        setActiveParentId(fallback.id);
        navigate(fallback.href);
      }
    }
  }, [activeParentId, navigate, parentTabs]);

  const activateTab = useCallback((tabId) => {
    if (!activeParent) return;
    setActiveChildByParent((current) => ({ ...current, [activeParent.id]: tabId }));
  }, [activeParent]);

  const markListDirty = useCallback((parentId = activeParent?.id) => {
    if (!parentId) return;
    setListRevisionByParent((current) => ({
      ...current,
      [parentId]: Number(current[parentId] || 0) + 1,
    }));
  }, [activeParent?.id]);

  const openCreateTab = useCallback((options = {}) => {
    if (!activeParent) return null;
    const id = options.reuseDefault === false ? `${activeParent.id}:create:${Date.now()}` : `${activeParent.id}:create:default`;
    const tab = {
      id,
      parentId: activeParent.id,
      type: "create",
      label: options.label || "Data Baru",
      closable: true,
      entity: null,
    };
    setChildrenByParent((current) => {
      const childTabs = current[activeParent.id] || [createListTab(activeParent)];
      return {
        ...current,
        [activeParent.id]: childTabs.some((item) => item.id === id)
          ? childTabs.map((item) => item.id === id ? { ...item, ...tab } : item)
          : [...childTabs, tab],
      };
    });
    setActiveChildByParent((current) => ({ ...current, [activeParent.id]: id }));
    return id;
  }, [activeParent]);

  const openOperationTab = useCallback((type, options = {}) => {
    if (!activeParent) return null;
    const id = `${activeParent.id}:${type}:${options.id || "default"}`;
    const tab = {
      id,
      parentId: activeParent.id,
      type,
      label: options.label || toTitleCase(type),
      closable: true,
      entity: options.entity || null,
      payload: options.payload || null,
    };
    setChildrenByParent((current) => {
      const childTabs = current[activeParent.id] || [createListTab(activeParent)];
      return {
        ...current,
        [activeParent.id]: childTabs.some((item) => item.id === id)
          ? childTabs.map((item) => item.id === id ? { ...item, ...tab } : item)
          : [...childTabs, tab],
      };
    });
    setActiveChildByParent((current) => ({ ...current, [activeParent.id]: id }));
    return id;
  }, [activeParent]);

  const openEditTab = useCallback((entity, options = {}) => {
    if (!activeParent) return null;
    const entityId = entity?.id ?? entity?.slug ?? Date.now();
    const id = `${activeParent.id}:edit:${entityId}`;
    const label = options.label || toTitleCase(entity?.name || entity?.title || entity?.code || "Edit Data");
    const tab = { id, parentId: activeParent.id, type: "edit", label, closable: true, entity };
    setChildrenByParent((current) => {
      const childTabs = current[activeParent.id] || [createListTab(activeParent)];
      return {
        ...current,
        [activeParent.id]: childTabs.some((item) => item.id === id)
          ? childTabs.map((item) => item.id === id ? tab : item)
          : [...childTabs, tab],
      };
    });
    setActiveChildByParent((current) => ({ ...current, [activeParent.id]: id }));
    return id;
  }, [activeParent]);

  const closeTab = useCallback((tabId) => {
    if (!activeParent) return;
    setChildrenByParent((current) => {
      const childTabs = current[activeParent.id] || [];
      const index = childTabs.findIndex((tab) => tab.id === tabId);
      const target = childTabs[index];
      if (!target?.closable) return current;
      const nextTabs = childTabs.filter((tab) => tab.id !== tabId);
      if (activeChildByParent[activeParent.id] === tabId) {
        const fallback = nextTabs[Math.max(0, index - 1)] || nextTabs[0];
        setActiveChildByParent((active) => ({ ...active, [activeParent.id]: fallback?.id || `${activeParent.id}:list` }));
      }
      return { ...current, [activeParent.id]: nextTabs.length ? nextTabs : [createListTab(activeParent)] };
    });
  }, [activeChildByParent, activeParent]);

  const closeActiveTab = useCallback(() => {
    if (activeTab?.closable) closeTab(activeTab.id);
    else if (activeParent) activateTab(`${activeParent.id}:list`);
  }, [activateTab, activeParent, activeTab, closeTab]);

  const openList = useCallback(() => {
    if (activeParent) activateTab(`${activeParent.id}:list`);
  }, [activateTab, activeParent]);

  useEffect(() => {
    const handler = (event) => {
      if (!event.ctrlKey) return;
      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        openCreateTab({ reuseDefault: false });
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
    items,
    parentTabs,
    activeParent,
    activeParentId,
    openParent,
    activateParent,
    closeParent,
    tabs,
    activeTab,
    activeTabId,
    activateTab,
    openCreateTab,
    openEditTab,
    openOperationTab,
    closeTab,
    closeActiveTab,
    openList,
    markListDirty,
    listRevision: Number(listRevisionByParent[activeParent?.id] || 0),
    navigate,
  }), [activateParent, activateTab, activeParent, activeParentId, activeTab, activeTabId, closeActiveTab, closeParent, closeTab, items, listRevisionByParent, markListDirty, navigate, openCreateTab, openEditTab, openOperationTab, openList, openParent, parentTabs, tabs]);

  return <PanelTabsContext.Provider value={value}>{children}</PanelTabsContext.Provider>;
}

export function usePanelTabs() {
  return useContext(PanelTabsContext);
}
