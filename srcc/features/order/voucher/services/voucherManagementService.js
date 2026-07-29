import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { toSqlDateTime } from "@/core/utils/dateTime";

export const voucherManagementKeys = { all: ["management", "vouchers"] };

export function normalizeVoucher(row = {}) {
  return {
    id: Number(row.id || 0),
    code: row.code || "",
    name: row.name || "",
    image: row.image || "",
    imageUrl: row.imageUrl || row.image_url || "",
    discountType: row.discountType || row.discount_type || "fixed",
    discountValue: Number(row.discountValue ?? row.discount_value ?? 0),
    minSpend: Number(row.minSpend ?? row.min_spend ?? 0),
    maxDiscount: row.maxDiscount ?? row.max_discount ?? "",
    startsAt: row.startsAt || row.starts_at || "",
    endsAt: row.endsAt || row.ends_at || "",
    usageLimit: Number(row.usageLimit ?? row.usage_limit ?? 0),
    usedCount: Number(row.usedCount ?? row.used_count ?? 0),
    storeId: row.storeId ?? row.store_id ?? null,
    isActive: Boolean(row.isActive ?? row.is_active ?? true),
    createdAt: row.createdAt || row.created_at || null,
  };
}

function serialize(values) {
  const formData = new FormData();
  const entries = {
    code: String(values.code || "").trim(),
    name: String(values.name || "").trim(),
    discount_type: values.discountType,
    discount_value: Number(values.discountValue || 0),
    min_spend: Number(values.minSpend || 0),
    max_discount: values.maxDiscount === "" ? "" : Number(values.maxDiscount || 0),
    starts_at: toSqlDateTime(values.startsAt),
    ends_at: toSqlDateTime(values.endsAt),
    usage_limit: Number(values.usageLimit || 0),
    is_active: values.isActive ? 1 : 0,
  };

  if (values.storeId) entries.store_id = Number(values.storeId);
  Object.entries(entries).forEach(([key, value]) => formData.append(key, String(value)));
  if (values.imageFile) formData.append("image", values.imageFile);
  return formData;
}

export async function getManagedVouchers(params = {}) {
  const response = await apiClient.get("/api/v1/order/vouchers/manage/list", { params });
  return unwrapCollection(response.data).map(normalizeVoucher);
}

export async function createVoucher(values) {
  const response = await apiClient.post("/api/v1/order/vouchers", serialize(values));
  return normalizeVoucher(unwrapApiData(response.data));
}

export async function updateVoucher(id, values) {
  const formData = serialize(values);
  formData.append("_method", "PUT");
  const response = await apiClient.post(`/api/v1/order/vouchers/${id}`, formData);
  return normalizeVoucher(unwrapApiData(response.data));
}

export async function deleteVoucher(id) {
  return apiClient.delete(`/api/v1/order/vouchers/${id}`);
}

export function useManagedVouchers(params = {}) {
  return useQuery({ queryKey: [...voucherManagementKeys.all, params], queryFn: () => getManagedVouchers(params) });
}

function useVoucherMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: voucherManagementKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["order", "vouchers"] }),
      ]);
    },
  });
}

export function useCreateVoucher() { return useVoucherMutation(createVoucher); }
export function useUpdateVoucher() { return useVoucherMutation(({ id, values }) => updateVoucher(id, values)); }
export function useDeleteVoucher() { return useVoucherMutation(deleteVoucher); }
export function getVoucherManagementError(error) { return getApiMessage(error, "Voucher gagal diproses."); }
