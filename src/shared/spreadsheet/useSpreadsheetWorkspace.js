import { useMemo } from "react";
import { usePanelTabs } from "@/shared/layout/tabs";

export function useSpreadsheetWorkspace({ module, label, selectedRows = [], onCompleted }) {
  const tabs = usePanelTabs();
  const selectedIds = useMemo(() => selectedRows.map((row) => Number(row?.id)).filter(Boolean), [selectedRows]);
  const activeOperation = ["import", "export", "bulk-delete"].includes(tabs?.activeTab?.type) ? tabs.activeTab : null;

  const openImport = () => tabs?.openOperationTab("import", { label: `Import ${label}`, payload: { module, label } });
  const openExport = () => tabs?.openOperationTab("export", { label: `Export ${label}`, payload: { module, label, ids: selectedIds } });
  const openBulkDelete = () => tabs?.openOperationTab("bulk-delete", { label: `Hapus ${label}`, payload: { module, label, ids: selectedIds, rows: selectedRows } });

  return {
    activeOperation,
    selectedIds,
    openImport,
    openExport,
    openBulkDelete,
    close: () => tabs?.closeActiveTab(),
    complete() {
      tabs?.markListDirty();
      onCompleted?.();
    },
    actions: [
      { key: "import", label: "Import Excel", icon: "upload_file", requiresSelection: false, onClick: openImport },
      { key: "export", label: selectedIds.length ? `Export ${selectedIds.length} data` : "Export semua data", icon: "download", requiresSelection: false, onClick: openExport },
      { key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, requiresSelection: true, onClick: openBulkDelete },
    ],
  };
}
