export function CategoryAdminForm() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Draft kategori cepat</h2>
          <p className="text-sm text-slate-500">Form dummy mengikuti pola domain category untuk kebutuhan admin.</p>
        </div>
        <span className="material-symbols-outlined text-teal-600">account_tree</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { label: "Nama kategori", value: "Aksesoris Laptop" },
          { label: "Slug", value: "aksesoris-laptop" },
          { label: "Catalog group", value: "Elektronik" },
          { label: "Parent", value: "Laptop" },
        ].map((field) => (
          <label key={field.label} className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">{field.label}</span>
            <input defaultValue={field.value} className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white" />
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Reset</button>
        <button className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700">Simpan Draft</button>
      </div>
    </div>
  );
}
