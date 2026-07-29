import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { RoleFormDialog } from "@/features/admin/identity/components/RoleFormDialog";
import { ROLE_TABLE_COLUMNS, RoleTable } from "@/features/admin/identity/components/RoleTable";
import {
  getAdminIdentityError,
  useAdminRoles,
  useDeleteAdminRole,
  useUpdateAdminRole,
} from "@/features/admin/identity/services/adminIdentityService";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { ConfirmDialog, EntityToolbar } from "@/shared/components/crud";
import { AsyncState } from "@/shared/components/feedback";
import { useColumnVisibility, useEntityEditor, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";

export default function AdminRolesPage() {
  const rolesQuery = useAdminRoles();
  const deleteMutation = useDeleteAdminRole();
  const quickUpdateMutation = useUpdateAdminRole();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = rolesQuery.data || [];
  const searchableRows = useMemo(() => rows.map((row) => ({ ...row, permissionNames: row.permissions.map((permission) => permission.name).join(" ") })), [rows]);
  const { query, setQuery, filteredRows } = useTableSearch(searchableRows, ["name", "description", "permissionNames"]);
  const columns = useMemo(() => mergeColumns(ROLE_TABLE_COLUMNS, buildRawColumns(rows, ["id", "name", "description", "permissions", "is_active"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-roles");

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      editor.close();
      setMessage("Role berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const role of selection.selectedRows) await deleteMutation.mutateAsync(role.id);
      selection.clear();
      setMessage("Role terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  const bulkActive = async (isActive) => {
    if (!selection.selectedRows.length) return;
    try {
      for (const role of selection.selectedRows) {
        await quickUpdateMutation.mutateAsync({ id: role.id, values: { ...role, isActive, permissionIds: role.permissions.map((permission) => permission.id) } });
      }
      selection.clear();
      setMessage(`Role terpilih berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}. Tekan Refresh untuk memperbarui daftar.`);
    } catch (error) {
      setMessage(getAdminIdentityError(error));
    }
  };

  return (
    <AdminShell>
      {editor.isListActive ? (
        <>
          <EntityToolbar
            query={query}
            onQueryChange={setQuery}
            onCreate={editor.create}
            onRefresh={() => rolesQuery.refetch()}
            refreshing={rolesQuery.isFetching}
            createLabel="Tambah Role"
            placeholder="Cari role atau permission lalu tekan Enter"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={[
              { key: "active", label: "Aktifkan role terpilih", icon: "toggle_on", onClick: () => bulkActive(true) },
              { key: "inactive", label: "Nonaktifkan role terpilih", icon: "toggle_off", onClick: () => bulkActive(false) },
              { key: "delete", label: "Hapus role terpilih", icon: "delete", danger: true, onClick: bulkDelete },
            ]}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
          />
          {message ? <p className="mb-3 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
          <AsyncState loading={rolesQuery.isLoading} error={rolesQuery.error ? getAdminIdentityError(rolesQuery.error) : ""} empty={!rolesQuery.isLoading && !filteredRows.length} emptyText="Role belum tersedia." />
          {filteredRows.length ? (
            <RoleTable
              rows={filteredRows}
              columns={columns}
              onEdit={editor.edit}
              onToggleActive={async (row, isActive) => {
                try {
                  await quickUpdateMutation.mutateAsync({ id: row.id, values: { ...row, isActive, permissionIds: row.permissions.map((permission) => permission.id) } });
                  setMessage("Status role berhasil diperbarui. Tekan Refresh untuk melihat data terbaru.");
                } catch (error) {
                  setMessage(getAdminIdentityError(error));
                }
              }}
              pendingId={quickUpdateMutation.variables?.id}
              visibleSet={columnVisibility.visibleSet}
              selectionEnabled={selection.enabled}
              selectedIds={selection.selectedIds}
              allSelected={selection.allSelected}
              onToggleRow={selection.toggleRow}
              onToggleAll={selection.toggleAll}
            />
          ) : null}
        </>
      ) : null}

      <RoleFormDialog open={editor.open} role={editor.entity} onDelete={setDeleteTarget} onClose={editor.close} onSaved={() => setMessage(`${editor.entity ? "Role berhasil diperbarui" : "Role berhasil ditambahkan"}. Tekan Refresh pada tab List untuk melihat data terbaru.`)} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Role" message={`Role “${deleteTarget?.name || ""}” akan dihapus dari user dan permission terkait.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
