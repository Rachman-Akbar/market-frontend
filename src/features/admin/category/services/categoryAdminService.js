import { getAdminCategories } from "@/features/admin/adminMockService";

export async function getCategoryAdminRows() {
  return getAdminCategories();
}
