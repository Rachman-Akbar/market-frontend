import { memo } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { formatDateTime } from "@/core/utils/dateTime";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const CatalogGroupCrudTable = memo(function CatalogGroupCrudTable({ rows, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Diperbarui</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-extrabold text-slate-900">{toTitleCase(row.name)}</td><td className="px-5 py-4 text-slate-500">{row.slug}</td><td className="px-5 py-4"><StatusBadge status={row.isActive ? "active" : "inactive"} /></td><td className="px-5 py-4 text-slate-500">{formatDateTime(row.updatedAt)}</td><td className="px-5 py-4"><RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} /></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
});
