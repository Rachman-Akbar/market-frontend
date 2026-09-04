import { memo, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SkeletonProductGrid, Skeleton, SkeletonTable } from "@/shared/components/feedback/Skeleton";
import { OverflowMenu } from "@/shared/components/ui/OverflowMenu";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { usePpobTransactions } from "@/features/ppob/services/ppobService";
import { usePpobCatalog } from "@/features/ppob/hooks/usePpobCatalog";
import {
  PpobCheckoutModal,
  formatRupiah,
  PPOB_STATUS_STYLES,
  PPOB_PAYMENT_STATUS_LABELS,
  PPOB_PAYMENT_STATUS_STYLES,
} from "@/features/ppob/components/PpobCheckoutModal";
import { useAuth } from "@/features/auth/context/AuthContext";

const CATEGORY_ICONS = {
  pulsa: "phone_android",
  data: "wifi",
  "token-listrik": "bolt",
  tagihan: "receipt_long",
  internet: "router",
  voucher: "confirmation_number",
};

export default function PpobPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("pulsa");
  const [operatorId, setOperatorId] = useState("");
  const [tab, setTab] = useState("beli");

  const catalog = usePpobCatalog(category, operatorId);

  const onRequireLogin = useCallback(() => navigate("/auth/login"), [navigate]);

  const onSelectCategory = useCallback((key) => {
    setCategory(key);
    setOperatorId("");
  }, []);

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-950">PPOB &amp; Top Up</h1>
        <p className="text-sm text-slate-500">Isi pulsa, paket data, token listrik, dan bayar tagihan dengan mudah.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === "beli" ? "default" : "outline"} size="sm" onClick={() => setTab("beli")}>
          <span className="material-symbols-outlined text-base">add_card</span> Beli Produk
        </Button>
        <Button variant={tab === "riwayat" ? "default" : "outline"} size="sm" onClick={() => (isAuthenticated ? setTab("riwayat") : navigate("/auth/login"))}>
          <span className="material-symbols-outlined text-base">history</span> Riwayat Transaksi
        </Button>
      </div>

      {tab === "beli" && (
        <BuyTab
          catalog={catalog}
          category={category}
          onSelectCategory={onSelectCategory}
          operatorId={operatorId}
          setOperatorId={setOperatorId}
          isAuthenticated={isAuthenticated}
          onRequireLogin={onRequireLogin}
        />
      )}

      {tab === "riwayat" && <HistoryTab isAuthenticated={isAuthenticated} onRequireLogin={onRequireLogin} />}
    </main>
  );
}

