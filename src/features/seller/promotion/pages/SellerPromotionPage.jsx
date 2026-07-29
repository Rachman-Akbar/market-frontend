import { useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { PromotionFormDialog } from "@/features/catalog/promotion/components/PromotionFormDialog";
import { PROMOTION_TABLE_COLUMNS, PromotionManagementTable } from "@/features/catalog/promotion/components/PromotionManagementTable";
import { getPromotionError, useDeleteSellerPromotion, useSellerPromotions, useUpdateSellerPromotion } from "@/features/catalog/promotion/services/promotionManagementService";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";

export default function SellerPromotionPage() {
  const [approvalStatus, setApprovalStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const editor = useEntityEditor();
  const promotionsQuery = useSellerPromotions(approvalStatus ? { approval_status: approvalStatus } : {});
  const deleteMutation = useDeleteSellerPromotion();
  const quickUpdateMutation = useUpdateSellerPromotion();
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: promotionsQuery.refetch });
  const rows = promotionsQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "approvalStatus", "targetUrl"]);
  const columns = mergeColumns(PROMOTION_TABLE_COLUMNS.filter((column) => column.key !== "store"), buildRawColumns(rows, ["id", "store_id", "name", "image_url", "mobile_image_url", "click_action", "target_id", "target_url", "sort_order", "is_active", "approval_status", "rejection_reason", "submitted_at", "approved_at", "approved_by"]));
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "seller-promotions");

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const row of selection.selectedRows) await deleteMutation.mutateAsync(row.id);
      selection.clear();
      setMessage("Promosi terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getPromotionError(error));
    }
  };

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      setMessage("Promosi berhasil dihapus.");
    } catch (error) {
      setMessage(getPromotionError(error));
    }
  };

  return (
    <SellerPanelShell title="Promosi Toko" subtitle="Ajukan promotion hero homepage. Setiap tambah atau edit akan kembali pending sampai disetujui admin.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => promotionsQuery.refetch()} refreshing={promotionsQuery.isFetching} createLabel="Ajukan Promosi" placeholder="Cari promosi" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} filters={<SearchableSelect value={approvalStatus} onChange={setApprovalStatus} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} placeholder="Semua approval" className="w-44" buttonClassName="h-10" />} />
      {message ? <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <AsyncState loading={promotionsQuery.isLoading} error={promotionsQuery.error ? getPromotionError(promotionsQuery.error) : ""} empty={!promotionsQuery.isLoading && !filteredRows.length} emptyText="Belum ada pengajuan promosi." />
      {filteredRows.length ? <PromotionManagementTable rows={filteredRows} columns={columns} portal="seller" onEdit={editor.edit} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} onToggleActive={(row, isActive) => quickUpdateMutation.mutate({ id: row.id, values: { ...row, isActive } })} pendingId={quickUpdateMutation.variables?.id} /> : null}
      
      </>) : null}
      <PromotionFormDialog open={editor.open} entity={editor.entity} portal="seller" onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); setMessage("Promosi berhasil diajukan dan menunggu approval admin."); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Promosi" message={`Promosi “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </SellerPanelShell>
  );
}
