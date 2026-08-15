import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useCreatePromotionPayment, usePromotionPayments, useReviewPromotionPayment } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useEntityEditor, useRefreshOnListActivation } from "@/shared/hooks";
import { usePanelTabs } from "@/shared/layout/tabs/PanelTabsContext";

function initialForm() {
  return { package_name: "Paket Promosi Seller", amount: "", payment_method: "transfer_bank", proof_url: "", paid_at: new Date().toISOString().slice(0, 16) };
}

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function PromotionPaymentsPage() {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm());
  const [message, setMessage] = useState("");
  const [localReviewOpen, setLocalReviewOpen] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const panelTabs = usePanelTabs();
  const editor = useEntityEditor({ createLabel: "Data Baru Pembayaran Promosi" });
  const listQuery = usePromotionPayments({ page, per_page: 20, ...(query.trim() ? { search: query.trim() } : {}), ...(status ? { status } : {}) });
  const createMutation = useCreatePromotionPayment();
  const reviewMutation = useReviewPromotionPayment();
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  const reviewOpen = panelTabs ? panelTabs.activeTab?.type === "promotion-payment-review" : localReviewOpen;
  const activeReviewRow = panelTabs?.activeTab?.entity || reviewRow;
  const activeReviewAction = panelTabs?.activeTab?.payload?.action || reviewAction;
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: listQuery.refetch });

  useEffect(() => {
    if (editor.open) {
      setForm(initialForm());
      setMessage("");
    }
  }, [editor.open]);

  const columns = useMemo(() => [
    { key: "payment_number", label: "Nomor" },
    { key: "store", label: "Toko", render: (row) => row.store?.name || "-" },
    { key: "package_name", label: "Paket" },
    { key: "amount", label: "Nominal", render: (row) => <span className="font-bold text-slate-900">{money(row.amount)}</span> },
    { key: "payment_method", label: "Metode" },
    { key: "paid_at", label: "Dibayar", render: (row) => row.paid_at ? new Date(row.paid_at).toLocaleString("id-ID") : "-" },
    { key: "status", label: "Status", render: (row) => <span className="font-bold uppercase text-slate-600">{row.status}</span> },
    { key: "promotion", label: "Dipakai Promosi", render: (row) => row.promotion?.name || "Belum dipakai" },
    { key: "proof_url", label: "Bukti", render: (row) => row.proof_url ? <a href={row.proof_url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">Buka</a> : "-" },
  ], []);

  async function submit(event) {
    event.preventDefault();
    try {
      await createMutation.mutateAsync({ ...form, amount: Number(form.amount), paid_at: form.paid_at ? new Date(form.paid_at).toISOString() : null });
      editor.markListDirty();
      editor.completeSave();
      editor.close();
      setMessage("Bukti pembayaran promosi berhasil diajukan.");
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  function openReview(row, action) {
    setReviewRow(row);
    setReviewAction(action);
    setReviewReason("");
    setMessage("");
    if (panelTabs) {
      panelTabs.openOperationTab("promotion-payment-review", {
        id: `${row.id}-${action}`,
        label: action === "approve" ? `Setujui ${row.payment_number || row.id}` : `Tolak ${row.payment_number || row.id}`,
        entity: row,
        payload: { action },
      });
      return;
    }
    setLocalReviewOpen(true);
  }

  function closeReview() {
    setReviewRow(null);
    setReviewAction("");
    setReviewReason("");
    if (panelTabs) {
      panelTabs.closeActiveTab();
      return;
    }
    setLocalReviewOpen(false);
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!activeReviewRow || !["approve", "reject"].includes(activeReviewAction)) return;
    if (activeReviewAction === "reject" && !reviewReason.trim()) {
      setMessage("Alasan penolakan wajib diisi.");
      return;
    }
    try {
      await reviewMutation.mutateAsync({ id: activeReviewRow.id, status: activeReviewAction, reason: reviewReason.trim() });
      editor.markListDirty();
      setMessage(activeReviewAction === "approve" ? "Pembayaran disetujui." : "Pembayaran ditolak.");
      closeReview();
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  return (
    <>
      {editor.isListActive ? (
        <ModuleFrame
          title="Pembayaran Promosi"
          subtitle={admin ? "Verifikasi pembayaran seller sebelum promosi dapat dibuat atau diubah." : "Pengajuan pembayaran dibuka sebagai tab data baru, bukan modal."}
          query={query}
          onQueryChange={setQuery}
          onRefresh={() => listQuery.refetch()}
          refreshing={listQuery.isFetching}
          onCreate={admin ? undefined : editor.create}
          createLabel="Ajukan Pembayaran"
          filters={<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 border border-slate-300 bg-white px-3 text-sm"><option value="">Semua status</option>{["pending", "approved", "rejected"].map((item) => <option key={item}>{item}</option>)}</select>}
        >
          {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          <DataGrid columns={columns} rows={rows} emptyText={listQuery.isLoading ? "" : "Pembayaran promosi belum tersedia."} actions={admin ? (row) => row.status === "pending" ? <div className="flex justify-end gap-1"><Button size="sm" onClick={() => openReview(row, "approve")}>Setujui</Button><Button size="sm" variant="destructive" onClick={() => openReview(row, "reject")}>Tolak</Button></div> : <span className="text-xs font-bold text-slate-500">Sudah ditinjau</span> : undefined} />
          {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
        </ModuleFrame>
      ) : null}

      <FormModal
        open={admin && reviewOpen}
        title={activeReviewAction === "approve" ? "Setujui Pembayaran Promosi" : "Tolak Pembayaran Promosi"}
        subtitle={activeReviewRow ? `${activeReviewRow.payment_number || "Pembayaran"} · ${activeReviewRow.store?.name || "Toko"} · ${money(activeReviewRow.amount)}` : "Tinjau pembayaran promosi seller."}
        onClose={closeReview}
        onSubmit={submitReview}
        busy={reviewMutation.isPending}
        submitLabel={activeReviewAction === "approve" ? "Setujui Pembayaran" : "Tolak Pembayaran"}
      >
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        <div className="grid gap-3 border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="grid grid-cols-[140px_1fr] gap-3"><span className="font-bold text-slate-500">Nomor</span><span className="font-semibold text-slate-900">{activeReviewRow?.payment_number || "-"}</span></div>
          <div className="grid grid-cols-[140px_1fr] gap-3"><span className="font-bold text-slate-500">Toko</span><span className="font-semibold text-slate-900">{activeReviewRow?.store?.name || "-"}</span></div>
          <div className="grid grid-cols-[140px_1fr] gap-3"><span className="font-bold text-slate-500">Nominal</span><span className="font-semibold text-slate-900">{money(activeReviewRow?.amount)}</span></div>
          <div className="grid grid-cols-[140px_1fr] gap-3"><span className="font-bold text-slate-500">Bukti</span><span>{activeReviewRow?.proof_url ? <a href={activeReviewRow.proof_url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">Buka bukti pembayaran</a> : "-"}</span></div>
        </div>
        {activeReviewAction === "reject" ? (
          <Field label="Alasan Penolakan" required>
            <textarea value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} rows={5} className="w-full border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" placeholder="Jelaskan alasan pembayaran ditolak" required />
          </Field>
        ) : (
          <p className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">Pastikan nominal dan bukti pembayaran sudah sesuai sebelum menyetujui.</p>
        )}
      </FormModal>

      <FormModal open={!admin && editor.open} title="Ajukan Pembayaran Promosi" subtitle="Data pengajuan tampil pada tab baru agar tetap konsisten dengan Product." onClose={editor.close} onSubmit={submit} busy={createMutation.isPending} submitLabel="Ajukan">
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        <Field label="Nama Paket" required><Input value={form.package_name} onChange={(event) => setForm((current) => ({ ...current, package_name: event.target.value }))} required /></Field>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Nominal" required><Input type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required /></Field><Field label="Metode"><Input value={form.payment_method} onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))} /></Field></div>
        <Field label="URL Bukti Pembayaran" required><Input type="url" value={form.proof_url} onChange={(event) => setForm((current) => ({ ...current, proof_url: event.target.value }))} required /></Field>
        <Field label="Tanggal Pembayaran"><Input type="datetime-local" value={form.paid_at} onChange={(event) => setForm((current) => ({ ...current, paid_at: event.target.value }))} /></Field>
      </FormModal>
    </>
  );
}
