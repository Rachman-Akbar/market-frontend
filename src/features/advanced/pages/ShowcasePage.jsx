import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useDeleteShowcase, useManageableProducts, useSaveShowcase, useShowcases } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { useEntityEditor, useRefreshOnListActivation } from "@/shared/hooks";

const initialForm = { store_id: "", name: "", description: "", sort_order: 0, is_active: true, product_ids: [] };

export default function ShowcasePage() {
  const { activeRole, store } = useAuth();
  const admin = activeRole === "admin";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const editor = useEntityEditor({ createLabel: "Data Baru Etalase", getEditLabel: (row) => row.name });
  const listQuery = useShowcases({ page, per_page: 20, ...(query.trim() ? { search: query.trim() } : {}) });
  const productsQuery = useManageableProducts({ per_page: 100, ...(admin && form.store_id ? { store_id: form.store_id } : {}) });
  const saveMutation = useSaveShowcase();
  const deleteMutation = useDeleteShowcase();
  const rows = listQuery.data?.rows || [];
  const products = productsQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: listQuery.refetch });

  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    if (!editor.open) return;
    const row = editor.entity;
    setMessage("");
    setForm(row ? {
      store_id: String(row.store_id || ""),
      name: row.name || "",
      description: row.description || "",
      sort_order: Number(row.sort_order || 0),
      is_active: row.is_active !== false,
      product_ids: (row.products || []).map((product) => Number(product.id)),
    } : { ...initialForm, store_id: admin ? "" : String(store?.id || "") });
  }, [admin, editor.entity, editor.open, store?.id]);

  const columns = useMemo(() => [
    { key: "name", label: "Nama Etalase" },
    { key: "store_name", label: "Toko" },
    { key: "sort_order", label: "Urutan" },
    { key: "products_count", label: "Jumlah Produk" },
    { key: "is_active", label: "Status", render: (row) => row.is_active ? "Aktif" : "Nonaktif" },
    { key: "description", label: "Deskripsi" },
  ], []);

  function toggleProduct(id) {
    setForm((current) => ({ ...current, product_ids: current.product_ids.includes(id) ? current.product_ids.filter((value) => value !== id) : [...current.product_ids, id] }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      await saveMutation.mutateAsync({
        id: editor.entity?.id,
        values: {
          ...(admin ? { store_id: Number(form.store_id) } : {}),
          name: form.name,
          description: form.description || null,
          sort_order: Number(form.sort_order || 0),
          is_active: Boolean(form.is_active),
          product_ids: form.product_ids,
        },
      });
      editor.markListDirty();
      editor.completeSave();
      editor.close();
      setMessage("Etalase berhasil disimpan.");
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
      setMessage("Etalase berhasil dihapus.");
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  return (
    <>
      {editor.isListActive ? (
        <ModuleFrame title="Etalase Toko" subtitle="Tambah dan edit etalase dibuka sebagai tab data baru seperti Product." query={query} onQueryChange={setQuery} onRefresh={() => listQuery.refetch()} refreshing={listQuery.isFetching} onCreate={editor.create} createLabel="Tambah Etalase">
          {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          <DataGrid columns={columns} rows={rows} emptyText={listQuery.isLoading ? "Memuat etalase..." : "Etalase belum tersedia."} actions={(row) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => editor.edit(row)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>Hapus</Button></div>} />
          {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
        </ModuleFrame>
      ) : null}
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Etalase" message={`Etalase “${deleteTarget?.name || ""}” akan dihapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
      <FormModal open={editor.open} title={editor.entity ? "Edit Etalase" : "Tambah Etalase"} subtitle="Form etalase menggunakan tampilan halaman data yang konsisten dengan Product." onClose={editor.close} onSubmit={submit} busy={saveMutation.isPending}>
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        {admin ? <Field label="ID Toko" required><Input type="number" min="1" value={form.store_id} onChange={(event) => setForm((current) => ({ ...current, store_id: event.target.value, product_ids: [] }))} required /></Field> : null}
        <Field label="Nama" required><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></Field>
        <Field label="Deskripsi"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-24 border border-slate-300 p-3 text-sm" /></Field>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Urutan"><Input type="number" min="0" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} /></Field><label className="flex items-center gap-2 pt-7 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /> Aktif</label></div>
        <Field label="Produk"><div className="max-h-72 space-y-1 overflow-y-auto border border-slate-300 p-2">{productsQuery.isLoading ? <p className="p-3 text-sm text-slate-500">Memuat produk...</p> : null}{!productsQuery.isLoading && !products.length ? <p className="p-3 text-sm text-slate-500">Produk tidak ditemukan.</p> : null}{products.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 p-2 text-sm last:border-b-0"><input type="checkbox" checked={form.product_ids.includes(Number(product.id))} onChange={() => toggleProduct(Number(product.id))} /><span className="font-semibold text-slate-800">{product.name}</span><span className="ml-auto text-xs text-slate-500">{product.stock ?? product.raw?.stock ?? 0} stok</span></label>)}</div></Field>
      </FormModal>
    </>
  );
}
