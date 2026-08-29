import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Badge } from "@/shared/components/ui/Badge";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SkeletonProductGrid, Skeleton, SkeletonLine, SkeletonTable } from "@/shared/components/feedback/Skeleton";
import { OverflowMenu } from "@/shared/components/ui/OverflowMenu";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import {
  usePpobTransactions,
  useCreatePpobTransaction,
  getPpobAdminError,
} from "@/features/ppob/services/ppobService";
import { usePpobCatalog } from "@/features/ppob/hooks/usePpobCatalog";
import { useAuth } from "@/features/auth/context/AuthContext";

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

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

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
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [success, setSuccess] = useState("");
  const [failure, setFailure] = useState("");
  const createMut = useCreatePpobTransaction();

  const openBuy = useCallback(
    (product) => {
      if (!isAuthenticated) {
        onRequireLogin();
        return;
      }
      setSelectedProduct(product);
      setCustomerId("");
      setSuccess("");
      setFailure("");
      setIsBuyOpen(true);
    },
    [isAuthenticated, onRequireLogin]
  );

  const closeBuy = useCallback(() => setIsBuyOpen(false), []);

  const doBuy = useCallback(async () => {
    if (!selectedProduct || !customerId.trim()) {
      setFailure("Masukkan nomor customer terlebih dahulu.");
      return;
    }
    setFailure("");
    setSuccess("");
    try {
      const result = await createMut.mutateAsync({ productId: selectedProduct.id, customerId: customerId.trim() });
      setSuccess(`Transaksi "${selectedProduct.name}" berhasil dibuat. Status: ${result?.status || "pending"}`);
      setIsBuyOpen(false);
    } catch (e) {
      setFailure(getPpobAdminError(e, createMut.error?.message || "Transaksi gagal diproses."));
    }
  }, [selectedProduct, customerId, createMut, getPpobAdminError]);

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

      {/* Buy modal */}
      {isBuyOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeBuy}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Pembelian</h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedProduct.name} • <span className="font-semibold text-orange-600">{formatRupiah(selectedProduct.sellingPrice)}</span>
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {selectedProduct.category === "tagihan" ? "Nomor Pelanggan" : "Nomor HP / ID Pelanggan"}
              </label>
              <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="08xxxxxxxxxx" inputMode="numeric" />
              {selectedProduct.sellingPrice !== selectedProduct.providerPrice && (
                <p className="text-xs text-slate-500">
                  Harga modal {formatRupiah(selectedProduct.providerPrice)} + biaya admin {formatRupiah(selectedProduct.adminFee)}.
                </p>
              )}
            </div>
            {failure && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{failure}</p>}
            {success && <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">{success}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={closeBuy}>Batal</Button>
              <Button onClick={doBuy} disabled={createMut.isPending}>
                {createMut.isPending ? "Memproses..." : "Konfirmasi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const HistoryTab = memo(function HistoryTab({ isAuthenticated, onRequireLogin }) {
  const [statusFilter, setStatusFilter] = useState("");
  const res = usePpobTransactions({ status: statusFilter || undefined, per_page: 20 });

  const effectiveRows = res.data?.rows || [];
  const effectiveMeta = res.data?.meta || {};

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
                ]}
                placeholder="Semua status"
                emptyText="—"
              />
            </div>
            <AsyncState loading={false} error={res.error ? getPpobAdminError(res.error, "Gagal memuat riwayat.") : ""} empty={!res.isLoading && !effectiveRows.length} emptyText="Belum ada transaksi." />
            {res.isLoading ? <SkeletonTable rows={5} cols={5} /> : null}
            {!res.isLoading && effectiveRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Produk</th>
                      <th className="py-2 pr-3 font-semibold">Customer</th>
                      <th className="py-2 pr-3 font-semibold">Total</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 font-semibold">Tanggal</th>
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
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[tx.status] || "bg-slate-100 text-slate-700"}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 text-slate-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString("id-ID") : "-"}</td>
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
