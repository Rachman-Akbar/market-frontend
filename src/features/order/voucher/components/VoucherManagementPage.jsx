import { useMemo, useState } from "react";
import { useTableSearch } from "@/core/hooks/useTableSearch";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { useAuth } from "@/features/auth/context/AuthContext";
import { VoucherFormDialog } from "@/features/order/voucher/components/VoucherFormDialog";
import { VOUCHER_TABLE_COLUMNS, VoucherManagementTable } from "@/features/order/voucher/components/VoucherManagementTable";
import { getVoucherManagementError, useDeleteVoucher, useManagedVouchers, useUpdateVoucher } from "@/features/order/voucher/services/voucherManagementService";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";

export function VoucherManagementPage({ portal, children: wrap }) {
  const { store } = useAuth();
  const vouchersQuery = useManagedVouchers(portal, { include_inactive: 1 });
  const deleteMutation = useDeleteVoucher(portal);
  const quickUpdateMutation = useUpdateVoucher(portal);
  const editor = useEntityEditor();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const rows = (vouchersQuery.data || []).filter((row) => {
    if (portal === "seller") return row.voucherScope === "store" && Number(row.storeId) === Number(store?.id);
    return true;
  });
  const { query, setQuery, filteredRows } = useTableSearch(rows, ["name", "code", "discountType"]);
  const columns = useMemo(() => mergeColumns(VOUCHER_TABLE_COLUMNS, buildRawColumns(rows, ["id", "code", "name", "image", "image_url", "voucher_scope", "discount_target", "discount_type", "discount_value", "min_spend", "max_discount", "starts_at", "ends_at", "usage_limit", "used_count", "store_id", "is_active"])), [rows]);
  const selection = useTableSelection(filteredRows);
  const columnVisibility = useColumnVisibility(columns, `${portal}-vouchers`);

  const bulkDelete = async () => {
    if (!selection.selectedRows.length) return;
    try {
      for (const row of selection.selectedRows) await deleteMutation.mutateAsync(row.id);
      selection.clear();
      setMessage("Voucher terpilih berhasil dihapus. Tekan Refresh untuk memperbarui daftar.");
    } catch (error) {
      setMessage(getVoucherManagementError(error));
    }
  };

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      editor.close();
      setMessage("Voucher berhasil dihapus.");
    } catch (error) {
      setMessage(getVoucherManagementError(error));
    }
  };

  const content = (
    <>
      <EntityToolbar query={query} onQueryChange={setQuery} onCreate={editor.create} onRefresh={() => vouchersQuery.refetch()} refreshing={vouchersQuery.isFetching} createLabel="Tambah Voucher" placeholder="Cari kode atau nama voucher" selectionEnabled={selection.enabled} selectedCount={selection.selectedCount} onToggleSelection={selection.toggleEnabled} bulkActions={[{ key: "delete", label: "Hapus data terpilih", icon: "delete", danger: true, onClick: bulkDelete }]} columns={columns} visibleColumns={columnVisibility.visibleKeys} onToggleColumn={columnVisibility.toggleColumn} onShowAllColumns={columnVisibility.showAll} onResetColumns={columnVisibility.reset} />
      {message ? <p className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${portal === "admin" ? "border-teal-200 bg-teal-50 text-teal-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
      <AsyncState loading={vouchersQuery.isLoading} error={vouchersQuery.error ? getVoucherManagementError(vouchersQuery.error) : ""} empty={!vouchersQuery.isLoading && !filteredRows.length} emptyText="Voucher belum tersedia." />
      {filteredRows.length ? <VoucherManagementTable rows={filteredRows} columns={columns} onEdit={editor.edit} visibleSet={columnVisibility.visibleSet} selectionEnabled={selection.enabled} selectedIds={selection.selectedIds} allSelected={selection.allSelected} onToggleRow={selection.toggleRow} onToggleAll={selection.toggleAll} onToggleActive={(row, isActive) => quickUpdateMutation.mutate({ id: row.id, values: { ...row, isActive } })} pendingId={quickUpdateMutation.variables?.id} /> : null}
      <VoucherFormDialog open={editor.open} entity={editor.entity} portal={portal} onDelete={(entity) => setDeleteTarget(entity)} onClose={editor.close} onSaved={() => { editor.markListDirty(); setMessage(editor.entity ? "Voucher berhasil diperbarui." : "Voucher berhasil ditambahkan."); }} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Voucher" message={`Voucher “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
    </>
  );

  return typeof wrap === "function" ? wrap(content) : content;
}
