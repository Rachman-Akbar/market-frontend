import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiMessage, unwrapCollection } from "@/core/utils/apiClient";
import { toBoolean } from "@/core/utils/boolean";

export const ppobKeys = {
  categories: ["ppob", "categories"],
  operators: (category) => ["ppob", "operators", category],
  products: (category, operatorId) => ["ppob", "products", category, operatorId],
  transactions: (params = {}) => ["ppob", "transactions", params],
  transaction: (id) => ["ppob", "transactions", id],
  invoices: (params = {}) => ["ppob", "receipts", params],
  invoice: (ref) => ["ppob", "receipts", ref],
  adminDashboard: ["ppob", "admin", "dashboard"],
  adminFinance: (params = {}) => ["ppob", "admin", "finance", params],
  adminBalance: ["ppob", "admin", "balance"],
  adminProducts: (params = {}) => ["ppob", "admin", "products", params],
  adminOperators: (params = {}) => ["ppob", "admin", "operators", params],
  adminPricingRules: (params = {}) => ["ppob", "admin", "pricing-rules", params],
};

function normalizePage(payload, normalizeRow) {
  const source = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const rows = Array.isArray(source) ? source : Array.isArray(source.data) ? source.data : unwrapCollection(payload);
  return {
    rows: (normalizeRow ? rows.map(normalizeRow) : rows),
    meta: payload?.meta || source?.meta || {
      current_page: source?.current_page || 1,
      last_page: source?.last_page || 1,
      total: source?.total || rows.length,
    },
  };
}

export function normalizePpobProduct(row = {}) {
  return {
    id: Number(row.id || 0),
    operatorId: row.operator_id || null,
    category: row.category || "",
    productType: row.product_type || "prepaid",
    providerProductCode: row.provider_product_code || null,
    name: row.name || "",
    brand: row.brand || null,
    nominal: row.nominal || null,
    providerPrice: Number(row.provider_price || 0),
    adminFee: Number(row.admin_fee || 0),
    commission: Number(row.commission || 0),
    margin: Number(row.margin || 0),
    sellingPrice: Number(row.selling_price || 0),
    iconUrl: row.icon_url || null,
    isAvailable: toBoolean(row.is_available ?? row.isAvailable, true),
    raw: row,
  };
}

export function normalizeOperator(row = {}) {
  return {
    id: Number(row.id || 0),
    name: row.name || "",
    slug: row.slug || "",
    category: row.category || "",
    brand: row.brand || null,
    operatorPrefix: row.operator_prefix ?? row.operatorPrefix ?? null,
    iconUrl: row.icon_url || row.iconUrl || null,
    providerName: row.provider_name || row.providerName || null,
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    raw: row,
  };
}

export function normalizePricingRule(row = {}) {
  return {
    id: Number(row.id || 0),
    level: row.level || row.rule_type || null,
    category: row.category || "",
    operatorId: row.operator_id ?? null,
    productId: row.product_id ?? null,
    marginType: row.margin_type ?? row.marginType ?? "fixed",
    marginValue: row.margin_value != null ? Number(row.margin_value) : Number(row.marginValue || 0),
    adminFeeType: row.admin_fee_type ?? row.adminFeeType ?? "fixed",
    adminFeeValue: row.admin_fee_value != null ? Number(row.admin_fee_value) : Number(row.adminFeeValue || 0),
    commissionType: row.commission_type ?? row.commissionType ?? "fixed",
    commissionValue: row.commission_value != null ? Number(row.commission_value) : Number(row.commissionValue || 0),
    minSellingPrice: row.min_selling_price != null ? Number(row.min_selling_price) : null,
    maxSellingPrice: row.max_selling_price != null ? Number(row.max_selling_price) : null,
    priority: Number(row.priority ?? 0),
    minNominal: row.min_nominal != null ? Number(row.min_nominal) : null,
    maxNominal: row.max_nominal != null ? Number(row.max_nominal) : null,
    ruleType: row.rule_type || row.level || "margin",
    value: row.value != null ? Number(row.value) : 0,
    isActive: toBoolean(row.is_active ?? row.isActive, true),
    raw: row,
  };
}

export function normalizePpobTransaction(row = {}) {
  return {
    id: Number(row.id || 0),
    referenceId: row.reference_id || "",
    productName: row.product_name || "",
    category: row.category || "",
    productType: row.product_type || "prepaid",
    customerId: row.customer_id || "",
    customerName: row.customer_name || null,
    totalAmount: Number(row.total_amount || 0),
    status: row.status || "pending",
    paymentStatus: row.payment_status || "pending",
    paymentMethod: row.payment_method || null,
    snapToken: row.snap_token || null,
    midtransClientKey: row.midtrans_client_key || null,
    midtransIsProduction: row.midtrans_is_production != null ? Boolean(row.midtrans_is_production) : null,
    providerMessage: row.provider_message || null,
    trId: row.tr_id || null,
    sn: row.sn || null,
    createdAt: row.created_at || null,
    paidAt: row.paid_at || null,
    completedAt: row.completed_at || null,
    operator: row.operator || null,
    raw: row,
  };
}

