import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Trophy } from "lucide-react";
import VoucherDetailModal from "@/features/order/voucher/components/VoucherDetailModal";
import MissionRequirementModal from "@/features/order/voucher/components/MissionRequirementModal";
import { useMissions } from "@/features/advanced/services/advancedMarketplaceService";

function formatRupiah(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatDiscount(voucher) {
  const value = voucher.discountType === "percentage"
    ? `${Number(voucher.discountValue || 0).toLocaleString("id-ID")}%`
    : formatRupiah(voucher.discountValue);

  if (voucher.discountTarget === "shipping") {
    return voucher.discountType === "percentage" && Number(voucher.discountValue || 0) === 100
      ? "Gratis ongkir"
      : `Diskon ongkir ${value}`;
  }

  return value;
}

function getVoucherDescription(voucher) {
  const parts = [];

  if (voucher.name) {
    parts.push(voucher.name);
  }

  if (voucher.discountValue) {
    parts.push(formatDiscount(voucher));
  }

  if (voucher.minSpend) {
    parts.push(`Min. belanja ${formatRupiah(voucher.minSpend)}`);
  }

  if (voucher.maxDiscount) {
    parts.push(`Maks. diskon ${formatRupiah(voucher.maxDiscount)}`);
  }

  return parts.join(" • ");
}

const MISSION_EVENT_LABEL = {
  login: "Login",
  order_completed: "Selesaikan Pesanan",
  review_submitted: "Beri Review",
  purchase_amount: "Total Belanja",
  product_purchased: "Beli Produk",
};

function isMissionCompleted(row) {
  return ["completed", "rewarded"].includes(String(row?.status || "").toLowerCase());
}

function MissionRewards({ compact = false }) {
  const missionsQuery = useMissions({}, false);
  const missions = missionsQuery.data?.rows || [];

  const active = missions
    .filter((row) => !isMissionCompleted(row))
    .slice(0, compact ? 4 : undefined);

  const completed = missions.filter(isMissionCompleted).length;

  if (missionsQuery.isLoading) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">Memuat misi...</div>
    );
  }

  if (missionsQuery.error) {
    return (
      <div className="py-6 text-center text-sm text-red-500">
        Misi belum dapat dimuat.
      </div>
    );
  }

  if (!missions.length) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h4 className="text-sm font-bold text-gray-900">Misi & Hadiah</h4>
        </div>
        <Link
          to="/profile/missions"
          className="text-xs font-semibold text-[#10B981] hover:underline"
        >
          Lihat semua misi ({completed} selesai)
        </Link>
      </div>

      {active.length ? (
        <div className={compact ? "space-y-2" : "space-y-2"}>
          {active.map((mission) => (
            <Link
              key={mission.id}
              to="/profile/missions"
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 transition hover:border-[#10B981]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-800">
                  {mission.name || MISSION_EVENT_LABEL[mission.event_type] || "Misi"}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {MISSION_EVENT_LABEL[mission.event_type] || "Aktivitas"} ·{" "}
                  {Number(mission.progress_value || 0)} /{" "}
                  {Number(mission.target_value || 0)}
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-[#10B981]"
                    style={{
                      width: `${Math.min(100, Number(mission.progress_percent || 0))}%`,
                    }}
                  />
                </div>
              </div>
              <Trophy size={15} className="shrink-0 text-amber-400" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Semua misi telah selesai. Selesaikan misi baru untuk membuka voucher.
        </p>
      )}
    </div>
  );
}

export default function VoucherDropdown({
  vouchers = [],
  loading = false,
  error = "",
  onSelect,
}) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [lockedVoucher, setLockedVoucher] = useState(null);
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
  const openVoucher = useCallback((voucher) => {
    if (voucher?.isLocked) {
      setLockedVoucher(voucher);
      return;
    }

    setSelectedVoucher(voucher);
  }, []);

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
            {visibleVouchers.map((voucher) => {
              const locked = Boolean(voucher.isLocked);

              return (
                <button
                  key={voucher.id || voucher.code}
                  type="button"
                  onClick={() => openVoucher(voucher)}
                  className={`relative min-h-[160px] overflow-hidden rounded-xl border text-left transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    locked
                      ? "cursor-not-allowed border-gray-200 bg-gray-100"
                      : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-[#10B981]"
                  }`}
                >
                  {voucher.imageUrl ? (
                    <>
                      <img
                        src={voucher.imageUrl}
                        alt={voucher.name || voucher.code}
                        className={`absolute inset-0 h-full w-full object-cover ${
                          locked ? "grayscale opacity-40" : ""
                        }`}
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
                      <div
                        className={`mb-3 inline-flex rounded-md border px-3 py-1 text-sm font-bold tracking-wide ${
                          locked
                            ? "border-gray-300 text-gray-400"
                            : "border-[#10B981]/30 text-[#10B981]"
                        }`}
                      >
                        {voucher.code}
                      </div>
                      <div
                        className={`line-clamp-3 text-sm leading-6 ${
                          locked ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {getVoucherDescription(voucher)}
                      </div>
                    </div>
                  )}

                  {locked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow">
                        <Lock size={22} className="text-gray-600" />
                      </span>
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                        Selesaikan misi untuk membuka
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <MissionRewards compact />
      </div>

      <VoucherDetailModal
        voucher={selectedVoucher}
        open={Boolean(selectedVoucher)}
        onClose={closeVoucher}
        onUse={onSelect ? useVoucher : undefined}
      />

      <MissionRequirementModal
        voucher={lockedVoucher}
        open={Boolean(lockedVoucher)}
        onClose={() => setLockedVoucher(null)}
      />
    </>
  );
}
