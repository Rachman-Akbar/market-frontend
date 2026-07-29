import { memo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const BANNER_TABLE_COLUMNS = [
  { key: "banner", label: "Banner" },
  { key: "store", label: "Toko" },
  { key: "image", label: "Gambar" },
  { key: "sortOrder", label: "Urutan" },
  { key: "active", label: "Status" },
];

export const BannerManagementTable = memo(function BannerManagementTable({
  rows,
  portal = "seller",
  onEdit,
  onToggleActive,
  pendingId,
  columns = BANNER_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const admin = portal === "admin";
  const visible = (key) => !visibleSet || visibleSet.has(key);
  const rawColumns = columns.filter((column) => column.rawKey && visible(column.key));

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {visible("banner") ? <th className="px-4 py-3">Nama Banner</th> : null}
              {admin && visible("store") ? <th className="px-4 py-3">Toko</th> : null}
              {visible("image") ? <th className="px-4 py-3">Gambar</th> : null}
              {visible("sortOrder") ? <th className="px-4 py-3 text-right">Urutan</th> : null}
              {visible("active") ? <th className="px-4 py-3">Status</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((banner) => (
              <tr key={banner.id} onClick={() => onEdit(banner)} className="cursor-pointer hover:bg-slate-50">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(banner.id))} onToggle={() => onToggleRow?.(banner.id)} />
                {visible("banner") ? <td className="px-4 py-3 font-extrabold text-slate-900">{toTitleCase(banner.name)}</td> : null}
                {admin && visible("store") ? <td className="px-4 py-3 font-bold text-slate-700">{toTitleCase(banner.storeName) || `Store #${banner.storeId}`}</td> : null}
                {visible("image") ? <td className="px-4 py-3"><img src={banner.imageUrl} alt={banner.name} className="h-16 w-40 bg-slate-100 object-cover" loading="lazy" /></td> : null}
                {visible("sortOrder") ? <td className="px-4 py-3 text-right text-slate-600">{banner.sortOrder}</td> : null}
                {visible("active") ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={banner.isActive} pending={pendingId === banner.id} onChange={(checked) => onToggleActive?.(banner, checked)} compact /></td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(banner.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
