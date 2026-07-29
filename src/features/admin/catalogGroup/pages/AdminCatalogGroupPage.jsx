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

export default function AdminCatalogGroupPage() {
  const groupsQuery = useAdminCatalogGroups();
  const deleteMutation = useDeleteAdminCatalogGroup();
  const quickUpdateMutation = useUpdateAdminCatalogGroup();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: groupsQuery.refetch });
  const rows = groupsQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "slug"]);
  const columns = useMemo(() => mergeColumns(CATALOG_GROUP_COLUMNS, buildRawColumns(rows, ["id", "name", "slug", "is_active"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-catalog-groups");

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const row of selection.selectedRows) await deleteMutation.mutateAsync(row.id);
      selection.clear();
      setMessage("Catalog group terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getCatalogGroupError(error));
    }
  };

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      setMessage("Catalog group berhasil dihapus.");
    } catch (error) {
      setMessage(getCatalogGroupError(error));
    }
  };

  return (
    <AdminShell title="Catalog Group" subtitle="Kelola level teratas struktur katalog beserta status active/non-active.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => groupsQuery.refetch()} refreshing={groupsQuery.isFetching} createLabel="Tambah Group" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} />
      {message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
      <AsyncState loading={groupsQuery.isLoading} error={groupsQuery.error ? getCatalogGroupError(groupsQuery.error) : ""} empty={!groupsQuery.isLoading && !filteredRows.length} emptyText="Catalog group belum tersedia." />
      {filteredRows.length ? <CatalogGroupCrudTable rows={filteredRows} columns={columns} onEdit={editor.edit} onToggleActive={(row, isActive) => quickUpdateMutation.mutate({ id: row.id, values: { ...row, isActive } })} pendingId={quickUpdateMutation.variables?.id} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} /> : null}
      
      </>) : null}
      <CatalogGroupFormDialog open={editor.open} entity={editor.entity} onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); setMessage(editor.entity ? "Catalog group berhasil diperbarui." : "Catalog group berhasil ditambahkan."); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Catalog Group" message={`Catalog group “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
