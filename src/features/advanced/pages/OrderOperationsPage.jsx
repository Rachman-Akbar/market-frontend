import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getOrderManagementError, useAdminOrders, useSellerOrders, useUpdateOrderStatus } from "@/features/admin/order/services/orderManagementService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Button } from "@/shared/components/ui/Button";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useTableSelection } from "@/shared/hooks";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function OrderOperationsPage() {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const params = { page, per_page: 20, ...(deferredQuery ? { order_number: deferredQuery } : {}), ...(type ? { order_type: type } : {}), ...(status ? { status } : {}) };
  const adminQuery = useAdminOrders(params);
  const sellerQuery = useSellerOrders(params);
  const listQuery = admin ? adminQuery : sellerQuery;
  const updateMutation = useUpdateOrderStatus();
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  const selection = useTableSelection(rows);
  const spreadsheetRowId = useCallback((row) => row?.orderId || row?.id, []);
  const spreadsheet = useSpreadsheetWorkspace({ module: "order", label: "Pesanan", selectedRows: selection.selectedRows, allowBulkDelete: admin, getRowId: spreadsheetRowId, onCompleted: () => { selection.clear(); listQuery.refetch(); } });

  useEffect(() => setPage(1), [deferredQuery, type, status]);

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
    { key: "bookingExpiresAt", label: "Batas Booking", render: (row) => row.bookingExpiresAt ? new Date(row.bookingExpiresAt).toLocaleString("id-ID") : "-" },
  ], []);

  async function changeStatus(row, nextStatus) {
    try {
      await updateMutation.mutateAsync({ id: row.id, status: nextStatus, trackingNumber: row.trackingNumber });
      setMessage("Status pesanan berhasil diperbarui.");
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
          actions={(row) => (
            <div className="flex flex-wrap justify-end gap-1">
              {row.status === "pending" ? <Button size="sm" variant="outline" onClick={() => changeStatus(row, "processing")}>Proses</Button> : null}
              {row.status === "processing" ? <Button size="sm" variant="outline" onClick={() => changeStatus(row, "shipped")}>Kirim</Button> : null}
              {row.status === "shipped" ? <Button size="sm" variant="outline" onClick={() => changeStatus(row, "received")}>Diterima</Button> : null}
              {row.status === "received" ? <Button size="sm" variant="outline" onClick={() => changeStatus(row, "completed")}>Selesai</Button> : null}
              {["pending", "processing"].includes(row.status) ? <Button size="sm" variant="destructive" onClick={() => changeStatus(row, "cancelled")}>Batal</Button> : null}
            </div>
          )}
        />
        {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
      </ModuleFrame>
      <SpreadsheetOperationPanel workspace={spreadsheet} />
    </>
  );
}
