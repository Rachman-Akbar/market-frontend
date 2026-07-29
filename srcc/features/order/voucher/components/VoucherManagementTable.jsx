import { memo } from "react";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { formatDateTime } from "@/core/utils/dateTime";
import { formatPrice } from "@/shared/utils/utils";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const VoucherManagementTable = memo(function VoucherManagementTable({ rows, onEdit, onDelete }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Voucher</th><th className="px-5 py-3">Diskon</th><th className="px-5 py-3">Periode</th><th className="px-5 py-3">Penggunaan</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-extrabold text-slate-900">{toTitleCase(row.name)}</p><p className="mt-1 text-xs font-bold uppercase text-emerald-700">{row.code}</p></td><td className="px-5 py-4 font-bold text-slate-700">{row.discountType === "percentage" ? `${row.discountValue}%` : formatPrice(row.discountValue)}</td><td className="px-5 py-4 text-xs text-slate-500"><p>{formatDateTime(row.startsAt)}</p><p>{formatDateTime(row.endsAt)}</p></td><td className="px-5 py-4 text-slate-600">{row.usedCount.toLocaleString("id-ID")} / {row.usageLimit ? row.usageLimit.toLocaleString("id-ID") : "∞"}</td><td className="px-5 py-4"><StatusBadge status={row.isActive ? "active" : "inactive"} /></td><td className="px-5 py-4"><RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row)} /></td></tr>)}</tbody></table></div></div>;
});
