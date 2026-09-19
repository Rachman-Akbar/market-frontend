import { memo, useCallback, useMemo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { TableHeaderFilter } from "@/shared/components/crud/TableHeaderFilter";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { useColumnFilterState } from "@/shared/hooks";
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

  const getValue = useCallback((role, key) => {
    if (key === "permissions") return (role.permissions || []).map((permission) => permission.name).join(", ");
    if (key === "active") return role.isActive ? "active" : "inactive";
    return role[key] ?? role.raw?.[key];
  }, []);

  const filterTypes = useMemo(() => ({ name: "text", description: "text", permissions: "text", active: "select" }), []);
  const { rows: tableRows, columnFilters, changeFilter, sortBy, sortDirection, setSort, hasActiveFilters, resetFilters } = useColumnFilterState({ rows, getValue, filterTypes });

  const interactiveProps = (column) => ({
    headerProps: layout.getHeaderProps(column.key),
    columnKey: column.key,
    columnStyle: layout.getColumnStyle(column.key),
    onResizeStart: layout.startResize,
    onResetWidth: layout.resetWidth,
    dragging: layout.dragKey === column.key,
    dropTarget: layout.dropKey === column.key,
  });

  const renderHeader = (column) => {
    if (column.key.startsWith("raw:")) return <InteractiveTableHeader key={column.key} {...interactiveProps(column)}>{column.label}</InteractiveTableHeader>;
    if (column.key === "name") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Role" sortKey="name" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="text" filterValue={columnFilters.name || ""} onFilterChange={(value) => changeFilter("name", value)} placeholder="Cari role" />;
    if (column.key === "description") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Deskripsi" filterType="text" filterValue={columnFilters.description || ""} onFilterChange={(value) => changeFilter("description", value)} placeholder="Cari deskripsi" />;
    if (column.key === "permissions") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Permissions" filterType="text" filterValue={columnFilters.permissions || ""} onFilterChange={(value) => changeFilter("permissions", value)} placeholder="Cari permission" />;
    return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Active" sortKey="active" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="select" filterValue={columnFilters.active || ""} onFilterChange={(value) => changeFilter("active", value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Non-Active" }]} />;
  };

  const renderCell = (column, role) => {
    if (column.key.startsWith("raw:")) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(role.raw?.[column.rawKey])}</td>;
    if (column.key === "name") return <td key={column.key} className="truncate px-4 py-3 font-extrabold text-slate-900">{toTitleCase(role.name)}</td>;
    if (column.key === "description") return <td key={column.key} className="px-4 py-3 text-slate-500"><div className="line-clamp-2">{role.description || "-"}</div></td>;
    if (column.key === "permissions") return <td key={column.key} className="px-4 py-3"><div className="flex flex-wrap gap-1">{role.permissions.length ? role.permissions.map((permission) => <span key={permission.id} className="bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{permission.name}</span>) : <span className="text-xs text-slate-400">Belum ada permission</span>}</div></td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={role.isActive} pending={pendingId === role.id} onChange={(checked) => onToggleActive?.(role, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} />{hasActiveFilters ? <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-500">Filter aktif:</span><button type="button" onClick={resetFilters} className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-600 hover:bg-slate-300">Reset semua</button></div> : null}<div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 760), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map(renderHeader)}</tr></thead><tbody className="divide-y divide-slate-100">{tableRows.map((role) => <tr key={role.id} onClick={() => onEdit(role)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(role.id))} onToggle={() => onToggleRow?.(role.id)} />{layout.orderedColumns.map((column) => renderCell(column, role))}</tr>)}</tbody></table></div></div>;
});
