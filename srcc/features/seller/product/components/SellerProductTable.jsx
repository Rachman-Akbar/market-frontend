import { memo } from "react";
import { formatPrice } from "@/shared/utils/utils";
import { RowActions } from "@/shared/components/crud/RowActions";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { toTitleCase } from "@/shared/utils/textFormatter";

export const SellerProductTable = memo(function SellerProductTable({ rows, onEdit, onDelete, deletingId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Produk</th>
              <th className="px-5 py-3">Mode</th>
              <th className="px-5 py-3">Harga</th>
              <th className="px-5 py-3">Stok</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                      {product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-[320px] truncate font-extrabold text-slate-900">{toTitleCase(product.name)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{product.sku || "SKU otomatis"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{product.mode === "variant" ? `${product.variants.length} variant` : "Tanpa variant"}</td>
                <td className="px-5 py-4 font-bold text-slate-800">{formatPrice(product.price)}</td>
                <td className="px-5 py-4 text-slate-600">{product.stock.toLocaleString("id-ID")}</td>
                <td className="px-5 py-4"><div className="flex flex-col items-start gap-1"><StatusBadge status={product.status} /><StatusBadge status={product.isActive ? "active" : "inactive"} /></div></td>
                <td className="px-5 py-4"><RowActions onEdit={() => onEdit(product)} onDelete={() => onDelete(product)} disabled={deletingId === product.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
