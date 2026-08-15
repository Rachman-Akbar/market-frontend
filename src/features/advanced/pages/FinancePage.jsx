import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { advancedError, useDeleteFinance, useFinance, useFinancePaymentHistory, useRecordFinancePayment, useSaveFinance } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { useEntityEditor, useRefreshOnListActivation, useTableSelection } from "@/shared/hooks";
import { usePanelTabs } from "@/shared/layout/tabs/PanelTabsContext";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

function nowInput() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function initialForm(type, mode) {
  return {
    type,
    title: "",
    description: "",
    amount: "",
    paid_amount: "0",
    status: mode === "cashflow" ? "posted" : "open",
    due_date: "",
    occurred_at: nowInput(),
    is_active: true,
  };
}

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function typeLabel(type) {
  return ({ income: "Pemasukan", expense: "Pengeluaran", receivable: "Piutang", payable: "Hutang" })[type] || type;
}

export default function FinancePage({ mode = "cashflow" }) {
  const allowedTypes = mode === "cashflow" ? ["income", "expense"] : ["receivable", "payable"];
  const [type, setType] = useState(allowedTypes[0]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(() => initialForm(allowedTypes[0], mode));
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [localPaymentOpen, setLocalPaymentOpen] = useState(false);
  const [paymentRow, setPaymentRow] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const panelTabs = usePanelTabs();
  const deferredQuery = useDeferredValue(query.trim());
  const editor = useEntityEditor({ createLabel: `Data Baru ${typeLabel(type)}`, getEditLabel: (row) => row.reference_number || row.title });
  const listQuery = useFinance({ page, per_page: 20, type, ...(deferredQuery ? { search: deferredQuery } : {}) });
  const saveMutation = useSaveFinance();
  const paymentMutation = useRecordFinancePayment();
  const deleteMutation = useDeleteFinance();
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  const selection = useTableSelection(rows);
  const paymentOpen = panelTabs ? panelTabs.activeTab?.type === "finance-payment" : localPaymentOpen;
  const paymentHistoryQuery = useFinancePaymentHistory(paymentRow?.id, paymentOpen);
  const spreadsheet = useSpreadsheetWorkspace({
    module: type,
    label: typeLabel(type),
    selectedRows: selection.selectedRows,
    onCompleted: () => {
      selection.clear();
      listQuery.refetch();
    },
  });

  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: listQuery.refetch });
  useEffect(() => setPage(1), [deferredQuery, type]);
  useEffect(() => {
    if (!editor.open) return;
    const row = editor.entity;
    setMessage("");
    setForm(row ? {
      type: row.type,
      title: row.title || "",
      description: row.description || "",
      amount: String(row.amount || ""),
      paid_amount: String(row.paid_amount || 0),
      status: row.status || (mode === "cashflow" ? "posted" : "open"),
      due_date: row.due_date || "",
      occurred_at: row.occurred_at ? new Date(row.occurred_at).toISOString().slice(0, 16) : nowInput(),
      is_active: row.is_active !== false,
    } : initialForm(type, mode));
  }, [editor.open, editor.entity, mode, type]);

  const columns = useMemo(() => [
    { key: "reference_number", label: "Referensi" },
    { key: "title", label: "Keterangan" },
    { key: "store_name", label: "Toko" },
    { key: "order_number", label: "Pesanan" },
    { key: "amount", label: "Nominal", render: (row) => <span className="font-bold text-slate-900">{money(row.amount)}</span> },
    { key: "paid_amount", label: "Terbayar", render: (row) => money(row.paid_amount) },
    { key: "outstanding_amount", label: "Sisa", render: (row) => money(row.outstanding_amount) },
    { key: "status", label: "Status", render: (row) => <span className="font-bold uppercase text-slate-600">{row.status}</span> },
    { key: "occurred_at", label: "Tanggal", render: (row) => row.occurred_at ? new Date(row.occurred_at).toLocaleDateString("id-ID") : "-" },
  ], []);

  async function submit(event) {
    event.preventDefault();
    try {
      const { paid_amount: _paidAmount, ...editableForm } = form;
      await saveMutation.mutateAsync({
        id: editor.entity?.id,
        values: {
          ...editableForm,
          amount: Number(form.amount),
          due_date: form.due_date || null,
          occurred_at: new Date(form.occurred_at).toISOString(),
        },
      });
      setMessage(`${typeLabel(form.type)} berhasil disimpan.`);
      editor.markListDirty();
      editor.completeSave();
      editor.close();
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  function recordPayment(row) {
    setPaymentRow(row);
    setPaymentAmount("");
    setPaymentMethod("transfer");
    setPaymentReference("");
    setPaymentNotes("");
    setMessage("");
    if (panelTabs) {
      panelTabs.openOperationTab("finance-payment", { id: row.id, label: `Pembayaran ${row.reference_number || row.title}` });
      return;
    }
    setLocalPaymentOpen(true);
  }

  function closePayment() {
    setPaymentRow(null);
    setPaymentAmount("");
    if (panelTabs) {
      panelTabs.closeActiveTab();
      return;
    }
    setLocalPaymentOpen(false);
  }

  async function submitPayment(event) {
    event.preventDefault();
    if (!paymentRow) return;
    try {
      await paymentMutation.mutateAsync({ id: paymentRow.id, amount: Number(paymentAmount), payment_method: paymentMethod, reference_number: paymentReference || null, notes: paymentNotes || null });
      setMessage("Pembayaran berhasil dicatat.");
      editor.markListDirty();
      closePayment();
      listQuery.refetch();
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      editor.markListDirty();
      setDeleteTarget(null);
      setMessage("Data keuangan berhasil dihapus.");
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  const title = mode === "cashflow" ? "Pemasukan dan Pengeluaran" : "Hutang dan Piutang";

  return (
    <>
      {editor.isListActive ? (
        <ModuleFrame
          title={title}
          subtitle="CRUD memakai tab data baru seperti Product. Admin melihat data global, seller otomatis dibatasi ke toko aktif."
          query={query}
          onQueryChange={setQuery}
          onRefresh={() => listQuery.refetch()}
          refreshing={listQuery.isFetching}
          onCreate={editor.create}
          createLabel={`Tambah ${typeLabel(type)}`}
          placeholder={`Cari ${typeLabel(type).toLowerCase()}, referensi, pesanan, atau toko`}
          filters={(
            <select value={type} onChange={(event) => { setType(event.target.value); selection.clear(); }} className="h-10 border border-slate-300 bg-white px-3 text-sm font-bold">
              {allowedTypes.map((item) => <option key={item} value={item}>{typeLabel(item)}</option>)}
            </select>
          )}
          selectionEnabled={selection.enabled}
          selectedCount={selection.selectedCount}
          onToggleSelection={selection.toggleEnabled}
          bulkActions={spreadsheet.actions}
        >
          {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          <DataGrid
            columns={columns}
            rows={rows}
            emptyText={listQuery.isLoading ? "" : `${typeLabel(type)} belum tersedia.`}
            selectionEnabled={selection.enabled}
            selectedIds={selection.selectedIds}
            allSelected={selection.allSelected}
            onToggleRow={selection.toggleRow}
            onToggleAll={selection.toggleAll}
            actions={(row) => (
              <div className="flex justify-end gap-1">
                {mode !== "cashflow" && Number(row.outstanding_amount) > 0 ? <Button size="sm" variant="outline" onClick={() => recordPayment(row)}>Bayar</Button> : null}
                <Button size="sm" variant="outline" onClick={() => editor.edit(row)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>Hapus</Button>
              </div>
            )}
          />
          {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
        </ModuleFrame>
      ) : null}

      <SpreadsheetOperationPanel workspace={spreadsheet} />
      <ConfirmDialog open={Boolean(deleteTarget)} title={`Hapus ${deleteTarget ? typeLabel(deleteTarget.type) : "Data Keuangan"}`} message={deleteTarget ? `${deleteTarget.reference_number || deleteTarget.title} akan dihapus.` : "Data akan dihapus."} pending={false} onClose={() => setDeleteTarget(null)} onConfirm={remove} />


      <FormModal
        open={paymentOpen}
        title="Catat Pembayaran"
        subtitle={paymentRow ? `${paymentRow.reference_number || paymentRow.title} · Sisa ${money(paymentRow.outstanding_amount)}` : "Masukkan nominal pembayaran."}
        onClose={closePayment}
        onSubmit={submitPayment}
        busy={false}
        submitLabel="Simpan Cicilan"
      >
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nominal Cicilan" required>
            <Input type="number" min="0.01" step="0.01" max={paymentRow?.outstanding_amount || undefined} value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} required />
          </Field>
          <Field label="Metode Pembayaran">
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="h-10 border border-slate-300 bg-white px-3 text-sm">
              <option value="transfer">Transfer</option><option value="cash">Tunai</option><option value="ewallet">E-Wallet</option><option value="manual">Lainnya</option>
            </select>
          </Field>
        </div>
        <Field label="Nomor Referensi"><Input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} /></Field>
        <Field label="Catatan"><textarea value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} className="min-h-20 border border-slate-300 p-3 text-sm" /></Field>
        <div className="border-t border-slate-200 pt-4">
          <h3 className="mb-3 text-sm font-black text-slate-800">Riwayat Pembayaran</h3>
          <div className="space-y-2">
            {(Array.isArray(paymentHistoryQuery.data) ? paymentHistoryQuery.data : paymentHistoryQuery.data?.data || []).map((row) => (
              <div key={row.id} className="grid gap-2 border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-4">
                <span>{row.paid_at ? new Date(row.paid_at).toLocaleString("id-ID") : "-"}</span>
                <strong>{money(row.amount)}</strong>
                <span>{row.payment_method || "manual"}</span>
                <span>Sisa {money(row.balance_after)}</span>
              </div>
            ))}
            {!paymentHistoryQuery.data?.length ? <p className="text-xs text-slate-500">Belum ada riwayat pembayaran.</p> : null}
          </div>
        </div>
      </FormModal>

      <FormModal
        open={editor.open}
        title={editor.entity ? `Edit ${typeLabel(form.type)}` : `Tambah ${typeLabel(form.type)}`}
        subtitle="Form dibuka pada tab data tersendiri agar daftar tetap ringkas dan pekerjaan tidak tertutup modal."
        onClose={editor.close}
        onSubmit={submit}
        busy={false}
      >
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Jenis" required>
            <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} className="h-10 border border-slate-300 bg-white px-3 text-sm" required>
              {allowedTypes.map((item) => <option key={item} value={item}>{typeLabel(item)}</option>)}
            </select>
          </Field>
          <Field label="Status" required>
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="h-10 border border-slate-300 bg-white px-3 text-sm">
              {(mode === "cashflow" ? ["draft", "posted", "cancelled"] : ["open", "partial", "paid", "cancelled"]).map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Judul" required><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
        <Field label="Deskripsi"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-24 border border-slate-300 p-3 text-sm" /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nominal" required><Input type="number" min="1" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required /></Field>
          <Field label="Sudah Dibayar" hint="Nilai ini hanya berubah melalui tombol Bayar agar seluruh cicilan tercatat di riwayat."><Input type="number" min="0" step="0.01" value={form.paid_amount} disabled /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tanggal Transaksi" required><Input type="datetime-local" value={form.occurred_at} onChange={(event) => setForm((current) => ({ ...current, occurred_at: event.target.value }))} required /></Field>
          {mode !== "cashflow" ? <Field label="Jatuh Tempo"><Input type="date" value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} /></Field> : <div />}
        </div>
      </FormModal>
    </>
  );
}
