import { memo } from "react";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatPrice } from "@/shared/utils/utils";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const ORDER_TABLE_COLUMNS = [
  { key: "number", label: "Nomor" },
  { key: "store", label: "Toko" },
  { key: "customer", label: "Customer" },
  { key: "total", label: "Total" },
  { key: "payment", label: "Pembayaran" },
  { key: "tracking", label: "Resi", defaultVisible: false },
  { key: "status", label: "Status" },
];

export const OrderManagementTable = memo(function OrderManagementTable({
  rows,
  portal,
  pendingId,
  onStatusChange,
  columns = ORDER_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));
  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("number") ? <th className="px-4 py-3">Nomor</th> : null}
              {portal === "admin" && visible("store") ? <th className="px-4 py-3">Toko</th> : null}
              {visible("customer") ? <th className="px-4 py-3">Customer</th> : null}
              {visible("total") ? <th className="px-4 py-3">Total</th> : null}
              {visible("payment") ? <th className="px-4 py-3">Pembayaran</th> : null}
              {visible("tracking") ? <th className="px-4 py-3">Resi</th> : null}
              {visible("status") ? <th className="px-4 py-3">Status</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={`${row.id}:${row.subOrderNumber}`} className="hover:bg-slate-50">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />
                {visible("number") ? <td className="px-4 py-3"><p className="font-extrabold text-slate-900">{row.subOrderNumber || row.orderNumber || `#${row.id}`}</p><p className="mt-0.5 text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString("id-ID") : "-"}</p></td> : null}
                {portal === "admin" && visible("store") ? <td className="px-4 py-3 font-bold text-slate-700">{toTitleCase(row.storeName) || "-"}</td> : null}
                {visible("customer") ? <td className="px-4 py-3 text-slate-600">{toTitleCase(row.customerName) || "-"}</td> : null}
                {visible("total") ? <td className="px-4 py-3 font-extrabold text-slate-800">{formatPrice(row.total)}</td> : null}
                {visible("payment") ? <td className="px-4 py-3"><StatusBadge status={row.paymentStatus} /></td> : null}
                {visible("tracking") ? <td className="px-4 py-3 text-slate-600">{row.trackingNumber || "-"}</td> : null}
                {visible("status") ? <td className="px-4 py-3"><div className="w-40"><SearchableSelect value={row.status} disabled={pendingId === row.id} onChange={(nextValue) => onStatusChange(row, nextValue)} options={STATUS_OPTIONS} clearable={false} buttonClassName="h-9 text-xs" /></div></td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
