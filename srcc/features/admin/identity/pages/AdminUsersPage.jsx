import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { UserFormDialog } from "@/features/admin/identity/components/UserFormDialog";
import { UserTable } from "@/features/admin/identity/components/UserTable";
import { getAdminIdentityError, useAdminUsers, useDeleteAdminUser } from "@/features/admin/identity/services/adminIdentityService";

export default function AdminUsersPage() {
  const queryState = useAdminUsers();
  const deleteMutation = useDeleteAdminUser();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = queryState.data || [];
  const searchable = rows.map((row) => ({ ...row, roleNames: row.roles.map((role) => role.name).join(" ") }));
  const { query, setQuery, filteredRows } = useTableSearch(searchable, ["name", "email", "roleNames"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("User berhasil dihapus.");
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  return <AdminShell title="Manajemen User" subtitle="Kelola akun buyer, seller, dan admin beserta active/non-active, role, verifikasi, dan banned status.">
      {editor.isListActive ? (<>
<EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => queryState.refetch()} refreshing={queryState.isFetching} createLabel="Tambah User" placeholder="Cari nama, email, atau role" />{message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}<AsyncState loading={queryState.isLoading} error={queryState.error ? getAdminIdentityError(queryState.error) : ""} empty={!queryState.isLoading && !filteredRows.length} emptyText="User belum tersedia." />{filteredRows.length ? <UserTable rows={filteredRows} onEdit={editor.edit} onDelete={setDeleteTarget} /> : null}
      </>) : null}
      <UserFormDialog open={editor.open} user={editor.entity} onClose={editor.close} onSaved={() => setMessage(editor.entity ? "User berhasil diperbarui." : "User berhasil ditambahkan.")} /><ConfirmDialog open={Boolean(deleteTarget)} title="Hapus User" message={`User “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} /></AdminShell>;
}
