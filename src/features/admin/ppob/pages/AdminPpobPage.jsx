import { useCallback, useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SkeletonProductGrid, SkeletonStatGrid, SkeletonTable } from "@/shared/components/feedback/Skeleton";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import {
  usePpobAdminDashboard,
  usePpobAdminFinance,
  usePpobAdminBalance,
  usePpobAdminProducts,
  usePpobAdminOperators,
  usePpobAdminPricingRules,
  useCreatePpobAdminProduct,
  useDeletePpobAdminProduct,
  useCreatePpobAdminOperator,
  useCreatePpobAdminPricingRule,
  getPpobAdminError,
} from "@/features/ppob/services/ppobService";
import {
  useCreatePpobTransaction,
} from "@/features/ppob/services/ppobService";
import { usePpobCatalog } from "@/features/ppob/hooks/usePpobCatalog";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

const CATEGORY_LABELS = {
  pulsa: "Pulsa",
  data: "Paket Data",
  "token-listrik": "Token Listrik",
  tagihan: "Tagihan Listrik",
  internet: "Internet / WiFi",
  voucher: "Voucher",
};

const CATEGORY_ICONS = {
  pulsa: "phone_android",
  data: "wifi",
  "token-listrik": "bolt",
  tagihan: "receipt_long",
  internet: "router",
  voucher: "confirmation_number",
};

const STATUS_STYLES = {
  success: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const TABS = [
  { key: "buy", label: "Beli", icon: "add_card" },
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "finance", label: "Keuangan", icon: "account_balance" },
  { key: "products", label: "Produk", icon: "inventory_2" },
  { key: "operators", label: "Operator", icon: "perm_identity" },
  { key: "pricing", label: "Aturan Harga", icon: "tune" },
];

