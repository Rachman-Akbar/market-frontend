import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { ReasonDialog } from "@/shared/components/crud/ReasonDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { PromotionFormDialog } from "@/features/catalog/promotion/components/PromotionFormDialog";
import { PromotionManagementTable } from "@/features/catalog/promotion/components/PromotionManagementTable";
import {
  getPromotionError,
  useAdminPromotions,
  useApprovePromotion,
  useDeleteAdminPromotion,
  useRejectPromotion,
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
  const rows = promotionsQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "approvalStatus", "targetUrl"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
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
        filters={<select value={approvalStatus} onChange={(event) => setApprovalStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600"><option value="">Semua approval</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>}
      />
      {message ? <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p> : null}
      <AsyncState loading={promotionsQuery.isLoading} error={promotionsQuery.error ? getPromotionError(promotionsQuery.error) : ""} empty={!promotionsQuery.isLoading && !filteredRows.length} emptyText="Promosi belum tersedia." />
      {filteredRows.length ? <PromotionManagementTable rows={filteredRows} portal="admin" onEdit={editor.edit} onDelete={setDeleteTarget} onApprove={approve} onReject={setRejectTarget} /> : null}
      
      </>) : null}
      <PromotionFormDialog open={editor.open} entity={editor.entity} portal="admin" onClose={editor.close} onSaved={() => setMessage(editor.entity ? "Promosi berhasil diperbarui." : "Promosi dibuat dengan status pending.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Promosi" message={`Promosi “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
      <ReasonDialog open={Boolean(rejectTarget)} title="Tolak Promosi" message={`Berikan alasan penolakan untuk promosi “${rejectTarget?.name || ""}”.`} initialValue={rejectTarget?.rejectionReason || ""} confirmLabel="Tolak Promosi" pending={rejectMutation.isPending} onClose={() => setRejectTarget(null)} onConfirm={reject} />
    </AdminShell>
  );
}
