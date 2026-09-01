import { useCallback, useMemo, useState } from "react";
import { Gift, Search, TicketPercent, Trophy, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import VoucherDetailModal from "@/features/order/voucher/components/VoucherDetailModal";
import { useMyVouchers } from "@/features/order/voucher/services/voucherService";
import { useMissions } from "@/features/advanced/services/advancedMarketplaceService";
import { formatPrice } from "@/shared/utils/utils";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "shipping", label: "Gratis Ongkir" },
  { key: "percentage", label: "Persentase" },
  { key: "fixed", label: "Potongan Tetap" },
];

const STATUS_META = {
  available: { label: "Belum diklaim", classes: "bg-amber-50 text-amber-700" },
  claimed: { label: "Diklaim", classes: "bg-[#D1FAE5] text-[#10B981]" },
  used: { label: "Terpakai", classes: "bg-slate-100 text-slate-500" },
};

function getVoucherIcon(voucher) {
  if (voucher.discountTarget === "shipping") return Truck;
  if (voucher.discountType === "percentage") return Gift;
  return TicketPercent;
}

function getVoucherValue(voucher) {
  if (voucher.discountTarget === "shipping" && voucher.discountType === "percentage" && Number(voucher.discountValue) >= 100) {
    return "Gratis Ongkir";
  }

  if (voucher.discountType === "percentage") {
    return `${voucher.discountValue}%`;
  }

  return formatPrice(voucher.discountValue);
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

function ProfileMissions() {
  const missionsQuery = useMissions({}, false);
  const missions = missionsQuery.data?.rows || [];
  const active = missions.filter((row) => !isMissionCompleted(row));
  const completedCount = missions.filter(isMissionCompleted).length;

  if (missionsQuery.isLoading) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">Memuat misi...</div>
    );
  }

  if (missionsQuery.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        Misi belum dapat dimuat.
      </div>
    );
  }

  if (!missions.length) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-[#e5e7eb] pt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <span className={profileLayout.contentEyebrow}>Rewards center</span>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            Ikuti Misi untuk Mendapatkan Voucher
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Selesaikan misi di bawah untuk membuka voucher terkunci pada halaman ini.
          </p>
        </div>
        <Link
          to="/profile/missions"
          className={`${profileLayout.secondaryButton} shrink-0`}
        >
          Lihat semua ({completedCount} selesai)
        </Link>
      </div>

      {active.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {active.map((mission) => {
            const label =
              MISSION_EVENT_LABEL[mission.event_type] || "Aktivitas";
            const progress = Math.min(
              100,
              Math.max(0, Number(mission.progress_percent || 0)),
            );

            return (
              <Link
                key={mission.id}
                to="/profile/missions"
                className="flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-4 transition hover:border-[#10B981]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Trophy size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {mission.name || label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {label} · Hadiah:{" "}
                    {mission.voucher?.name || "Voucher"}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-full rounded-full bg-[#10B981]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-[#10B981]">
                  {Math.round(progress)}%
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#e5e7eb] bg-slate-50 p-4 text-sm text-slate-500">
          Semua misi telah selesai. Selesaikan misi baru untuk membuka voucher.
        </div>
      )}
    </div>
  );
}

export default function VouchersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const vouchersQuery = useMyVouchers();
  const vouchers = vouchersQuery.data || [];
  const filteredVouchers = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const categoryMatch =
        filter === "all" ||
        (filter === "shipping"
          ? voucher.discountTarget === "shipping"
          : voucher.discountTarget === "product" && voucher.discountType === filter);
      const keywordMatch =
        !search ||
        `${voucher.name} ${voucher.code}`.toLowerCase().includes(search);
      return categoryMatch && keywordMatch;
    });
  }, [filter, keyword, vouchers]);

  const closeVoucher = useCallback(() => setSelectedVoucher(null), []);

  const openVoucher = useCallback((voucher) => {
    setSelectedVoucher(voucher);
  }, []);

  const applyVoucher = useCallback(
    (voucher) => {
      closeVoucher();
      navigate("/cart?tab=cart", {
        state: { voucherCode: voucher.code },
      });
    },
    [closeVoucher, navigate],
  );

  return (
    <section className={profileLayout.contentShell}>
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Voucher wallet</span>
            <h2 className={profileLayout.contentTitle}>Voucher Saya</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>
              Voucher milik Anda. Klaim dilakukan lewat aplikasi Android dan otomatis tampil di sini.
            </p>
          </div>
        </div>

        <hr className={profileLayout.divider} />
        <div className="flex min-h-[72px] flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <label className={`${profileLayout.searchBox} min-w-0 flex-1 gap-2`}>
            <Search size={17} />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Cari voucher atau kode promo"
              type="search"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition ${
                  filter === item.key
                    ? "bg-[#10B981] text-white"
                    : "bg-white text-slate-500 ring-1 ring-[#e5e7eb] hover:text-[#10B981]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <hr className={profileLayout.divider} />

        {vouchersQuery.error ? (
          <p className="py-12 text-center text-sm text-red-600">
            {vouchersQuery.error.message}
          </p>
        ) : null}
        {filteredVouchers.map((voucher) => {
          const Icon = getVoucherIcon(voucher);
          const statusMeta = STATUS_META[voucher.userVoucherStatus] || STATUS_META.available;
          const consumable = voucher.userVoucherStatus !== "used";
          return (
            <div
              key={voucher.id}
              role="button"
              tabIndex={0}
              onClick={() => openVoucher(voucher)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openVoucher(voucher);
                }
              }}
              className={`grid min-h-[128px] w-full gap-4 py-6 text-left md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center ${consumable ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl text-[#10B981] ring-1 ring-[#e5e7eb] md:h-[104px]">
                {voucher.imageUrl ? (
                  <img
                    src={voucher.imageUrl}
                    alt={voucher.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white text-center">
                    <Icon size={22} />
                    <b className="block text-xl font-light">
                      {getVoucherValue(voucher)}
                    </b>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-950">
                    {voucher.name}
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusMeta.classes}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Kode: {voucher.code}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {voucher.discountTarget === "shipping" ? "Potongan ongkir" : "Diskon produk"} {getVoucherValue(voucher)} · Min. belanja{" "}
                  {formatPrice(voucher.minSpend)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {voucher.userVoucherStatus === "used"
                    ? "Terpakai pada " + (voucher.usedAt ? new Date(voucher.usedAt).toLocaleDateString("id-ID") : "-")
                    : `Berlaku sampai ${voucher.endsAt ? new Date(voucher.endsAt).toLocaleDateString("id-ID") : "tanpa batas"}`}
                </p>
              </div>
              {consumable ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    applyVoucher(voucher);
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#10B981] px-5 text-sm font-semibold text-white transition hover:bg-[#059669]"
                >
                  Pakai
                </button>
              ) : (
                <span className="hidden text-sm font-semibold text-slate-400 md:block">Voucher terpakai</span>
              )}
              <hr className="border-[#e5e7eb] md:col-span-3" />
            </div>
          );
        })}

        {!vouchersQuery.isLoading && !filteredVouchers.length ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#D1FAE5] text-[#10B981]">
              <TicketPercent size={34} />
            </div>
            <h3 className="text-xl font-light text-slate-950">
              Voucher tidak ditemukan
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Anda belum memiliki voucher. Klaim voucher lewat aplikasi Android setelah menyelesaikan misi.
            </p>
          </div>
        ) : null}
      </div>

      <ProfileMissions />

      <VoucherDetailModal
        voucher={selectedVoucher}
        open={Boolean(selectedVoucher)}
        onClose={closeVoucher}
        onUse={applyVoucher}
      />
    </section>
  );
}