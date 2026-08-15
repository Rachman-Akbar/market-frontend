import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

function ProductOrderPicker({ products, existingProducts = [], value, onChange, onSearchChange }) {
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState(null);
  const byId = useMemo(() => {
    const map = new Map();
    [...existingProducts, ...products].forEach((product) => map.set(Number(product.id), product));
    return map;
  }, [existingProducts, products]);
  const selected = value.map((id) => byId.get(Number(id))).filter(Boolean);
  const selectedSet = useMemo(() => new Set(value.map(Number)), [value]);
  const available = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter((product) => !selectedSet.has(Number(product.id)) && (!needle || String(product.name || "").toLowerCase().includes(needle) || String(product.sku || product.raw?.sku || "").toLowerCase().includes(needle)));
  }, [products, search, selectedSet]);

  const add = (id) => {
    const numericId = Number(id);
    if (!numericId || selectedSet.has(numericId)) return;
    onChange([...value, numericId]);
  };

  const remove = (id) => onChange(value.filter((current) => Number(current) !== Number(id)));

  const move = (sourceId, targetId) => {
    if (!sourceId || !targetId || Number(sourceId) === Number(targetId)) return;
    const sourceIndex = value.findIndex((id) => Number(id) === Number(sourceId));
    const targetIndex = value.findIndex((id) => Number(id) === Number(targetId));
    if (sourceIndex < 0 || targetIndex < 0) return;
    const next = [...value];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-extrabold text-slate-800">Produk di Etalase</p><p className="text-xs text-slate-500">Tarik produk untuk menentukan urutan tampil.</p></div><span className="bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700">{selected.length}</span></div></div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {!selected.length ? <div className="p-6 text-center text-sm text-slate-400">Belum ada produk. Tambahkan dari daftar produk toko.</div> : null}
          {selected.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={(event) => { setDragId(product.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(product.id)); }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
              onDrop={(event) => { event.preventDefault(); move(event.dataTransfer.getData("text/plain") || dragId, product.id); setDragId(null); }}
              onDragEnd={() => setDragId(null)}
              className={`mb-1 flex items-center gap-2 border border-slate-100 bg-white p-2 transition ${Number(dragId) === Number(product.id) ? "opacity-45" : "hover:border-emerald-200 hover:bg-emerald-50/30"}`}
            >
              <span className="material-symbols-outlined cursor-grab text-[19px] text-slate-400">drag_indicator</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-slate-100 text-[11px] font-extrabold text-slate-500">{index + 1}</span>
              <div className="h-10 w-10 shrink-0 overflow-hidden bg-slate-100">{product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : null}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{product.name}</p><p className="truncate text-[11px] text-slate-400">{product.sku || product.raw?.sku || `Produk #${product.id}`}</p></div>
              <button type="button" onClick={() => remove(product.id)} className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Hapus ${product.name} dari etalase`}><span className="material-symbols-outlined text-[18px]">close</span></button>
            </div>
          ))}
        </div>
      </section>
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 p-2.5"><div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span><input value={search} onChange={(event) => { setSearch(event.target.value); onSearchChange?.(event.target.value); }} placeholder="Cari produk toko..." className="h-10 w-full border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-500" /></div></div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {!available.length ? <div className="p-6 text-center text-sm text-slate-400">Tidak ada produk lain yang cocok.</div> : null}
          {available.map((product) => <button key={product.id} type="button" onClick={() => add(product.id)} className="mb-1 flex w-full items-center gap-3 border border-transparent p-2 text-left hover:border-emerald-200 hover:bg-emerald-50/40"><div className="h-10 w-10 shrink-0 overflow-hidden bg-slate-100">{product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : null}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{product.name}</p><p className="truncate text-[11px] text-slate-400">{product.sku || product.raw?.sku || `${product.stock ?? product.raw?.stock ?? 0} stok`}</p></div><span className="material-symbols-outlined text-[20px] text-emerald-600">add_circle</span></button>)}
        </div>
      </section>
    </div>
  );
}

export default function ShowcasePage() {
  const { activeRole, store } = useAuth();
  const admin = activeRole === "admin";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const deferredProductSearch = useDeferredValue(productSearch.trim());
  const editor = useEntityEditor({ createLabel: "Data Baru Etalase", getEditLabel: (row) => row.name });
  const listQuery = useShowcases({ page, per_page: 20, ...(query.trim() ? { search: query.trim() } : {}) });
  const productsQuery = useManageableProducts({ per_page: 100, ...(deferredProductSearch ? { search: deferredProductSearch } : {}), ...(admin && form.store_id ? { store_id: form.store_id } : {}) });
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
    setProductSearch("");
    setForm(row ? { store_id: String(row.store_id || ""), name: row.name || "", description: row.description || "", sort_order: Number(row.sort_order || 0), is_active: row.is_active !== false, product_ids: (row.products || []).map((product) => Number(product.id)) } : { ...initialForm, store_id: admin ? "" : String(store?.id || "") });
  }, [admin, editor.entity, editor.open, store?.id]);

  const columns = useMemo(() => [
    { key: "name", label: "Nama Etalase", width: 220 },
    { key: "store_name", label: "Toko", width: 220 },
    { key: "sort_order", label: "Urutan", width: 110 },
    { key: "products_count", label: "Jumlah Produk", width: 140 },
    { key: "is_active", label: "Status", width: 130, render: (row) => row.is_active ? "Aktif" : "Nonaktif" },
    { key: "description", label: "Deskripsi", width: 300 },
  ], []);

  async function submit(event) {
    event.preventDefault();
    if (!form.product_ids.length) {
      setMessage("Pilih minimal satu produk agar etalase mempunyai isi.");
      return;
    }
    try {
      await saveMutation.mutateAsync({ id: editor.entity?.id, values: { ...(admin ? { store_id: Number(form.store_id) } : {}), name: form.name.trim(), description: form.description.trim() || null, sort_order: Number(form.sort_order || 0), is_active: Boolean(form.is_active), product_ids: form.product_ids } });
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
        <ModuleFrame title="Etalase Toko" subtitle="Kelompokkan produk toko ke beberapa etalase dan atur urutan tampilnya di storefront." query={query} onQueryChange={setQuery} onRefresh={() => listQuery.refetch()} refreshing={listQuery.isFetching} onCreate={editor.create} createLabel="Tambah Etalase">
          <div className="flex flex-wrap items-center justify-between gap-2 border border-slate-200 bg-white px-4 py-3"><div><p className="text-sm font-extrabold text-slate-800">Pengelompokan produk storefront</p><p className="mt-0.5 text-xs text-slate-500">Produk mengikuti urutan yang kamu susun di dalam masing-masing etalase.</p></div>{!admin ? <Link to="/seller/store-preview" className="inline-flex h-9 items-center gap-2 border border-emerald-200 px-3 text-xs font-extrabold text-emerald-700 hover:bg-emerald-50"><span className="material-symbols-outlined text-[18px]">preview</span>Preview Toko</Link> : null}</div>
          {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          <DataGrid storageKey={`${activeRole}.showcases`} columns={columns} rows={rows} emptyText={listQuery.isLoading ? "" : "Etalase belum tersedia."} actions={(row) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => editor.edit(row)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}>Hapus</Button></div>} />
          {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
        </ModuleFrame>
      ) : null}
      <ConfirmDialog open={Boolean(deleteTarget)} title="Hapus Etalase" message={`Etalase “${deleteTarget?.name || ""}” akan dihapus. Produk tidak ikut terhapus.`} pending={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
      <FormModal open={editor.open} title={editor.entity ? "Edit Etalase" : "Tambah Etalase"} subtitle="Atur nama, urutan etalase, lalu susun produk dengan drag and drop." onClose={editor.close} onSubmit={submit} busy={saveMutation.isPending}>
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        {admin ? <Field label="ID Toko" required><Input type="number" min="1" value={form.store_id} onChange={(event) => { setProductSearch(""); setForm((current) => ({ ...current, store_id: event.target.value, product_ids: [] })); }} required /></Field> : null}
        <div className="grid gap-4 md:grid-cols-2"><Field label="Nama Etalase" required><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={120} required /></Field><Field label="Urutan Tampil"><Input type="number" min="0" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} /></Field></div>
        <Field label="Deskripsi"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} maxLength={3000} className="min-h-20 w-full border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500" placeholder="Contoh: Koleksi produk terbaru dan paling diminati." /></Field>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /> Tampilkan etalase di toko</label>
        <Field label="Susunan Produk" required><ProductOrderPicker products={products} existingProducts={editor.entity?.products || []} value={form.product_ids} onChange={(product_ids) => setForm((current) => ({ ...current, product_ids }))} onSearchChange={setProductSearch} /></Field>
      </FormModal>
    </>
  );
}
