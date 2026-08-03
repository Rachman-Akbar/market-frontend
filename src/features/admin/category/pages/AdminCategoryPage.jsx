import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { CATEGORY_TABLE_COLUMNS, CategoryCrudTable } from "@/features/admin/category/components/CategoryCrudTable";
import { CategoryFormDialog } from "@/features/admin/category/components/CategoryFormDialog";
import { useAdminCatalogGroups } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";
import { getCategoryError, useAdminCategoryList, useDeleteAdminCategory, useUpdateAdminCategory } from "@/features/admin/category/services/adminCategoryService";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

export default function AdminCategoryPage() {
  const categoriesQuery = useAdminCategoryList();
  const groupsQuery = useAdminCatalogGroups();
  const deleteMutation = useDeleteAdminCategory();
  const quickUpdateMutation = useUpdateAdminCategory();
  const editor = useEntityEditor();
  const notifications = useNotificationCenter();
  const [deleteTarget, setDeleteTarget] = useState(null);
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: categoriesQuery.refetch });
  const rows = categoriesQuery.data || [];
  const groupsById = useMemo(() => Object.fromEntries((groupsQuery.data || []).map((group) => [group.id, group.name])), [groupsQuery.data]);
  const searchableRows = useMemo(() => rows.map((row) => ({ ...row, groupName: groupsById[row.catalogGroupId] || "" })), [groupsById, rows]);
  const { query, setQuery, filteredRows } = useTableSearch(searchableRows, ["name", "slug", "fullSlug", "parentName", "groupName"]);
  const columns = useMemo(() => mergeColumns(CATEGORY_TABLE_COLUMNS, buildRawColumns(rows, ["id", "catalog_group_id", "parent_id", "name", "slug", "full_slug", "image_url", "icon_url", "sort_order", "products_count", "is_active", "is_visible_in_menu", "children"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-categories");
  const spreadsheet = useSpreadsheetWorkspace({ module: "category", label: "Category", selectedRows: selection.selectedRows, onCompleted: () => { selection.clear(); categoriesQuery.refetch(); } });

  const toggleActive = (row, isActive) => {
    quickUpdateMutation.mutate(
      { id: row.id, values: { ...row, isActive } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Category", message: `Category berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Category", message: getCategoryError(error) }),
      },
    );
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      notifications.push({ type: "success", title: "Category", message: "Category berhasil dihapus." });
    } catch (error) {
      notifications.push({ type: "error", title: "Category", message: getCategoryError(error) });
    }
  };

  return (
    <AdminShell title="Manajemen Category" subtitle="Kelola struktur category, gambar, import/export Excel, urutan, dan status active/non-active.">
      {editor.isListActive ? (
        <>
          <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => categoriesQuery.refetch()} refreshing={categoriesQuery.isFetching} createLabel="Tambah Kategori" placeholder="Cari category, parent, atau catalog group" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={spreadsheet.actions} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} hasActiveFilters={Boolean(query)} onClearFilters={() => setQuery("")} />
          <AsyncState loading={categoriesQuery.isLoading} error={categoriesQuery.error ? getCategoryError(categoriesQuery.error) : ""} empty={!categoriesQuery.isLoading && !filteredRows.length} emptyText="Category belum tersedia." />
          {filteredRows.length ? <CategoryCrudTable rows={filteredRows} columns={columns} groupsById={groupsById} onEdit={editor.edit} onToggleActive={toggleActive} pendingId={quickUpdateMutation.variables?.id} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} /> : null}
        </>
      ) : null}

      <SpreadsheetOperationPanel workspace={spreadsheet} />

      <CategoryFormDialog open={editor.open} entity={editor.entity} categories={rows} onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); notifications.push({ type: "success", title: "Category", message: editor.entity ? "Category berhasil diperbarui." : "Category berhasil ditambahkan." }); editor.completeSave(); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Category" message={`Category “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