const BuyTab = memo(function BuyTab({ catalog, category, onSelectCategory, operatorId, setOperatorId, isAuthenticated, onRequireLogin }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openBuy = useCallback(
    (product) => {
      if (!isAuthenticated) {
        onRequireLogin();
        return;
      }
      setSelectedProduct(product);
    },
    [isAuthenticated, onRequireLogin]
  );

  const { categories, operators, products, isLoadingProducts, error } = catalog;

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <Card>
        <CardContent className="pt-6">
          {isLoadingProducts && !categories.length ? (
            <div className="space-y-3" aria-busy="true">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton className="h-9 w-64 max-w-full" />
            </div>
          ) : (
            <>
              <OverflowMenu
                items={categories}
                maxVisible={5}
                buttonLabel="Lainnya"
                buttonClass="py-2"
                menuClassName="w-56"
                renderItem={(cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => onSelectCategory(cat.key)}
                    className={`flex w-full items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors ${
                      category === cat.key ? "bg-orange-50 text-orange-600" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{CATEGORY_ICONS[cat.key] || "category"}</span>
                    {cat.label}
                  </button>
                )}
              />

              <div className="mt-4 max-w-xs">
                <SearchableSelect
                  value={operatorId}
                  onChange={setOperatorId}
                  options={operators.map((o) => ({ value: String(o.id), label: o.name }))}
                  placeholder="Semua operator"
                  emptyText="Tidak ada operator"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Product grid */}
      <AsyncState loading={false} error={error} empty={!isLoadingProducts && !products.length} emptyText="Tidak ada produk pada kategori ini." />
      {isLoadingProducts && !products.length ? <SkeletonProductGrid count={8} /> : null}
      {!isLoadingProducts && !error && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <span className="material-symbols-outlined text-lg">{CATEGORY_ICONS[category] || "category"}</span>
                  </span>
                  <Badge className={p.productType === "postpaid" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}>
                    {p.productType === "postpaid" ? "Tagihan" : "Prepaid"}
                  </Badge>
                </div>
                <p className="truncate text-sm font-semibold text-slate-900" title={p.name}>{p.name}</p>
                <p className="text-sm font-bold text-orange-600">{formatRupiah(p.sellingPrice)}</p>
                <Button size="sm" onClick={() => openBuy(p)} disabled={!p.isAvailable}>
                  {p.productType === "postpaid" ? "Bayar" : "Beli"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Shared checkout modal — handles prepaid (Midtrans) & postpaid (inquiry) flows */}
      <PpobCheckoutModal
        product={selectedProduct}
        customerLabel={selectedProduct?.category === "tagihan" ? "Nomor Pelanggan" : "Nomor HP / ID Pelanggan"}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => {
          setSelectedProduct(null);
        }}
      />
    </div>
  );
});

const HistoryTab = memo(function HistoryTab({ isAuthenticated, onRequireLogin }) {
  const [statusFilter, setStatusFilter] = useState("");
  const res = usePpobTransactions({ status: statusFilter || undefined, per_page: 20 });

  const effectiveRows = res.data?.rows || [];

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="text-base font-extrabold text-slate-950">Riwayat Transaksi PPOB</h3>
        {!isAuthenticated ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">Masuk untuk melihat riwayat transaksi Anda.</p>
            <Button className="mt-4" onClick={onRequireLogin}>Masuk</Button>
          </div>
        ) : (
          <>
            <div className="max-w-xs">
              <SearchableSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "processing", label: "Processing" },
                  { value: "success", label: "Success" },
                  { value: "failed", label: "Failed" },
                  { value: "expired", label: "Expired" },
                ]}
                placeholder="Semua status"
                emptyText="—"
              />
            </div>
            <AsyncState
              loading={false}
              error={res.error ? (res.error.message || "Gagal memuat riwayat.") : ""}
              empty={!res.isLoading && !effectiveRows.length}
              emptyText="Belum ada transaksi."
            />
            {res.isLoading ? <SkeletonTable rows={5} cols={6} /> : null}
            {!res.isLoading && effectiveRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Produk</th>
                      <th className="py-2 pr-3 font-semibold">Customer</th>
                      <th className="py-2 pr-3 font-semibold">Total</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 pr-3 font-semibold">Pembayaran</th>
                      <th className="py-2 pr-3 font-semibold">Tanggal</th>
                      <th className="py-2 font-semibold">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveRows.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 align-top">
                        <td className="py-2 pr-3">
                          <p className="font-semibold text-slate-900">{tx.productName || "-"}</p>
                          <p className="text-xs text-slate-400">{tx.referenceId}</p>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">
                          {tx.customerId}
                          {tx.sn ? <p className="text-xs text-slate-400">SN: {tx.sn}</p> : null}
                        </td>
                        <td className="py-2 pr-3 font-semibold text-slate-900">{formatRupiah(tx.totalAmount)}</td>
                        <td className="py-2 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PPOB_STATUS_STYLES[tx.status] || "bg-slate-100 text-slate-700"}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${PPOB_PAYMENT_STATUS_STYLES[tx.paymentStatus] || "bg-slate-100 text-slate-700"}`}>
                            {tx.paymentStatus === "paid" && (
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            )}
                            {PPOB_PAYMENT_STATUS_LABELS[tx.paymentStatus] || tx.paymentStatus || "—"}
                          </span>
                        </td>
                        <td className="py-2 text-slate-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString("id-ID") : "-"}</td>
                        <td className="py-2">
                          {["success", "processing"].includes(tx.status) ? (
                            <Link
                              to={`/ppob/receipt/${encodeURIComponent(tx.referenceId)}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
                            >
                              <span className="material-symbols-outlined text-sm">receipt_long</span> Lihat
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});
