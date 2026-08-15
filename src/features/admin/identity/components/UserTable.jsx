import { memo, useMemo } from "react";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const USER_TABLE_COLUMNS = [
  { key: "user", label: "User" },
  { key: "email", label: "Email" },
  { key: "avatar", label: "Avatar", defaultVisible: false },
  { key: "roles", label: "Role" },
  { key: "verified", label: "Email Verified" },
  { key: "active", label: "Active" },
  { key: "bannedAt", label: "Banned At", defaultVisible: false },
];

const widths = { user: 240, email: 230, avatar: 260, roles: 220, verified: 160, active: 130, bannedAt: 180 };

export const UserTable = memo(function UserTable({
  rows,
  onEdit,
  onToggleActive,
  pendingId,
  columns = USER_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const activeColumns = useMemo(() => columns.filter((column) => (!visibleSet || visibleSet.has(column.key))).map((column) => ({ ...column, width: widths[column.key] || 180 })), [columns, visibleSet]);
  const layout = useTableColumnLayout({ storageKey: "admin.users", columns: activeColumns });
  const tableWidth = layout.totalWidth + (selectionEnabled ? 44 : 0);

  const renderCell = (column, user) => {
    if (column.rawKey) return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{formatTableValue(user.raw?.[column.rawKey])}</td>;
    if (column.key === "user") return <td key={column.key} className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 font-extrabold text-teal-700">{user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" loading="lazy" /> : String(user.name || "U").slice(0, 1).toUpperCase()}</div><p className="truncate font-extrabold text-slate-900">{toTitleCase(user.name)}</p></div></td>;
    if (column.key === "email") return <td key={column.key} className="truncate px-4 py-3 text-slate-600">{user.email || "-"}</td>;
    if (column.key === "avatar") return <td key={column.key} className="truncate px-4 py-3 text-slate-500">{user.avatar || "-"}</td>;
    if (column.key === "roles") return <td key={column.key} className="px-4 py-3"><div className="flex flex-wrap gap-1">{user.roles.length ? user.roles.map((role) => <span key={role.id} className="bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{toTitleCase(role.name)}</span>) : <span className="text-xs text-slate-400">Tanpa role</span>}</div></td>;
    if (column.key === "verified") return <td key={column.key} className="px-4 py-3"><StatusBadge status={user.isEmailVerified ? "approved" : "pending"} label={user.isEmailVerified ? "Verified" : "Unverified"} /></td>;
    if (column.key === "active") return <td key={column.key} className="px-4 py-3" onClick={(event) => event.stopPropagation()}>{user.bannedAt ? <StatusBadge status="banned" /> : <InlineActiveSwitch checked={user.isActive} pending={pendingId === user.id} onChange={(checked) => onToggleActive?.(user, checked)} compact />}</td>;
    return <td key={column.key} className="truncate px-4 py-3 text-slate-500">{formatTableValue(user.bannedAt)}</td>;
  };

  return <div className="bg-white ring-1 ring-slate-200"><TableLayoutHint onReset={layout.resetLayout} /><div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(tableWidth, 760), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} leadingWidth={selectionEnabled ? 44 : 0} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr><TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.key === "user" ? "Nama" : column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((user) => <tr key={user.id} onClick={() => onEdit(user)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit"><TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(user.id))} onToggle={() => onToggleRow?.(user.id)} />{layout.orderedColumns.map((column) => renderCell(column, user))}</tr>)}</tbody></table></div></div>;
});
