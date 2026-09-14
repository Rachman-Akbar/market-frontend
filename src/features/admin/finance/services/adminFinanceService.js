import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapApiData, unwrapCollection } from "@/core/utils/apiClient";
import { toBoolean } from "@/core/utils/boolean";

export const adminFinanceKeys = {
  feeConfigs: ["admin", "finance", "fee-configs"],
  withdrawals: (params = {}) => ["admin", "finance", "withdrawals", params],
};

export function normalizeFeeConfig(row = {}) {
  return {
    id: Number(row.id || 0),
    categoryId: row.category_id || row.categoryId || null,
    categoryName: row.category_name || row.categoryName || "",
    name: row.name || "",
    code: row.code || "",
    percentage: Number(row.percentage || 0),
    fixedAmount: Number(row.fixed_amount || row.fixedAmount || 0),
    minFee: row.min_fee != null ? Number(row.min_fee) : null,
    maxFee: row.max_fee != null ? Number(row.max_fee) : null,
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    description: row.description || "",
    raw: row,
  };
}

export function normalizeWithdrawal(row = {}) {
  return {
    id: Number(row.id || 0),
    withdrawalNumber: row.withdrawal_number || row.withdrawalNumber || "",
    storeId: Number(row.store_id || row.storeId || 0),
    storeName: row.store_name || row.storeName || "",
    amount: Number(row.amount || 0),
    method: row.method || "",
    bankDetails: row.bank_details || row.bankDetails || {},
    status: row.status || "pending",
    rejectionReason: row.rejection_reason || row.rejectionReason || null,
    processedAt: row.processed_at || row.processedAt || null,
    createdAt: row.created_at || row.createdAt || null,
    raw: row,
  };
}

function serializeFeeConfig(values, partial = false) {
  const payload = {
    category_id: values.categoryId ? Number(values.categoryId) : null,
    name: values.name,
    code: values.code,
    percentage: Number(values.percentage || 0),
    fixed_amount: values.fixedAmount != null ? Number(values.fixedAmount) : null,
    min_fee: values.minFee != null ? Number(values.minFee) : null,
    max_fee: values.maxFee != null ? Number(values.maxFee) : null,
    description: values.description || null,
  };
  if (partial) {
    const allowed = new Set(["category_id", "name", "percentage", "fixed_amount", "min_fee", "max_fee", "is_active", "description"]);
    Object.keys(payload).forEach((key) => {
      if (!allowed.has(key)) delete payload[key];
    });
    payload.is_active = Boolean(values.isActive);
  }
  return payload;
}

// ── Fee configs ──────────────────────────────────────────────────────────

export async function getAdminFeeConfigs() {
  const response = await apiClient.get("/api/v1/finance/admin/fee-configs");
  return unwrapCollection(response.data).map(normalizeFeeConfig);
}

export async function createAdminFeeConfig(values) {
  const response = await apiClient.post("/api/v1/finance/admin/fee-configs", serializeFeeConfig(values));
  return unwrapApiData(response.data);
}

export async function updateAdminFeeConfig(id, values) {
  const response = await apiClient.put(`/api/v1/finance/admin/fee-configs/${id}`, serializeFeeConfig(values, true));
  return unwrapApiData(response.data);
}

export async function deleteAdminFeeConfig(id) {
  return apiClient.delete(`/api/v1/finance/admin/fee-configs/${id}`);
}

export function useAdminFeeConfigs() {
  return useQuery({
    queryKey: adminFinanceKeys.feeConfigs,
    queryFn: getAdminFeeConfigs,
  });
}

export function useCreateAdminFeeConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminFeeConfig,
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminFinanceKeys.feeConfigs }),
  });
}

export function useUpdateAdminFeeConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updateAdminFeeConfig(id, values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminFinanceKeys.feeConfigs }),
  });
}

export function useDeleteAdminFeeConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminFeeConfig,
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminFinanceKeys.feeConfigs }),
  });
}

// ── Withdrawals (admin) ──────────────────────────────────────────────────

export async function getAdminWithdrawals(params = {}) {
  const response = await apiClient.get("/api/v1/finance/admin/withdrawals", { params });
  const payload = response.data?.data ?? response.data;
  const rows = unwrapCollection({ ...response.data, data: payload });
  return {
    rows: rows.map(normalizeWithdrawal),
    meta: response.data?.meta || payload?.meta || { current_page: 1, last_page: 1, total: rows.length },
    pendingCount: Number(response.data?.pending_count ?? 0),
  };
}

export async function approveAdminWithdrawal(id) {
  const response = await apiClient.post(`/api/v1/finance/admin/withdrawals/${id}/approve`);
  return unwrapApiData(response.data);
}

export async function rejectAdminWithdrawal(id, reason) {
  const response = await apiClient.post(`/api/v1/finance/admin/withdrawals/${id}/reject`, { reason });
  return unwrapApiData(response.data);
}

export function useAdminWithdrawals(params = {}) {
  return useQuery({
    queryKey: adminFinanceKeys.withdrawals(params),
    queryFn: () => getAdminWithdrawals(params),
  });
}

export function useApproveAdminWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAdminWithdrawal,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin", "finance", "withdrawals"] }),
  });
}

export function useRejectAdminWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectAdminWithdrawal(id, reason),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin", "finance", "withdrawals"] }),
  });
}

export function getFinanceError(error, fallback = "Data keuangan gagal diproses.") {
  return getApiMessage(error, fallback);
}