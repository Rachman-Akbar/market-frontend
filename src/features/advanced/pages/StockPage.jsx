import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { advancedError, useAdjustStock, useManageableProducts, useStockMovements } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { useEntityEditor, useRefreshOnListActivation, useTableSelection } from "@/shared/hooks";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

const EMPTY_FORM = { variant_id: "", quantity_delta: "", reference_type: "manual", reference_id: "", notes: "", occurred_at: "" };

export default function StockPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const deferredQuery = useDeferredValue(query.trim());
  const editor = useEntityEditor({ createLabel: "Penyesuaian Stok" });
  const listQuery = useStockMovements({ page, per_page: 20, ...(deferredQuery ? { search: deferredQuery } : {}) });
  const productsQuery = useManageableProducts({ per_page: 100, is_active: true });
  const adjustMutation = useAdjustStock();
  const rows = listQuery.data?.rows || [];
  const meta = listQuery.data?.meta || {};
  const selection = useTableSelection(rows);
  const spreadsheet = useSpreadsheetWorkspace({ module: "stock", label: "Stock", selectedRows: selection.selectedRows, allowBulkDelete: false, onCompleted: () => { selection.clear(); listQuery.refetch(); } });

  useRefreshOnListActivation({ isListActive: editor.isListActive, listRevision: editor.listRevision, refetch: listQuery.refetch });
  useEffect(() => setPage(1), [deferredQuery]);
  useEffect(() => {
    if (editor.open) {
      setForm(EMPTY_FORM);
      setMessage("");
    }
  }, [editor.open]);

  const variantOptions = useMemo(() => (productsQuery.data?.rows || []).flatMap((product) => (product.variants || []).map((variant) => ({
    id: Number(variant.id),
    label: `${product.name} - ${variant.name || variant.sku || `Varian ${variant.id}`} - ${variant.sku || "Tanpa SKU"} - Stok ${Number(variant.stock || 0)}`,
  }))), [productsQuery.data?.rows]);

  const columns = useMemo(() => [
    { key: "occurred_at", label: "Waktu", render: (row) => row.occurred_at ? new Date(row.occurred_at).toLocaleString("id-ID") : "-" },
    { key: "store_name", label: "Toko" },
    { key: "product_name", label: "Produk" },
    { key: "variant_name", label: "Varian" },
    { key: "sku", label: "SKU" },
    { key: "type", label: "Jenis", render: (row) => <span className="font-bold uppercase text-slate-600">{row.type}</span> },
    { key: "quantity_delta", label: "Perubahan", render: (row) => <span className={Number(row.quantity_delta) >= 0 ? "font-black text-emerald-600" : "font-black text-red-600"}>{Number(row.quantity_delta) > 0 ? "+" : ""}{row.quantity_delta}</span> },
    { key: "balance_after", label: "Saldo Stok" },
    { key: "reference_id", label: "Referensi" },
    { key: "notes", label: "Catatan" },
  ], []);

  async function submit(event) {
    event.preventDefault();
    try {
      await adjustMutation.mutateAsync({
        ...form,
        variant_id: Number(form.variant_id),
        quantity_delta: Number(form.quantity_delta),
        occurred_at: form.occurred_at ? new Date(form.occurred_at).toISOString() : null,
      });
      setMessage("Penyesuaian stok berhasil disimpan.");
      editor.markListDirty();
      editor.completeSave();
      editor.close();
    } catch (error) {
      setMessage(advancedError(error));
    }
  }

  return (
    <>
      {editor.isListActive ? (
        <ModuleFrame
          title="Stock dan Riwayat Pergerakan"
          subtitle="Penyesuaian dibuka sebagai tab data baru. Import/export mengikuti workbook tiga sheet yang sama seperti Product."
          query={query}
          onQueryChange={setQuery}
          onRefresh={() => listQuery.refetch()}
          refreshing={listQuery.isFetching}
          onCreate={editor.create}
          createLabel="Penyesuaian Stok"
          placeholder="Cari produk, SKU, toko, referensi, atau catatan"
          selectionEnabled={selection.enabled}
          selectedCount={selection.selectedCount}
          onToggleSelection={selection.toggleEnabled}
          bulkActions={spreadsheet.actions}
        >
          {message ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
          <DataGrid
            columns={columns}
            rows={rows}
            emptyText={listQuery.isLoading ? "Memuat riwayat stok..." : "Riwayat stok belum tersedia."}
            selectionEnabled={selection.enabled}
            selectedIds={selection.selectedIds}
            allSelected={selection.allSelected}
            onToggleRow={selection.toggleRow}
            onToggleAll={selection.toggleAll}
          />
          {rows.length ? <Pagination current={meta.current_page || page} total={meta.last_page || 1} onChange={setPage} /> : null}
        </ModuleFrame>
      ) : null}

      <SpreadsheetOperationPanel workspace={spreadsheet} />

      <FormModal
        open={editor.open}
        title="Penyesuaian Stok Manual"
        subtitle="Gunakan nilai positif untuk barang masuk dan nilai negatif untuk barang keluar."
        onClose={editor.close}
        onSubmit={submit}
        busy={adjustMutation.isPending}
      >
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}
        <Field label="Varian Produk" required>
          <select value={form.variant_id} onChange={(event) => setForm((current) => ({ ...current, variant_id: event.target.value }))} className="h-10 w-full border border-slate-300 bg-white px-3 text-sm" required>
            <option value="">Pilih varian produk</option>
            {variantOptions.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
          </select>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Perubahan Quantity" required hint="Contoh 10 untuk masuk atau -3 untuk keluar."><Input type="number" value={form.quantity_delta} onChange={(event) => setForm((current) => ({ ...current, quantity_delta: event.target.value }))} required /></Field>
          <Field label="Waktu Pergerakan"><Input type="datetime-local" value={form.occurred_at} onChange={(event) => setForm((current) => ({ ...current, occurred_at: event.target.value }))} /></Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipe Referensi"><Input value={form.reference_type} onChange={(event) => setForm((current) => ({ ...current, reference_type: event.target.value }))} /></Field>
          <Field label="Nomor Referensi"><Input value={form.reference_id} onChange={(event) => setForm((current) => ({ ...current, reference_id: event.target.value }))} /></Field>
        </div>
        <Field label="Catatan"><textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-24 border border-slate-300 p-3 text-sm" /></Field>
      </FormModal>
    </>
  );
}
