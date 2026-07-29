import { memo } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";

export const RoleTable = memo(function RoleTable({ rows, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Role</th><th className="px-5 py-3">Permissions</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((role) => <tr key={role.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-extrabold capitalize text-slate-900">{role.name}</p><p className="mt-1 max-w-md text-xs text-slate-500">{role.description || "Tanpa deskripsi"}</p></td><td className="px-5 py-4"><div className="flex max-w-xl flex-wrap gap-1">{role.permissions.length ? role.permissions.map((permission) => <span key={permission.id} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{permission.name}</span>) : <span className="text-xs text-slate-400">Belum ada permission</span>}</div></td><td className="px-5 py-4"><StatusBadge status={role.isActive ? "active" : "inactive"} /></td><td className="px-5 py-4"><RowActions onEdit={() => onEdit(role)} onDelete={() => onDelete(role)} /></td></tr>)}</tbody></table></div></div>
  );
});
