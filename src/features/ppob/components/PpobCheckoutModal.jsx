import { memo, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Badge } from "@/shared/components/ui/Badge";
import { usePpobPayment } from "@/features/ppob/hooks/usePpobPayment";

export const PPOB_STATUS_STYLES = {
  success: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-slate-100 text-slate-700",
  refunded: "bg-purple-100 text-purple-700",
};

export const PPOB_PAYMENT_STATUS_LABELS = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  failed: "Pembayaran Gagal",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
};

export const PPOB_PAYMENT_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-slate-100 text-slate-700",
  refunded: "bg-purple-100 text-purple-700",
};

const PAYMENT_FLOW = ["customer", "inquiry", "confirm", "payment"];

const WIZARD_STEPS = [
  { key: "customer", title: "Nomor Customer" },
  { key: "inquiry", title: "Inquiry" },
  { key: "confirm", title: "Konfirmasi" },
  { key: "payment", title: "Pembayaran" },
];

const SUCCESS_MESSAGES = {
  success: "Pembayaran berhasil. Pesanan Anda sedang diproses dan akan dikirimkan segera.",
  pending: "Pembayaran Anda menunggu konfirmasi. Anda dapat melihat statusnya di Riwayat Transaksi.",
  error: "Pembayaran gagal. Silakan coba lagi.",
  closed: "Jendela pembayaran ditutup sebelum pembayaran selesai. Pembayaran Anda belum diselesaikan.",
};

export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

