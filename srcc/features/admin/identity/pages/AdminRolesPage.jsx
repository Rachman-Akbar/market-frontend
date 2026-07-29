import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { RoleFormDialog } from "@/features/admin/identity/components/RoleFormDialog";
import { RoleTable } from "@/features/admin/identity/components/RoleTable";
import { getAdminIdentityError, useAdminRoles, useDeleteAdminRole } from "@/features/admin/identity/services/adminIdentityService";

export default function AdminRolesPage() {
  const queryState = useAdminRoles();
  const deleteMutation = useDeleteAdminRole();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = queryState.data || [];
  const searchable = rows.map((row) => ({ ...row, permissionNames: row.permissions.map((permission) => permission.name).join(" ") }));
  const { query, setQuery, filteredRows } = useTableSearch(searchable, ["name", "description", "permissionNames"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("Role berhasil dihapus.");
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  return <AdminShell title="Role & Permission" subtitle="Kelola role, permission assignment, serta status active/non-active secara konsisten.">
      {editor.isListActive ? (<>
<EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => queryState.refetch()} refreshing={queryState.isFetching} createLabel="Tambah Role" placeholder="Cari role atau permission" />{message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}<AsyncState loading={queryState.isLoading} error={queryState.error ? getAdminIdentityError(queryState.error) : ""} empty={!queryState.isLoading && !filteredRows.length} emptyText="Role belum tersedia." />{filteredRows.length ? <RoleTable rows={filteredRows} onEdit={editor.edit} onDelete={setDeleteTarget} /> : null}
      </>) : null}
      <RoleFormDialog open={editor.open} role={editor.entity} onClose={editor.close} onSaved={() => setMessage(editor.entity ? "Role berhasil diperbarui." : "Role berhasil ditambahkan.")} /><ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Role" message={`Role “${deleteTarget?.name || ""}” akan dihapus dari user dan permission terkait.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} /></AdminShell>;
}
