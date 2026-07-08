import { useEffect, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerStoreProfileCard } from "@/features/seller/store/components/SellerStoreProfileCard";
import { SellerStoreSettingsPanel } from "@/features/seller/store/components/SellerStoreSettingsPanel";
import { getSellerStoreData } from "@/features/seller/store/services/sellerStoreService";

export default function SellerStorePage() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    getSellerStoreData().then(setStore);
  }, []);

  return (
    <SellerPanelShell title="Profil Toko" subtitle="Kelola identitas toko, operasional gudang, dan informasi yang tampil untuk pembeli.">
      <div className="space-y-6">
        <SellerStoreProfileCard store={store} />
        <SellerStoreSettingsPanel store={store} />
      </div>
    </SellerPanelShell>
  );
}
