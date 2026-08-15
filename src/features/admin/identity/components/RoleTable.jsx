import { memo, useMemo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const ROLE_TABLE_COLUMNS = [
  { key: "name", label: "Role" },
  { key: "description", label: "Deskripsi" },
  { key: "permissions", label: "Permissions" },
  { key: "active", label: "Active" },
];

const widths = { name: 180, description: 280, permissions: 420, active: 130 };

export const RoleTable = memo(function RoleTable({ rows, onEdit, onToggleActive, pendingId, columns = ROLE_TABLE_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key))).map((column) => ({ ...column, width: widths[column.key] || 180 })), [columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: "admin.roles", columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const renderCell = (column, role) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(role.raw?.[column.rawKey])}</td>;
    if (column.key === "name") return <td key={column.key} className="truncate px-4 py-3 font-extrabold text-slate-900">{toTitleCase(role.name)}</td>;
    if (column.key === "description") return <td key={column.key} className="px-4 py-3 text-slate-500"><div className="line-clamp-2">{role.description || "-"}</div></td>;
    if (column.key === "permissions") return <td key={column.key} className="px-4 py-3"><div className="flex flex-wrap gap-1">{role.permissions.length ? role.permissions.map((permission) => <span key={permission.id} className="bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{permission.name}</span>) : <span className="text-xs text-slate-400">Belum ada permission</span>}</div></td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={role.isActive} pending={pendingId === role.id} onChange={(checked) => onToggleActive?.(role, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 760), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((role) => <tr key={role.id} onClick={() => onEdit(role)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(role.id))} onToggle={() => onToggleRow?.(role.id)} />{layout.orderedColumns.map((column) => renderCell(column, role))}</tr>)}</tbody></table></div></div>;
});
