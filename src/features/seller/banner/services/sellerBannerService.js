import { useSellerStore, assetUrl } from "@/features/seller/store/services/sellerStoreService";

export function useSellerBanners() {
  const storeQuery = useSellerStore();
  const store = storeQuery.data;
  const rows = store?.bannerUrl
    ? [{
        id: `store-${store.id}`,
        image: assetUrl(store.bannerUrl),
        title: store.name,
        placement: "Store Hero",
        status: store.isActive ? "active" : "inactive",
        ctr: "-",
        startsAt: store.createdAt ? new Date(store.createdAt).toLocaleDateString("id-ID") : "-",
        endsAt: "-",
      }]
    : [];
  return { ...storeQuery, data: rows };
}
