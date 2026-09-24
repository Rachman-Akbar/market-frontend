import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { UserFormDialog } from "@/features/admin/identity/components/UserFormDialog";
import { USER_TABLE_COLUMNS, UserTable } from "@/features/admin/identity/components/UserTable";
import {
  getAdminIdentityError,
  useAdminUsers,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/features/admin/identity/services/adminIdentityService";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { ConfirmDialog, EntityToolbar, ListPageFrame } from "@/shared/components/crud";
import { AsyncState } from "@/shared/components/feedback";
import { InfiniteScrollSentinel } from "@/shared/components/ui/InfiniteScrollSentinel";
import { useColumnVisibility, useEntityEditor, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";

export default function AdminUsersPage() {
  const usersQuery = useAdminUsers();
  const deleteMutation = useDeleteAdminUser();
  const quickUpdateMutation = useUpdateAdminUser();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const rows = usersQuery.rows;
  const searchableRows = useMemo(
    () => rows.map((row) => ({ ...row, roleNames: row.roles.map((role) => role.name).join(" ") })),
    [rows],
  );
  const { query, setQuery, filteredRows } = useTableSearch(searchableRows, ["name", "email", "roleNames"]);
  const columns = useMemo(() => mergeColumns(USER_TABLE_COLUMNS, buildRawColumns(rows, ["id", "name", "email", "avatar", "roles", "is_email_verified", "is_active", "banned_at"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-users");

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      editor.close();
      editor.markListDirty();
      toastSuccess("Hapus User", "User berhasil dihapus.");
    } catch (error) {
      toastError("Hapus User", getAdminIdentityError(error));
    }
  };

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const user of selection.selectedRows) await deleteMutation.mutateAsync(user.id);
      selection.clear();
      editor.markListDirty();
      toastSuccess("Hapus User", "User terpilih berhasil dihapus.");
    } catch (error) {
      toastError("Hapus User", getAdminIdentityError(error));
    }
  };

  const bulkActive = async (isActive) => {
    if (!selection.selectedRows.length) return;
    try {
      for (const user of selection.selectedRows) {
        await quickUpdateMutation.mutateAsync({
          id: user.id,
          values: { ...user, isActive, isBanned: false, roleIds: user.roles.map((role) => role.id) },
        });
      }
      selection.clear();
      editor.markListDirty();
      toastSuccess("Aktifkan User", `User terpilih berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch (error) {
      toastError("Ubah Status User", getAdminIdentityError(error));
    }
  };

  return (
    <AdminShell>
      {editor.isListActive ? (
        <ListPageFrame
          toolbar={(
          <EntityToolbar
            query={query}
            onQueryChange={setQuery}
            onCreate={editor.create}
            onRefresh={() => usersQuery.refetch()}
            refreshing={usersQuery.isFetching}
            createLabel="Tambah User"
            placeholder="Cari nama, email, atau role lalu tekan Enter"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={[
              { key: "active", label: "Aktifkan user terpilih", icon: "toggle_on", onClick: () => bulkActive(true) },
              { key: "inactive", label: "Nonaktifkan user terpilih", icon: "toggle_off", onClick: () => bulkActive(false) },
              { key: "delete", label: "Hapus user terpilih", icon: "delete", danger: true, onClick: bulkDelete },
            ]}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
            onApplyDefaultColumns={columnVisibility.applyAsDefault}
          />
          )}
        >

          <AsyncState loading={usersQuery.isLoading} error={usersQuery.error ? getAdminIdentityError(usersQuery.error) : ""} empty={!usersQuery.isLoading && !filteredRows.length} emptyText="User belum tersedia." />
          {filteredRows.length ? (
            <>
              <UserTable
                rows={filteredRows}
                columns={columns}
                onEdit={editor.edit}
                onToggleActive={(row, isActive) => {
                  quickUpdateMutation.mutate(
                    { id: row.id, values: { ...row, isActive, isBanned: false, roleIds: row.roles.map((role) => role.id) } },
                    {
                      onSuccess: () => { editor.markListDirty(); toastSuccess("Ubah Status User", "Status user berhasil diperbarui."); },
                      onError: (error) => toastError("Ubah Status User", getAdminIdentityError(error)),
                    },
                  );
                }}
                pendingId={quickUpdateMutation.variables?.id}
                visibleSet={columnVisibility.visibleSet}
                selectionEnabled={selection.enabled}
                selectedIds={selection.selectedIds}
                allSelected={selection.allSelected}
                onToggleRow={selection.toggleRow}
                onToggleAll={selection.toggleAll}
              />
              <InfiniteScrollSentinel query={usersQuery} />
            </>
          ) : null}
        </ListPageFrame>
      ) : null}

      <UserFormDialog
        open={editor.open}
        user={editor.entity}
        onDelete={setDeleteTarget}
        onClose={editor.close}
        onSaved={() => editor.markListDirty()}
      />

      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus User" message={`User “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
