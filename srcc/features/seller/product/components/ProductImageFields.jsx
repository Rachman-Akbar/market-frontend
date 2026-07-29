import { memo } from "react";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { createClientId } from "@/core/utils/clientId";

export const ProductImageFields = memo(function ProductImageFields({ images, error, onChange }) {
  const update = (index, field, value) => {
    onChange(images.map((image, imageIndex) => imageIndex === index ? { ...image, [field]: value } : image));
  };

  const remove = (index) => onChange(images.filter((_, imageIndex) => imageIndex !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-extrabold text-slate-800">Gambar produk</p>
          <p className="text-xs text-slate-500">URL pertama menjadi gambar utama.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...images, { clientId: createClientId("image"), url: "", altText: "" }])}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
        >
          Tambah Gambar
        </button>
      </div>
      {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
      {images.map((image, index) => (
        <div key={image.id || image.clientId || `image-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_180px_36px]">
          <FormField label={index === 0 ? "URL gambar utama" : `URL galeri ${index}`}>
            <input value={image.url} onChange={(event) => update(index, "url", event.target.value)} className={inputClassName} placeholder="https://..." />
          </FormField>
          <FormField label="Alt text">
            <input value={image.altText || ""} onChange={(event) => update(index, "altText", event.target.value)} className={inputClassName} placeholder="Deskripsi gambar" />
          </FormField>
          <button type="button" onClick={() => remove(index)} className="mt-6 flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label="Hapus gambar">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ))}
    </div>
  );
});
