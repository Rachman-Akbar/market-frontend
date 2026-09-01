import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Skeleton } from "@/shared/components/feedback/Skeleton";
import { usePpobInvoice } from "@/features/ppob/services/ppobService";
import {
  PPOB_STATUS_STYLES,
  PPOB_PAYMENT_STATUS_LABELS,
  PPOB_PAYMENT_STATUS_STYLES,
  formatRupiah,
} from "@/features/ppob/components/PpobCheckoutModal";

export default function PpobInvoicePage() {
  const { ref } = useParams();
  const navigate = useNavigate();

  const { data: invoice, isLoading, error } = usePpobInvoice(ref);

  const handlePrintOrDone = () => {
    if (ref && invoice) {
      window.print();
    } else {
      navigate("/ppob?tab=riwayat");
    }
  };

  if (isLoading && !invoice) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
            <h2 className="text-lg font-bold text-slate-900">Invoice tidak ditemukan</h2>
            <p className="text-sm text-slate-500">Invoice tidak tersedia atau tidak berhak diakses.</p>
            <Button onClick={() => navigate("/ppob?tab=riwayat")}>Kembali ke Riwayat</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const dateStr = invoice.paidAt || invoice.createdAt
    ? new Date(invoice.paidAt || invoice.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-950">Detail Invoice</h1>
        <p className="text-sm text-slate-500">Ringkasan pembelian layanan digital Anda.</p>
      </div>

      <div id="invoice-print" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 bg-orange-600 px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-100">Marketplace — Invoice</p>
            <p className="text-xl font-extrabold">#{invoice.invoiceNumber || "-"}</p>
            <p className="text-xs text-orange-100">Ref Transaksi: {invoice.transactionReference || "-"}</p>
          </div>
          <span className="material-symbols-outlined text-4xl">receipt_long</span>
        </div>

        <div className="space-y-3 p-6 text-sm">
          {/* Customer */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Pelanggan</p>
            <p className="font-semibold text-slate-900">{invoice.customerId || "-"}</p>
            {invoice.customerName ? <p className="text-slate-600">{invoice.customerName}</p> : null}
          </div>

          {/* Item */}
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Produk / Layanan</dt>
              <dd className="font-semibold text-slate-900">{invoice.productName || "-"}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Kategori</dt>
              <dd className="font-semibold text-slate-900">{invoice.category || "-"}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Tanggal</dt>
              <dd className="font-semibold text-slate-900">{dateStr}</dd>
            </div>
          </dl>

          {/* Price breakdown */}
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-semibold text-slate-900">{formatRupiah(invoice.subtotal)}</dd>
            </div>
            {Number(invoice.adminFee) > 0 ? (
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-slate-500">Biaya Admin</dt>
                <dd className="font-semibold text-slate-900">{formatRupiah(invoice.adminFee)}</dd>
              </div>
            ) : null}
            {Number(invoice.discount) > 0 ? (
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-slate-500">Diskon</dt>
                <dd className="font-semibold text-green-600">-{formatRupiah(invoice.discount)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-base font-semibold text-slate-700">Total</dt>
              <dd className="text-base font-extrabold text-orange-600">{formatRupiah(invoice.total)}</dd>
            </div>
          </dl>

          {/* Status */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Pembayaran:</span>
              <Badge className={PPOB_PAYMENT_STATUS_STYLES[invoice.paymentStatus] || "bg-slate-100 text-slate-700"}>
                {PPOB_PAYMENT_STATUS_LABELS[invoice.paymentStatus] || invoice.paymentStatus || "-"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Transaksi:</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PPOB_STATUS_STYLES[invoice.transactionStatus] || "bg-slate-100 text-slate-700"}`}>
                {invoice.transactionStatus || "-"}
              </span>
            </div>
            {invoice.paymentMethod ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Metode:</span>
                <span className="font-semibold uppercase text-slate-900">{invoice.paymentMethod}</span>
              </div>
            ) : null}
          </div>

          <p className="pt-2 text-center text-xs text-slate-400">
            Terima kasih telah menggunakan layanan Marketplace.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={handlePrintOrDone}>
          <span className="material-symbols-outlined text-base">print</span> Cetak / Simpan
        </Button>
        <div className="flex gap-2">
          <Link to="/ppob?tab=riwayat">
            <Button variant="outline">Riwayat</Button>
          </Link>
          <Button onClick={() => navigate("/ppob")}>
            <span className="material-symbols-outlined text-base">add_card</span> Beli Lagi
          </Button>
        </div>
      </div>
    </main>
  );
}
