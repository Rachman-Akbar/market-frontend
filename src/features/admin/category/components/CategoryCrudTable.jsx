import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { TableHeaderFilter } from "@/shared/components/crud/TableHeaderFilter";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { useColumnFilterState } from "@/shared/hooks";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const CATEGORY_TABLE_COLUMNS = [
  { key: "structure", label: "Struktur Kategori" },
  { key: "level", label: "Level" },
  { key: "catalogGroup", label: "Catalog Group" },
  { key: "parent", label: "Parent", defaultVisible: false },
  { key: "slug", label: "Slug", defaultVisible: false },
  { key: "fullSlug", label: "Full Slug", defaultVisible: false },
  { key: "imageUrl", label: "Gambar", defaultVisible: false },
  { key: "iconUrl", label: "Icon", defaultVisible: false },
  { key: "sortOrder", label: "Urutan", defaultVisible: false },
  { key: "productsCount", label: "Produk" },
  { key: "visibleMenu", label: "Tampil Menu", defaultVisible: false },
  { key: "active", label: "Status" },
];

const widths = { structure: 330, level: 120, catalogGroup: 210, parent: 200, slug: 200, fullSlug: 260, imageUrl: 120, iconUrl: 110, sortOrder: 110, productsCount: 110, visibleMenu: 130, active: 130 };

function getLevel(row) {
  return Number(row.depth ?? Math.max(0, Number(row.level || 1) - 1)) + 1;
}

function LevelBadge({ level }) {
  const className = level === 1 ? "bg-teal-50 text-teal-700" : level === 2 ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700";
  return <span className={`inline-flex min-w-16 justify-center px-2 py-1 text-[11px] font-extrabold ${className}`}>Level {level}</span>;
}

