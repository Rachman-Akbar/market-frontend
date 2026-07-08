export function SellerStoreSettingsPanel({ store }) {
  if (!store) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">Informasi operasional</h2>
        <div className="mt-4 space-y-3">
          {[
            { label: "Jam operasional", value: store.operationHours },
            { label: "Gudang utama", value: store.warehouse },
            { label: "Bergabung", value: store.joinedAt },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">Pengaturan toko</h2>
        <div className="mt-4 grid gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Nama toko</span>
            <input defaultValue={store.name} className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Deskripsi</span>
            <textarea defaultValue={store.description} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}
