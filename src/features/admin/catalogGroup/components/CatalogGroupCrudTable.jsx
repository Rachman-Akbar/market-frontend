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

  const getValue = useCallback((row, key) => {
    if (key === "active") return row.isActive ? "active" : "inactive";
    return row[key] ?? row.raw?.[key];
  }, []);

  const filterTypes = useMemo(() => ({ name: "text", slug: "text", active: "select" }), []);
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
    if (column.key === "name") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Nama" sortKey="name" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="text" filterValue={columnFilters.name || ""} onFilterChange={(value) => changeFilter("name", value)} placeholder="Cari nama grup" />;
    if (column.key === "slug") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Slug" sortKey="slug" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="text" filterValue={columnFilters.slug || ""} onFilterChange={(value) => changeFilter("slug", value)} placeholder="Cari slug" />;
    return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Status" sortKey="active" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="select" filterValue={columnFilters.active || ""} onFilterChange={(value) => changeFilter("active", value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Non-Active" }]} />;
  };

  const renderCell = (column, row) => {
    if (column.key.startsWith("raw:")) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>;
    if (column.key === "name") return <td key={column.key} className="truncate px-4 py-3 font-extrabold text-slate-900">{toTitleCase(row.name)}</td>;
    if (column.key === "slug") return <td key={column.key} className="truncate px-4 py-3 text-slate-500">{row.slug}</td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} />{hasActiveFilters ? <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-500">Filter aktif:</span><button type="button" onClick={resetFilters} className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-600 hover:bg-slate-300">Reset semua</button></div> : null}<div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 620), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map(renderHeader)}</tr></thead><tbody className="divide-y divide-slate-100">{tableRows.map((row) => <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody></table></div></div>;
});
