import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";

export const voucherKeys = {
  active: ["order", "vouchers", "active"],
};


function resolveAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(import.meta.env.VITE_ASSET_BASE_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const normalized = String(path).replace(/^\/+/, "");
  return normalized.startsWith("storage/") ? `${base}/${normalized}` : `${base}/storage/${normalized}`;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeVoucher(voucher = {}) {
  const maxDiscount = voucher.maxDiscount ?? voucher.max_discount;

  return {
    id: Number(voucher.id),
    code: voucher.code || "",
    name: voucher.name || "Voucher",
    image: voucher.image || "",
    imageUrl: resolveAssetUrl(voucher.imageUrl || voucher.image_url || voucher.image || ""),
    discountType: voucher.discountType || voucher.discount_type || "fixed",
    discountValue: toNumber(voucher.discountValue ?? voucher.discount_value),
    minSpend: toNumber(voucher.minSpend ?? voucher.min_spend),
    maxDiscount: maxDiscount === null || maxDiscount === undefined ? null : toNumber(maxDiscount),
    startsAt: voucher.startsAt || voucher.starts_at || null,
    endsAt: voucher.endsAt || voucher.ends_at || null,
    usageLimit: toNumber(voucher.usageLimit ?? voucher.usage_limit),
    usedCount: toNumber(voucher.usedCount ?? voucher.used_count),
    storeId: voucher.storeId ?? voucher.store_id ?? null,
    isActive: Boolean(voucher.isActive ?? voucher.is_active),
    createdAt: voucher.createdAt || voucher.created_at || null,
  };
}

export async function getActiveVouchers() {
  const response = await apiClient.get("/api/v1/order/vouchers", { params: { is_active: 1 } });
  return unwrapCollection(response.data).map(normalizeVoucher);
}

export function useActiveVouchers(options = {}) {
  return useQuery({
    queryKey: voucherKeys.active,
    queryFn: getActiveVouchers,
    staleTime: 300000,
    ...options,
  });
}
