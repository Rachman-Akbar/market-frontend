import { memo, useMemo } from "react";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { toTitleCase } from "@/shared/utils/textFormatter";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export const ProductStockFields = memo(function ProductStockFields({
  mode,
  sku,
  price,
  stock,
  variants,
  errors,
  onSimpleChange,
  onVariantsChange,
}) {
  const totalStock = useMemo(
    () => mode === "variant"
      ? variants.reduce((total, variant) => total + Number(variant.stock || 0), 0)
      : Number(stock || 0),
    [mode, stock, variants],
  );

  const updateVariant = (index, field, value) => {
    onVariantsChange(variants.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, [field]: value } : variant
    )));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-800">Pengaturan Harga & Stok</p>
          <p className="mt-0.5 text-xs text-slate-500">Stok total mengikuti mode produk dan seluruh variant yang tersimpan.</p>
        </div>
        <div className="rounded-lg bg-white px-4 py-2 text-right ring-1 ring-inset ring-slate-200">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Total stok</p>
          <p className="text-lg font-extrabold text-slate-900">{formatNumber(totalStock)}</p>
        </div>
      </div>

      {mode === "simple" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="SKU">
            <input value={sku} onChange={(event) => onSimpleChange("sku", event.target.value)} className={inputClassName} placeholder="Kosongkan untuk otomatis" />
          </FormField>
          <FormField label="Harga" error={errors.price} required>
            <input type="number" min="0" value={price} onChange={(event) => onSimpleChange("price", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Stok" error={errors.stock} required>
            <input type="number" min="0" value={stock} onChange={(event) => onSimpleChange("stock", event.target.value)} className={inputClassName} />
          </FormField>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-extrabold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {variants.map((variant, index) => (
                  <tr key={variant.id || variant.clientId || `stock-${index}`}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{toTitleCase(variant.name) || `Variant ${index + 1}`}</p>
                      {index === 0 ? <span className="mt-1 inline-flex rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">Default</span> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{variant.sku || "-"}</td>
                    <td className="min-w-44 px-4 py-3">
                      <input type="number" min="0" value={variant.price} onChange={(event) => updateVariant(index, "price", event.target.value)} className={inputClassName} aria-label={`Harga ${variant.name || `variant ${index + 1}`}`} />
                    </td>
                    <td className="min-w-36 px-4 py-3">
                      <input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, "stock", event.target.value)} className={inputClassName} aria-label={`Stok ${variant.name || `variant ${index + 1}`}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.variantStock ? <p className="border-t border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">{errors.variantStock}</p> : null}
        </div>
      )}
    </div>
  );
});
