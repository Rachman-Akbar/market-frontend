import { memo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const ROLE_TABLE_COLUMNS = [
  { key: "name", label: "Role" },
  { key: "description", label: "Deskripsi" },
  { key: "permissions", label: "Permissions" },
  { key: "active", label: "Active" },
];

export const RoleTable = memo(function RoleTable({
  rows,
  onEdit,
  onToggleActive,
  pendingId,
  columns = ROLE_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("name") ? <th className="px-4 py-3">Role</th> : null}
              {visible("description") ? <th className="px-4 py-3">Deskripsi</th> : null}
              {visible("permissions") ? <th className="px-4 py-3">Permissions</th> : null}
              {visible("active") ? <th className="px-4 py-3">Active</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((role) => (
              <tr key={role.id} onClick={() => onEdit(role)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(role.id))} onToggle={() => onToggleRow?.(role.id)} />
                {visible("name") ? <td className="px-4 py-3 font-extrabold text-slate-900">{toTitleCase(role.name)}</td> : null}
                {visible("description") ? <td className="max-w-md px-4 py-3 text-slate-500">{role.description || "-"}</td> : null}
                {visible("permissions") ? (
                  <td className="px-4 py-3">
                    <div className="flex max-w-xl flex-wrap gap-1">
                      {role.permissions.length ? role.permissions.map((permission) => (
                        <span key={permission.id} className="bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{permission.name}</span>
                      )) : <span className="text-xs text-slate-400">Belum ada permission</span>}
                    </div>
                  </td>
                ) : null}
                {visible("active") ? (
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <InlineActiveSwitch checked={role.isActive} pending={pendingId === role.id} onChange={(checked) => onToggleActive?.(role, checked)} compact />
                  </td>
                ) : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(role.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
