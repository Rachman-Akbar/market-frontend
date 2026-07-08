import { getSellerStoreProfile } from "@/features/seller/services/sellerMockService";

export async function getSellerStoreData() {
  return getSellerStoreProfile();
}
