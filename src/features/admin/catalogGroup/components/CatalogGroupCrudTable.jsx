import { memo, useMemo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const CATALOG_GROUP_COLUMNS = [
  { key: "name", label: "Nama" },
  { key: "slug", label: "Slug" },
  { key: "active", label: "Status" },
];

const widths = { name: 240, slug: 220, active: 140 };

export const CatalogGroupCrudTable = memo(function CatalogGroupCrudTable({ rows, onEdit, onToggleActive, pendingId, columns = CATALOG_GROUP_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const activeColumns = useMemo(() => columns.filter((column) => !visibleSet || visibleSet.has(column.key)).map((column) => ({ ...column, width: widths[column.key] || 180 })), [columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: "admin.catalog-groups", columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const renderCell = (column, row) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>;
    if (column.key === "name") return <td key={column.key} className="truncate px-4 py-3 font-extrabold text-slate-900">{toTitleCase(row.name)}</td>;
    if (column.key === "slug") return <td key={column.key} className="truncate px-4 py-3 text-slate-500">{row.slug}</td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 620), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody></table></div></div>;
});
