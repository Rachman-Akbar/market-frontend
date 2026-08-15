import { useMemo } from "react";
import { formatDate } from "@/core/utils/numberFormat";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";

const statusClass = {
  Dibayar: "bg-emerald-50 text-emerald-700",
  Diproses: "bg-blue-50 text-blue-700",
  Review: "bg-amber-50 text-amber-700",
  Dikirim: "bg-sky-50 text-sky-700",
};

export function AdminDataTable({ rows = [] }) {
  const columns = useMemo(() => [
    { key: "invoice", label: "Invoice", width: 150 },
    { key: "buyer", label: "Pembeli", width: 180 },
    { key: "seller", label: "Seller", width: 180 },
    { key: "channel", label: "Channel", width: 130 },
    { key: "total", label: "Total", width: 160, align: "right" },
    { key: "status", label: "Status", width: 140 },
    { key: "date", label: "Tanggal", width: 180 },
  ], []);
  const layout = useTableColumnLayout({ storageKey: "admin.dashboard.orders", columns });

  const renderCell = (column, row) => {
    if (column.key === "invoice") return <td key={column.key} className="px-5 py-4 font-bold text-slate-900">{row.id}</td>;
    if (column.key === "buyer") return <td key={column.key} className="px-5 py-4 text-slate-600">{row.buyer}</td>;
    if (column.key === "seller") return <td key={column.key} className="px-5 py-4 text-slate-600">{row.seller}</td>;
    if (column.key === "channel") return <td key={column.key} className="px-5 py-4 text-slate-500">{row.channel}</td>;
    if (column.key === "total") return <td key={column.key} className="px-5 py-4 text-right font-bold text-slate-900">{row.total}</td>;
    if (column.key === "status") return <td key={column.key} className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || "bg-slate-100 text-slate-600"}`}>{row.status}</span></td>;
    return <td key={column.key} className="px-5 py-4 text-slate-500">{formatDate(row.createdAt)}</td>;
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div><h2 className="text-base font-extrabold text-slate-950">Pesanan terbaru</h2><p className="text-sm text-slate-500">Monitoring order, channel, dan status pembayaran</p></div>
      </div>
      <div className="px-4 pt-2"><TableLayoutHint onReset={layout.resetLayout} /></div>
      <div className="overflow-x-auto">
        <table className="table-fixed text-left text-sm" style={{ width: Math.max(layout.totalWidth, 900), minWidth: "100%" }}>
          <InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} />
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key} align={column.align}>{column.label}</InteractiveTableHeader>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id} className="transition hover:bg-slate-50/80">{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