export default function AdminPpobPage() {
  const [tab, setTab] = useState("buy");
  const notifications = useNotificationCenter();

  return (
    <AdminShell title="Manajemen PPOB" subtitle="Kelola pulsa, token listrik, tagihan, operator, dan aturan harga.">
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
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

      {tab === "buy" && <BuyTab notifications={notifications} />}
      {tab === "dashboard" && <DashboardTab />}
      {tab === "finance" && <FinanceTab />}
      {tab === "products" && <ProductsTab notifications={notifications} />}
      {tab === "operators" && <OperatorsTab notifications={notifications} />}
      {tab === "pricing" && <PricingTab notifications={notifications} />}
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

function BuyTab({ notifications }) {
  const [category, setCategory] = useState("pulsa");
  const [operatorId, setOperatorId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [result, setResult] = useState(null);

  const catalog = usePpobCatalog(category, operatorId);
  const createMut = useCreatePpobTransaction();

  const categories = catalog.categories;
  const products = catalog.products;
  const operators = catalog.operators;
  const isLoadingProducts = catalog.isLoadingProducts;
  const productsError = catalog.error;

  const openBuy = useCallback((product) => {
    setSelectedProduct(product);
    setCustomerId("");
    setResult(null);
  }, []);

  const closeBuy = useCallback(() => setSelectedProduct(null), []);

  const doBuy = useCallback(async () => {
    if (!selectedProduct) return;
    if (!customerId.trim()) {
      setResult({ ok: false, message: "Masukkan nomor HP / ID pelanggan terlebih dahulu." });
      return;
    }
    setResult(null);
    try {
      const res = await createMut.mutateAsync({ productId: selectedProduct.id, customerId: customerId.trim() });
      notifications.push({ type: "success", title: "Beli PPOB", message: `"${selectedProduct.name}" status ${res?.status || "pending"}.` });
      setResult({ ok: true, message: `Transaksi "${selectedProduct.name}" berhasil. Status: ${res?.status || "pending"}`, data: res });
      setSelectedProduct(null);
    } catch (e) {
      const msg = getPpobAdminError(e, "Transaksi gagal diproses.");
      notifications.push({ type: "error", title: "Beli PPOB", message: msg });
      setResult({ ok: false, message: msg });
    }
  }, [selectedProduct, customerId, createMut, notifications]);

  const selectCategory = useCallback((key) => {
    setCategory(key);
    setOperatorId("");
  }, []);

  const operatorOptions = useMemo(
    () => operators.map((o) => ({ value: String(o.id), label: o.name })),
    [operators]
  );

  const productGrid = useMemo(
    () =>
      products.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <span className="material-symbols-outlined text-lg">{CATEGORY_ICONS[category] || "category"}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${p.productType === "postpaid" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                {p.productType === "postpaid" ? "Tagihan" : "Prepaid"}
              </span>
            </div>
            <p className="truncate text-sm font-semibold text-slate-900" title={p.name}>{p.name}</p>
            <p className="text-sm font-bold text-teal-700">{formatRupiah(p.sellingPrice)}</p>
            <Button size="sm" onClick={() => openBuy(p)} disabled={!p.isAvailable}>
              {p.productType === "postpaid" ? "Bayar" : "Beli"}
            </Button>
          </CardContent>
        </Card>
      )),
    [products, category, openBuy]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => selectCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === cat.key ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-base">{CATEGORY_ICONS[cat.key] || "category"}</span>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="min-w-[180px] max-w-xs lg:ml-auto">
          <SearchableSelect
            value={operatorId}
            onChange={setOperatorId}
            options={operatorOptions}
            placeholder="Semua operator"
            emptyText="Tidak ada operator"
          />
        </div>
      </div>

      {isLoadingProducts && !products.length ? (
        <SkeletonProductGrid count={8} />
      ) : (
        <>
          <AsyncState loading={false} error={productsError} empty={!isLoadingProducts && !products.length} emptyText="Tidak ada produk pada kategori ini." />
          {!isLoadingProducts && !productsError && products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{productGrid}</div>
          )}
        </>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeBuy}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Pembelian</h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedProduct.name} • <span className="font-semibold text-teal-700">{formatRupiah(selectedProduct.sellingPrice)}</span>
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {selectedProduct.category === "tagihan" ? "Nomor Pelanggan" : "Nomor HP / ID Pelanggan"}
              </label>
              <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="08xxxxxxxxxx" inputMode="numeric" />
              {selectedProduct.sellingPrice !== selectedProduct.providerPrice && (
                <p className="text-xs text-slate-500">Harga modal {formatRupiah(selectedProduct.providerPrice)} + biaya admin {formatRupiah(selectedProduct.adminFee)}.</p>
              )}
            </div>
            {result && (
              <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{result.message}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={closeBuy}>Batal</Button>
              <Button onClick={doBuy} disabled={createMut.isPending} className="bg-teal-600 hover:bg-teal-700">
                {createMut.isPending ? "Memproses..." : "Konfirmasi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardTab() {
  const dashboard = usePpobAdminDashboard();
  const balance = usePpobAdminBalance();
  const data = dashboard.data;

  return (
    <div className="space-y-4">
      <AsyncState loading={false} error={dashboard.error ? getPpobAdminError(dashboard.error, "Gagal memuat dashboard PPOB.") : ""} />
      {dashboard.isLoading && !data ? <SkeletonStatGrid count={8} /> : null}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total Transaksi" value={data.summary?.total_orders ?? 0} icon="receipt_long" />
            <StatCard label="Sukses" value={data.summary?.success_orders ?? 0} icon="check_circle" accent="text-green-700" />
            <StatCard label="Gagal" value={data.summary?.failed_orders ?? 0} icon="cancel" accent="text-red-700" />
            <StatCard label="Transaksi Hari Ini" value={data.summary?.orders_today ?? 0} icon="today" />
            <StatCard label="Total Pendapatan" value={formatRupiah(data.summary?.total_revenue)} icon="payments" accent="text-teal-700" />
            <StatCard label="Laba Bersih" value={formatRupiah(data.summary?.total_profit)} icon="trending_up" accent="text-teal-700" />
            <StatCard label="Pendapatan Hari Ini" value={formatRupiah(data.summary?.revenue_today)} icon="savings" />
            <StatCard label="Laba Hari Ini" value={formatRupiah(data.summary?.profit_today)} icon="local_atm" />
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 text-base font-extrabold text-slate-950">Saldo Provider (IAK)</h3>
              {balance.isLoading ? (
                <p className="text-sm text-slate-500">Memeriksa saldo...</p>
              ) : balance.error ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Tidak dapat memeriksa saldo: {getPpobAdminError(balance.error, "Terjadi kesalahan.")}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Saldo</p>
                    <p className="text-xl font-extrabold text-slate-950">{formatRupiah(balance.data?.balance)}</p>
                  </div>
                  {balance.data?.currency ? (
                    <div>
                      <p className="text-xs text-slate-500">Mata Uang</p>
                      <p className="text-xl font-extrabold text-slate-950">{balance.data.currency}</p>
                    </div>
                  ) : null}
                  {balance.data?.message ? (
                    <div className="sm:col-span-3">
                      <p className="text-xs text-slate-500">Keterangan</p>
                      <p className="text-sm font-semibold text-slate-700">{balance.data.message}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {(data.by_category?.length || 0) > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 text-base font-extrabold text-slate-950">Per Kategori</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {data.by_category.map((c) => (
                    <div key={c.category} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-700">{CATEGORY_LABELS[c.category] || c.category}</span>
                      <span className="text-sm text-slate-500">{c.count} transaksi • {formatRupiah(c.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(data.recent_transactions?.length || 0) > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 text-base font-extrabold text-slate-950">Transaksi Terbaru</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2 pr-3 font-semibold">Produk</th>
                        <th className="py-2 pr-3 font-semibold">Kategori</th>
                        <th className="py-2 pr-3 font-semibold">Customer</th>
                        <th className="py-2 pr-3 font-semibold">Total</th>
                        <th className="py-2 pr-3 font-semibold">Status</th>
                        <th className="py-2 font-semibold">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-semibold text-slate-900">{tx.product_name || "-"}</td>
                          <td className="py-2 pr-3 text-slate-600">{CATEGORY_LABELS[tx.category] || tx.category}</td>
                          <td className="py-2 pr-3 text-slate-600">{tx.customer_id}</td>
                          <td className="py-2 pr-3 font-semibold text-slate-900">{formatRupiah(tx.total_amount)}</td>
                          <td className="py-2 pr-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[tx.status] || "bg-slate-100 text-slate-700"}`}>{tx.status}</span>
                          </td>
                          <td className="py-2 text-slate-500">{tx.created_at ? new Date(tx.created_at).toLocaleString("id-ID") : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function FinanceTab() {
  const finance = usePpobAdminFinance();
  const data = finance.data;

  const rows = data
    ? [
        { label: "Pendapatan (Revenue)", value: data.revenue, icon: "payments" },
        { label: "Biaya Provider", value: data.provider_cost, icon: "savings" },
        { label: "Biaya Admin", value: data.admin_fee, icon: "receipt" },
        { label: "Komisi", value: data.commission, icon: "percent" },
        { label: "Laba Bersih", value: data.net_profit, icon: "trending_up" },
      ]
    : [];

  return (
    <div className="space-y-4">
      <AsyncState loading={false} error={finance.error ? getPpobAdminError(finance.error, "Gagal memuat ringkasan keuangan.") : ""} />
      {finance.isLoading && !data ? <SkeletonStatGrid count={3} /> : null}
      {data && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-extrabold text-slate-950">Ringkasan Keuangan PPOB</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <div key={r.label} className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                    <span className="text-xs font-semibold">{r.label}</span>
                  </div>
                  <p className={`mt-1 text-lg font-extrabold ${r.label.includes("Laba") ? "text-teal-700" : "text-slate-950"}`}>{formatRupiah(r.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProductsTab({ notifications }) {
  const [category, setCategory] = useState("pulsa");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({});
  const products = usePpobAdminProducts({ category });
  const operatorsQuery = usePpobAdminOperators();
  const createMut = useCreatePpobAdminProduct();
  const deleteMut = useDeletePpobAdminProduct();

  const operators = operatorsQuery.data?.rows || [];

  const openCreate = () => {
    setForm({ category, product_type: "prepaid", provider_price: 0, admin_fee: 0, margin: 0, commission: 0, operator_id: "" });
    setIsOpen(true);
  };

  const save = async () => {
    try {
      await createMut.mutateAsync({
        category: form.category,
        product_type: form.product_type,
        provider_product_code: form.provider_product_code,
        name: form.name,
        brand: form.brand || null,
        nominal: form.nominal || null,
        operator_id: form.operator_id ? Number(form.operator_id) : null,
        provider_price: Number(form.provider_price || 0),
        admin_fee: Number(form.admin_fee || 0),
        margin: Number(form.margin || 0),
        commission: Number(form.commission || 0),
        icon_url: form.icon_url || null,
      });
      setIsOpen(false);
      notifications.push({ type: "success", title: "Produk PPOB", message: "Produk berhasil dibuat." });
    } catch (e) {
      notifications.push({ type: "error", title: "Produk PPOB", message: getPpobAdminError(e) });
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    try {
      await deleteMut.mutateAsync(id);
      notifications.push({ type: "success", title: "Produk PPOB", message: "Produk berhasil dihapus." });
    } catch (e) {
      notifications.push({ type: "error", title: "Produk PPOB", message: getPpobAdminError(e) });
    }
  };

  const rows = products.data?.rows || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="max-w-xs">
          <SearchableSelect
            value={category}
            onChange={setCategory}
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
            placeholder="Kategori"
            emptyText="—"
          />
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <span className="material-symbols-outlined text-base">add</span> Tambah Produk
        </Button>
      </div>

      <AsyncState loading={false} error={products.error ? getPpobAdminError(products.error) : ""} empty={!products.isLoading && !rows.length} emptyText="Tidak ada produk pada kategori ini." />
      {products.isLoading && !rows.length ? <SkeletonTable rows={5} cols={5} /> : null}
      {!products.isLoading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-semibold">Produk</th>
                <th className="py-2 pr-3 font-semibold">Kategori</th>
                <th className="py-2 pr-3 font-semibold">Harga Modal</th>
                <th className="py-2 pr-3 font-semibold">Harga Jual</th>
                <th className="py-2 pr-3 font-semibold">Margin</th>
                <th className="py-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-3">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.productType} • {p.providerProductCode}</p>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{CATEGORY_LABELS[p.category] || p.category}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatRupiah(p.providerPrice)}</td>
                  <td className="py-2 pr-3 font-semibold text-slate-900">{formatRupiah(p.sellingPrice)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatRupiah(p.margin)}</td>
                  <td className="py-2">
                    <button type="button" onClick={() => remove(p.id, p.name)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <Modal title="Tambah Produk PPOB" onClose={() => setIsOpen(false)} onSave={save} pending={createMut.isPending}>
          <Field label="Nama Produk (wajib)">
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Telkomsel 10rb" />
          </Field>
          <Field label="Kode Produk Provider (wajib, unik)">
            <Input value={form.provider_product_code || ""} onChange={(e) => setForm({ ...form, provider_product_code: e.target.value })} placeholder="e.g. PLSR10" />
          </Field>
          <Field label="Tipe Produk">
            <SearchableSelect
              value={form.product_type}
              onChange={(v) => setForm({ ...form, product_type: v })}
              options={[{ value: "prepaid", label: "Prepaid" }, { value: "postpaid", label: "Postpaid / Tagihan" }]}
              placeholder="Tipe"
              emptyText="—"
            />
          </Field>
          <Field label="Operator">
            <SearchableSelect
              value={form.operator_id || ""}
              onChange={(v) => setForm({ ...form, operator_id: v })}
              options={operators.map((o) => ({ value: String(o.id), label: o.name }))}
              placeholder="Pilih operator (opsional)"
              emptyText="—"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga Modal (wajib)">
              <Input type="number" value={form.provider_price || 0} onChange={(e) => setForm({ ...form, provider_price: e.target.value })} />
            </Field>
            <Field label="Biaya Admin">
              <Input type="number" value={form.admin_fee || 0} onChange={(e) => setForm({ ...form, admin_fee: e.target.value })} />
            </Field>
            <Field label="Margin">
              <Input type="number" value={form.margin || 0} onChange={(e) => setForm({ ...form, margin: e.target.value })} />
            </Field>
            <Field label="Komisi">
              <Input type="number" value={form.commission || 0} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
            </Field>
          </div>
          <Field label="Nominal">
            <Input value={form.nominal || ""} onChange={(e) => setForm({ ...form, nominal: e.target.value })} placeholder="e.g. 10000 (opsional)" />
          </Field>
        </Modal>
      )}
    </div>
  );
}

function OperatorsTab({ notifications }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({});
  const operators = usePpobAdminOperators();
  const createMut = useCreatePpobAdminOperator();

  const rows = operators.data?.rows || [];

  const openCreate = () => {
    setForm({ category: "pulsa" });
    setIsOpen(true);
  };

  const save = async () => {
    try {
      await createMut.mutateAsync({
        name: form.name,
        slug: form.slug,
        category: form.category,
        brand: form.brand || null,
        operator_prefix: form.operator_prefix || null,
        icon_url: form.icon_url || null,
      });
      setIsOpen(false);
      notifications.push({ type: "success", title: "Operator PPOB", message: "Operator berhasil dibuat." });
    } catch (e) {
      notifications.push({ type: "error", title: "Operator PPOB", message: getPpobAdminError(e) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <span className="material-symbols-outlined text-base">add</span> Tambah Operator
        </Button>
      </div>
      <AsyncState loading={false} error={operators.error ? getPpobAdminError(operators.error) : ""} empty={!operators.isLoading && !rows.length} emptyText="Belum ada operator." />
      {operators.isLoading && !rows.length ? <SkeletonProductGrid count={3} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /> : null}
      {!operators.isLoading && rows.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="material-symbols-outlined text-2xl text-slate-400">sim_card</span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{o.name}</p>
                    <p className="text-xs text-slate-500">{CATEGORY_LABELS[o.category] || o.category}{o.operatorPrefix ? ` • ${o.operatorPrefix}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <Modal title="Tambah Operator PPOB" onClose={() => setIsOpen(false)} onSave={save} pending={createMut.isPending}>
          <Field label="Nama Operator (wajib)">
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="e.g. Telkomsel" />
          </Field>
          <Field label="Slug (wajib, unik)">
            <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="Kategori">
            <SearchableSelect
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
              placeholder="Kategori"
              emptyText="—"
            />
          </Field>
          <Field label="Brand (opsional)">
            <Input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </Field>
          <Field label="Prefiks Operator (opsional)">
            <Input value={form.operator_prefix || ""} onChange={(e) => setForm({ ...form, operator_prefix: e.target.value })} placeholder="e.g. 0811" />
          </Field>
        </Modal>
      )}
    </div>
  );
}

function PricingTab({ notifications }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({});
  const pricing = usePpobAdminPricingRules();
  const createMut = useCreatePpobAdminPricingRule();

  const rows = pricing.data?.rows || [];

  const openCreate = () => {
    setForm({ level: "global", margin_type: "fixed", margin_value: 0, admin_fee_type: "fixed", admin_fee_value: 0, commission_type: "fixed", commission_value: 0, priority: 0 });
    setIsOpen(true);
  };

  const save = async () => {
    try {
      await createMut.mutateAsync({
        level: form.level,
        category: form.level === "category" ? form.category : null,
        operator_id: form.level === "operator" && form.operator_id ? Number(form.operator_id) : null,
        margin_type: form.margin_type,
        margin_value: Number(form.margin_value || 0),
        admin_fee_type: form.admin_fee_type,
        admin_fee_value: Number(form.admin_fee_value || 0),
        commission_type: form.commission_type,
        commission_value: Number(form.commission_value || 0),
        priority: Number(form.priority || 0),
      });
      setIsOpen(false);
      notifications.push({ type: "success", title: "Aturan Harga", message: "Aturan harga berhasil dibuat." });
    } catch (e) {
      notifications.push({ type: "error", title: "Aturan Harga", message: getPpobAdminError(e) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <span className="material-symbols-outlined text-base">add</span> Tambah Aturan Harga
        </Button>
      </div>
      <AsyncState loading={false} error={pricing.error ? getPpobAdminError(pricing.error) : ""} empty={!pricing.isLoading && !rows.length} emptyText="Belum ada aturan harga." />
      {pricing.isLoading && !rows.length ? <SkeletonTable rows={5} cols={6} /> : null}
      {!pricing.isLoading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-semibold">Level</th>
                <th className="py-2 pr-3 font-semibold">Kategori</th>
                <th className="py-2 pr-3 font-semibold">Margin</th>
                <th className="py-2 pr-3 font-semibold">Biaya Admin</th>
                <th className="py-2 pr-3 font-semibold">Komisi</th>
                <th className="py-2 font-semibold">Prioritas</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 text-slate-600">{r.ruleType || r.level}</td>
                  <td className="py-2 pr-3 text-slate-600">{CATEGORY_LABELS[r.category] || r.category || "-"}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatRule(r.marginType, r.marginValue)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatRule(r.adminFeeType, r.adminFeeValue)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatRule(r.commissionType, r.commissionValue)}</td>
                  <td className="py-2 text-slate-600">{r.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <Modal title="Tambah Aturan Harga" onClose={() => setIsOpen(false)} onSave={save} pending={createMut.isPending}>
          <Field label="Level">
            <SearchableSelect
              value={form.level}
              onChange={(v) => setForm({ ...form, level: v })}
              options={[
                { value: "global", label: "Global" },
                { value: "category", label: "Per Kategori" },
                { value: "operator", label: "Per Operator" },
                { value: "product", label: "Per Produk" },
              ]}
              placeholder="Level"
              emptyText="—"
            />
          </Field>
          {form.level === "category" && (
            <Field label="Kategori">
              <SearchableSelect
                value={form.category || ""}
                onChange={(v) => setForm({ ...form, category: v })}
                options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
                placeholder="Kategori"
                emptyText="—"
              />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipe Margin">
              <SearchableSelect
                value={form.margin_type}
                onChange={(v) => setForm({ ...form, margin_type: v })}
                options={[{ value: "fixed", label: "Fixed" }, { value: "percentage", label: "Persen" }]}
                placeholder="Tipe"
                emptyText="—"
              />
            </Field>
            <Field label="Nilai Margin">
              <Input type="number" value={form.margin_value || 0} onChange={(e) => setForm({ ...form, margin_value: e.target.value })} />
            </Field>
            <Field label="Tipe Biaya Admin">
              <SearchableSelect
                value={form.admin_fee_type}
                onChange={(v) => setForm({ ...form, admin_fee_type: v })}
                options={[{ value: "fixed", label: "Fixed" }, { value: "percentage", label: "Persen" }]}
                placeholder="Tipe"
                emptyText="—"
              />
            </Field>
            <Field label="Nilai Biaya Admin">
              <Input type="number" value={form.admin_fee_value || 0} onChange={(e) => setForm({ ...form, admin_fee_value: e.target.value })} />
            </Field>
            <Field label="Tipe Komisi">
              <SearchableSelect
                value={form.commission_type}
                onChange={(v) => setForm({ ...form, commission_type: v })}
                options={[{ value: "fixed", label: "Fixed" }, { value: "percentage", label: "Persen" }]}
                placeholder="Tipe"
                emptyText="—"
              />
            </Field>
            <Field label="Nilai Komisi">
              <Input type="number" value={form.commission_value || 0} onChange={(e) => setForm({ ...form, commission_value: e.target.value })} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

function formatRule(type, value) {
  const num = Number(value || 0);
  if (type === "percentage") return `${num}%`;
  return formatRupiah(num);
}

function slugify(text) {
  return String(text || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, onSave, pending, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="mt-4 space-y-3">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSave} disabled={pending} className="bg-teal-600 hover:bg-teal-700">
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
