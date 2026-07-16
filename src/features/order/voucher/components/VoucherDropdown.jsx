import { useCallback, useMemo, useState } from "react";
import VoucherDetailModal from "@/features/order/voucher/components/VoucherDetailModal";

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
  onSelect,
}) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const visibleVouchers = useMemo(() => {
    return Array.isArray(vouchers) ? vouchers : [];
  }, [vouchers]);
  const closeVoucher = useCallback(() => setSelectedVoucher(null), []);
  const useVoucher = useCallback(
    (voucher) => {
      onSelect?.(voucher);
      closeVoucher();
    },
    [closeVoucher, onSelect],
  );

  return (
    <>
      <div className="mx-auto h-[460px] max-w-[1200px] overflow-y-auto overscroll-contain bg-white p-6">
        <div className="mb-5 border-b border-gray-100 pb-3">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">
            Voucher
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Pilih voucher yang tersedia untuk mendapatkan potongan belanja.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[160px] rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-red-500">
            {error}
          </div>
        ) : null}

        {!loading && !error && !visibleVouchers.length ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-gray-400">
            Voucher belum tersedia
          </div>
        ) : null}

        {!loading && !error && visibleVouchers.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVouchers.map((voucher) => (
              <button
                key={voucher.id || voucher.code}
                type="button"
                onClick={() => setSelectedVoucher(voucher)}
                className="relative min-h-[160px] overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#10B981]"
              >
                {voucher.imageUrl ? (
                  <>
                    <img
                      src={voucher.imageUrl}
                      alt={voucher.name || voucher.code}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <div className="mb-2 inline-flex rounded-md border border-white/50 bg-black/20 px-3 py-1 text-sm font-bold tracking-wide backdrop-blur-sm">
                        {voucher.code}
                      </div>
                      <div className="line-clamp-2 text-sm leading-6 text-white/90">
                        {getVoucherDescription(voucher)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="min-h-[160px] p-4">
                    <div className="mb-3 inline-flex rounded-md border border-[#10B981]/30 px-3 py-1 text-sm font-bold tracking-wide text-[#10B981]">
                      {voucher.code}
                    </div>
                    <div className="line-clamp-3 text-sm leading-6 text-gray-600">
                      {getVoucherDescription(voucher)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <VoucherDetailModal
        voucher={selectedVoucher}
        open={Boolean(selectedVoucher)}
        onClose={closeVoucher}
        onUse={onSelect ? useVoucher : undefined}
      />
    </>
  );
}
