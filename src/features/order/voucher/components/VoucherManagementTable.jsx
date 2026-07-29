import { memo } from "react";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatDateTime } from "@/core/utils/dateTime";
import { formatPrice } from "@/shared/utils/utils";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const VOUCHER_TABLE_COLUMNS = [
  { key: "voucher", label: "Voucher" },
  { key: "scope", label: "Cakupan" },
  { key: "image", label: "Gambar", defaultVisible: false },
  { key: "discount", label: "Diskon" },
  { key: "minSpend", label: "Min. Belanja", defaultVisible: false },
  { key: "maxDiscount", label: "Maks. Diskon", defaultVisible: false },
  { key: "period", label: "Periode" },
  { key: "usage", label: "Penggunaan" },
  { key: "active", label: "Status" },
];

function discountLabel(row) {
  const value = row.discountType === "percentage" ? `${row.discountValue}%` : formatPrice(row.discountValue);
  return `${row.discountTarget === "shipping" ? "Ongkir" : "Produk"} · ${value}`;
}

export const VoucherManagementTable = memo(function VoucherManagementTable({
  rows,
  onEdit,
  onToggleActive,
  pendingId,
  columns = VOUCHER_TABLE_COLUMNS,
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
              {visible("voucher") ? <th className="px-4 py-3">Voucher</th> : null}
              {visible("scope") ? <th className="px-4 py-3">Cakupan</th> : null}
              {visible("image") ? <th className="px-4 py-3">Gambar</th> : null}
              {visible("discount") ? <th className="px-4 py-3">Diskon</th> : null}
              {visible("minSpend") ? <th className="px-4 py-3">Min. Belanja</th> : null}
              {visible("maxDiscount") ? <th className="px-4 py-3">Maks. Diskon</th> : null}
              {visible("period") ? <th className="px-4 py-3">Periode</th> : null}
              {visible("usage") ? <th className="px-4 py-3">Penggunaan</th> : null}
              {visible("active") ? <th className="px-4 py-3">Status</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} onClick={() => onEdit(row)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(row.id))} onToggle={() => onToggleRow?.(row.id)} />
                {visible("voucher") ? <td className="px-4 py-3"><p className="font-extrabold text-slate-900">{toTitleCase(row.name)}</p><p className="mt-1 text-xs font-bold uppercase text-emerald-700">{row.code}</p></td> : null}
                {visible("scope") ? <td className="px-4 py-3"><span className={`px-2.5 py-1 text-xs font-extrabold ${row.voucherScope === "store" ? "bg-emerald-50 text-emerald-700" : "bg-teal-50 text-teal-700"}`}>{row.voucherScope === "store" ? toTitleCase(row.storeName || `Toko ${row.storeId}`) : "Platform"}</span></td> : null}
                {visible("image") ? <td className="px-4 py-3">{row.imageUrl || row.image ? <img src={row.imageUrl || row.image} alt={row.name} className="h-12 w-20 object-cover" loading="lazy" /> : "-"}</td> : null}
                {visible("discount") ? <td className="px-4 py-3 font-bold text-slate-700">{discountLabel(row)}</td> : null}
                {visible("minSpend") ? <td className="px-4 py-3 text-slate-600">{formatPrice(row.minSpend)}</td> : null}
                {visible("maxDiscount") ? <td className="px-4 py-3 text-slate-600">{row.maxDiscount === "" || row.maxDiscount === null ? "-" : formatPrice(Number(row.maxDiscount))}</td> : null}
                {visible("period") ? <td className="px-4 py-3 text-xs text-slate-500"><p>{formatDateTime(row.startsAt)}</p><p>{formatDateTime(row.endsAt)}</p></td> : null}
                {visible("usage") ? <td className="px-4 py-3 text-slate-600">{row.usedCount.toLocaleString("id-ID")} / {row.usageLimit ? row.usageLimit.toLocaleString("id-ID") : "∞"}</td> : null}
                {visible("active") ? <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}><InlineActiveSwitch checked={row.isActive} pending={pendingId === row.id} onChange={(checked) => onToggleActive?.(row, checked)} compact /></td> : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(row.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
