import { memo } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { formatDateTime } from "@/core/utils/dateTime";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const PromotionManagementTable = memo(function PromotionManagementTable({
  rows,
  portal,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  const isAdmin = portal === "admin";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
            <tr><th className="px-5 py-3">Promosi</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Diajukan</th><th className="px-5 py-3 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={row.imageUrl} alt={row.name} className="h-14 w-24 rounded-xl bg-slate-100 object-cover" loading="lazy" />
                    <div><p className="font-extrabold text-slate-900">{toTitleCase(row.name)}</p><p className="mt-1 text-xs text-slate-500">Urutan {row.sortOrder}{row.storeId ? ` · Store ${row.storeId}` : " · Platform"}</p></div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600"><span className="capitalize">{row.clickAction}</span>{row.targetId ? ` #${row.targetId}` : row.targetUrl ? <p className="max-w-[220px] truncate text-xs text-slate-400">{row.targetUrl}</p> : null}</td>
                <td className="px-5 py-4"><div className="flex flex-col items-start gap-1"><StatusBadge status={row.approvalStatus} /><StatusBadge status={row.isActive ? "active" : "inactive"} />{row.rejectionReason ? <p className="max-w-[240px] text-xs text-red-600">{row.rejectionReason}</p> : null}</div></td>
                <td className="px-5 py-4 text-slate-500">{formatDateTime(row.submittedAt)}</td>
                <td className="px-5 py-4">
                  <RowActions
                    onEdit={() => onEdit(row)}
                    onDelete={() => onDelete(row)}
                    extra={isAdmin && row.approvalStatus === "pending" ? (
                      <>
                        <button type="button" onClick={() => onApprove(row)} className="flex h-8 items-center rounded-lg border border-emerald-200 px-2.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-50">Approve</button>
                        <button type="button" onClick={() => onReject(row)} className="flex h-8 items-center rounded-lg border border-amber-200 px-2.5 text-xs font-extrabold text-amber-700 hover:bg-amber-50">Reject</button>
                      </>
                    ) : null}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
