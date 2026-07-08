const VOUCHER_ENDPOINT = "/api/v1/order/vouchers";

function getVoucherListFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.vouchers)) return payload.vouchers;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;

  return [];
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

function normalizeVoucher(voucher) {
  const maxDiscount = voucher.maxDiscount ?? voucher.max_discount;

  return {
    id: voucher.id,
    code: voucher.code || "",
    name: voucher.name || "",
    discountType: voucher.discountType || voucher.discount_type || "fixed",
    discountValue: toNumber(voucher.discountValue ?? voucher.discount_value),
    minSpend: toNumber(voucher.minSpend ?? voucher.min_spend),
    maxDiscount:
      maxDiscount === null || maxDiscount === undefined
        ? null
        : toNumber(maxDiscount),
    startsAt: voucher.startsAt || voucher.starts_at || null,
    endsAt: voucher.endsAt || voucher.ends_at || null,
    usageLimit: toNumber(voucher.usageLimit ?? voucher.usage_limit),
    usedCount: toNumber(voucher.usedCount ?? voucher.used_count),
    storeId: voucher.storeId ?? voucher.store_id ?? null,
    isActive: toBoolean(voucher.isActive ?? voucher.is_active),
    createdAt: voucher.createdAt || voucher.created_at || null,
  };
}

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return {
    message: text,
  };
}

export async function getActiveVouchers() {
  const url = new URL(VOUCHER_ENDPOINT, window.location.origin);

  url.searchParams.set("is_active", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    credentials: "same-origin",
  });

  const payload = await readResponse(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 419) {
      throw new Error("Sesi login tidak valid. Silakan login ulang.");
    }

    if (response.status === 403) {
      throw new Error("Kamu tidak memiliki akses untuk melihat voucher.");
    }

    if (response.status === 404) {
      throw new Error("Endpoint voucher tidak ditemukan.");
    }

    throw new Error(payload?.message || `Gagal memuat voucher (${response.status})`);
  }

  const list = getVoucherListFromPayload(payload);

  return list.map(normalizeVoucher);
}