import { useMemo } from "react";

function formatRupiah(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatDiscount(voucher) {
  if (voucher.discountType === "percentage") {
    return `${Number(voucher.discountValue || 0).toLocaleString("id-ID")}%`;
  }

  return formatRupiah(voucher.discountValue);
}

function getVoucherDescription(voucher) {
  const parts = [];

  if (voucher.name) {
    parts.push(voucher.name);
  }

  if (voucher.discountValue) {
    parts.push(`Diskon ${formatDiscount(voucher)}`);
  }

  if (voucher.minSpend) {
    parts.push(`Min. belanja ${formatRupiah(voucher.minSpend)}`);
  }

  if (voucher.maxDiscount) {
    parts.push(`Maks. diskon ${formatRupiah(voucher.maxDiscount)}`);
  }

  return parts.join(" • ");
}

export default function VoucherDropdown({
  vouchers = [],
  loading = false,
  error = "",
}) {
  const visibleVouchers = useMemo(() => {
    return Array.isArray(vouchers) ? vouchers : [];
  }, [vouchers]);

  return (
    <div className="mx-auto h-[460px] max-w-[1200px] overflow-y-auto overscroll-contain bg-white p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-5 border-b border-gray-100 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-gray-900">
          Voucher
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Pilih voucher yang tersedia untuk mendapatkan potongan belanja.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[118px] rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex h-[300px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && !visibleVouchers.length && (
        <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
          Voucher belum tersedia
        </div>
      )}

      {!loading && !error && visibleVouchers.length ? (
        <div className="grid grid-cols-3 gap-4">
          {visibleVouchers.map((voucher) => (
            <div
              key={voucher.id || voucher.code}
              className="min-h-[118px] overflow-hidden rounded-xl border border-gray-200 bg-white transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#03ac0e]"
            >
              <div className={voucher.imageUrl ? "grid min-h-[118px] grid-cols-[92px_minmax(0,1fr)]" : "min-h-[118px] p-4"}>
                {voucher.imageUrl ? (
                  <img src={voucher.imageUrl} alt={voucher.name || voucher.code} className="h-full min-h-[118px] w-full object-cover" />
                ) : null}
                <div className={voucher.imageUrl ? "p-4" : ""}>
                  <div className="mb-3 inline-flex rounded-md border border-[#03ac0e]/30 px-3 py-1 text-sm font-bold tracking-wide text-[#03ac0e]">
                    {voucher.code}
                  </div>

                  <div className="line-clamp-3 text-sm leading-6 text-gray-600">
                    {getVoucherDescription(voucher)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}