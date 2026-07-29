import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { ReasonDialog } from "@/shared/components/crud/ReasonDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";
import { PromotionFormDialog } from "@/features/catalog/promotion/components/PromotionFormDialog";
import { PROMOTION_TABLE_COLUMNS, PromotionManagementTable } from "@/features/catalog/promotion/components/PromotionManagementTable";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import {
  getPromotionError,
  useAdminPromotions,
  useApprovePromotion,
  useDeleteAdminPromotion,
  useRejectPromotion,
  useUpdateAdminPromotion,
} from "@/features/catalog/promotion/services/promotionManagementService";

export default function AdminPromotionPage() {
  const [approvalStatus, setApprovalStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [message, setMessage] = useState("");
  const editor = useEntityEditor();
  const promotionsQuery = useAdminPromotions(approvalStatus ? { approval_status: approvalStatus } : {});
  const deleteMutation = useDeleteAdminPromotion();
  const approveMutation = useApprovePromotion();
  const rejectMutation = useRejectPromotion();
  const quickUpdateMutation = useUpdateAdminPromotion();
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: promotionsQuery.refetch });
  const rows = promotionsQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "approvalStatus", "targetUrl"]);
  const columns = mergeColumns(PROMOTION_TABLE_COLUMNS, buildRawColumns(rows, ["id", "store_id", "name", "image_url", "mobile_image_url", "click_action", "target_id", "target_url", "sort_order", "is_active", "approval_status", "rejection_reason", "submitted_at", "approved_at", "approved_by"]));
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, "admin-promotions");

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

  const approve = async (row) => {
    try {
      await approveMutation.mutateAsync(row.id);
      setMessage(`Promosi “${row.name}” berhasil disetujui dan dapat tampil di homepage.`);
    } catch (error) {
      setMessage(getPromotionError(error));
    }
  };

  const reject = async (reason) => {
    try {
      await rejectMutation.mutateAsync({ id: rejectTarget.id, reason });
      setRejectTarget(null);
      setMessage("Promosi berhasil ditolak.");
    } catch (error) {
      setMessage(getPromotionError(error));
    }
  };

  return (
    <AdminShell title="Approval Promosi" subtitle="Review pengajuan seller, approve/reject, dan kelola promotion hero homepage.">
      {editor.isListActive ? (<>

      <EntityToolbar
        query={query}
        onQueryChange={setQuery}
        onCreate={editor.create}
        onRefresh={() => promotionsQuery.refetch()}
        refreshing={promotionsQuery.isFetching}
        createLabel="Tambah Promosi"
        placeholder="Cari nama atau target promosi"
        selectionEnabled={selection.enabled}
        selectedCount={selection.selectedCount}
        onToggleSelection={selection.toggleEnabled}
        bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]}
        columns={columns}
        visibleColumns={columnVisibility.visibleKeys}
        onToggleColumn={columnVisibility.toggleColumn}
        onShowAllColumns={columnVisibility.showAll}
        onResetColumns={columnVisibility.reset}
        filters={<SearchableSelect value={approvalStatus} onChange={setApprovalStatus} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} placeholder="Semua approval" className="w-44" buttonClassName="h-10" />}
      />
      {message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
      <AsyncState loading={promotionsQuery.isLoading} error={promotionsQuery.error ? getPromotionError(promotionsQuery.error) : ""} empty={!promotionsQuery.isLoading && !filteredRows.length} emptyText="Promosi belum tersedia." />
      {filteredRows.length ? <PromotionManagementTable rows={filteredRows} columns={columns} portal="admin" onEdit={editor.edit} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} onToggleActive={(row, isActive) => quickUpdateMutation.mutate({ id: row.id, values: { ...row, isActive } })} pendingId={quickUpdateMutation.variables?.id} onApprove={approve} onReject={setRejectTarget} /> : null}
      
      </>) : null}
      <PromotionFormDialog open={editor.open} entity={editor.entity} portal="admin" onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); setMessage(editor.entity ? "Promosi berhasil diperbarui." : "Promosi dibuat dengan status pending."); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Promosi" message={`Promosi “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
      <ReasonDialog open={Boolean(rejectTarget)} title="Tolak Promosi" message={`Berikan alasan penolakan untuk promosi “${rejectTarget?.name || ""}”.`} initialValue={rejectTarget?.rejectionReason || ""} confirmLabel="Tolak Promosi" pending={rejectMutation.isPending} onClose={() => setRejectTarget(null)} onConfirm={reject} />
    </AdminShell>
  );
}
