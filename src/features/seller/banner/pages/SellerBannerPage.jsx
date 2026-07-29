import { useMemo, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { BANNER_TABLE_COLUMNS, BannerManagementTable } from "@/features/seller/banner/components/BannerManagementTable";
import { SellerBannerForm } from "@/features/seller/banner/components/SellerBannerForm";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { getSellerBannerError, useDeleteSellerBanner, useSellerBanners, useUpdateSellerBanner } from "@/features/seller/banner/services/sellerBannerService";

export default function SellerBannerPage() {
  const bannersQuery = useSellerBanners();
  const deleteMutation = useDeleteSellerBanner();
  const quickUpdateMutation = useUpdateSellerBanner();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: bannersQuery.refetch });
  const rows = bannersQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name"]);
  const columns = useMemo(() => mergeColumns(BANNER_TABLE_COLUMNS.filter((column) => column.key !== "store"), buildRawColumns(rows, ["id", "store_id", "name", "image_url", "sort_order", "is_active"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "seller-banners");

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const banner of selection.selectedRows) await deleteMutation.mutateAsync(banner.id);
      selection.clear();
      setMessage("Banner terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getSellerBannerError(error));
    }
  };

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      setMessage("Banner berhasil dihapus.");
    } catch (error) {
      setMessage(getSellerBannerError(error));
    }
  };

  return (
    <SellerPanelShell title="Banner Toko" subtitle="Banner dikelola khusus untuk halaman toko buyer dan tidak digunakan sebagai hero homepage.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => bannersQuery.refetch()} refreshing={bannersQuery.isFetching} createLabel="Tambah Banner" placeholder="Cari nama banner" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} />
      {message ? <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <AsyncState loading={bannersQuery.isLoading} error={bannersQuery.error ? getSellerBannerError(bannersQuery.error) : ""} empty={!bannersQuery.isLoading && !filteredRows.length} emptyText="Banner toko belum tersedia." />
      {filteredRows.length ? <BannerManagementTable rows={filteredRows} columns={columns} portal="seller" onEdit={editor.edit} onToggleActive={(row, isActive) => quickUpdateMutation.mutate({ id: row.id, values: { ...row, isActive } })} pendingId={quickUpdateMutation.variables?.id} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} /> : null}
      
      </>) : null}
      <SellerBannerForm open={editor.open} entity={editor.entity} onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); setMessage(editor.entity ? "Banner berhasil diperbarui." : "Banner berhasil ditambahkan."); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Banner" message={`Banner “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </SellerPanelShell>
  );
}
