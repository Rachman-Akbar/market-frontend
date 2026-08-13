import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useDeleteMission, useMissions, useSaveMission } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { useEntityEditor, useRefreshOnListActivation } from "@/shared/hooks";

function initialForm() {
  return { voucher_id: "", name: "", code: "", description: "", event_type: "order_completed", target_value: 1, starts_at: new Date().toISOString().slice(0, 16), ends_at: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16), is_active: true };
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("id-ID") : "-";
}

export default function MissionsPage() {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm());
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const editor = useEntityEditor({ createLabel: "Data Baru Misi", getEditLabel: (row) => row.name });
  const listQuery = useMissions({ page, per_page: 20, ...(query.trim() ? { search: query.trim() } : {}) }, admin);
  const saveMutation = useSaveMission();
  const deleteMutation = useDeleteMission();
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: listQuery.refetch });

  useEffect(() => {
    if (!editor.open) return;
    const row = editor.entity;
    setMessage("");
    setForm(row ? { voucher_id: row.voucher_id ? String(row.voucher_id) : "", name: row.name || "", code: row.code || "", description: row.description || "", event_type: row.event_type || "order_completed", target_value: Number(row.target_value || 1), starts_at: row.starts_at ? new Date(row.starts_at).toISOString().slice(0, 16) : initialForm().starts_at, ends_at: row.ends_at ? new Date(row.ends_at).toISOString().slice(0, 16) : initialForm().ends_at, is_active: row.is_active !== false } : initialForm());
  }, [editor.entity, editor.open]);

  const columns = useMemo(() => admin ? [
    { key: "name", label: "Nama" }, { key: "code", label: "Kode" }, { key: "event_type", label: "Event" }, { key: "target_value", label: "Target" }, { key: "voucher", label: "Hadiah", render: (row) => row.voucher?.code || "-" }, { key: "starts_at", label: "Mulai", render: (row) => formatDate(row.starts_at) }, { key: "ends_at", label: "Selesai", render: (row) => formatDate(row.ends_at) }, { key: "is_active", label: "Status", render: (row) => row.is_active ? "Aktif" : "Nonaktif" },
  ] : [
    { key: "name", label: "Misi" }, { key: "description", label: "Deskripsi" }, { key: "progress_value", label: "Progress", render: (row) => `${row.progress_value || 0} / ${row.target_value || 0}` }, { key: "status", label: "Status" }, { key: "voucher", label: "Hadiah", render: (row) => row.voucher ? (row.voucher.code || "Terkunci") : "-" }, { key: "ends_at", label: "Berakhir", render: (row) => formatDate(row.ends_at) },
  ], [admin]);

  async function submit(event) {
    event.preventDefault();
    try {
      await saveMutation.mutateAsync({ id: editor.entity?.id, values: { ...form, voucher_id: form.voucher_id ? Number(form.voucher_id) : null, target_value: Number(form.target_value), starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString() } });
      editor.markListDirty();
      editor.completeSave();
      editor.close();
      setMessage("Misi berhasil disimpan.");
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
      setMessage("Misi berhasil dihapus.");
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  return (
    <>
      {editor.isListActive ? <ModuleFrame title={admin ? "Games dan Mission" : "Misi Saya"} subtitle={admin ? "CRUD misi memakai tab data baru seperti Product." : "Progress diperbarui otomatis dari aktivitas pesanan dan review."} query={query} onQueryChange={setQuery} onRefresh={() => listQuery.refetch()} refreshing={listQuery.isFetching} onCreate={admin ? editor.create : undefined} createLabel="Tambah Misi"><>{message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}<DataGrid columns={columns} rows={rows} emptyText={listQuery.isLoading ? "Memuat misi..." : "Misi belum tersedia."} actions={admin ? (row) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => editor.edit(row)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>Hapus</Button></div> : undefined} />{admin && rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}</></ModuleFrame> : null}
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Misi" message={`Misi “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
      <FormModal open={admin && editor.open} title={editor.entity ? "Edit Misi" : "Tambah Misi"} subtitle="Form misi tampil pada tab data tersendiri." onClose={editor.close} onSubmit={submit} busy={saveMutation.isPending}>
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-2"><Field label="Nama" required><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></Field><Field label="Kode"><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></Field></div>
        <Field label="Deskripsi"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-24 border border-slate-300 p-3 text-sm" /></Field>
        <div className="grid gap-4 md:grid-cols-3"><Field label="Event"><select value={form.event_type} onChange={(event) => setForm((current) => ({ ...current, event_type: event.target.value }))} className="h-10 border border-slate-300 px-3">{["order_completed", "review_submitted", "login", "purchase_amount", "product_purchased"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Target" required><Input type="number" min="1" value={form.target_value} onChange={(event) => setForm((current) => ({ ...current, target_value: event.target.value }))} required /></Field><Field label="ID Voucher"><Input type="number" min="1" value={form.voucher_id} onChange={(event) => setForm((current) => ({ ...current, voucher_id: event.target.value }))} /></Field></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Mulai" required><Input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} required /></Field><Field label="Berakhir" required><Input type="datetime-local" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} required /></Field></div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /> Aktif</label>
      </FormModal>
    </>
  );
}
