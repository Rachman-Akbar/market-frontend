import { useCallback, useMemo, useState } from "react";
import { usePanelTabs } from "@/shared/layout/tabs/PanelTabsContext";

export function useEntityEditor(options = {}) {
  const tabs = usePanelTabs();
  const [localState, setLocalState] = useState({ open: false, entity: null });

  const create = useCallback(() => {
    if (tabs) {
      tabs.openCreateTab({ label: options.createLabel });
      return;
    }
    setLocalState({ open: true, entity: null });
  }, [options.createLabel, tabs]);

  const edit = useCallback((entity) => {
    if (tabs) {
      tabs.openEditTab(entity, { label: options.getEditLabel?.(entity) });
      return;
    }
    setLocalState({ open: true, entity });
  }, [options, tabs]);

  const close = useCallback(() => {
    if (tabs) {
      tabs.closeActiveTab();
      return;
    }
    setLocalState({ open: false, entity: null });
  }, [tabs]);

  return useMemo(() => {
    if (!tabs) {
      return {
        ...localState,
        isEditing: Boolean(localState.entity),
        isListActive: !localState.open,
        create,
        edit,
        close,
      };
    }

    const isEditorTab = tabs.activeTab?.type === "create" || tabs.activeTab?.type === "edit";
    const entity = tabs.activeTab?.type === "edit" ? tabs.activeTab.entity : null;

    return {
      open: isEditorTab,
      entity,
      isEditing: Boolean(entity),
      isListActive: tabs.activeTab?.type === "list",
      activeTab: tabs.activeTab,
      create,
      edit,
      close,
    };
  }, [close, create, edit, localState, tabs]);
}