// ── Catalog (any authenticated buyer) ────────────────────────────────────

export async function getPpobCategories() {
  const response = await apiClient.get("/api/v1/ppob/categories");
  return unwrapCollection(response.data);
}

export async function getPpobOperators(category) {
  const response = await apiClient.get("/api/v1/ppob/operators", { params: category ? { category } : {} });
  return unwrapCollection(response.data).map(normalizeOperator);
}

export async function getPpobProducts(category, operatorId) {
  const response = await apiClient.get("/api/v1/ppob/products", {
    params: { category, ...(operatorId ? { operator_id: operatorId } : {}) },
  });
  return unwrapCollection(response.data).map(normalizePpobProduct);
}

export function usePpobCategories() {
  return useQuery({ queryKey: ppobKeys.categories, queryFn: getPpobCategories });
}

export function usePpobOperators(category) {
  return useQuery({
    queryKey: ppobKeys.operators(category),
    queryFn: () => getPpobOperators(category),
    enabled: Boolean(category),
  });
}

export function usePpobProducts(category, operatorId) {
  return useQuery({
    queryKey: ppobKeys.products(category, operatorId),
    queryFn: () => getPpobProducts(category, operatorId),
    enabled: Boolean(category),
  });
}

// ── Buyer transactions ───────────────────────────────────────────────────

export async function createPpobTransaction(productId, customerId) {
  const response = await apiClient.post("/api/v1/ppob/transactions", { product_id: productId, customer_id: customerId });
  return normalizePpobTransaction(response.data?.data || response.data);
}

export async function checkPpobTransactionStatus(id) {
  const response = await apiClient.post(`/api/v1/ppob/transactions/${id}/check-status`);
  return normalizePpobTransaction(response.data?.data || response.data);
}

export async function getPpobTransactions(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/transactions", { params });
  return normalizePage(response.data, normalizePpobTransaction);
}

export function usePpobTransactions(params = {}) {
  return useQuery({
    queryKey: ppobKeys.transactions(params),
    queryFn: () => getPpobTransactions(params),
  });
}

export function useCreatePpobTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, customerId }) => createPpobTransaction(productId, customerId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "transactions"] }),
  });
}

export function useCheckPpobTransactionStatus() {
  return useMutation({ mutationFn: (id) => checkPpobTransactionStatus(id) });
}

// ── Receipts (bukti pembayaran, buyer) ──────────────────────────────────

export function normalizePpobReceipt(row = {}) {
  return {
    id: Number(row.id || 0),
    receiptNumber: row.receipt_number || "",
    transactionReference: row.transaction_reference || "",
    receiptType: row.receipt_type || "digital",
    productName: row.product_name || "",
    category: row.category || "",
    customerId: row.customer_id || "",
    customerName: row.customer_name || null,
    subtotal: Number(row.subtotal || 0),
    adminFee: Number(row.admin_fee || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    paymentMethod: row.payment_method || null,
    paymentStatus: row.payment_status || "pending",
    transactionStatus: row.transaction_status || "pending",
    paidAt: row.paid_at || null,
    createdAt: row.created_at || null,
    raw: row,
  };
}

export async function getPpobReceipts(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/receipts", { params });
  return normalizePage(response.data, normalizePpobReceipt);
}

export async function getPpobReceipt(ref) {
  const response = await apiClient.get(`/api/v1/ppob/receipts/${encodeURIComponent(ref)}`);
  return normalizePpobReceipt(response.data?.data || response.data);
}

export function usePpobReceipts(params = {}) {
  return useQuery({
    queryKey: ppobKeys.invoices(params),
    queryFn: () => getPpobReceipts(params),
  });
}

export function usePpobReceipt(ref, options = {}) {
  return useQuery({
    queryKey: ppobKeys.invoice(ref),
    queryFn: () => getPpobReceipt(ref),
    enabled: Boolean(ref),
    ...options,
  });
}

// ── Postpaid bills (verified email) ──────────────────────────────────────

export async function inquiryPpobBill(productCode, customerId) {
  const response = await apiClient.post("/api/v1/ppob/bills/inquiry", { product_code: productCode, customer_id: customerId });
  return response.data?.data || response.data;
}

export async function payPpobBill(referenceId) {
  const response = await apiClient.post("/api/v1/ppob/bills/pay", { reference_id: referenceId });
  return response.data?.data || response.data;
}

export function useInquiryPpobBill() {
  return useMutation({ mutationFn: ({ productCode, customerId }) => inquiryPpobBill(productCode, customerId) });
}

export function usePayPpobBill() {
  return useMutation({ mutationFn: (referenceId) => payPpobBill(referenceId) });
}

// ── Admin PPOB ───────────────────────────────────────────────────────────

export async function getPpobAdminDashboard() {
  const response = await apiClient.get("/api/v1/ppob/admin/dashboard");
  return response.data?.data || response.data;
}

export async function getPpobAdminFinance(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/admin/finance-summary", { params });
  return response.data?.data || response.data;
}

export async function getPpobAdminBalance() {
  const response = await apiClient.get("/api/v1/ppob/admin/balance");
  return response.data?.data || response.data;
}

export function usePpobAdminDashboard() {
  return useQuery({ queryKey: ppobKeys.adminDashboard, queryFn: getPpobAdminDashboard });
}

export function usePpobAdminFinance(params = {}) {
  return useQuery({ queryKey: ppobKeys.adminFinance(params), queryFn: () => getPpobAdminFinance(params) });
}

export function usePpobAdminBalance() {
  return useQuery({ queryKey: ppobKeys.adminBalance, queryFn: getPpobAdminBalance });
}

// Product CRUD (admin)
export async function getPpobAdminProducts(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/admin/products", { params });
  return normalizePage(response.data, normalizePpobProduct);
}

export async function createPpobAdminProduct(values) {
  const response = await apiClient.post("/api/v1/ppob/admin/products", values);
  return normalizePpobProduct(response.data?.data || response.data);
}

export async function updatePpobAdminProduct(id, values) {
  const response = await apiClient.put(`/api/v1/ppob/admin/products/${id}`, values);
  return normalizePpobProduct(response.data?.data || response.data);
}

export async function deletePpobAdminProduct(id) {
  await apiClient.delete(`/api/v1/ppob/admin/products/${id}`);
}

export function usePpobAdminProducts(params = {}) {
  return useQuery({
    queryKey: ppobKeys.adminProducts(params),
    queryFn: () => getPpobAdminProducts(params),
  });
}

export function useCreatePpobAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => createPpobAdminProduct(values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "products"] }),
  });
}

