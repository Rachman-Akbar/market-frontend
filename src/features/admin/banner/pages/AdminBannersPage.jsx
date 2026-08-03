import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { AdminBannerEditor } from "@/features/admin/banner/components/AdminBannerEditor";
import { getAdminBannerError, useAdminBanners, useDeleteAdminBanner, useUpdateAdminBanner } from "@/features/admin/banner/services/adminBannerService";
import { BANNER_TABLE_COLUMNS, BannerManagementTable } from "@/features/seller/banner/components/BannerManagementTable";
import { useAdminProductStores } from "@/features/admin/product/services/adminProductService";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useRefreshOnListActivation, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

export default function AdminBannersPage() {
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const editor = useEntityEditor({ createLabel: "Tambah Banner" });
  const notifications = useNotificationCenter();
  const bannersQuery = useAdminBanners({ ...(query ? { search: query } : {}) });
  const storesQuery = useAdminProductStores();
  const deleteMutation = useDeleteAdminBanner();
  const updateMutation = useUpdateAdminBanner();
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: bannersQuery.refetch });
  const rows = bannersQuery.data || [];
  const columns = useMemo(() => mergeColumns(BANNER_TABLE_COLUMNS, buildRawColumns(rows, ["id", "store_id", "name", "image_url", "sort_order", "is_active"])), [rows]);
  const selection = useTableSelection(rows);
  const columnVisibility = useColumnVisibility(columns, "admin-banners");
  const spreadsheet = useSpreadsheetWorkspace({ module: "banner", label: "Banner", selectedRows: selection.selectedRows, onCompleted: () => { selection.clear(); bannersQuery.refetch(); } });

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      notifications.push({ type: "success", title: "Banner", message: "Banner berhasil dihapus." });
    } catch (error) {
      notifications.push({ type: "error", title: "Banner", message: getAdminBannerError(error) });
    }
  };

  const toggleActive = (row, isActive) => {
    updateMutation.mutate(
      { id: row.id, values: { ...row, isActive } },
      {
        onSuccess: () => notifications.push({ type: "success", title: "Banner", message: `Banner berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.` }),
        onError: (error) => notifications.push({ type: "error", title: "Banner", message: getAdminBannerError(error) }),
      },
    );
  };

  return (
    <AdminShell title="Manajemen Banner" subtitle="Kelola banner toko, gambar, import/export Excel, urutan, dan status active/non-active.">
      {editor.isListActive ? (
        <>
          <EntityToolbar
            query={query}
            onQueryChange={setQuery}
            onCreate={editor.create}
            onRefresh={() => bannersQuery.refetch()}
            refreshing={bannersQuery.isFetching}
            createLabel="Tambah Banner"
            placeholder="Cari nama banner atau toko lalu tekan Enter"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={spreadsheet.actions}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
            hasActiveFilters={Boolean(query)}
            onClearFilters={() => setQuery("")}
          />
          <AsyncState loading={bannersQuery.isLoading} error={bannersQuery.error ? getAdminBannerError(bannersQuery.error) : ""} empty={!bannersQuery.isLoading && !rows.length} emptyText="Banner belum tersedia." />
          {rows.length ? (
            <BannerManagementTable
              rows={rows}
              columns={columns}
              portal="admin"
              onEdit={editor.edit}
              pendingId={updateMutation.variables?.id}
              onToggleActive={toggleActive}
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

      <SpreadsheetOperationPanel workspace={spreadsheet} />

      <AdminBannerEditor
        open={editor.open}
        entity={editor.entity}
        stores={storesQuery.data || []}
        onClose={editor.close}
        onDelete={setDeleteTarget}
        onSaved={() => {
          editor.markListDirty();
          notifications.push({ type: "success", title: "Banner", message: editor.entity ? "Banner berhasil diperbarui." : "Banner berhasil ditambahkan." });
          editor.completeSave();
        }}
      />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Banner" message={`Banner “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
