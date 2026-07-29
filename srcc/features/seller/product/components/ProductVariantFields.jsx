import { memo } from "react";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { createClientId } from "@/core/utils/clientId";
import { toTitleCase } from "@/shared/utils/textFormatter";

function emptyValue() {
  return { clientId: createClientId("attribute-value"), attributeId: "", value: "" };
}

function emptyVariant() {
  return { clientId: createClientId("variant"), id: null, name: "", sku: "", price: 0, stock: 0, values: [] };
}

export const ProductVariantFields = memo(function ProductVariantFields({ variants, attributes, onChange }) {
  const updateVariant = (index, field, value) => {
    onChange(variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [field]: value } : variant));
  };

  const updateValue = (variantIndex, valueIndex, field, value) => {
    onChange(variants.map((variant, index) => {
      if (index !== variantIndex) return variant;
      return {
        ...variant,
        values: variant.values.map((item, itemIndex) => itemIndex === valueIndex ? { ...item, [field]: value } : item),
      };
    }));
  };

  const addValue = (variantIndex) => {
    onChange(variants.map((variant, index) => index === variantIndex ? { ...variant, values: [...variant.values, emptyValue()] } : variant));
  };

  const removeValue = (variantIndex, valueIndex) => {
    onChange(variants.map((variant, index) => index === variantIndex ? { ...variant, values: variant.values.filter((_, itemIndex) => itemIndex !== valueIndex) } : variant));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-800">Daftar Variant</p>
          <p className="mt-0.5 text-xs text-slate-500">Atur nama, SKU, dan kombinasi atribut. Harga serta stok diisi pada tab Stok.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...variants, emptyVariant()])}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          Tambah Variant
        </button>
      </div>

      {variants.map((variant, index) => (
        <div key={variant.id || variant.clientId || `variant-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-extrabold text-slate-700 ring-1 ring-inset ring-slate-200">{index + 1}</span>
              <div>
                <p className="text-xs font-extrabold text-slate-800">{toTitleCase(variant.name) || `Variant ${index + 1}`}</p>
                {index === 0 ? <p className="text-[10px] font-bold text-emerald-700">Variant default</p> : null}
              </div>
            </div>
            {variants.length > 1 ? (
              <button type="button" onClick={() => onChange(variants.filter((_, variantIndex) => variantIndex !== index))} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
            ) : null}
          </div>

          <div className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Nama variant" required>
                <input value={variant.name} onChange={(event) => updateVariant(index, "name", event.target.value)} className={inputClassName} placeholder="Contoh: Merah / XL" />
              </FormField>
              <FormField label="SKU" required>
                <input value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} className={inputClassName} placeholder="SKU-001" />
              </FormField>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-slate-700">Atribut variant</p>
                  <p className="text-[11px] text-slate-500">Contoh ukuran, warna, kapasitas, atau material.</p>
                </div>
                <button type="button" onClick={() => addValue(index)} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">+ Tambah atribut</button>
              </div>

              <div className="space-y-2">
                {variant.values.map((item, valueIndex) => (
                  <div key={item.clientId || `${index}-${valueIndex}`} className="grid gap-2 sm:grid-cols-[190px_1fr_36px]">
                    <select value={item.attributeId} onChange={(event) => updateValue(index, valueIndex, "attributeId", event.target.value)} className={inputClassName}>
                      <option value="">Pilih atribut</option>
                      {attributes.map((attribute) => <option key={attribute.id} value={attribute.id}>{toTitleCase(attribute.name)}</option>)}
                    </select>
                    <input value={item.value} onChange={(event) => updateValue(index, valueIndex, "value", event.target.value)} className={inputClassName} placeholder="Contoh: Merah, XL, 128 GB" />
                    <button type="button" onClick={() => removeValue(index, valueIndex)} className="flex h-11 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Hapus atribut">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
                {!variant.values.length ? <p className="py-2 text-center text-xs text-slate-400">Belum ada atribut pada variant ini.</p> : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
