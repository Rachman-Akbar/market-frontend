import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useCreatePromotionPayment, usePromotionPayments, useReviewPromotionPayment } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Input } from "@/shared/components/ui/Input";
import { toolbarControlClassName } from "@/shared/components/crud/toolbarControlClassName";
import { useEntityEditor, useRefreshOnListActivation } from "@/shared/hooks";
import { useListTotalCount } from "@/shared/hooks/useListTotalCount";
import { usePanelTabs } from "@/shared/layout/tabs/PanelTabsContext";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";

function initialForm() {
  return { package_name: "Paket Promosi Seller", amount: "", payment_method: "transfer_bank", proof_url: "", paid_at: new Date().toISOString().slice(0, 16) };
}

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function PromotionPaymentsPage() {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm());
  const [localReviewOpen, setLocalReviewOpen] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const panelTabs = usePanelTabs();
  const editor = useEntityEditor();
  const listQuery = usePromotionPayments({ per_page: 20, ...(query.trim() ? { search: query.trim() } : {}), ...(status ? { status } : {}) });
  const createMutation = useCreatePromotionPayment();
  const reviewMutation = useReviewPromotionPayment();
  const rows = listQuery.data?.rows || [];
  const total = useListTotalCount(listQuery.data?.meta, { fallbackTotal: rows.length, label: "Pembayaran" });
  const reviewOpen = panelTabs ? panelTabs.activeTab?.type === "promotion-payment-review" : localReviewOpen;
  const activeReviewRow = panelTabs?.activeTab?.entity || reviewRow;
  const activeReviewAction = panelTabs?.activeTab?.payload?.action || reviewAction;
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: listQuery.refetch });

  useEffect(() => {
    if (editor.open) {
      setForm(initialForm());
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
      toastSuccess("Ajukan Pembayaran Promosi", "Bukti pembayaran promosi berhasil diajukan.");
      editor.markListDirty();
      editor.completeSave();
      editor.close();
    } catch (error) {
      toastError("Ajukan Pembayaran Promosi", advancedError(error));
    }
  }

  function openReview(row, action) {
    setReviewRow(row);
    setReviewAction(action);
    setReviewReason("");
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
      toastError("Tinjau Pembayaran Promosi", "Alasan penolakan wajib diisi.");
      return;
    }
    try {
      await reviewMutation.mutateAsync({ id: activeReviewRow.id, status: activeReviewAction, reason: reviewReason.trim() });
      editor.markListDirty();
      toastSuccess("Tinjau Pembayaran Promosi", activeReviewAction === "approve" ? "Pembayaran disetujui." : "Pembayaran ditolak.");
      closeReview();
    } catch (error) {
      toastError("Tinjau Pembayaran Promosi", advancedError(error));
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
          totalCount={total.totalCount}
          totalLabel={total.totalLabel}
          totalTitle={total.totalTitle}
          filters={<select value={status} onChange={(event) => setStatus(event.target.value)} className={toolbarControlClassName}><option value="">Semua status</option>{["pending", "approved", "rejected"].map((item) => <option key={item}>{item}</option>)}</select>}
        >
          <DataGrid
            onFilterStateChange={total.onFilterStateChange}
            columns={columns}
            rows={rows}
            onRowClick={(row) => admin && row.status === "pending" ? openReview(row, "approve") : undefined}
            emptyText={listQuery.isLoading ? "" : "Pembayaran promosi belum tersedia."}
            hasNextPage={listQuery.hasNextPage}
            isFetchingNextPage={listQuery.isFetchingNextPage}
            onLoadMore={() => listQuery.fetchNextPage()}
          />
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
        saveIcon={activeReviewAction === "approve" ? "check" : "close"}
        tone={activeReviewAction === "approve" ? "emerald" : "rose"}
        onDelete={activeReviewAction === "approve" && activeReviewRow ? () => openReview(activeReviewRow, "reject") : undefined}
        deleteLabel="Tolak & Isi Alasan"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            <span>Nomor</span>
            <Input value={activeReviewRow?.payment_number || "-"} disabled />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            <span>Toko</span>
            <Input value={activeReviewRow?.store?.name || "-"} disabled />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            <span>Nominal</span>
            <Input value={money(activeReviewRow?.amount)} disabled />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            <span>Metode</span>
            <Input value={activeReviewRow?.payment_method || "-"} disabled />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2">
            <span>Bukti</span>
            {activeReviewRow?.proof_url ? (
              <a href={activeReviewRow.proof_url} target="_blank" rel="noreferrer" className="flex h-10 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-blue-600 underline">Buka bukti pembayaran</a>
            ) : <Input value="-" disabled />}
          </label>
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
        <Field label="Nama Paket" required><Input value={form.package_name} onChange={(event) => setForm((current) => ({ ...current, package_name: event.target.value }))} required /></Field>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Nominal" required><Input type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required /></Field><Field label="Metode"><Input value={form.payment_method} onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))} /></Field></div>
        <Field label="URL Bukti Pembayaran" required><Input type="url" value={form.proof_url} onChange={(event) => setForm((current) => ({ ...current, proof_url: event.target.value }))} required /></Field>
        <Field label="Tanggal Pembayaran"><Input type="datetime-local" value={form.paid_at} onChange={(event) => setForm((current) => ({ ...current, paid_at: event.target.value }))} /></Field>
      </FormModal>
    </>
  );
}
