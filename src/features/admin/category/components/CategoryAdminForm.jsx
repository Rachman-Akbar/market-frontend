export function CategoryAdminForm() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Editor kategori</h2>
          <p className="text-sm text-slate-500">Pilih baris kategori untuk mengubah data melalui endpoint katalog.</p>
        </div>
        <span className="material-symbols-outlined text-teal-600">account_tree</span>
      </div>
      <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        Belum ada kategori yang dipilih.
      </div>
    </div>
  );
}
