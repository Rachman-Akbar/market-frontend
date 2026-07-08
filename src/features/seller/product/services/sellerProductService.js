import { getSellerProducts } from "@/features/seller/services/sellerMockService";

export async function getSellerProductRows() {
  return getSellerProducts();
}
