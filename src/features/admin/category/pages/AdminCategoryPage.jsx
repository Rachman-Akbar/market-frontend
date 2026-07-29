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

export default function AdminCategoryPage() {
  const categoriesQuery = useAdminCategoryList();
  const groupsQuery = useAdminCatalogGroups();
  const deleteMutation = useDeleteAdminCategory();
  const quickUpdateMutation = useUpdateAdminCategory();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: categoriesQuery.refetch });
  const rows = categoriesQuery.data || [];
  const groupsById = useMemo(() => Object.fromEntries((groupsQuery.data || []).map((group) => [group.id, group.name])), [groupsQuery.data]);
  const searchableRows = useMemo(() => rows.map((row) => ({ ...row, groupName: groupsById[row.catalogGroupId] || "" })), [groupsById, rows]);
  const { query, setQuery, filteredRows } = useTableSearch(searchableRows, ["name", "slug", "fullSlug", "parentName", "groupName"]);
  const columns = useMemo(() => mergeColumns(CATEGORY_TABLE_COLUMNS, buildRawColumns(rows, ["id", "catalog_group_id", "parent_id", "name", "slug", "full_slug", "image_url", "icon_url", "sort_order", "products_count", "is_active", "is_visible_in_menu", "children"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-categories");

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      const ordered = [...selection.selectedRows].sort((a, b) => Number(b.level || 0) - Number(a.level || 0));
      for (const row of ordered) await deleteMutation.mutateAsync(row.id);
      selection.clear();
      setMessage("Kategori terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getCategoryError(error));
    }
  };

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      setMessage("Kategori berhasil dihapus.");
    } catch (error) {
      setMessage(getCategoryError(error));
    }
  };

  return (
    <AdminShell title="Manajemen Kategori" subtitle="Kelola struktur kategori parent-child, urutan, visibilitas menu, dan status active/non-active.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => categoriesQuery.refetch()} refreshing={categoriesQuery.isFetching} createLabel="Tambah Kategori" placeholder="Cari kategori, parent, atau group" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} />
      {message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
      <AsyncState loading={categoriesQuery.isLoading} error={categoriesQuery.error ? getCategoryError(categoriesQuery.error) : ""} empty={!categoriesQuery.isLoading && !filteredRows.length} emptyText="Kategori belum tersedia." />
      {filteredRows.length ? <CategoryCrudTable rows={filteredRows} columns={columns} groupsById={groupsById} onEdit={editor.edit} onToggleActive={(row, isActive) => quickUpdateMutation.mutate({ id: row.id, values: { ...row, isActive } })} pendingId={quickUpdateMutation.variables?.id} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} /> : null}
      
      </>) : null}
      <CategoryFormDialog open={editor.open} entity={editor.entity} categories={rows} onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); setMessage(editor.entity ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan."); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Kategori" message={`Kategori “${deleteTarget?.name || ""}” akan dihapus. Pastikan tidak ada child atau produk yang masih bergantung.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
