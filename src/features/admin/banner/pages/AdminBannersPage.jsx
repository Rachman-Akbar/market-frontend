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
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";

export default function AdminBannersPage() {
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const editor = useEntityEditor();
  const bannersQuery = useAdminBanners({ ...(query ? { search: query } : {}) });
  const storesQuery = useAdminProductStores();
  const deleteMutation = useDeleteAdminBanner();
  const updateMutation = useUpdateAdminBanner();
  const rows = bannersQuery.data || [];
  const columns = useMemo(() => mergeColumns(BANNER_TABLE_COLUMNS, buildRawColumns(rows, ["id", "store_id", "name", "image_url", "sort_order", "is_active"])), [rows]);
  const selection = useTableSelection(rows);
  const columnVisibility = useColumnVisibility(columns, "admin-banners");

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const banner of selection.selectedRows) await deleteMutation.mutateAsync(banner.id);
      selection.clear();
      setMessage("Banner terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getAdminBannerError(error));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      editor.close();
      setMessage("Banner berhasil dihapus. Tekan Refresh untuk melihat data terbaru.");
    } catch (error) {
      setMessage(getAdminBannerError(error));
    }
  };

  return (
    <AdminShell>
      {editor.isListActive ? (
        <>
          <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => bannersQuery.refetch()} refreshing={bannersQuery.isFetching} createLabel="Tambah Banner" placeholder="Cari banner lalu tekan Enter" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} />
          {message ? <p className="mb-3 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
          <AsyncState loading={bannersQuery.isLoading} error={bannersQuery.error ? getAdminBannerError(bannersQuery.error) : ""} empty={!bannersQuery.isLoading && !rows.length} emptyText="Banner belum tersedia." />
          {rows.length ? <BannerManagementTable rows={rows} columns={columns} portal="admin" onEdit={editor.edit} pendingId={updateMutation.variables?.id} onToggleActive={(row, isActive) => updateMutation.mutate({ id: row.id, values: { ...row, isActive } })} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} /> : null}
        </>
      ) : null}
      <AdminBannerEditor open={editor.open} entity={editor.entity} stores={storesQuery.data || []} onClose={editor.close} onDelete={setDeleteTarget} onSaved={() => setMessage("Banner berhasil disimpan. Tekan Refresh untuk melihat data terbaru.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Banner" message={`Banner “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}
