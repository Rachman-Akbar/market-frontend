import { memo } from "react";
import { formatPrice } from "@/shared/utils/utils";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { TableSelectionCell, TableSelectionHeader } from "@/shared/components/crud/TableSelectionCell";
import { formatTableValue } from "@/shared/utils/tableData";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const PRODUCT_TABLE_COLUMNS = [
  { key: "product", label: "Produk" },
  { key: "store", label: "Toko", defaultVisible: false },
  { key: "mode", label: "Mode" },
  { key: "price", label: "Harga" },
  { key: "stock", label: "Stok" },
  { key: "status", label: "Status Admin" },
  { key: "active", label: "Status Seller" },
];

function isVisible(visibleSet, key) {
  return !visibleSet || visibleSet.has(key);
}

export const SellerProductTable = memo(function SellerProductTable({
  rows,
  onEdit,
  onToggleActive,
  onStatusChange,
  pendingId,
  portal = "seller",
  columns = PRODUCT_TABLE_COLUMNS,
  visibleSet,
  selectionEnabled = false,
  selectedIds = new Set(),
  allSelected = false,
  onToggleRow,
  onToggleAll,
}) {
  const admin = portal === "admin";
  const rawColumns = columns.filter((column) => column.rawKey && isVisible(visibleSet, column.key));

  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
            <tr>
              <TableSelectionHeader enabled={selectionEnabled} checked={allSelected} onToggle={onToggleAll} />
              {isVisible(visibleSet, "product") ? <th className="px-4 py-3">Produk</th> : null}
              {admin && isVisible(visibleSet, "store") ? <th className="px-4 py-3">Toko</th> : null}
              {isVisible(visibleSet, "mode") ? <th className="px-4 py-3">Mode</th> : null}
              {isVisible(visibleSet, "price") ? <th className="px-4 py-3">Harga</th> : null}
              {isVisible(visibleSet, "stock") ? <th className="px-4 py-3">Stok</th> : null}
              {admin && isVisible(visibleSet, "status") ? <th className="px-4 py-3">Status Admin</th> : null}
              {isVisible(visibleSet, "active") ? <th className="px-4 py-3">Status Seller</th> : null}
              {rawColumns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((product) => (
              <tr key={product.id} onClick={() => onEdit(product)} className="cursor-pointer hover:bg-slate-50" title="Klik untuk edit">
                <TableSelectionCell enabled={selectionEnabled} checked={selectedIds.has(String(product.id))} onToggle={() => onToggleRow?.(product.id)} />
                {isVisible(visibleSet, "product") ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden bg-slate-100">
                        {product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-extrabold text-slate-900">{toTitleCase(product.name)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{product.sku || "SKU otomatis"}</p>
                      </div>
                    </div>
                  </td>
                ) : null}
                {admin && isVisible(visibleSet, "store") ? <td className="px-4 py-3 font-bold text-slate-700">{toTitleCase(product.storeName) || "-"}</td> : null}
                {isVisible(visibleSet, "mode") ? <td className="px-4 py-3 text-slate-600">{product.mode === "variant" ? `${product.variants.length} variant` : "Tanpa variant"}</td> : null}
                {isVisible(visibleSet, "price") ? <td className="px-4 py-3 font-bold text-slate-800">{formatPrice(product.price)}</td> : null}
                {isVisible(visibleSet, "stock") ? <td className="px-4 py-3 text-slate-600">{product.stock.toLocaleString("id-ID")}</td> : null}
                {admin && isVisible(visibleSet, "status") ? (
                  <td className="px-4 py-3">
                    <div onClick={(event) => event.stopPropagation()} className="w-36">
                      <SearchableSelect
                        value={product.status}
                        disabled={pendingId === product.id}
                        onChange={(nextValue) => onStatusChange?.(product, nextValue)}
                        options={[
                          { value: "draft", label: "Draft" },
                          { value: "published", label: "Published" },
                          { value: "archived", label: "Archived" },
                        ]}
                        clearable={false}
                        buttonClassName="h-8 px-2 text-xs"
                      />
                    </div>
                  </td>
                ) : null}
                {isVisible(visibleSet, "active") ? (
                  <td className="px-4 py-3">
                    <InlineActiveSwitch checked={product.isActive} pending={pendingId === product.id} onChange={(checked) => onToggleActive?.(product, checked)} compact />
                    {!admin ? <div className="mt-1"><StatusBadge status={product.status} /></div> : null}
                  </td>
                ) : null}
                {rawColumns.map((column) => <td key={column.key} className="max-w-72 truncate px-4 py-3 text-slate-600">{formatTableValue(product.raw?.[column.rawKey])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
