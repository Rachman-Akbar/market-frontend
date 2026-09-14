import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import {
  useStoreContextStores,
  useStoreContextStats,
  useStoreContextOrderTrend,
  useStoreContextOrders,
  useStoreContextProducts,
  useStoreContextSettlements,
  getStoreContextError,
} from "@/features/admin/storeContext/services/adminStoreContextService";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

const ORDER_TABS = [
  { key: "stats", label: "Statistik", icon: "monitoring" },
  { key: "trend", label: "Tren", icon: "show_chart" },
  { key: "orders", label: "Pesanan", icon: "receipt_long" },
  { key: "products", label: "Produk", icon: "inventory_2" },
  { key: "settlements", label: "Settlement", icon: "payments" },
];

export default function AdminStoreContextPage() {
  const [search] = useState("");
  const [searchParams] = useSearchParams();
  const paramStoreId = searchParams.get("storeId") || "";
  const [storeId, setStoreId] = useState(paramStoreId);
  const [period, setPeriod] = useState("monthly");
  const [tab, setTab] = useState("stats");

  useEffect(() => {
    const next = searchParams.get("storeId") || "";
    if (next) setStoreId(next);
  }, [searchParams]);

  const storesQuery = useStoreContextStores({ search: search || undefined, per_page: 100 });
  const stores = storesQuery.data?.rows || [];
  const storeOptions = stores.map((s) => ({ value: String(s.id), label: s.name }));

  const selectedStore = stores.find((s) => String(s.id) === String(storeId));

  return (
    <AdminShell title="Monitoring Toko (Store Context)" subtitle="Pilih satu toko untuk melihat statistik, pesanan, produk, dan settlement secara terfokus.">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SearchableSelect
                  value={storeId}
                  onChange={setStoreId}
                  options={storeOptions}
                  placeholder="Pilih toko untuk dilihat"
                  emptyText={storesQuery.isLoading ? "Memuat toko..." : "Tidak ada toko"}
                  className="w-full"
                />
              </div>
              <div>
                <SearchableSelect
                  value={period}
                  onChange={setPeriod}
                  options={[
                    { value: "daily", label: "Harian" },
                    { value: "weekly", label: "Mingguan" },
                    { value: "monthly", label: "Bulanan" },
                    { value: "yearly", label: "Tahunan" },
                  ]}
                  placeholder="Periode"
                  disabled={!storeId}
                  emptyText="—"
                />
              </div>
            </div>
            {selectedStore && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
                <span className="material-symbols-outlined text-slate-500">store</span>
                <span className="font-bold text-slate-900">{selectedStore.name}</span>
                <span className="text-xs text-slate-500">• {selectedStore.ownerName || "—"}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${selectedStore.isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {selectedStore.status}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {storeId && (
          <div className="flex flex-wrap gap-2">
            {ORDER_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                  tab === t.key ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {storeId && (
          <>
            {tab === "stats" && <StatsTab storeId={storeId} period={period} />}
            {tab === "trend" && <TrendTab storeId={storeId} period={period} />}
            {tab === "orders" && <OrdersTab storeId={storeId} />}
            {tab === "products" && <ProductsTab storeId={storeId} />}
            {tab === "settlements" && <SettlementsTab storeId={storeId} />}
          </>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, icon, accent = "text-teal-700" }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 ${accent}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="truncate text-lg font-extrabold text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsTab({ storeId, period }) {
  const stats = useStoreContextStats(storeId, period);
  const data = stats.data;

  return (
    <div className="space-y-4">
      <AsyncState loading={stats.isLoading} error={stats.error ? getStoreContextError(stats.error) : ""} />
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Orders (periode)" value={data.orders?.total ?? 0} icon="receipt_long" />
            <StatCard label="Pendapatan" value={formatRupiah(data.orders?.revenue)} icon="payments" />
            <StatCard label="Biaya Admin" value={formatRupiah(data.orders?.admin_fees)} icon="percent" />
            <StatCard label="Penjual Bersih" value={formatRupiah(data.orders?.seller_net)} icon="trending_up" />
            <StatCard label="Produk Aktif" value={data.products?.active ?? 0} icon="inventory_2" accent="text-green-700" />
            <StatCard label="Total Produk" value={data.products?.total ?? 0} icon="category" accent="text-green-700" />
            <StatCard label="Settlement Selesai" value={data.settlements?.settled ?? 0} icon="task_alt" accent="text-blue-700" />
            <StatCard label="Settlement Pending" value={data.settlements?.pending ?? 0} icon="pending" accent="text-amber-700" />
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 text-base font-extrabold text-slate-950">Ringkasan Settlement</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Gross</p>
                  <p className="text-lg font-extrabold text-slate-950">{formatRupiah(data.settlements?.gross)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Biaya Admin</p>
                  <p className="text-lg font-extrabold text-slate-950">{formatRupiah(data.settlements?.admin_fee)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net</p>
                  <p className="text-lg font-extrabold text-slate-950">{formatRupiah(data.settlements?.net)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function TrendTab({ storeId, period }) {
  const trend = useStoreContextOrderTrend(storeId, period);
  const data = trend.data;
  const points = data?.trend || [];
  const max = Math.max(1, ...points.map((p) => p.orders), ...points.map((p) => Number(p.revenue)));

  return (
    <div className="space-y-4">
      <AsyncState loading={trend.isLoading} error={trend.error ? getStoreContextError(trend.error) : ""} empty={!trend.isLoading && !points.length} emptyText="Belum ada data tren." />
      {!trend.isLoading && points.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-extrabold text-slate-950">Tren Order &amp; Pendapatan ({period})</h3>
            <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ height: 160 }}>
              {points.map((p) => (
                <div key={p.date} className="flex min-w-[24px] flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-teal-500"
                    style={{ height: `${Math.max(3, (Number(p.orders) / max) * 120)}px` }}
                    title={`${p.date}: ${p.orders} order, ${formatRupiah(p.revenue)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>{points[0]?.date}</span>
              <span>{points[points.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OrdersTab({ storeId }) {
  const [status, setStatus] = useState("");
  const orders = useStoreContextOrders(storeId, { status: status || undefined, per_page: 30 });
  const rows = orders.data?.rows || [];
  const meta = orders.data?.meta || {};

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-950">Pesanan Toko ({meta.total ?? rows.length})</h3>
          <div className="w-44">
            <SearchableSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              placeholder="Semua status"
              emptyText="—"
            />
          </div>
        </div>
        <AsyncState loading={orders.isLoading} error={orders.error ? getStoreContextError(orders.error) : ""} empty={!orders.isLoading && !rows.length} emptyText="Belum ada pesanan." />
        {!orders.isLoading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-semibold">ID</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Subtotal</th>
                  <th className="py-2 pr-3 font-semibold">Ongkir</th>
                  <th className="py-2 pr-3 font-semibold">Biaya Admin</th>
                  <th className="py-2 font-semibold">Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-900">#{o.id}</td>
                    <td className="py-2 pr-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{o.status}</span>
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(o.total_items_price)}</td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(o.shipping_cost)}</td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(o.admin_fee)}</td>
                    <td className="py-2 text-slate-500">{o.created_at ? new Date(o.created_at).toLocaleString("id-ID") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductsTab({ storeId }) {
  const products = useStoreContextProducts(storeId, { per_page: 30 });
  const rows = products.data?.rows || [];

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h3 className="text-base font-extrabold text-slate-950">Produk Toko</h3>
        <AsyncState loading={products.isLoading} error={products.error ? getStoreContextError(products.error) : ""} empty={!products.isLoading && !rows.length} emptyText="Belum ada produk." />
        {!products.isLoading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Nama Produk</th>
                  <th className="py-2 pr-3 font-semibold">Harga</th>
                  <th className="py-2 pr-3 font-semibold">Stok</th>
                  <th className="py-2 font-semibold">Aktif</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(p.price)}</td>
                    <td className="py-2 pr-3 text-slate-600">{p.stock ?? "-"}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SettlementsTab({ storeId }) {
  const [status, setStatus] = useState("");
  const settlements = useStoreContextSettlements(storeId, { status: status || undefined, per_page: 30 });
  const rows = settlements.data?.rows || [];

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-950">Settlement Toko</h3>
          <div className="w-44">
            <SearchableSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "pending", label: "Pending" },
                { value: "settled", label: "Settled" },
              ]}
              placeholder="Semua status"
              emptyText="—"
            />
          </div>
        </div>
        <AsyncState loading={settlements.isLoading} error={settlements.error ? getStoreContextError(settlements.error) : ""} empty={!settlements.isLoading && !rows.length} emptyText="Belum ada settlement." />
        {!settlements.isLoading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-3 font-semibold">ID</th>
                  <th className="py-2 pr-3 font-semibold">Gross</th>
                  <th className="py-2 pr-3 font-semibold">Biaya Admin</th>
                  <th className="py-2 pr-3 font-semibold">Net</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-slate-900">#{s.id}</td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(s.gross_amount)}</td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(s.admin_fee)}</td>
                    <td className="py-2 pr-3 text-slate-600">{formatRupiah(s.net_amount)}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.status === "settled" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
