import { useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { PromotionFormDialog } from "@/features/catalog/promotion/components/PromotionFormDialog";
import { PromotionManagementTable } from "@/features/catalog/promotion/components/PromotionManagementTable";
import { getPromotionError, useDeleteSellerPromotion, useSellerPromotions } from "@/features/catalog/promotion/services/promotionManagementService";

export default function SellerPromotionPage() {
  const [approvalStatus, setApprovalStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const editor = useEntityEditor();
  const promotionsQuery = useSellerPromotions(approvalStatus ? { approval_status: approvalStatus } : {});
  const deleteMutation = useDeleteSellerPromotion();
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

  return (
    <SellerPanelShell title="Promosi Toko" subtitle="Ajukan promotion hero homepage. Setiap tambah atau edit akan kembali pending sampai disetujui admin.">
      {editor.isListActive ? (<>

      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => promotionsQuery.refetch()} refreshing={promotionsQuery.isFetching} createLabel="Ajukan Promosi" placeholder="Cari promosi" filters={<select value={approvalStatus} onChange={(event) => setApprovalStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600"><option value="">Semua approval</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>} />
      {message ? <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <AsyncState loading={promotionsQuery.isLoading} error={promotionsQuery.error ? getPromotionError(promotionsQuery.error) : ""} empty={!promotionsQuery.isLoading && !filteredRows.length} emptyText="Belum ada pengajuan promosi." />
      {filteredRows.length ? <PromotionManagementTable rows={filteredRows} portal="seller" onEdit={editor.edit} onDelete={setDeleteTarget} /> : null}
      
      </>) : null}
      <PromotionFormDialog open={editor.open} entity={editor.entity} portal="seller" onClose={editor.close} onSaved={() => setMessage("Promosi berhasil diajukan dan menunggu approval admin.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Promosi" message={`Promosi “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </SellerPanelShell>
  );
}
