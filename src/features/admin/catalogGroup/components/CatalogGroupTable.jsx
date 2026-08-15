import { useMemo } from "react";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";

export function CatalogGroupTable({ rows = [] }) {
  const columns = useMemo(() => [
    { key: "name", label: "Nama", width: 200 },
    { key: "slug", label: "Slug", width: 180 },
    { key: "owner", label: "Owner", width: 180 },
    { key: "sortOrder", label: "Urutan", width: 110, align: "center" },
    { key: "products", label: "Produk", width: 120, align: "right" },
    { key: "updatedAt", label: "Update", width: 180 },
  ], []);
  const layout = useTableColumnLayout({ storageKey: "admin.catalog-groups.detail", columns });

  const renderCell = (column, row) => {
    if (column.key === "name") return <td key={column.key} className="px-5 py-4 font-extrabold text-slate-900"><div className="truncate">{row.name}</div></td>;
    if (column.key === "slug") return <td key={column.key} className="px-5 py-4 text-slate-500"><div className="truncate">{row.slug}</div></td>;
    if (column.key === "owner") return <td key={column.key} className="px-5 py-4 text-slate-600"><div className="truncate">{row.owner}</div></td>;
    if (column.key === "sortOrder") return <td key={column.key} className="px-5 py-4 text-center font-bold text-slate-700">{row.sortOrder}</td>;
    if (column.key === "products") return <td key={column.key} className="px-5 py-4 text-right font-bold text-slate-900">{row.products.toLocaleString("id-ID")}</td>;
    return <td key={column.key} className="px-5 py-4 text-slate-500">{row.updatedAt}</td>;
  };

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-slate-950">Detail catalog group</h2><p className="text-sm text-slate-500">Kontrol sort order, owner, dan sinkronisasi group katalog.</p></div>
      <div className="px-4 pt-2"><TableLayoutHint onReset={layout.resetLayout} /></div>
      <div className="overflow-x-auto">
        <table className="table-fixed text-left text-sm" style={{ width: Math.max(layout.totalWidth, 760), minWidth: "100%" }}>
          <InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} />
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key} align={column.align}>{column.label}</InteractiveTableHeader>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id} className="transition hover:bg-slate-50/80">{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
