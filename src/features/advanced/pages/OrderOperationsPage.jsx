import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getOrderManagementError, useAdminOrders, useSellerOrders, useUpdateOrderStatus } from "@/features/admin/order/services/orderManagementService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { useTableSelection } from "@/shared/hooks";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function OrderOperationsPage() {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [detailRow, setDetailRow] = useState(null);
  const deferredQuery = useDeferredValue(query.trim());
  const params = { per_page: 20, ...(deferredQuery ? { order_number: deferredQuery } : {}), ...(type ? { order_type: type } : {}), ...(status ? { status } : {}) };
  const adminQuery = useAdminOrders(params);
  const sellerQuery = useSellerOrders(params);
  const listQuery = admin ? adminQuery : sellerQuery;
  const updateMutation = useUpdateOrderStatus();
  const rows = listQuery.data?.rows || [];
  const selection = useTableSelection(rows);
  const spreadsheetRowId = useCallback((row) => row?.orderId || row?.id, []);
  const spreadsheet = useSpreadsheetWorkspace({ module: "order", label: "Pesanan", selectedRows: selection.selectedRows, allowBulkDelete: admin, getRowId: spreadsheetRowId, onCompleted: () => { selection.clear(); listQuery.refetch(); } });

  const columns = useMemo(() => [
    { key: "orderNumber", label: "Nomor Pesanan" },
    { key: "subOrderNumber", label: "Sub Order" },
    { key: "orderType", label: "Tipe", render: (row) => <span className="font-black uppercase text-slate-700">{row.orderType || "normal"}</span> },
    { key: "storeName", label: "Toko" },
    { key: "customerName", label: "Pelanggan" },
    { key: "total", label: "Total", render: (row) => <span className="font-bold text-slate-900">{money(row.total)}</span> },
    { key: "paymentStatus", label: "Pembayaran" },
    { key: "status", label: "Status" },
    { key: "preorderReleaseAt", label: "Rilis Preorder", render: (row) => row.preorderReleaseAt ? new Date(row.preorderReleaseAt).toLocaleString("id-ID") : "-" },
    { key: "scheduledAt", label: "Jadwal Kirim/Pickup", render: (row) => row.scheduledAt ? new Date(row.scheduledAt).toLocaleString("id-ID") : "-" },
  ], []);

  async function changeStatus(row, nextStatus) {
    try {
      await updateMutation.mutateAsync({ id: row.id, status: nextStatus, trackingNumber: row.trackingNumber });
      setDetailRow(null);
      setMessage(`Status pesanan ${row.orderNumber || row.id} berhasil diperbarui menjadi ${nextStatus}.`);
      listQuery.refetch();
    } catch (error) {
      setMessage(getOrderManagementError(error));
    }
  }

  return (
    <>
      <ModuleFrame
        title="Operasional Pesanan"
        subtitle="Import/export pesanan memakai format tiga sheet seperti Product. Seller hanya menerima baris pesanan untuk tokonya."
        query={query}
        onQueryChange={setQuery}
        onRefresh={() => listQuery.refetch()}
        refreshing={listQuery.isFetching}
        hideCreate
        placeholder="Cari nomor pesanan"
        filters={(
          <>
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 border border-slate-300 bg-white px-3 text-sm"><option value="">Semua tipe</option>{["normal", "preorder", "booking"].map((item) => <option key={item}>{item}</option>)}</select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 border border-slate-300 bg-white px-3 text-sm"><option value="">Semua status</option>{["pending", "processing", "shipped", "received", "completed", "cancelled"].map((item) => <option key={item}>{item}</option>)}</select>
          </>
        )}
        selectionEnabled={selection.enabled}
        selectedCount={selection.selectedCount}
        onToggleSelection={selection.toggleEnabled}
        bulkActions={spreadsheet.actions}
      >
        {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        <DataGrid
          columns={columns}
          rows={rows}
          emptyText={listQuery.isLoading ? "" : "Pesanan belum tersedia."}
          selectionEnabled={selection.enabled}
          selectedIds={selection.selectedIds}
          allSelected={selection.allSelected}
          onToggleRow={selection.toggleRow}
          onToggleAll={selection.toggleAll}
          onRowClick={setDetailRow}
          hasNextPage={listQuery.hasNextPage}
          isFetchingNextPage={listQuery.isFetchingNextPage}
          onLoadMore={() => listQuery.fetchNextPage()}
        />
      </ModuleFrame>
      <FormModal
        open={Boolean(detailRow)}
        title={detailRow ? `Operasi Pesanan ${detailRow.orderNumber || detailRow.id}` : ""}
        subtitle="Perbarui status pesanan melalui modal ini."
        onClose={() => setDetailRow(null)}
        onSubmit={(event) => { event.preventDefault(); setDetailRow(null); }}
        submitLabel="Tutup"
      >
        {detailRow ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Toko</p><p className="font-semibold text-slate-800">{detailRow.storeName || "-"}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pelanggan</p><p className="font-semibold text-slate-800">{detailRow.customerName || "-"}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tipe</p><p className="font-semibold text-slate-800">{detailRow.orderType || "normal"}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pembayaran</p><p className="font-semibold text-slate-800">{detailRow.paymentStatus || "-"}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p><p className="font-bold text-slate-900">{money(detailRow.total)}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</p><p className="font-black uppercase text-slate-700">{detailRow.status}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {detailRow.status === "pending" ? <Button type="button" variant="outline" onClick={() => changeStatus(detailRow, "processing")}>Proses</Button> : null}
              {detailRow.status === "processing" ? <Button type="button" variant="outline" onClick={() => changeStatus(detailRow, "shipped")}>Kirim</Button> : null}
              {detailRow.status === "shipped" ? <Button type="button" variant="outline" onClick={() => changeStatus(detailRow, "received")}>Diterima</Button> : null}
              {detailRow.status === "received" ? <Button type="button" variant="outline" onClick={() => changeStatus(detailRow, "completed")}>Selesai</Button> : null}
              {["pending", "processing"].includes(detailRow.status) ? <Button type="button" variant="destructive" onClick={() => changeStatus(detailRow, "cancelled")}>Batal</Button> : null}
            </div>
          </div>
        ) : null}
      </FormModal>
      <SpreadsheetOperationPanel workspace={spreadsheet} />
    </>
  );
}
