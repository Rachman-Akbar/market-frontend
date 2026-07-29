import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { CatalogGroupCrudTable } from "@/features/admin/catalogGroup/components/CatalogGroupCrudTable";
import { CatalogGroupFormDialog } from "@/features/admin/catalogGroup/components/CatalogGroupFormDialog";
import { getCatalogGroupError, useAdminCatalogGroups, useDeleteAdminCatalogGroup } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";

export default function AdminCatalogGroupPage() {
  const groupsQuery = useAdminCatalogGroups();
  const deleteMutation = useDeleteAdminCatalogGroup();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = groupsQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "slug"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("Catalog group berhasil dihapus.");
    } catch (error) {
      setMessage(getCatalogGroupError(error));
    }
  };

  return (
    <AdminShell title="Catalog Group" subtitle="Kelola level teratas struktur katalog beserta status active/non-active.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => groupsQuery.refetch()} refreshing={groupsQuery.isFetching} createLabel="Tambah Group" />
      {message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
      <AsyncState loading={groupsQuery.isLoading} error={groupsQuery.error ? getCatalogGroupError(groupsQuery.error) : ""} empty={!groupsQuery.isLoading && !filteredRows.length} emptyText="Catalog group belum tersedia." />
      {filteredRows.length ? <CatalogGroupCrudTable rows={filteredRows} onEdit={editor.edit} onDelete={setDeleteTarget} /> : null}
      
      </>) : null}
      <CatalogGroupFormDialog open={editor.open} entity={editor.entity} onClose={editor.close} onSaved={() => setMessage(editor.entity ? "Catalog group berhasil diperbarui." : "Catalog group berhasil ditambahkan.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Catalog Group" message={`Catalog group “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
