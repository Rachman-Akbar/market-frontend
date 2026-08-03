import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { CATALOG_GROUP_COLUMNS, CatalogGroupCrudTable } from "@/features/admin/catalogGroup/components/CatalogGroupCrudTable";
import { CatalogGroupFormDialog } from "@/features/admin/catalogGroup/components/CatalogGroupFormDialog";
import { getCatalogGroupError, useAdminCatalogGroups, useDeleteAdminCatalogGroup, useUpdateAdminCatalogGroup } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

export default function AdminCatalogGroupPage() {
  const groupsQuery = useAdminCatalogGroups();
  const deleteMutation = useDeleteAdminCatalogGroup();
  const quickUpdateMutation = useUpdateAdminCatalogGroup();
  const editor = useEntityEditor();
  const notifications = useNotificationCenter();
  const [deleteTarget, setDeleteTarget] = useState(null);
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: groupsQuery.refetch });
  const rows = groupsQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "slug"]);
  const columns = useMemo(() => mergeColumns(CATALOG_GROUP_COLUMNS, buildRawColumns(rows, ["id", "name", "slug", "is_active"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-catalog-groups");
  const spreadsheet = useSpreadsheetWorkspace({ module: "catalog-group", label: "Catalog Group", selectedRows: selection.selectedRows, onCompleted: () => { selection.clear(); groupsQuery.refetch(); } });

  const toggleActive = (row, isActive) => {
    quickUpdateMutation.mutate(
      { id: row.id, values: { ...row, isActive } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Catalog Group", message: `Catalog Group berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Catalog Group", message: getCatalogGroupError(error) }),
      },
    );
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      notifications.push({ type: "success", title: "Catalog Group", message: "Catalog Group berhasil dihapus." });
    } catch (error) {
      notifications.push({ type: "error", title: "Catalog Group", message: getCatalogGroupError(error) });
    }
  };

  return (
    <AdminShell title="Catalog Group" subtitle="Kelola level teratas katalog, import/export Excel, dan status active/non-active.">
      {editor.isListActive ? (
        <>
          <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => groupsQuery.refetch()} refreshing={groupsQuery.isFetching} createLabel="Tambah Group" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={spreadsheet.actions} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} hasActiveFilters={Boolean(query)} onClearFilters={() => setQuery("")} />
          <AsyncState loading={groupsQuery.isLoading} error={groupsQuery.error ? getCatalogGroupError(groupsQuery.error) : ""} empty={!groupsQuery.isLoading && !filteredRows.length} emptyText="Catalog Group belum tersedia." />
          {filteredRows.length ? <CatalogGroupCrudTable rows={filteredRows} columns={columns} onEdit={editor.edit} onToggleActive={toggleActive} pendingId={quickUpdateMutation.variables?.id} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} /> : null}
        </>
      ) : null}

      <SpreadsheetOperationPanel workspace={spreadsheet} />

      <CatalogGroupFormDialog open={editor.open} entity={editor.entity} onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); notifications.push({ type: "success", title: "Catalog Group", message: editor.entity ? "Catalog Group berhasil diperbarui." : "Catalog Group berhasil ditambahkan." }); editor.completeSave(); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Catalog Group" message={`Catalog Group “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
