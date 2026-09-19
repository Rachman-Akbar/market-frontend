import { memo, useCallback, useMemo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { TableHeaderFilter } from "@/shared/components/crud/TableHeaderFilter";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { useColumnFilterState } from "@/shared/hooks";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const ADMIN_STORE_COLUMNS = [
  { key: "store", label: "Toko" },
  { key: "owner", label: "Pemilik" },
  { key: "phone", label: "Telepon", defaultVisible: false },
  { key: "email", label: "Email", defaultVisible: false },
  { key: "location", label: "Lokasi" },
  { key: "status", label: "Status Moderasi" },
  { key: "active", label: "Operasional" },
];

const widths = { store: 260, owner: 240, phone: 160, email: 230, location: 220, status: 170, active: 150 };

export const AdminStoreTable = memo(function AdminStoreTable({ rows, onEdit, onToggleActive, pendingId, columns = ADMIN_STORE_COLUMNS, visibleSet, selectionEnabled = false, selectedIds = new Set(), allSelected = false, onToggleRow, onToggleAll }) {
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key))).map((column) => ({ ...column, width: widths[column.key] || 180 })), [columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: "admin.stores", columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const getValue = useCallback((store, key) => {
    switch (key) {
      case "store":
        return store.name;
      case "owner":
        return store.ownerName || store.ownerEmail || "";
      case "location":
        return [toTitleCase(store.city), toTitleCase(store.province)].filter(Boolean).join(", ");
      case "active":
        return store.isActive ? "active" : "inactive";
      default:
        return store[key] ?? store.raw?.[key];
    }
  }, []);

  const filterTypes = useMemo(() => ({ store: "text", owner: "text", phone: "text", email: "text", location: "text", status: "select", active: "select" }), []);
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
    if (column.key === "store") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Toko" sortKey="store" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="text" filterValue={columnFilters.store || ""} onFilterChange={(value) => changeFilter("store", value)} placeholder="Cari nama toko" />;
    if (column.key === "owner") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Pemilik" sortKey="owner" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="text" filterValue={columnFilters.owner || ""} onFilterChange={(value) => changeFilter("owner", value)} placeholder="Cari pemilik" />;
    if (column.key === "phone") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Telepon" filterType="text" filterValue={columnFilters.phone || ""} onFilterChange={(value) => changeFilter("phone", value)} placeholder="Cari telepon" />;
    if (column.key === "email") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Email" filterType="text" filterValue={columnFilters.email || ""} onFilterChange={(value) => changeFilter("email", value)} placeholder="Cari email" />;
    if (column.key === "location") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Lokasi" filterType="text" filterValue={columnFilters.location || ""} onFilterChange={(value) => changeFilter("location", value)} placeholder="Cari kota / provinsi" />;
    if (column.key === "status") return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Status Moderasi" sortKey="status" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="select" filterValue={columnFilters.status || ""} onFilterChange={(value) => changeFilter("status", value)} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "suspended", label: "Suspended" }]} />;
    return <TableHeaderFilter key={column.key} {...interactiveProps(column)} label="Operasional" sortKey="active" sortBy={sortBy} sortDirection={sortDirection} onSortChange={setSort} filterType="select" filterValue={columnFilters.active || ""} onFilterChange={(value) => changeFilter("active", value)} options={[{ value: "active", label: "Aktif" }, { value: "inactive", label: "Non-Aktif" }]} />;
  };

  const renderCell = (column, store) => {
    if (column.key.startsWith("raw:")) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(store.raw?.[column.rawKey])}</td>;
    if (column.key === "store") return <td key={column.key} className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-11 w-11 shrink-0 overflow-hidden bg-slate-100">{store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : <span className="material-symbols-outlined flex h-full items-center justify-center text-slate-400">storefront</span>}</div><div className="min-w-0"><p className="truncate font-extrabold text-slate-900">{toTitleCase(store.name)}</p><p className="mt-0.5 truncate text-xs text-slate-500">{store.slug}</p></div></div></td>;
    if (column.key === "owner") return <td key={column.key} className="px-4 py-3 text-slate-600"><p className="truncate font-bold text-slate-700">{toTitleCase(store.ownerName) || "-"}</p><p className="truncate text-xs">{store.ownerEmail || "-"}</p></td>;
    if (column.key === "phone") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{store.phone || "-"}</td>;
    if (column.key === "email") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{store.email || "-"}</td>;
    if (column.key === "location") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{[toTitleCase(store.city), toTitleCase(store.province)].filter(Boolean).join(", ") || "-"}</td>;
    if (column.key === "status") return <td key={column.key} className="px-4 py-3"><StatusBadge status={store.status} /></td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={store.isActive} pending={pendingId === store.id} disabled={store.status === "suspended"} onChange={(checked) => onToggleActive(store, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} />{hasActiveFilters ? <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-500">Filter aktif:</span><button type="button" onClick={resetFilters} className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-600 hover:bg-slate-300">Reset semua</button></div> : null}<div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 820), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map(renderHeader)}</tr></thead><tbody className="divide-y divide-slate-100">{tableRows.map((store) => <tr key={store.id} onClick={() => onEdit(store)} className="cursor-pointer hover:bg-slate-50"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(store.id))} onToggle={() => onToggleRow?.(store.id)} />{layout.orderedColumns.map((column) => renderCell(column, store))}</tr>)}</tbody></table></div></div>;
});
