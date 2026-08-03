import StoreDetailPage from "@/features/catalog/store/pages/StoreDetailPage";
import { useSellerStore } from "@/features/seller/store/services/sellerStoreService";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { AsyncState } from "@/shared/components/feedback/AsyncState";

export default function SellerStorePreviewPage() {
  const storeQuery = useSellerStore();

  return (
    <SellerPanelShell title="Preview Toko" subtitle="Pratinjau halaman toko tetap berada di Seller Center dan tidak memindahkan sesi ke marketplace.">
      {storeQuery.isLoading ? <AsyncState loading /> : null}
      {storeQuery.error ? <AsyncState error="Preview toko tidak dapat dimuat." /> : null}
      {storeQuery.data ? <StoreDetailPage storeOverride={storeQuery.data} embedded /> : null}
    </SellerPanelShell>
  );
}
