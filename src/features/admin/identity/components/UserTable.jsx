import { memo } from "react";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
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
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("user") ? <th className="px-4 py-3">Nama</th> : null}
              {visible("email") ? <th className="px-4 py-3">Email</th> : null}
              {visible("avatar") ? <th className="px-4 py-3">Avatar</th> : null}
              {visible("roles") ? <th className="px-4 py-3">Role</th> : null}
              {visible("verified") ? <th className="px-4 py-3">Email Verified</th> : null}
              {visible("active") ? <th className="px-4 py-3">Active</th> : null}
              {visible("bannedAt") ? <th className="px-4 py-3">Banned At</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((user) => (
              <tr key={user.id} onClick={() => onEdit(user)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(user.id))} onToggle={() => onToggleRow?.(user.id)} />
                {visible("user") ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 font-extrabold text-teal-700">
                        {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" loading="lazy" /> : String(user.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <p className="font-extrabold text-slate-900">{toTitleCase(user.name)}</p>
                    </div>
                  </td>
                ) : null}
                {visible("email") ? <td className="px-4 py-3 text-slate-600">{user.email || "-"}</td> : null}
                {visible("avatar") ? <td className="max-w-64 truncate px-4 py-3 text-slate-500">{user.avatar || "-"}</td> : null}
                {visible("roles") ? (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length ? user.roles.map((role) => <span key={role.id} className="bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{toTitleCase(role.name)}</span>) : <span className="text-xs text-slate-400">Tanpa role</span>}
                    </div>
                  </td>
                ) : null}
                {visible("verified") ? <td className="px-4 py-3"><StatusBadge status={user.isEmailVerified ? "approved" : "pending"} label={user.isEmailVerified ? "Verified" : "Unverified"} /></td> : null}
                {visible("active") ? (
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    {user.bannedAt ? <StatusBadge status="banned" /> : <InlineActiveSwitch checked={user.isActive} pending={pendingId === user.id} onChange={(checked) => onToggleActive?.(user, checked)} compact />}
                  </td>
                ) : null}
                {visible("bannedAt") ? <td className="px-4 py-3 text-slate-500">{formatTableValue(user.bannedAt)}</td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(user.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
