import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Gift, LogIn, PackageCheck, RefreshCw, ShoppingBag, Star, Trophy } from "lucide-react";
import { useMissions } from "@/features/advanced/services/advancedMarketplaceService";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Sedang Berjalan" },
  { key: "completed", label: "Selesai" },
];

const EVENT_META = {
  login: { label: "Login", icon: LogIn, unit: "kali" },
  order_completed: { label: "Selesaikan Pesanan", icon: PackageCheck, unit: "pesanan" },
  review_submitted: { label: "Beri Review", icon: Star, unit: "review" },
  purchase_amount: { label: "Total Belanja", icon: ShoppingBag, unit: "progress" },
  product_purchased: { label: "Beli Produk", icon: ShoppingBag, unit: "produk" },
};

function isCompleted(row) {
  return ["completed", "rewarded"].includes(String(row?.status || "").toLowerCase());
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function rewardLabel(voucher) {
  if (!voucher) return "Tanpa voucher";
  if (voucher.discount_type === "percentage") return `${Number(voucher.discount_value || 0)}% diskon`;
  return voucher.name || "Voucher hadiah";
}

export default function BuyerMissionsPage() {
  const [filter, setFilter] = useState("all");
  const missionsQuery = useMissions({}, false);
  const missions = missionsQuery.data?.rows || [];

  const stats = useMemo(() => {
    const completed = missions.filter(isCompleted).length;
    const active = missions.length - completed;
    const rewards = missions.filter((row) => isCompleted(row) && row.voucher).length;
    return { active, completed, rewards };
  }, [missions]);

  const filtered = useMemo(() => missions.filter((row) => {
    if (filter === "completed") return isCompleted(row);
    if (filter === "active") return !isCompleted(row);
    return true;
  }), [filter, missions]);

  return (
    <section className={profileLayout.contentShell} aria-label="Misi buyer">
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Rewards center</span>
            <h2 className={profileLayout.contentTitle}>Misi & Hadiah</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>
              Selesaikan aktivitas belanja untuk membuka voucher dan hadiah yang tersedia untuk akun Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => missionsQuery.refetch()}
            disabled={missionsQuery.isFetching}
            className={profileLayout.secondaryButton}
          >
            <RefreshCw size={16}  />
            Perbarui
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Berjalan</span>
              <Clock3 size={18} className="text-emerald-600" />
            </div>
            <strong className="mt-4 block text-3xl font-light text-slate-950">{stats.active}</strong>
            <p className="mt-1 text-xs text-slate-500">Misi yang masih dapat diselesaikan</p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Selesai</span>
              <CheckCircle2 size={18} className="text-[#10B981]" />
            </div>
            <strong className="mt-4 block text-3xl font-light text-slate-950">{stats.completed}</strong>
            <p className="mt-1 text-xs text-slate-500">Misi yang sudah Anda capai</p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Hadiah</span>
              <Gift size={18} className="text-amber-500" />
            </div>
            <strong className="mt-4 block text-3xl font-light text-slate-950">{stats.rewards}</strong>
            <p className="mt-1 text-xs text-slate-500">Voucher yang berhasil dibuka</p>
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-4">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`h-9 shrink-0 rounded-full px-4 text-xs font-semibold transition ${filter === item.key ? "bg-[#10B981] text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-[#10B981]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {missionsQuery.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {missionsQuery.error.message || "Misi belum dapat dimuat."}
          </div>
        ) : null}

        {!missionsQuery.isLoading && !missionsQuery.error ? (
          <div className="grid gap-4 py-6 md:grid-cols-2">
            {filtered.map((row) => {
              const event = EVENT_META[row.event_type] || { label: "Aktivitas", icon: Trophy, unit: "progress" };
              const Icon = event.icon;
              const completed = isCompleted(row);
              const progress = Math.max(0, Math.min(100, Number(row.progress_percent || 0)));
              const unlockedVoucher = row.voucher && !row.voucher_locked && completed;

              return (
                <article key={row.id} className="flex min-w-0 flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-emerald-200">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      <Icon size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{event.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {completed ? "Selesai" : "Berjalan"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-slate-950">{row.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{row.description || "Selesaikan misi ini untuk mendapatkan hadiah."}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-800">{Number(row.progress_value || 0)} / {Number(row.target_value || 0)} {event.unit}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#10B981] transition-[width] duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-right text-xs font-bold text-[#10B981]">{Math.round(progress)}%</p>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Batas waktu</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">{formatDate(row.ends_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Hadiah</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">{rewardLabel(row.voucher)}</p>
                    </div>
                  </div>

                  {row.voucher ? (
                    <div className={`mt-4 rounded-xl p-3 ${unlockedVoucher ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-500"}`}>
                      <div className="flex items-center gap-2">
                        <Gift size={16} />
                        <span className="text-xs font-semibold">
                          {unlockedVoucher ? `Voucher terbuka: ${row.voucher.code || row.voucher.name}` : "Voucher akan terbuka setelah misi selesai"}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        {!missionsQuery.isLoading && !missionsQuery.error && !filtered.length ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-[#10B981]">
              <Trophy size={34} />
            </div>
            <h3 className="mt-5 text-xl font-light text-slate-950">Belum ada misi pada kategori ini</h3>
            <p className="mt-2 text-sm text-slate-500">Misi aktif berikutnya akan muncul otomatis di halaman ini.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
