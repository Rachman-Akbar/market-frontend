import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerStoreProfileCard } from "@/features/seller/store/components/SellerStoreProfileCard";
import { SellerStoreSettingsPanel } from "@/features/seller/store/components/SellerStoreSettingsPanel";
import { useSellerStore } from "@/features/seller/store/services/sellerStoreService";

export default function SellerStorePage() {
  const storeQuery = useSellerStore();
  const store = storeQuery.data || null;

  return (
    <SellerPanelShell title="Profil Toko" subtitle="Kelola identitas toko, operasional gudang, dan informasi yang tampil untuk pembeli.">
      <div className="space-y-6">
        {storeQuery.isLoading ? <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Memuat data toko...</div> : null}
        <SellerStoreProfileCard store={store} />
        <SellerStoreSettingsPanel store={store} />
      </div>
    </SellerPanelShell>
  );
}
