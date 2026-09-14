import { useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SkeletonTable } from "@/shared/components/feedback/Skeleton";
import {
  getFinanceError,
  useAdminWithdrawals,
  useApproveAdminWithdrawal,
  useRejectAdminWithdrawal,
} from "@/features/admin/finance/services/adminFinanceService";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_LABELS = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  completed: "Selesai",
};

const FILTER_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "completed", label: "Selesai" },
];

const METHOD_LABELS = {
  bank_transfer: "Transfer Bank",
  e_wallet: "E-Wallet",
  cash: "Tunai",
};

function bankSummary(details) {
  if (!details || typeof details !== "object") return "";
  return [details.bank_name, details.account_number, details.account_name].filter(Boolean).join(" • ");
}

export default function AdminWithdrawalsPage() {
  const [status, setStatus] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const notifications = useNotificationCenter();

  const withdrawalsQuery = useAdminWithdrawals({ ...(status ? { status } : {}) });
  const approveMut = useApproveAdminWithdrawal();
  const rejectMut = useRejectAdminWithdrawal();

  const rows = withdrawalsQuery.data?.rows || [];
  const pendingCount = withdrawalsQuery.data?.pendingCount ?? 0;

  const approve = async (w) => {
    if (!confirm(`Setujui penarikan ${w.withdrawalNumber} senilai ${formatRupiah(w.amount)}?`)) return;
    try {
      await approveMut.mutateAsync(w.id);
      notifications.push({ type: "success", title: "Penarikan", message: "Penarikan berhasil disetujui." });
    } catch (e) {
      notifications.push({ type: "error", title: "Penarikan", message: getFinanceError(e) });
    }
  };

  const openReject = (w) => {
    setRejectTarget(w);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      notifications.push({ type: "error", title: "Penarikan", message: "Alasan penolakan wajib diisi." });
      return;
    }
    try {
      await rejectMut.mutateAsync({ id: rejectTarget.id, reason: rejectReason.trim() });
      setRejectTarget(null);
      notifications.push({ type: "success", title: "Penarikan", message: "Penarikan berhasil ditolak." });
    } catch (e) {
      notifications.push({ type: "error", title: "Penarikan", message: getFinanceError(e) });
    }
  };

  return (
    <AdminShell title="Penarikan Dana Seller" subtitle="Tinjau dan proses permintaan penarikan dana dari seller.">
      <div className="space-y-4">
        {pendingCount > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {pendingCount} penarikan menunggu persetujuan.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="grid w-full max-w-xs grid-cols-2 gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                  status === opt.value ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <AsyncState loading={false} error={withdrawalsQuery.error ? getFinanceError(withdrawalsQuery.error, "Gagal memuat penarikan.") : ""} empty={!withdrawalsQuery.isLoading && !rows.length} emptyText="Tidak ada penarikan." />
        {withdrawalsQuery.isLoading && !rows.length ? <SkeletonTable rows={6} cols={6} /> : null}
        {!withdrawalsQuery.isLoading && rows.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">No. Penarikan</th>
                      <th className="py-2 pr-3 font-semibold">Toko</th>
                      <th className="py-2 pr-3 font-semibold">Jumlah</th>
                      <th className="py-2 pr-3 font-semibold">Metode</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 pr-3 font-semibold">Waktu</th>
                      <th className="py-2 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((w) => (
                      <tr key={w.id} className="border-b border-slate-100 align-top">
                        <td className="py-2 pr-3">
                          <p className="font-semibold text-slate-900">{w.withdrawalNumber}</p>
                          <p className="max-w-[220px] truncate text-xs text-slate-400">{bankSummary(w.bankDetails) || w.method}</p>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">{w.storeName}</td>
                        <td className="py-2 pr-3 font-semibold text-slate-900">{formatRupiah(w.amount)}</td>
                        <td className="py-2 pr-3 text-slate-600">{METHOD_LABELS[w.method] || w.method}</td>
                        <td className="py-2 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[w.status] || "bg-slate-100 text-slate-600"}`}>
                            {STATUS_LABELS[w.status] || w.status}
                          </span>
                          {w.rejectionReason && <p className="mt-1 max-w-[220px] text-xs text-red-600">{w.rejectionReason}</p>}
                        </td>
                        <td className="py-2 pr-3 text-slate-500">{w.createdAt ? new Date(w.createdAt).toLocaleString("id-ID") : "-"}</td>
                        <td className="py-2">
                          {w.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => approve(w)} className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              </button>
                              <button type="button" onClick={() => openReject(w)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800">
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRejectTarget(null)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900">Tolak Penarikan</h3>
              <p className="mt-1 text-sm text-slate-500">
                {rejectTarget.withdrawalNumber} • {formatRupiah(rejectTarget.amount)}
              </p>
              <div className="mt-4 space-y-3">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-slate-700">Alasan Penolakan (wajib)</span>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectTarget(null)}>Batal</Button>
                <Button onClick={submitReject} disabled={rejectMut.isPending} className="bg-red-600 hover:bg-red-700">
                  {rejectMut.isPending ? "Memproses..." : "Tolak Penarikan"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}