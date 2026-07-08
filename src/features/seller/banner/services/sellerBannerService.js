import { getSellerBanners } from "@/features/seller/services/sellerMockService";

export async function getSellerBannerRows() {
  return getSellerBanners();
}
