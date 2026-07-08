import { getAdminCatalogGroups } from "@/features/admin/adminMockService";

export async function getCatalogGroupAdminRows() {
  return getAdminCatalogGroups();
}
