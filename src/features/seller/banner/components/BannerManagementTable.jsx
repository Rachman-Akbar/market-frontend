import { memo, useMemo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const BANNER_TABLE_COLUMNS = [
  { key: "banner", label: "Banner" },
  { key: "store", label: "Toko" },
  { key: "image", label: "Gambar" },
  { key: "sortOrder", label: "Urutan" },
  { key: "active", label: "Status" },
];

const widths = { banner: 220, store: 220, image: 220, sortOrder: 120, active: 140 };

export const BannerManagementTable = memo(function BannerManagementTable({ rows, portal = "seller", onEdit, onToggleActive, pendingId, columns = BANNER_TABLE_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const admin = portal === "admin";
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key)) && (column.key !== "store" || admin)).map((column) => ({ ...column, width: widths[column.key] || 180, align: column.key === "sortOrder" ? "right" : "left" })), [admin, columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: `${portal}.banners`, columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const renderCell = (column, banner) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(banner.raw?.[column.rawKey])}</td>;
    if (column.key === "banner") return <td key={column.key} className="truncate px-4 py-3 font-extrabold text-slate-900">{toTitleCase(banner.name)}</td>;
    if (column.key === "store") return <td key={column.key} className="truncate px-4 py-3 font-bold text-slate-700">{toTitleCase(banner.storeName) || `Store #${banner.storeId}`}</td>;
    if (column.key === "image") return <td key={column.key} className="px-4 py-3"><img src={banner.imageUrl} alt={banner.name} className="h-16 w-full max-w-44 bg-slate-100 object-cover" loading="lazy" /></td>;
    if (column.key === "sortOrder") return <td key={column.key} className="px-4 py-3 text-right text-slate-600">{banner.sortOrder}</td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={banner.isActive} pending={pendingId === banner.id} onChange={(checked) => onToggleActive?.(banner, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 720), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key} align={column.align}>{column.key === "banner" ? "Nama Banner" : column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((banner) => <tr key={banner.id} onClick={() => onEdit(banner)} className="cursor-pointer hover:bg-slate-50"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(banner.id))} onToggle={() => onToggleRow?.(banner.id)} />{layout.orderedColumns.map((column) => renderCell(column, banner))}</tr>)}</tbody></table></div></div>;
});
