export function SellerProductEditor() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Editor cepat produk</h2>
          <p className="text-sm text-slate-500">Dummy form untuk menjaga konsistensi layout seller.</p>
        </div>
        <span className="material-symbols-outlined text-emerald-600">edit_square</span>
      </div>
      <div className="grid gap-3">
        {[
          { label: "Nama produk", value: "Sepatu Phoenix Running" },
          { label: "SKU", value: "PHX-RUN-37" },
          { label: "Harga", value: "162000" },
          { label: "Stok", value: "128" },
        ].map((field) => (
          <label key={field.label} className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">{field.label}</span>
            <input defaultValue={field.value} className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
          </label>
        ))}
        <label className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500">Deskripsi singkat</span>
          <textarea defaultValue="Sepatu running ringan dengan upper breathable dan outsole fleksibel." className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Reset</button>
        <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">Simpan</button>
      </div>
    </div>
  );
}