function DefaultInvoice({ tx = {}, productName = "", customerId = "", total = 0, providerPrice = 0, adminFee = 0 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between gap-2 bg-orange-600 px-5 py-4 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-100">Invoice</p>
          <p className="text-sm font-bold">#{tx.referenceId || "-"}</p>
        </div>
        <span className="material-symbols-outlined text-3xl">receipt_long</span>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Produk</span>
          <span className="font-semibold text-slate-900">{tx.productName || productName || "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Nomor Customer</span>
          <span className="font-mono font-semibold text-slate-900">{tx.customerId || customerId || "-"}</span>
        </div>
        {tx.customerName ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Nama Pelanggan</span>
            <span className="font-semibold text-slate-900">{tx.customerName}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Tanggal</span>
          <span className="font-semibold text-slate-900">
            {tx.paidAt || tx.createdAt ? new Date(tx.paidAt || tx.createdAt).toLocaleString("id-ID") : "-"}
          </span>
        </div>

        {providerPrice > 0 && (
          <>
            <div className="my-1 border-t border-dashed border-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Harga</span>
              <span className="font-semibold text-slate-900">{formatRupiah(providerPrice)}</span>
            </div>
          </>
        )}
        {adminFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Biaya Admin</span>
            <span className="font-semibold text-slate-900">{formatRupiah(adminFee)}</span>
          </div>
        )}

        <div className="my-1 border-t border-dashed border-slate-200" />

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Status Pembayaran</span>
          <Badge className={PPOB_PAYMENT_STATUS_STYLES[tx.paymentStatus] || "bg-green-100 text-green-700"}>
            {PPOB_PAYMENT_STATUS_LABELS[tx.paymentStatus] || tx.paymentStatus || "Dibayar"}
          </Badge>
        </div>
        {tx.sn ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Serial Number</span>
            <span className="font-mono font-semibold text-slate-900">{tx.sn}</span>
          </div>
        ) : null}
        {tx.paymentMethod ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Metode Pembayaran</span>
            <span className="font-semibold text-slate-900">{tx.paymentMethod}</span>
          </div>
        ) : null}

        <div className="my-1 border-t border-slate-200" />

        <div className="flex items-center justify-between text-base">
          <span className="font-semibold text-slate-700">Total Dibayar</span>
          <span className="font-bold text-orange-600">{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Shared checkout modal for PPOB (Top Up & Tagihan).
 * Handles prepaid (Pulsa/Data/Token) via Midtrans payment and
 * postpaid (Tagihan) via inquiry → confirm → direct pay.
 *
 * Usage:
 *   const [product, setProduct] = useState(null);
 *   <PpobCheckoutModal product={product} onClose={() => setProduct(null)} />
 */
export const PpobCheckoutModal = memo(function PpobCheckoutModal({
  product,
  onClose,
  onSuccess,
  customerLabel,
  initialCustomerId = "",
}) {
  const [customerId, setCustomerId] = useState(initialCustomerId);

  const {
    step,
    setStep,
    created,
    setCreated,
    setLiveStatus,
    paymentResult,
    setPaymentResult,
    inquiryData,
    failure,
    setFailure,
    ledger,
    isTerminal,
    payPrepaid,
    inquiryBill,
    payPostpaid,
    retryPay,
  } = usePpobPayment({ onSuccess });

  const isPostpaid = product?.productType === "postpaid";

  // Reset state whenever the modal opens with a new product
  useEffect(() => {
    if (product) {
      setCustomerId(initialCustomerId);
      setStep("customer");
      setCreated(null);
      setLiveStatus(null);
      setPaymentResult(null);
      setFailure("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const goToConfirm = useCallback(() => {
    if (!product) return;
    if (!customerId.trim()) {
      setFailure("Masukkan nomor customer terlebih dahulu.");
      return;
    }
    setFailure("");

    if (isPostpaid) {
      inquiryBill(product, customerId.trim());
      return;
    }
    setStep("confirm");
  }, [customerId, isPostpaid, inquiryBill, product, setStep, setFailure]);

  const handlePay = useCallback(() => {
    if (isPostpaid && inquiryData) {
      payPostpaid(inquiryData.referenceId);
      return;
    }
    if (product) {
      payPrepaid(product, customerId.trim());
    }
  }, [isPostpaid, inquiryData, product, customerId, payPostpaid, payPrepaid]);

  if (!product) return null;

  const stepIndex = PAYMENT_FLOW.indexOf(step);
  const totalAmount = inquiryData?.total_amount ?? product.sellingPrice;

  const renderInvoice = step === "payment" && paymentResult === "success";
  const showSpinner = step === "payment" && !paymentResult && !failure && !isTerminal;

  const label = customerLabel || (product.category === "tagihan" ? "Nomor Pelanggan" : "Nomor HP / ID Pelanggan");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {step === "payment" ? "Pembayaran" : isPostpaid ? `Bayar ${product.name}` : `Beli ${product.name}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {step !== "payment" && (
          <ol className="mt-3 flex items-center gap-2 text-xs font-semibold">
            {WIZARD_STEPS.map((s, i) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    i < stepIndex ? "bg-green-600 text-white" : i === stepIndex ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                <span className={i === stepIndex ? "text-orange-600" : "text-slate-500"}>{s.title}</span>
                {i < WIZARD_STEPS.length - 1 && <span className="h-px w-5 bg-slate-300" />}
              </li>
            ))}
          </ol>
        )}

        {step === "customer" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500">
              {product.name} • <span className="font-semibold text-orange-600">{formatRupiah(product.sellingPrice)}</span>
            </p>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <Input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="08xxxxxxxxxx"
              inputMode="numeric"
              autoFocus
            />
            {isPostpaid ? (
              <p className="text-xs text-slate-500">Kami akan memeriksa data tagihan Anda terlebih dahulu sebelum pembayaran.</p>
            ) : (
              <p className="text-xs text-slate-500">Pembayaran dilakukan melalui Midtrans sebelum top-up dikirim.</p>
            )}
            {failure && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{failure}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Batal</Button>
              <Button onClick={goToConfirm}>Lanjut</Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="mt-4 space-y-3">
            <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500">Produk</dt>
                <dd className="font-semibold text-slate-900">{product.name}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-mono font-semibold text-slate-900">{customerId}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-500">Total Bayar</dt>
                <dd className="font-bold text-orange-600">{formatRupiah(totalAmount)}</dd>
              </div>
            </dl>
            {(product.sellingPrice !== product.providerPrice || product.adminFee > 0) && (
              <p className="text-xs text-slate-500">
                Harga modal {formatRupiah(product.providerPrice)} + biaya admin {formatRupiah(product.adminFee)}.
              </p>
            )}
            {failure && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{failure}</p>}
            <div className="mt-5 flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("customer")}>Kembali</Button>
              <Button onClick={handlePay}>Bayar Sekarang</Button>
            </div>
          </div>
        )}

        {isPostpaid && step === "inquiry" && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-600" />
              Memeriksa data pelanggan...
            </div>
            <p className="text-xs text-slate-400">Sistem sedang memverifikasi tagihan dengan provider.</p>
          </div>
        )}

        {step === "payment" && created && (
          <div className="mt-4 space-y-4">
            {renderInvoice ? (
              <>
                <DefaultInvoice
                  tx={ledger}
                  productName={product.name}
                  customerId={customerId}
                  total={totalAmount}
                  providerPrice={product.providerPrice}
                  adminFee={product.adminFee}
                />
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  {SUCCESS_MESSAGES.success}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/ppob/invoice/${encodeURIComponent(created.referenceId || "")}`}>
                    <Button variant="outline" size="sm">
                      <span className="material-symbols-outlined text-base">receipt_long</span> Lihat Invoice
                    </Button>
                  </Link>
                  <Button onClick={onClose}>Selesai</Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{customerId}</p>
                    <p className="text-xs text-slate-400">Ref: {created.referenceId}</p>
                  </div>
                  <div className="ml-auto shrink-0 font-bold text-orange-600">{formatRupiah(totalAmount)}</div>
                </div>

                {showSpinner && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-600" />
                    Memproses pembayaran...
                  </div>
                )}

                {paymentResult && !renderInvoice && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                      paymentResult === "success"
                        ? "bg-green-50 text-green-700"
                        : paymentResult === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : paymentResult === "closed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-50 text-red-600"
                    }`}
                  >
                    {SUCCESS_MESSAGES[paymentResult]}
                    {paymentResult === "error" && failure && <p className="mt-1 text-xs font-normal text-red-500">{failure}</p>}
                  </div>
                )}

                {!paymentResult && failure && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{failure}</div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Badge className={PPOB_PAYMENT_STATUS_STYLES[ledger.paymentStatus] || "bg-slate-100 text-slate-700"}>
                    {PPOB_PAYMENT_STATUS_LABELS[ledger.paymentStatus] || ledger.paymentStatus || "Pending"}
                  </Badge>
                  <div className="flex gap-2">
                    {((paymentResult === "error") || paymentResult === "closed" || failure) && (
                      <Button variant="outline" size="sm" onClick={retryPay}>Coba Bayar Lagi</Button>
                    )}
                    <Button size="sm" onClick={onClose}>Selesai</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
