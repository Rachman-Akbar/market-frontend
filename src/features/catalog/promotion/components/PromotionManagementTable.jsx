import { memo } from "react";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatDateTime } from "@/core/utils/dateTime";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const PROMOTION_TABLE_COLUMNS = [
  { key: "promotion", label: "Promosi" },
  { key: "store", label: "Toko" },
  { key: "target", label: "Target" },
  { key: "image", label: "Gambar", defaultVisible: false },
  { key: "mobileImage", label: "Gambar Mobile", defaultVisible: false },
  { key: "sortOrder", label: "Urutan", defaultVisible: false },
  { key: "approval", label: "Approval" },
  { key: "active", label: "Active" },
  { key: "submittedAt", label: "Diajukan" },
  { key: "approvedAt", label: "Disetujui", defaultVisible: false },
];

export const PromotionManagementTable = memo(function PromotionManagementTable({
  rows,
  portal,
  onEdit,
  onToggleActive,
  onApprove,
  onReject,
  pendingId,
  columns = PROMOTION_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const isAdmin = portal === "admin";
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("promotion") ? <th className="px-4 py-3">Promosi</th> : null}
              {isAdmin && visible("store") ? <th className="px-4 py-3">Toko</th> : null}
              {visible("target") ? <th className="px-4 py-3">Target</th> : null}
              {visible("image") ? <th className="px-4 py-3">Gambar</th> : null}
              {visible("mobileImage") ? <th className="px-4 py-3">Gambar Mobile</th> : null}
              {visible("sortOrder") ? <th className="px-4 py-3 text-right">Urutan</th> : null}
              {visible("approval") ? <th className="px-4 py-3">Approval</th> : null}
              {visible("active") ? <th className="px-4 py-3">Active</th> : null}
              {visible("submittedAt") ? <th className="px-4 py-3">Diajukan</th> : null}
              {visible("approvedAt") ? <th className="px-4 py-3">Disetujui</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />
                {visible("promotion") ? <td className="px-4 py-3"><p className="font-extrabold text-slate-900">{toTitleCase(row.name)}</p><p className="mt-1 text-xs text-slate-500">{row.badge}</p></td> : null}
                {isAdmin && visible("store") ? <td className="px-4 py-3 font-bold text-slate-700">{toTitleCase(row.storeName) || "Platform"}</td> : null}
                {visible("target") ? <td className="px-4 py-3 text-slate-600"><span className="capitalize">{row.clickAction}</span>{row.targetId ? ` #${row.targetId}` : row.targetUrl ? <p className="max-w-[220px] truncate text-xs text-slate-400">{row.targetUrl}</p> : null}</td> : null}
                {visible("image") ? <td className="px-4 py-3"><img src={row.imageUrl} alt={row.name} className="h-12 w-24 bg-slate-100 object-cover" loading="lazy" /></td> : null}
                {visible("mobileImage") ? <td className="px-4 py-3"><img src={row.mobileImageUrl} alt="" className="h-12 w-20 bg-slate-100 object-cover" loading="lazy" /></td> : null}
                {visible("sortOrder") ? <td className="px-4 py-3 text-right text-slate-600">{row.sortOrder}</td> : null}
                {visible("approval") ? <td className="px-4 py-3"><div className="flex flex-col items-start gap-1.5"><StatusBadge status={row.approvalStatus} />{row.rejectionReason ? <p className="max-w-[240px] text-xs text-red-600">{row.rejectionReason}</p> : null}{isAdmin && row.approvalStatus === "pending" ? <div className="flex gap-1" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => onApprove(row)} className="h-8 bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-100">Approve</button><button type="button" onClick={() => onReject(row)} className="h-8 bg-amber-50 px-2.5 text-xs font-extrabold text-amber-700 hover:bg-amber-100">Reject</button></div> : null}</div></td> : null}
                {visible("active") ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td> : null}
                {visible("submittedAt") ? <td className="px-4 py-3 text-slate-500">{formatDateTime(row.submittedAt)}</td> : null}
                {visible("approvedAt") ? <td className="px-4 py-3 text-slate-500">{formatDateTime(row.approvedAt)}</td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
