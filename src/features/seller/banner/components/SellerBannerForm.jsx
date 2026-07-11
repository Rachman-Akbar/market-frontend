import { useState } from "react";
import { getSellerStoreError, useSellerStore, useUpdateSellerStore } from "@/features/seller/store/services/sellerStoreService";

export function SellerBannerForm() {
  const storeQuery = useSellerStore();
  const updateMutation = useUpdateSellerStore();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !storeQuery.data) return;
    const formData = new FormData();
    formData.append("banner", file);
    try {
      await updateMutation.mutateAsync({ id: storeQuery.data.id, formData });
      setMessage("Banner toko berhasil diperbarui.");
      setFile(null);
    } catch (error) {
      setMessage(getSellerStoreError(error));
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Banner toko</h2>
          <p className="text-sm text-slate-500">Unggah visual hero yang ditampilkan pada profil toko.</p>
        </div>
        <span className="material-symbols-outlined text-emerald-600">view_carousel</span>
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-slate-500">File banner</span>
        <input type="file" required accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
      </label>
      {message ? <p className="mt-3 text-sm font-semibold text-slate-600">{message}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <button disabled={!file || updateMutation.isPending} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">{updateMutation.isPending ? "Menyimpan..." : "Simpan Banner"}</button>
      </div>
    </form>
  );
}
