import { memo, useMemo, useState } from "react";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { TableHeaderFilter } from "@/shared/components/crud/TableHeaderFilter";
import { InteractiveColGroup } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { cn, formatPrice } from "@/shared/utils/utils";
import { formatTableValue, resolveTableValue } from "@/shared/utils/tableData";
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

const STATUS_BUTTON_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  processing: "border-sky-200 bg-sky-50 text-sky-800",
  shipped: "border-violet-200 bg-violet-50 text-violet-800",
  received: "border-cyan-200 bg-cyan-50 text-cyan-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_DOT_STYLES = {
  pending: "bg-amber-500",
  processing: "bg-sky-500",
  shipped: "bg-violet-500",
  received: "bg-cyan-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const FILTER_TYPES = { number: "text", store: "text", customer: "text", total: "range", payment: "select", tracking: "text", status: "select" };

function hasFilterValue(type, value) {
  if (type === "range") return Boolean(value?.min !== "" || value?.max !== "");
  return value !== "" && value !== null && value !== undefined;
}

function columnValue(column, row) {
  if (column.key.startsWith("raw:")) return resolveTableValue({ raw: row.raw }, column.rawKey);
  if (column.key === "number") return row.subOrderNumber || row.orderNumber || `#${row.id}`;
  if (column.key === "store") return row.storeName;
  if (column.key === "customer") return row.customerName;
  if (column.key === "total") return row.total;
  if (column.key === "payment") return row.paymentStatus;
  if (column.key === "tracking") return row.trackingNumber;
  if (column.key === "status") return row.status;
  return resolveTableValue(row, column.key);
}

export const OrderManagementTable = memo(function OrderManagementTable({ rows, portal, pendingId, onStatusChange, onPrint, onEdit, columns = ORDER_TABLE_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [columnFilters, setColumnFilters] = useState({});
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key)) && (column.key !== "store" || portal === "admin")).map((column) => ({ ...column, width: widths[column.key] || 180 })), [columns, portal, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: `${portal}.orders.management`, columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const paymentOptions = useMemo(() => {
    const values = new Set();
    rows.forEach((row) => {
      const value = row.paymentStatus;
      if (value) values.add(value);
    });
    return [...values].sort().map((value) => ({ value, label: toTitleCase(value) }));
  }, [rows]);

  const visibleRows = useMemo(() => {
    let next = rows;
    const activeFilters = activeColumns.filter((column) => column.key.startsWith("raw:") || hasFilterValue(FILTER_TYPES[column.key], columnFilters[column.key]));
    if (activeFilters.length) {
      next = next.filter((row) =>
        activeFilters.every((column) => {
          const value = columnValue(column, row);
          const type = FILTER_TYPES[column.key] || "text";
          const filterValue = columnFilters[column.key];
          if (type === "range") {
            const num = Number(value);
            const { min = "", max = "" } = filterValue || {};
            return !(min !== "" && !(num >= Number(min))) && !(max !== "" && !(num <= Number(max)));
          }
          if (type === "select") {
            return String(value ?? "") === String(filterValue ?? "");
          }
          return String(value ?? "").toLowerCase().includes(String(filterValue ?? "").toLowerCase());
        }),
      );
    }
    if (sortBy) {
      const direction = sortDirection === "desc" ? -1 : 1;
      const sortColumn = activeColumns.find((column) => column.key === sortBy);
      next = [...next].sort((left, right) => {
        const leftValue = sortColumn ? columnValue(sortColumn, left) : resolveTableValue(left, sortBy);
        const rightValue = sortColumn ? columnValue(sortColumn, right) : resolveTableValue(right, sortBy);
        return String(leftValue ?? "").localeCompare(String(rightValue ?? ""), "id", { numeric: true, sensitivity: "base" }) * direction;
      });
    }
    return next;
  }, [activeColumns, columnFilters, rows, sortBy, sortDirection]);

  const renderCell = (column, row) => {
    if (column.key.startsWith("raw:")) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(resolveTableValue({ raw: row.raw }, column.rawKey))}</td>;
    if (column.key === "number") return <td key={column.key} className="px-4 py-3"><p className="truncate font-extrabold text-slate-900">{row.subOrderNumber || row.orderNumber || `#${row.id}`}</p><p className="mt-0.5 truncate text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleString("id-ID") : "-"}</p></td>;
    if (column.key === "store") return <td key={column.key} className="truncate px-4 py-3 font-bold text-slate-700">{toTitleCase(row.storeName) || "-"}</td>;
    if (column.key === "customer") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{toTitleCase(row.customerName) || "-"}</td>;
    if (column.key === "total") return <td key={column.key} className="px-4 py-3 font-extrabold text-slate-800">{formatPrice(row.total)}</td>;
    if (column.key === "payment") return <td key={column.key} className="px-4 py-3"><StatusBadge status={row.paymentStatus} /></td>;
    if (column.key === "tracking") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{row.trackingNumber || "-"}</td>;
    return <td key={column.key} className="px-4 py-3"><div className="flex w-full items-center gap-2" onClick={(event) => event.stopPropagation()}>{onPrint ? <button type="button" onClick={() => onPrint(row)} title="Cetak surat pesanan" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"><span className="material-symbols-outlined text-[18px]">print</span></button> : null}<div className="w-full"><SearchableSelect value={row.status} disabled={pendingId === row.id} onChange={(nextValue) => onStatusChange(row, nextValue)} options={STATUS_OPTIONS} clearable={false} buttonClassName={`h-9 border text-xs ${STATUS_BUTTON_STYLES[row.status] || "border-slate-200 bg-white"}`} indicatorClassName={STATUS_DOT_STYLES[row.status]} /></div></div></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 820), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <TableHeaderFilter key={column.key} label={column.label} sortKey={column.key} sortBy={sortBy} sortDirection={sortDirection} onSortChange={(key, direction) => { setSortBy(key); setSortDirection(direction); }} filterType={FILTER_TYPES[column.key]} filterValue={columnFilters[column.key]} onFilterChange={(value) => setColumnFilters((current) => { const next = { ...current }; if (hasFilterValue(FILTER_TYPES[column.key], value)) next[column.key] = value; else delete next[column.key]; return next; })} options={column.key === "payment" ? paymentOptions : column.key === "status" ? STATUS_OPTIONS : []} headerProps={layout.getHeaderProps(column.key)} columnKey={column.key} columnStyle={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</TableHeaderFilter>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <tr key={`${row.id}:${row.subOrderNumber}`} onClick={onEdit ? () => onEdit(row) : undefined} title={onEdit ? "Klik untuk melihat detail pesanan" : undefined} className={cn("hover:bg-slate-50", onEdit && "cursor-pointer hover:bg-emerald-50/40")}><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody></table></div></div>;
});