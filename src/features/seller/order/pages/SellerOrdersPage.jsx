import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { ORDER_TABLE_COLUMNS, OrderManagementTable } from "@/features/admin/order/components/OrderManagementTable";
import { getOrderManagementError, useSellerOrders, useUpdateOrderStatus } from "@/features/admin/order/services/orderManagementService";
import { EntityToolbar } from "@/shared/components/crud/EntityToolbar";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useColumnVisibility, useTableSelection } from "@/shared/hooks";
import { buildRawColumns, mergeColumns } from "@/shared/utils/tableData";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

export default function SellerOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const ordersQuery = useSellerOrders({ page, per_page: 20, ...(deferredQuery ? { order_number: deferredQuery } : {}), ...(status ? { status } : {}) });
  const updateMutation = useUpdateOrderStatus();
  const rows = ordersQuery.data?.rows || [];
  const meta = ordersQuery.data?.meta || {};
  const columns = useMemo(() => mergeColumns(ORDER_TABLE_COLUMNS.filter((column) => column.key !== "store"), buildRawColumns(rows, ["id", "order_id", "order_number", "sub_order_number", "store_id", "store_name", "grand_total", "total", "total_items_price", "shipping_cost", "status", "payment_status", "tracking_number"])), [rows]);
  const selection = useTableSelection(rows);
  const columnVisibility = useColumnVisibility(columns, "seller-orders");
  const spreadsheetRowId = useCallback((row) => row?.orderId || row?.order_id || row?.id, []);
  const spreadsheet = useSpreadsheetWorkspace({
    module: "order",
    label: "Pesanan",
    selectedRows: selection.selectedRows,
    allowBulkDelete: false,
    getRowId: spreadsheetRowId,
    onCompleted: () => {
      selection.clear();
      ordersQuery.refetch();
    },
  });

  useEffect(() => setPage(1), [deferredQuery, status]);

  const bulkStatus = async (nextStatus) => {
    if (!selection.selectedRows.length) return;
    try {
      for (const row of selection.selectedRows) {
        await updateMutation.mutateAsync({ id: row.id, status: nextStatus, trackingNumber: row.trackingNumber });
      }
      selection.clear();
      setMessage(`Status pesanan terpilih diubah menjadi ${nextStatus}.`);
      ordersQuery.refetch();
    } catch (error) {
      setMessage(getOrderManagementError(error));
    }
  };

  const bulkActions = [
    { key: "processing", label: "Set Processing", icon: "pending_actions", requiresSelection: true, onClick: () => bulkStatus("processing") },
    { key: "shipped", label: "Set Shipped", icon: "local_shipping", requiresSelection: true, onClick: () => bulkStatus("shipped") },
    { key: "received", label: "Set Received", icon: "inventory_2", requiresSelection: true, onClick: () => bulkStatus("received") },
    { key: "completed", label: "Set Completed", icon: "task_alt", requiresSelection: true, onClick: () => bulkStatus("completed") },
    ...spreadsheet.actions,
  ];

  return (
    <SellerPanelShell>
      {!spreadsheet.activeOperation ? (
        <>
          <EntityToolbar
            query={query}
            onQueryChange={setQuery}
            hideCreate
            onRefresh={() => ordersQuery.refetch()}
            refreshing={ordersQuery.isFetching}
            placeholder="Cari nomor order lalu tekan Enter"
            selectionEnabled={selection.enabled}
            selectedCount={selection.selectedCount}
            onToggleSelection={selection.toggleEnabled}
            bulkActions={bulkActions}
            columns={columns}
            visibleColumns={columnVisibility.visibleKeys}
            onToggleColumn={columnVisibility.toggleColumn}
            onShowAllColumns={columnVisibility.showAll}
            onResetColumns={columnVisibility.reset}
            filters={(
              <SearchableSelect
                value={status}
                onChange={setStatus}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "processing", label: "Processing" },
                  { value: "shipped", label: "Shipped" },
                  { value: "received", label: "Received" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                placeholder="Semua status"
                className="w-44"
                buttonClassName="h-10"
              />
            )}
          />
          {message ? <p className="mb-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          <AsyncState loading={ordersQuery.isLoading} error={ordersQuery.error ? getOrderManagementError(ordersQuery.error) : ""} empty={!ordersQuery.isLoading && !rows.length} emptyText="Pesanan toko belum tersedia." />
          {rows.length ? (
            <OrderManagementTable
              rows={rows}
              columns={columns}
              portal="seller"
              pendingId={updateMutation.variables?.id}
              visibleSet={columnVisibility.visibleSet}
              selectionEnabled={selection.enabled}
              selectedIds={selection.selectedIds}
              allSelected={selection.allSelected}
              onToggleRow={selection.toggleRow}
              onToggleAll={selection.toggleAll}
              onStatusChange={async (row, nextStatus) => {
                try {
                  await updateMutation.mutateAsync({ id: row.id, status: nextStatus, trackingNumber: row.trackingNumber });
                  setMessage("Status pesanan berhasil diperbarui.");
                  ordersQuery.refetch();
                } catch (error) {
                  setMessage(getOrderManagementError(error));
                }
              }}
            />
          ) : null}
          {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
        </>
      ) : null}
      <SpreadsheetOperationPanel workspace={spreadsheet} />
    </SellerPanelShell>
  );
}
