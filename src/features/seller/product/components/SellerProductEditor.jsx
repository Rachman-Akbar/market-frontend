export function SellerProductEditor() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Editor cepat produk</h2>
          <p className="text-sm text-slate-500">Pilih produk pada tabel untuk membuka editor.</p>
        </div>
        <span className="material-symbols-outlined text-emerald-600">edit_square</span>
      </div>
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">Belum ada produk yang dipilih.</div>
    </div>
  );
}
