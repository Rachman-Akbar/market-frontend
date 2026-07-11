import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";
import { formatPrice } from "@/shared/utils/utils";

const promotionKeys = {
  all: ["catalog", "promotions"],
};


function resolveAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(import.meta.env.VITE_ASSET_BASE_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const normalized = String(path).replace(/^\/+/, "");
  return normalized.startsWith("storage/") ? `${base}/${normalized}` : `${base}/storage/${normalized}`;
}

function labelValue(row = {}) {
  const type = row.discount_type || row.discountType || "fixed";
  const value = Number(row.discount_value ?? row.discountValue ?? 0);
  if (type === "percentage" || type === "shipping_percentage") return `${value}%`;
  if (type === "free_shipping") return "Gratis Ongkir";
  return formatPrice(value);
}

function normalizePromotion(row = {}, index = 0) {
  const type = row.discount_type || row.discountType || "fixed";
  const gradients = ["from-emerald-600 to-lime-500", "from-sky-600 to-teal-500", "from-slate-800 to-emerald-700"];
  return {
    id: row.id,
    title: row.name || row.title || row.code || "Promo",
    subtitle: `Potongan ${labelValue(row)}${Number(row.min_spend || 0) > 0 ? `, minimum belanja ${formatPrice(Number(row.min_spend))}` : ""}`,
    badge: row.ends_at ? `Sampai ${new Date(row.ends_at).toLocaleDateString("id-ID")}` : "Voucher aktif",
    cta: "Gunakan Voucher",
    image: resolveAssetUrl(row.imageUrl || row.image_url || row.image || row.banner_url || ""),
    href: `/cart?voucher=${encodeURIComponent(row.code || "")}`,
    color: gradients[index % gradients.length],
    code: row.code || "",
    type,
  };
}

export async function getPromotionHighlights() {
  const response = await apiClient.get("/api/v1/order/vouchers", { params: { is_active: 1 } });
  return unwrapCollection(response.data).map(normalizePromotion);
}

export function usePromotionHighlights() {
  return useQuery({
    queryKey: promotionKeys.all,
    queryFn: getPromotionHighlights,
    staleTime: 300000,
  });
}