export function useUpdatePpobAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updatePpobAdminProduct(id, values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "products"] }),
  });
}

export function useDeletePpobAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePpobAdminProduct(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "products"] }),
  });
}

// Operator CRUD (admin)
export async function getPpobAdminOperators(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/admin/operators", { params });
  return normalizePage(response.data, normalizeOperator);
}

export async function createPpobAdminOperator(values) {
  const response = await apiClient.post("/api/v1/ppob/admin/operators", values);
  return normalizeOperator(response.data?.data || response.data);
}

export async function updatePpobAdminOperator(id, values) {
  const response = await apiClient.put(`/api/v1/ppob/admin/operators/${id}`, values);
  return normalizeOperator(response.data?.data || response.data);
}

export async function deletePpobAdminOperator(id) {
  await apiClient.delete(`/api/v1/ppob/admin/operators/${id}`);
}

export function usePpobAdminOperators(params = {}) {
  return useQuery({
    queryKey: ppobKeys.adminOperators(params),
    queryFn: () => getPpobAdminOperators(params),
  });
}

export function useCreatePpobAdminOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => createPpobAdminOperator(values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "operators"] }),
  });
}

export function useUpdatePpobAdminOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updatePpobAdminOperator(id, values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "operators"] }),
  });
}

export function useDeletePpobAdminOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePpobAdminOperator(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "operators"] }),
  });
}

// Pricing rule CRUD (admin)
export async function getPpobAdminPricingRules(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/admin/pricing-rules", { params });
  return normalizePage(response.data, normalizePricingRule);
}

export async function createPpobAdminPricingRule(values) {
  const response = await apiClient.post("/api/v1/ppob/admin/pricing-rules", values);
  return normalizePricingRule(response.data?.data || response.data);
}

export async function updatePpobAdminPricingRule(id, values) {
  const response = await apiClient.put(`/api/v1/ppob/admin/pricing-rules/${id}`, values);
  return normalizePricingRule(response.data?.data || response.data);
}

export async function deletePpobAdminPricingRule(id) {
  await apiClient.delete(`/api/v1/ppob/admin/pricing-rules/${id}`);
}

export function usePpobAdminPricingRules(params = {}) {
  return useQuery({
    queryKey: ppobKeys.adminPricingRules(params),
    queryFn: () => getPpobAdminPricingRules(params),
  });
}

export function useCreatePpobAdminPricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values) => createPpobAdminPricingRule(values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "pricing-rules"] }),
  });
}

export function useUpdatePpobAdminPricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => updatePpobAdminPricingRule(id, values),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "pricing-rules"] }),
  });
}

export function useDeletePpobAdminPricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePpobAdminPricingRule(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["ppob", "admin", "pricing-rules"] }),
  });
}

export function getPpobAdminError(error, fallback = "Data PPOB gagal diproses.") {
  return getApiMessage(error, fallback);
}

// ── Unified transaction history (PPOB + Marketplace) ───────────────────

export async function getTransactionHistory(params = {}) {
  const response = await apiClient.get("/api/v1/ppob/receipts/history", { params });
  return normalizePage(response.data);
}

export function useTransactionHistory(params = {}) {
  return useQuery({
    queryKey: ["ppob", "history", params],
    queryFn: () => getTransactionHistory(params),
  });
}
