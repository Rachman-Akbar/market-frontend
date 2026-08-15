import { memo, useMemo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
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

  const renderCell = (column, store) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(store.raw?.[column.rawKey])}</td>;
    if (column.key === "store") return <td key={column.key} className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-11 w-11 shrink-0 overflow-hidden bg-slate-100">{store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : <span className="material-symbols-outlined flex h-full items-center justify-center text-slate-400">storefront</span>}</div><div className="min-w-0"><p className="truncate font-extrabold text-slate-900">{toTitleCase(store.name)}</p><p className="mt-0.5 truncate text-xs text-slate-500">{store.slug}</p></div></div></td>;
    if (column.key === "owner") return <td key={column.key} className="px-4 py-3 text-slate-600"><p className="truncate font-bold text-slate-700">{toTitleCase(store.ownerName) || "-"}</p><p className="truncate text-xs">{store.ownerEmail || "-"}</p></td>;
    if (column.key === "phone") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{store.phone || "-"}</td>;
    if (column.key === "email") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{store.email || "-"}</td>;
    if (column.key === "location") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{[toTitleCase(store.city), toTitleCase(store.province)].filter(Boolean).join(", ") || "-"}</td>;
    if (column.key === "status") return <td key={column.key} className="px-4 py-3"><StatusBadge status={store.status} /></td>;
    return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={store.isActive} pending={pendingId === store.id} disabled={store.status === "suspended"} onChange={(checked) => onToggleActive(store, checked)} compact /></td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 820), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((store) => <tr key={store.id} onClick={() => onEdit(store)} className="cursor-pointer hover:bg-slate-50"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(store.id))} onToggle={() => onToggleRow?.(store.id)} />{layout.orderedColumns.map((column) => renderCell(column, store))}</tr>)}</tbody></table></div></div>;
});
