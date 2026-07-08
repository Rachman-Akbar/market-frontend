export function SellerBannerForm() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Buat banner baru</h2>
          <p className="text-sm text-slate-500">Dummy form campaign toko.</p>
        </div>
        <span className="material-symbols-outlined text-emerald-600">view_carousel</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Judul", value: "Weekend Sport Sale" },
          { label: "Placement", value: "Store Hero" },
          { label: "Tanggal mulai", value: "2026-07-18" },
          { label: "Tanggal akhir", value: "2026-07-21" },
        ].map((field) => (
          <label key={field.label} className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">{field.label}</span>
            <input defaultValue={field.value} className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Preview</button>
        <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">Simpan Banner</button>
      </div>
    </div>
  );
}