export const CategoryCrudTable = memo(function CategoryCrudTable({ rows, groupsById, onEdit, onToggleActive, pendingId, columns = CATEGORY_TABLE_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const parentRows = useMemo(() => rows.filter((row) => row.hasChildren || rows.some((candidate) => candidate.parentId === row.id)), [rows]);
  const [expandedIds, setExpandedIds] = useState(() => new Set(parentRows.map((row) => row.id)));
  const activeColumns = useMemo(() => columns.filter((column) => !visibleSet || visibleSet.has(column.key)).map((column) => ({ ...column, width: widths[column.key] || 180, align: ["sortOrder", "productsCount"].includes(column.key) ? "right" : "left" })), [columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: "admin.categories", columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const getValue = useCallback((row, key) => {
    if (key === "structure") return row.name || "";
    if (key === "level") return getLevel(row);
    if (key === "catalogGroup") return groupsById[row.catalogGroupId] || "";
    if (key === "parent") return row.parentName || "";
    if (key === "sortOrder") return row.sortOrder;
    if (key === "productsCount") return row.productsCount;
    if (key === "visibleMenu") return row.isVisibleInMenu ? "Ya" : "Tidak";
    if (key === "active") return row.isActive ? "active" : "inactive";
    return row[key] ?? row.raw?.[key];
  }, [groupsById]);

  const groupOptions = useMemo(() => [...new Set(rows.map((row) => groupsById[row.catalogGroupId]).filter(Boolean))].filter((value, index, list) => list.indexOf(value) === index).map((value) => ({ value, label: toTitleCase(value) })).sort((a, b) => a.label.localeCompare(b.label, "id")), [groupsById, rows]);

  const filterTypes = useMemo(() => ({ structure: "text", level: "select", catalogGroup: "select", parent: "text", slug: "text", fullSlug: "text", sortOrder: "range", productsCount: "range", visibleMenu: "select", active: "select" }), []);
  const { rows: tableRows, columnFilters, changeFilter, sortBy, sortDirection, setSort, hasActiveFilters, resetFilters } = useColumnFilterState({ rows, getValue, filterTypes });

  useEffect(() => {
    setExpandedIds((current) => {
      const next = new Set(current);
      parentRows.forEach((row) => next.add(row.id));
      return next;
    });
  }, [parentRows]);

  const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const visibleRows = useMemo(() => tableRows.filter((row) => {
    let parentId = row.parentId;
    while (parentId) {
      const parent = rowsById.get(parentId);
      if (!parent) break;
      if (!expandedIds.has(parentId)) return false;
      parentId = parent.parentId || null;
    }
    return true;
  }), [expandedIds, rowsById, tableRows]);

  const toggle = (id) => setExpandedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

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
    if (column.key === "structure") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Struktur Kategori" sortKey="structure" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="text" filterValue={columnFilters.structure || ""} onFilterChange={(value) => changeFilter("structure", value)} placeholder="Cari nama kategori" />;
    if (column.key === "level") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Level" sortKey="level" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="select" filterValue={columnFilters.level || ""} onFilterChange={(value) => changeFilter("level", value)} options={[{ value: "1", label: "Level 1" }, { value: "2", label: "Level 2" }, { value: "3", label: "Level 3" }]} />;
    if (column.key === "catalogGroup") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Catalog Group" filterType="select" filterValue={columnFilters.catalogGroup || ""} onFilterChange={(value) => changeFilter("catalogGroup", value)} options={groupOptions} />;
    if (column.key === "parent") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Parent" filterType="text" filterValue={columnFilters.parent || ""} onFilterChange={(value) => changeFilter("parent", value)} placeholder="Cari parent" />;
    if (column.key === "slug") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Slug" filterType="text" filterValue={columnFilters.slug || ""} onFilterChange={(value) => changeFilter("slug", value)} placeholder="Cari slug" />;
    if (column.key === "fullSlug") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Full Slug" filterType="text" filterValue={columnFilters.fullSlug || ""} onFilterChange={(value) => changeFilter("fullSlug", value)} placeholder="Cari full slug" />;
    if (column.key === "imageUrl") return <InteractiveTableHeader key={column.key} {...interactiveProps(column)}>Gambar</InteractiveTableHeader>;
    if (column.key === "iconUrl") return <InteractiveTableHeader key={column.key} {...interactiveProps(column)}>Icon</InteractiveTableHeader>;
    if (column.key === "sortOrder") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Urutan" align="right" filterType="range" filterValue={columnFilters.sortOrder || { min: "", max: "" }} onFilterChange={(value) => changeFilter("sortOrder", value)} minPlaceholder="Min" maxPlaceholder="Max" />;
    if (column.key === "productsCount") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Produk" align="right" sortKey="productsCount" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="range" filterValue={columnFilters.productsCount || { min: "", max: "" }} onFilterChange={(value) => changeFilter("productsCount", value)} minPlaceholder="Min" maxPlaceholder="Max" />;
    if (column.key === "visibleMenu") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Tampil Menu" filterType="select" filterValue={columnFilters.visibleMenu || ""} onFilterChange={(value) => changeFilter("visibleMenu", value)} options={[{ value: "Ya", label: "Ya" }, { value: "Tidak", label: "Tidak" }]} />;
    return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Status" sortKey="active" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="select" filterValue={columnFilters.active || ""} onFilterChange={(value) => changeFilter("active", value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Non-Active" }]} />;
  };

  const renderCell = (column, row) => {
    const level = getLevel(row);
    const hasChildren = row.hasChildren || rows.some((candidate) => candidate.parentId === row.id);
    const expanded = expandedIds.has(row.id);
    if (column.key.startsWith("raw:")) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>;
    if (column.key === "structure") return <td key={column.key} className="px-4 py-3"><div className="flex items-center" style={{ paddingLeft: `${Math.max(0, level - 1) * 24}px` }}>{hasChildren ? <button type="button" onClick={(event) => { event.stopPropagation(); toggle(row.id); }} className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100" aria-label={expanded ? "Tutup child" : "Buka child"}><span className="material-symbols-outlined text-[18px]">{expanded ? "expand_more" : "chevron_right"}</span></button> : <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center text-slate-300">•</span>}<div className="min-w-0"><p className={`${level === 1 ? "font-extrabold" : "font-bold"} truncate text-slate-900`}>{toTitleCase(row.name)}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{row.path || row.fullSlug || row.slug}</p></div></div></td>;
    if (column.key === "level") return <td key={column.key} className="px-4 py-3"><LevelBadge level={level} /></td>;
    if (column.key === "catalogGroup") return <td key={column.key} className="truncate px-4 py-3 font-bold text-slate-700">{toTitleCase(groupsById[row.catalogGroupId]) || "-"}</td>;
    if (column.key === "parent") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{toTitleCase(row.parentName) || "-"}</td>;
    if (column.key === "slug") return <td key={column.key} className="truncate px-4 py-3 text-slate-500">{row.slug || "-"}</td>;
    if (column.key === "fullSlug") return <td key={column.key} className="truncate px-4 py-3 text-slate-500">{row.fullSlug || "-"}</td>;
    if (column.key === "imageUrl") return <td key={column.key} className="px-4 py-3">{row.imageUrl ? <img src={row.imageUrl} alt={row.name} className="h-9 w-9 object-cover" /> : "-"}</td>;
    if (column.key === "iconUrl") return <td key={column.key} className="px-4 py-3">{row.iconUrl ? <img src={row.iconUrl} alt="" className="h-7 w-7 object-contain" /> : "-"}</td>;
    if (column.key === "sortOrder") return <td key={column.key} className="px-4 py-3 text-right text-slate-600">{row.sortOrder}</td>;
    if (column.key === "productsCount") return <td key={column.key} className="px-4 py-3 text-right font-bold text-slate-700">{row.productsCount}</td>;
    if (column.key === "visibleMenu") return <td key={column.key} className="px-4 py-3 text-slate-600">{row.isVisibleInMenu ? "Ya" : "Tidak"}</td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td>;
  };

  return (
    <div className="bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5"><div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">{[1, 2, 3].map((level) => <span key={level} className="bg-white px-2 py-1 ring-1 ring-inset ring-slate-200">Level {level}: {tableRows.filter((row) => getLevel(row) === level).length}</span>)}</div><div className="flex items-center gap-1"><button type="button" onClick={() => setExpandedIds(new Set(parentRows.map((row) => row.id)))} className="px-2 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50">Buka Semua</button><button type="button" onClick={() => setExpandedIds(new Set())} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100">Tutup Semua</button></div></div>
      <TableLayoutHint onReset={layout.resetLayout} />
      {hasActiveFilters ? <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-500">Filter aktif:</span><button type="button" onClick={resetFilters} className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-600 hover:bg-slate-300">Reset semua</button></div> : null}
      <div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 900), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map(renderHeader)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />{layout.orderedColumns.map((column) => renderCell(column, row))}</tr>)}</tbody></table></div>
    </div>
  );
});
