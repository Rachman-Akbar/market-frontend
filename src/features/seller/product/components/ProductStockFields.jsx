import { memo, useMemo } from "react";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { InteractiveColGroup, InteractiveTableHeader } from "@/shared/components/table/InteractiveTableHeader";
import { TableLayoutHint } from "@/shared/components/table/TableLayoutHint";
import { useTableColumnLayout } from "@/shared/hooks/useTableColumnLayout";
import { toTitleCase } from "@/shared/utils/textFormatter";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export const ProductStockFields = memo(function ProductStockFields({ mode, sku, price, stock, poStock, variants, errors, onSimpleChange, onVariantsChange }) {
  const totals = useMemo(() => mode === "variant"
    ? variants.reduce(
        (total, variant) => ({
          stock: total.stock + Number(variant.stock || 0),
          poStock: total.poStock + Number(variant.poStock || 0),
        }),
        { stock: 0, poStock: 0 },
      )
    : { stock: Number(stock || 0), poStock: Number(poStock || 0) }, [mode, stock, poStock, variants]);
  const variantColumns = useMemo(() => [
    { key: "variant", label: "Variant", width: 240 },
    { key: "sku", label: "SKU", width: 190 },
    { key: "price", label: "Harga", width: 170 },
    { key: "stock", label: "Stok", width: 130 },
    { key: "poStock", label: "Stok PO", width: 130 },
  ], []);
  const layout = useTableColumnLayout({ storageKey: "seller.product-editor.variant-stock", columns: variantColumns });

  const updateVariant = (index, field, value) => {
    onVariantsChange(variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [field]: value } : variant));
  };

  const renderCell = (column, variant, index) => {
    if (column.key === "variant") return <td key={column.key} className="px-4 py-3"><p className="truncate font-bold text-slate-900">{toTitleCase(variant.name) || `Variant ${index + 1}`}</p>{index === 0 ? <span className="mt-1 inline-flex rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">Default</span> : null}</td>;
    if (column.key === "sku") return <td key={column.key} className="truncate px-4 py-3 font-mono text-xs text-slate-600">{variant.sku || "-"}</td>;
    if (column.key === "price") return <td key={column.key} className="px-4 py-3"><input type="number" min="0" value={variant.price} onChange={(event) => updateVariant(index, "price", event.target.value)} className={inputClassName} aria-label={`Harga ${variant.name || `variant ${index + 1}`}`} /></td>;
    if (column.key === "stock") return <td key={column.key} className="px-4 py-3"><input type="number" min="0" value={variant.stock} disabled className={`${inputClassName} cursor-not-allowed bg-slate-100 text-slate-500`} aria-label={`Stok ${variant.name || `variant ${index + 1}`}`} /><p className="mt-0.5 text-[10px] font-semibold text-slate-400">Saldo riil dikelola di Persediaan</p></td>;
    return <td key={column.key} className="px-4 py-3"><input type="number" min="0" value={variant.poStock} onChange={(event) => updateVariant(index, "poStock", event.target.value)} className={inputClassName} title="Kuota stok untuk pesanan Pre-Order (PO)" aria-label={`Stok PO ${variant.name || `variant ${index + 1}`}`} /><p className="mt-0.5 text-[10px] font-semibold text-slate-400">Khusus pesanan Pre-Order</p></td>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-800">Pengaturan Harga & Stok</p>
          <p className="mt-0.5 text-xs text-slate-500">Harga dapat diubah di sini. Stok marketplace (Stok) berubah melalui Persediaan agar histori dan bahan baku sinkron. Stok PO hanya terpakai untuk pesanan Pre-Order.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white px-4 py-2 text-right ring-1 ring-inset ring-slate-200"><p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Tersedia marketplace</p><p className="text-lg font-extrabold text-slate-900">{formatNumber(totals.stock)}</p></div>
          <div className="rounded-lg bg-white px-4 py-2 text-right ring-1 ring-inset ring-slate-200"><p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-500">Stok PO</p><p className="text-lg font-extrabold text-amber-600">{formatNumber(totals.poStock)}</p></div>
          <div className="rounded-lg bg-white px-4 py-2 text-right ring-1 ring-inset ring-slate-200"><p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Total stok</p><p className="text-lg font-extrabold text-slate-900">{formatNumber(totals.stock + totals.poStock)}</p></div>
        </div>
      </div>
      {mode === "simple" ? <div className="grid gap-4 md:grid-cols-3"><FormField label="SKU"><input value={sku} onChange={(event) => onSimpleChange("sku", event.target.value)} className={inputClassName} placeholder="Kosongkan untuk otomatis" /></FormField><FormField label="Harga" error={errors.price} required><input type="number" min="0" value={price} onChange={(event) => onSimpleChange("price", event.target.value)} className={inputClassName} /></FormField><FormField label="Stok"><input type="number" min="0" value={stock} disabled className={`${inputClassName} cursor-not-allowed bg-slate-100 text-slate-500`} /><p className="mt-1 text-[11px] font-semibold text-slate-500">Gunakan menu Persediaan → Stok Produk untuk Stock/Restock.</p></FormField><FormField label="Stok PO" hint="Kuota untuk pesanan Pre-Order (PO). Tidak terpakai untuk pesanan langsung."><input type="number" min="0" value={poStock} onChange={(event) => onSimpleChange("poStock", event.target.value)} className={inputClassName} /></FormField></div> : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="px-3 pt-2"><TableLayoutHint onReset={layout.resetLayout} /></div>
          <div className="overflow-x-auto"><table className="table-fixed text-left text-sm" style={{ width: Math.max(layout.totalWidth, 820), minWidth: "100%" }}><InteractiveColGroup columns={layout.orderedColumns} getColumnStyle={layout.getColumnStyle} /><thead className="bg-slate-100 text-xs font-extrabold text-slate-600"><tr>{layout.orderedColumns.map((column) => <InteractiveTableHeader key={column.key} columnKey={column.key} headerProps={layout.getHeaderProps(column.key)} style={layout.getColumnStyle(column.key)} onResizeStart={layout.startResize} onResetWidth={layout.resetWidth} dragging={layout.dragKey === column.key} dropTarget={layout.dropKey === column.key}>{column.label}</InteractiveTableHeader>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{variants.map((variant, index) => <tr key={variant.id || variant.clientId || `stock-${index}`}>{layout.orderedColumns.map((column) => renderCell(column, variant, index))}</tr>)}</tbody></table></div>
          {errors.variantStock ? <p className="border-t border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">{errors.variantStock}</p> : null}
        </div>
      )}
    </div>
  );
});