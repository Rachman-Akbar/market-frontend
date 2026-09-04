import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SkeletonTable } from "@/shared/components/feedback/Skeleton";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTransactionHistory } from "@/features/ppob/services/ppobService";
import { formatPrice } from "@/shared/utils/utils";
import {
  PPOB_STATUS_STYLES,
  PPOB_PAYMENT_STATUS_LABELS,
  PPOB_PAYMENT_STATUS_STYLES,
} from "@/features/ppob/components/PpobCheckoutModal";

const TYPE_LABELS = {
  digital: { label: "Digital", icon: "phone_android", className: "bg-blue-100 text-blue-700" },
  order: { label: "Pesanan", icon: "shopping_bag", className: "bg-orange-100 text-orange-700" },
};

const STATUS_STYLES = {
  ...PPOB_STATUS_STYLES,
  pending: "bg-amber-100 text-amber-700",
  unpaid: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  received: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-700",
  expired: "bg-slate-100 text-slate-700",
};

function formatStatus(status) {
  const map = {
    pending: "Menunggu",
    unpaid: "Belum Dibayar",
    processing: "Diproses",
    shipped: "Dikirim",
    received: "Diterima",
    completed: "Selesai",
    success: "Berhasil",
    failed: "Gagal",
    cancelled: "Dibatalkan",
    expired: "Kedaluwarsa",
  };
  return map[status] || status || "-";
}

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = {
    page,
    per_page: 20,
    ...(typeFilter ? { type: typeFilter } : {}),
  };

  const res = useTransactionHistory(params);
  const rows = res.data?.rows || [];
  const meta = res.data?.meta || {};

  const onRequireLogin = useCallback(() => navigate("/auth/login"), [navigate]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-slate-950">Riwayat Transaksi</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">history</span>
            <h2 className="text-lg font-bold text-slate-900">Masuk untuk melihat riwayat</h2>
            <p className="text-sm text-slate-500">Silakan masuk untuk melihat seluruh transaksi Anda.</p>
            <Button onClick={onRequireLogin}>Masuk</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-950">Riwayat Transaksi</h1>
        <p className="text-sm text-slate-500">Semua transaksi digital dan pesanan marketplace Anda.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="max-w-[200px]">
              <p className="mb-1 text-xs font-semibold text-slate-500">Jenis</p>
              <SearchableSelect
                value={typeFilter}
                onChange={(v) => { setTypeFilter(v); setPage(1); }}
                options={[
                  { value: "digital", label: "Digital (PPOB)" },
                  { value: "order", label: "Pesanan Marketplace" },
                ]}
                placeholder="Semua jenis"
                emptyText="—"
              />
            </div>
            <div className="max-w-[200px]">
              <p className="mb-1 text-xs font-semibold text-slate-500">Status</p>
              <SearchableSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "pending", label: "Menunggu" },
                  { value: "processing", label: "Diproses" },
                  { value: "success", label: "Berhasil" },
                  { value: "completed", label: "Selesai" },
                  { value: "failed", label: "Gagal" },
                  { value: "cancelled", label: "Dibatalkan" },
                ]}
                placeholder="Semua status"
                emptyText="—"
              />
            </div>
          </div>

          <AsyncState
            loading={false}
            error={res.error ? (res.error.message || "Gagal memuat riwayat.") : ""}
            empty={!res.isLoading && !rows.length}
            emptyText="Belum ada transaksi."
          />

          {res.isLoading ? <SkeletonTable rows={5} cols={6} /> : null}

          {!res.isLoading && rows.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Jenis</th>
                      <th className="py-2 pr-3 font-semibold">Produk / Pesanan</th>
                      <th className="py-2 pr-3 font-semibold">Total</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 pr-3 font-semibold">Pembayaran</th>
                      <th className="py-2 pr-3 font-semibold">Tanggal</th>
                      <th className="py-2 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .filter((row) => !statusFilter || row.status === statusFilter || row.payment_status === statusFilter)
                      .map((row) => {
                        const typeInfo = TYPE_LABELS[row.type] || TYPE_LABELS.digital;
                        const invoicePath = `/ppob/receipt/${encodeURIComponent(row.reference_id)}`;

                        return (
                          <tr key={`${row.type}-${row.id}`} className="border-b border-slate-100 align-top">
                            <td className="py-2 pr-3">
                              <Badge className={typeInfo.className}>
                                <span className="material-symbols-outlined text-[11px]">{typeInfo.icon}</span>
                                {typeInfo.label}
                              </Badge>
                            </td>
                            <td className="py-2 pr-3">
                              <p className="font-semibold text-slate-900">{row.product_name || "-"}</p>
                              <p className="text-xs text-slate-400">{row.reference_id}</p>
                              {row.customer_id && (
                                <p className="text-xs text-slate-400">{row.customer_id}</p>
                              )}
                              {row.operator_name && (
                                <p className="text-xs text-slate-400">{row.operator_name}</p>
                              )}
                            </td>
                            <td className="py-2 pr-3 font-semibold text-slate-900">
                              {formatPrice(row.total_amount)}
                            </td>
                            <td className="py-2 pr-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[row.status] || "bg-slate-100 text-slate-700"}`}>
                                {formatStatus(row.status)}
                              </span>
                            </td>
                            <td className="py-2 pr-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${PPOB_PAYMENT_STATUS_STYLES[row.payment_status] || "bg-slate-100 text-slate-700"}`}>
                                {row.payment_status === "paid" && (
                                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                )}
                                {PPOB_PAYMENT_STATUS_LABELS[row.payment_status] || row.payment_status || "-"}
                              </span>
                            </td>
                            <td className="py-2 text-slate-500">
                              {row.created_at ? new Date(row.created_at).toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="py-2">
                              {["success", "completed", "processing", "paid"].includes(row.payment_status) ||
                               ["success", "completed"].includes(row.status) ? (
                                <Link
                                  to={invoicePath}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
                                >
                                  <span className="material-symbols-outlined text-sm">receipt_long</span> Pembayaran
                                </Link>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-xs text-slate-500">
                    Halaman {meta.current_page} dari {meta.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
