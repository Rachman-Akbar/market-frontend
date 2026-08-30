import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, Trophy, X } from "lucide-react";
import { useMissions } from "@/features/advanced/services/advancedMarketplaceService";

const EVENT_LABEL = {
  login: "Login",
  order_completed: "Selesaikan Pesanan",
  review_submitted: "Beri Review",
  purchase_amount: "Total Belanja",
  product_purchased: "Beli Produk",
};

function formatDiscount(voucher = {}) {
  const type = String(voucher.discount_type || "fixed").toLowerCase();
  const value = Number(voucher.discount_value || 0);
  return type === "percentage" ? `${value.toLocaleString("id-ID")}% diskon` : (voucher.name || "Voucher");
}

export default function MissionRequirementModal({ voucher, open, onClose }) {
  const missionsQuery = useMissions({}, false);
  const missions = missionsQuery.data?.rows || [];

  const relatedMissions = missions
    .filter((mission) => Number(mission?.voucher?.id) === Number(voucher?.id))
    .map((mission) => ({
      ...mission,
      completed: ["completed", "rewarded"].includes(String(mission.status).toLowerCase()),
    }));

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  if (!open || !voucher) {
    return null;
  }

  const displayMissions =
    relatedMissions.length > 0
      ? relatedMissions
      : [{ id: "unknown", name: voucher.name || "Voucher misi", unknown: true }];

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Cara mendapatkan voucher ${voucher.name || voucher.code}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="max-h-[calc(100vh-48px)] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="rounded-t-2xl bg-slate-900 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Lock size={22} className="text-amber-300" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Voucher terkunci
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  {voucher.name || "Voucher Misi"}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Tutup"
            >
              <X size={19} />
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Voucher ini belum aktif. Selesaikan misi berikut untuk membukanya dan
            gunakan saat checkout.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {missionsQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Memuat misi...
            </p>
          ) : null}

          {missionsQuery.error ? (
            <p className="py-8 text-center text-sm text-red-600">
              Misi belum dapat dimuat.
            </p>
          ) : null}

          {!missionsQuery.isLoading && !missionsQuery.error ? (
            <div className="space-y-3">
              {displayMissions.map((mission) => {
                const progress = Math.min(
                  100,
                  Math.max(0, Number(mission.progress_percent || 0)),
                );

                return (
                  <div
                    key={mission.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {mission.unknown
                          ? "Misi"
                          : EVENT_LABEL[mission.event_type] || "Aktivitas"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">
                      {mission.name || "Selesaikan misi"}
                    </h3>

                    {!mission.unknown ? (
                      <>
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-slate-700">
                              {Number(mission.progress_value || 0)} /{" "}
                              {Number(mission.target_value || 0)}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#10B981]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-right text-xs font-bold text-[#10B981]">
                          {Math.round(progress)}%
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">
                        Selesaikan misi yang menyediakan voucher ini untuk
                        membukanya.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          <Link
            to="/profile/missions"
            onClick={onClose}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 text-sm font-bold text-white transition hover:bg-[#059669]"
          >
            <Trophy size={16} />
            Lihat & Ikuti Misi
          </Link>
        </div>
      </div>
    </div>
  );
}
