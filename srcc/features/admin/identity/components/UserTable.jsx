import { memo } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { formatDateTime } from "@/core/utils/dateTime";

export const UserTable = memo(function UserTable({ rows, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
            <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Dibuat</th><th className="px-5 py-3 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-teal-100 font-extrabold text-teal-700">{user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" loading="lazy" /> : user.name.slice(0, 1).toUpperCase()}</div><div><p className="font-extrabold text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div></div></td>
                <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{user.roles.map((role) => <span key={role.id} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold capitalize text-slate-600">{role.name}</span>)}</div></td>
                <td className="px-5 py-4"><div className="flex flex-col items-start gap-1"><StatusBadge status={user.bannedAt ? "banned" : user.isActive ? "active" : "inactive"} /><StatusBadge status={user.isEmailVerified ? "approved" : "pending"} label={user.isEmailVerified ? "Email verified" : "Email unverified"} /></div></td>
                <td className="px-5 py-4 text-slate-500">{formatDateTime(user.createdAt)}</td>
                <td className="px-5 py-4"><RowActions onEdit={() => onEdit(user)} onDelete={() => onDelete(user)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
