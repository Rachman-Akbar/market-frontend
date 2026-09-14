import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { useAdminMonitorOverview } from "@/features/admin/adminService";
import { getApiMessage } from "@/core/utils/apiClient";
import { OrderRevenueBars, StatCard } from "@/shared/components/charts/chartKit";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

const PERIOD_OPTIONS = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
];

function InfoGrid({ stats }) {
  const orders = stats.orders || {};
  const stores = stats.stores || {};
  const products = stats.products || {};
  const users = stats.users || {};
  const finance = stats.finance || {};

  const cards = [
    { label: "Total Pesanan", value: Number(orders.total || 0).toLocaleString("id-ID"), icon: "receipt_long", accent: "text-teal-700", hint: `${Number(orders.completed || 0).toLocaleString("id-ID")} selesai` },
    { label: "Pendapatan Periode", value: formatRupiah(orders.revenue), icon: "payments", accent: "text-emerald-700", hint: `Konversi ${orders.conversion_rate || 0}%` },
    { label: "Toko Aktif", value: Number(stores.total || 0).toLocaleString("id-ID"), icon: "storefront", accent: "text-indigo-700", hint: `${Number(stores.new || 0).toLocaleString("id-ID")} baru` },
    { label: "Produk Aktif", value: Number(products.total || 0).toLocaleString("id-ID"), icon: "inventory_2", accent: "text-blue-700", hint: `${Number(products.new || 0).toLocaleString("id-ID")} baru` },
    { label: "Biaya Admin Terkumpul", value: formatRupiah(finance.admin_fees_collected), icon: "percent", accent: "text-amber-700", hint: "Settlement selesai" },
    { label: "Pengguna", value: Number(users.total || 0).toLocaleString("id-ID"), icon: "group", accent: "text-rose-700", hint: `${Number(users.new || 0).toLocaleString("id-ID")} baru` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 ${card.accent}`}>
              <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500">{card.label}</p>
              <p className="truncate text-lg font-extrabold text-slate-950">{card.value}</p>
              {card.hint ? <p className="truncate text-[11px] text-slate-400">{card.hint}</p> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TopStoresRanking({ stores, startDate }) {
  const max = Math.max(1, ...stores.map((store) => store.revenue));

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Toko Paling Laris</h2>
          <p className="text-sm text-slate-500">Urutan performa toko berdasarkan pendapatan{startDate ? ` sejak ${startDate}` : ""}.</p>
        </div>

        {stores.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Belum ada transaksi pada periode ini.</p>
        ) : (
          <div className="space-y-3">
            {stores.map((store, index) => (
              <Link
                key={store.store_id}
                to={`/admin/store-context?storeId=${store.store_id}`}
                className="block rounded-2xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-teal-300 hover:bg-teal-50/40"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-200 text-slate-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">{store.store_name}</p>
                      <p className="text-xs text-slate-500">{Number(store.order_count).toLocaleString("id-ID")} pesanan</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold text-teal-700">{formatRupiah(store.revenue)}</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${Math.max(4, (store.revenue / max) * 100)}%` }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrderTrendMini({ trend }) {
  const points = trend || [];
  const totalOrders = points.reduce((sum, p) => sum + Number(p.orders || 0), 0);
  const totalRevenue = points.reduce((sum, p) => sum + Number(p.revenue || 0), 0);
  const totalCompleted = points.reduce((sum, p) => sum + Number(p.completed || 0), 0);

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">Tren Order &amp; Pendapatan</h2>
          <p className="text-sm text-slate-500">Perbandingan jumlah pesanan dan pendapatan per hari pada periode terpilih.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total Order" value={totalOrders.toLocaleString("id-ID")} tone="sky" />
          <StatCard label="Pendapatan" value={formatRupiah(totalRevenue)} tone="emerald" />
          <StatCard label="Selesai" value={totalCompleted.toLocaleString("id-ID")} tone="slate" />
        </div>
        <OrderRevenueBars points={points} format={formatRupiah} />
      </CardContent>
    </Card>
  );
}

export default function AdminMonitorOverviewPage() {
  const [period, setPeriod] = useState("monthly");
  const overview = useAdminMonitorOverview(period);
  const data = overview.data;

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-950">Monitoring Marketplace</h1>
            <p className="text-sm text-slate-500">Ringkasan performa platform, toko paling laris, serta tren pesanan.</p>
          </div>
          <div className="w-48">
            <SearchableSelect
              value={period}
              onChange={setPeriod}
              options={PERIOD_OPTIONS}
              placeholder="Periode"
            />
          </div>
        </div>

        <AsyncState
          loading={overview.isLoading}
          error={overview.error ? getApiMessage(overview.error, "Data monitoring gagal dimuat.") : ""}
        />

        {data ? (
          <>
            <InfoGrid stats={data.stats} />

            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
              <TopStoresRanking stores={data.topStores} startDate={data.start_date} />
              <div className="space-y-4">
                <OrderTrendMini trend={data.trend} />
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-base font-extrabold text-slate-950">Inspeksi Toko</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Klik toko pada ranking untuk membuka detail statistik, pesanan, produk, dan settlement satu toko.
                    </p>
                    <Link
                      to="/admin/store-context"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      <span className="material-symbols-outlined text-base">storefront</span>
                      Buka Store Context
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}