import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";
import { normalizeStorefront } from "@/features/catalog/store/services/storefrontService";

export const storeManagementKeys = {
  all: ["management", "stores"],
  list: (params = {}) => ["management", "stores", params],
};

export async function getManagedStores(params = {}) {
  const response = await apiClient.get("/api/v1/seller/stores/manage", { params });
  return unwrapCollection(response.data).map(normalizeStorefront);
}

export function useManagedStores(params = {}, options = {}) {
  return useQuery({
    queryKey: storeManagementKeys.list(params),
    queryFn: () => getManagedStores(params),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}
