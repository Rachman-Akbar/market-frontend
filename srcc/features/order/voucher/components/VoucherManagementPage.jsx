import { useState } from "react";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { VoucherFormDialog } from "@/features/order/voucher/components/VoucherFormDialog";
import { VoucherManagementTable } from "@/features/order/voucher/components/VoucherManagementTable";
import { getVoucherManagementError, useDeleteVoucher, useManagedVouchers } from "@/features/order/voucher/services/voucherManagementService";

export function VoucherManagementPage({ portal, children: wrap }) {
  const vouchersQuery = useManagedVouchers({ include_inactive: 1 });
  const deleteMutation = useDeleteVoucher();
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = vouchersQuery.data || [];
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "code", "discountType"]);

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setMessage("Voucher berhasil dihapus.");
    } catch (error) {
      setMessage(getVoucherManagementError(error));
    }
  };

  const content = (
    <>
      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => vouchersQuery.refetch()} refreshing={vouchersQuery.isFetching} createLabel="Tambah Voucher" placeholder="Cari kode atau nama voucher" />
      {message ? <p className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${portal === "admin" ? "border-teal-200 bg-teal-50 text-teal-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
      <AsyncState loading={vouchersQuery.isLoading} error={vouchersQuery.error ? getVoucherManagementError(vouchersQuery.error) : ""} empty={!vouchersQuery.isLoading && !filteredRows.length} emptyText="Voucher belum tersedia." />
      {filteredRows.length ? <VoucherManagementTable rows={filteredRows} onEdit={editor.edit} onDelete={setDeleteTarget} /> : null}
      <VoucherFormDialog open={editor.open} entity={editor.entity} portal={portal} onClose={editor.close} onSaved={() => setMessage(editor.entity ? "Voucher berhasil diperbarui." : "Voucher berhasil ditambahkan.")} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Voucher" message={`Voucher “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </>
  );

  return typeof wrap === "function" ? wrap(content) : content;
}
