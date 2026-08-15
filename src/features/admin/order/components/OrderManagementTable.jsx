import { memo, useMemo } from "react";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { formatPrice } from "@/shared/utils/utils";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "received", label: "Received" },
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

const widths = { number: 220, store: 210, customer: 200, total: 160, payment: 160, tracking: 200, status: 190 };

export const OrderManagementTable = memo(function OrderManagementTable({ rows, portal, pendingId, onStatusChange, columns = ORDER_TABLE_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key)) && (column.key !== "store" || portal === "admin")).map((column) => ({ ...column, width: widths[column.key] || 180 })), [columns, portal, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: `${portal}.orders.management`, columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const renderCell = (column, row) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>;
    if (column.key === "number") return <td key={column.key} className="px-4 py-3"><p className="truncate font-extrabold text-slate-900">{row.subOrderNumber || row.orderNumber || `#${row.id}`}</p><p className="mt-0.5 truncate text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString("id-ID") : "-"}</p></td>;
    if (column.key === "store") return <td key={column.key} className="truncate px-4 py-3 font-bold text-slate-700">{toTitleCase(row.storeName) || "-"}</td>;
    if (column.key === "customer") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{toTitleCase(row.customerName) || "-"}</td>;
    if (column.key === "total") return <td key={column.key} className="px-4 py-3 font-extrabold text-slate-800">{formatPrice(row.total)}</td>;
    if (column.key === "payment") return <td key={column.key} className="px-4 py-3"><StatusBadge status={row.paymentStatus} /></td>;
    if (column.key === "tracking") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{row.trackingNumber || "-"}</td>;
    return <td key={column.key} className="px-4 py-3"><div className="w-full" onClick={(event) => event.stopPropagation()}><SearchableSelect value={row.status} disabled={pendingId === row.id} onChange={(nextValue) => onStatusChange(row, nextValue)} options={STATUS_OPTIONS} clearable={false} buttonClassName="h-9 text-xs" /></div></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 820), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={`${row.id}:${row.subOrderNumber}`} className="hover:bg-slate-50"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody></table></div></div>;
});
