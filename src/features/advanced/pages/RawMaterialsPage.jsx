import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useAdjustRawMaterial, useDeleteRawMaterial, useManageableProducts, useRawMaterialCostImpacts, useRawMaterialMovements, useRawMaterials, useSaveRawMaterial } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";
import { useEntityEditor } from "@/shared/hooks/useEntityEditor";
import { useRefreshOnListActivation } from "@/shared/hooks/useRefreshOnListActivation";

const MATERIAL_EMPTY = { code: "", name: "", unit: "pcs", minimum_stock: 0, average_cost: 0, is_active: true };

const DEFAULT_UNITS = ["pcs", "kg", "gram", "liter", "ml", "meter", "cm", "dus", "botol", "sachet", "lusin", "pack", "rim", "unit", "buah"];

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function RawMaterialsPage() {
  const { activeRole } = useAuth();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim());
  const [materialForm, setMaterialForm] = useState(null);
  const [materialAdjust, setMaterialAdjust] = useState(null);
  const [materialDelete, setMaterialDelete] = useState(null);
  const [materialSelected, setMaterialSelected] = useState(new Set());
  const [extraUnits, setExtraUnits] = useState([]);
  const [delta, setDelta] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const products = useManageableProducts({ per_page: 100, is_active: true });
  const materials = useRawMaterials({ per_page: 100, ...(deferred ? { search: deferred } : {}) });
  const materialMovements = useRawMaterialMovements({ per_page: 100 });
  const costImpacts = useRawMaterialCostImpacts({ per_page: 100, direction: "increase" });
  const saveMaterial = useSaveRawMaterial();
  const deleteMaterial = useDeleteRawMaterial();
  const adjustMaterial = useAdjustRawMaterial();

  const editor = useEntityEditor({
    createLabel: "Bahan Baku Baru",
    getEditLabel: (entity) => (entity?.name ? `Edit: ${entity.name}` : "Edit Bahan Baku"),
  });

  const refetchAll = useCallback(() => {
    materials.refetch();
    materialMovements.refetch();
    costImpacts.refetch();
  }, [costImpacts, materialMovements, materials]);

  useRefreshOnListActivation({
    isListActive: editor.isListActive,
    listRevision: editor.listRevision,
    refetch: refetchAll,
  });

  const openCreate = () => {
    setMaterialForm({ ...MATERIAL_EMPTY });
    editor.create();
  };

  const openEdit = (row) => {
    setMaterialForm({ ...row });
    editor.edit(row);
  };

  const closeMaterialForm = () => {
    setMaterialForm(null);
    editor.close();
  };

  const materialRows = useMemo(() => materials.data?.rows || [], [materials.data?.rows]);
  const materialAllSelected = materialRows.length > 0 && materialSelected.size === materialRows.length;
  const unitOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    const feed = (unit) => {
      const value = String(unit || "").trim();
      if (value && !seen.has(value)) {
        seen.add(value);
        options.push({ value, label: value });
      }
    };
    DEFAULT_UNITS.forEach(feed);
    materialRows.forEach((row) => feed(row.unit));
    extraUnits.forEach(feed);
    return options;
  }, [materialRows, extraUnits]);

  const toggleMaterialRow = (id) => setMaterialSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const toggleMaterialAll = () => setMaterialSelected((current) => (materialRows.length && current.size === materialRows.length ? new Set() : new Set(materialRows.map((row) => row.id))));

  const createUnit = async (name) => {
    const clean = String(name || "").trim();
    if (!clean) return null;
    setExtraUnits((current) => (current.includes(clean) ? current : [...current, clean]));
    setMaterialForm((current) => ({ ...current, unit: clean }));
    return { value: clean, label: clean };
  };

  const materialSpreadsheet = useSpreadsheetWorkspace({ module: "raw-material", label: "Bahan Baku", selectedRows: materialRows.filter((row) => materialSelected.has(row.id)), allowBulkDelete: true, onCompleted: () => { materials.refetch(); setMaterialSelected(new Set()); } });
  const materialStockSpreadsheet = useSpreadsheetWorkspace({ module: "raw-material-stock", label: "Stok Bahan Baku", allowBulkDelete: false, onCompleted: () => { materials.refetch(); materialMovements.refetch(); costImpacts.refetch(); } });

  const workspaceByModule = { "raw-material": materialSpreadsheet, "raw-material-stock": materialStockSpreadsheet };
  const activeSpreadsheetModule = materialSpreadsheet.activeOperation?.payload?.module;
  const activeWorkspace = workspaceByModule[activeSpreadsheetModule] || materialSpreadsheet;

  const storeOptions = useMemo(() => {
    const map = new Map();
    (products.data?.rows || []).forEach((product) => {
      const id = Number(product.store_id || product.storeId || product.store?.id || 0);
      const name = product.store_name || product.storeName || product.store?.name || `Toko ${id}`;
      if (id) map.set(id, { id, name });
    });
    return [...map.values()];
  }, [products.data?.rows]);

  const materialColumns = [
    { key: "code", label: "Kode", filterType: "text" },
    { key: "name", label: "Bahan Baku", filterType: "text" },
    { key: "unit", label: "Satuan", filterType: "select", options: unitOptions },
    { key: "stock", label: "Stok", filterType: "range" },
    { key: "minimum_stock", label: "Minimum", filterType: "range" },
    { key: "average_cost", label: "Biaya Rata-rata", filterType: "range", render: (row) => money(row.average_cost), align: "right" },
    { key: "is_active", label: "Status", filterable: false, render: (row) => row.is_active ? "Aktif" : "Non-Aktif" },
    {
      key: "actions",
      label: "Aksi",
      filterable: false,
      width: 132,
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
          <button type="button" title="Stock / Restock" onClick={() => { setMaterialAdjust(row); setDelta(""); setUnitCost(String(row.average_cost || "")); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><span className="material-symbols-outlined text-[17px]">add_box</span></button>
          <button type="button" title="Edit" onClick={() => openEdit(row)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"><span className="material-symbols-outlined text-[17px]">edit</span></button>
          <button type="button" title="Hapus" onClick={() => setMaterialDelete(row)} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"><span className="material-symbols-outlined text-[17px]">delete</span></button>
        </div>
      ),
    },
  ];

  const spreadsheetActions = materialSpreadsheet.actions;

  async function submitMaterial(event) {
    event.preventDefault();
    if (saveMaterial.isPending) return;
    const autoCode = !materialForm?.id && !String(materialForm?.code || "").trim();
    try {
      const saved = await saveMaterial.mutateAsync({ id: materialForm?.id, values: materialForm });
      setMaterialForm(null);
      editor.markListDirty();
      toastSuccess("Simpan Bahan Baku", autoCode && saved?.code
        ? `Bahan baku berhasil disimpan dengan kode otomatis ${saved.code}. Jika biaya berubah, HPP produk terkait telah dihitung ulang.`
        : "Bahan baku berhasil disimpan. Jika biaya berubah, HPP produk terkait telah dihitung ulang.");
      costImpacts.refetch();
      editor.completeSave();
    } catch (error) {
      toastError("Simpan Bahan Baku", advancedError(error));
    }
  }

  const removeMaterial = async () => {
    if (!materialDelete || deleteMaterial.isPending) return;
    try {
      await deleteMaterial.mutateAsync(materialDelete.id);
      setMaterialDelete(null);
      setMaterialSelected(new Set());
      toastSuccess("Hapus Bahan Baku", `Bahan baku ${materialDelete.name || materialDelete.code} berhasil dihapus.`);
      materials.refetch();
      materialMovements.refetch();
      costImpacts.refetch();
    } catch (error) {
      toastError("Hapus Bahan Baku", advancedError(error));
    }
  };

  async function submitMaterialStock(event) {
    event.preventDefault();
    if (adjustMaterial.isPending) return;
    try {
      await adjustMaterial.mutateAsync({ id: materialAdjust.id, values: { quantity_delta: Number(delta), unit_cost: unitCost ? Number(unitCost) : null, reference_type: Number(delta) > 0 ? "restock" : "usage", notes: "Pergerakan dari Persediaan" } });
      setMaterialAdjust(null);
      setDelta("");
      setUnitCost("");
      toastSuccess("Stock / Restock Bahan Baku", "Stok bahan baku berhasil diperbarui. Dampak biaya terhadap HPP sudah disinkronkan.");
      materials.refetch();
      materialMovements.refetch();
      costImpacts.refetch();
    } catch (error) {
      toastError("Stock / Restock Bahan Baku", advancedError(error));
    }
  }

  return <>
    {editor.isListActive ? (
      <ModuleFrame
      title="Bahan Baku"
      subtitle="Master bahan baku, stok/restock, import/export terpisah, dan laporan dampak kenaikan biaya terhadap HPP. Pemakaian bahan tercatat otomatis saat produk di-restock."
      query={query}
      onQueryChange={setQuery}
      onRefresh={refetchAll}
      refreshing={false}
      onCreate={openCreate}
      createLabel="Bahan Baku"
      selectionEnabled={materialSelected.size > 0}
      selectedCount={materialSelected.size}
      onToggleSelection={() => (materialSelected.size ? setMaterialSelected(new Set()) : setMaterialSelected(new Set(materialRows.map((row) => row.id))))}
      bulkActions={spreadsheetActions}
    >
      <DataGrid storageKey="inventory.raw-materials" columns={materialColumns} rows={materialRows} emptyText="Bahan baku belum tersedia." onRowClick={(row) => (row.id ? openEdit(row) : undefined)} selectionEnabled selectedIds={materialSelected} allSelected={materialAllSelected} onToggleRow={toggleMaterialRow} onToggleAll={toggleMaterialAll} />
    </ModuleFrame>
    ) : null}

    <SpreadsheetOperationPanel workspace={activeWorkspace} />

    <FormModal open={editor.open} title={materialForm?.id ? "Edit Bahan Baku" : "Data Baru Bahan Baku"} onClose={closeMaterialForm} onSubmit={submitMaterial} busy={saveMaterial.isPending} submitLabel="Simpan" dangerAction={materialForm?.id ? <Button type="button" variant="outline" onClick={() => { setMaterialAdjust(materialForm); setDelta(""); setUnitCost(String(materialForm?.average_cost || "")); setMaterialForm(null); editor.close(); }}>Stock / Restock</Button> : undefined}>
      <div className="grid gap-4 md:grid-cols-2">
        {activeRole === "admin" ? <Field label="Toko" required><select className="h-10 border border-slate-300 bg-white px-3 text-sm" value={materialForm?.store_id || ""} onChange={(event) => setMaterialForm((current) => ({ ...current, store_id: event.target.value }))} required><option value="">Pilih toko</option>{storeOptions.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></Field> : null}
        <Field label="Kode" hint="Kosongkan agar dibuat otomatis (mis. RM-GULA), atau isi manual."><Input value={materialForm?.code || ""} onChange={(event) => setMaterialForm((current) => ({ ...current, code: event.target.value }))} /></Field>
        <Field label="Nama" required><Input value={materialForm?.name || ""} onChange={(event) => setMaterialForm((current) => ({ ...current, name: event.target.value }))} required /></Field>
        <Field label="Satuan" required hint="Pilih satuan yang sudah ada, atau ketik satuan baru untuk menambah langsung ke daftar."><SearchableSelect value={materialForm?.unit || ""} onChange={(nextValue) => setMaterialForm((current) => ({ ...current, unit: nextValue }))} options={unitOptions} clearable={false} onCreate={createUnit} createLabel={(name) => `Satuan “${name}” belum ada, tambahkan sekarang`} placeholder="Pilih / ketik satuan" searchPlaceholder="Cari atau ketik satuan baru" /></Field>
        <Field label="Minimum Stok"><Input type="number" min="0" value={materialForm?.minimum_stock || 0} onChange={(event) => setMaterialForm((current) => ({ ...current, minimum_stock: event.target.value }))} /></Field>
        <Field label="Biaya Rata-rata" hint={materialForm?.id ? "Biaya rata-rata berubah melalui Stock / Restock Bahan Baku agar weighted average dan histori HPP tercatat." : "Biaya awal bahan sebelum transaksi restock pertama."}><Input type="number" min="0" value={materialForm?.average_cost || 0} disabled={Boolean(materialForm?.id)} onChange={(event) => setMaterialForm((current) => ({ ...current, average_cost: event.target.value }))} className={materialForm?.id ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} /></Field>
      </div>
    </FormModal>

    <FormModal open={Boolean(materialAdjust)} title="Stock / Restock Bahan Baku" onClose={() => setMaterialAdjust(null)} onSubmit={submitMaterialStock} busy={adjustMaterial.isPending} submitLabel="Simpan">
      <Field label="Perubahan Stok" required hint="Positif untuk restock, negatif untuk pemakaian."><Input type="number" step="0.0001" value={delta} onChange={(event) => setDelta(event.target.value)} required /></Field>
      <Field label="Biaya per Satuan" hint="Saat restock, nilai ini dipakai untuk average cost tertimbang dan laporan dampak HPP."><Input type="number" step="0.0001" min="0" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} /></Field>
    </FormModal>

    <ConfirmDialog open={Boolean(materialDelete)} title="Hapus Bahan Baku" message={`Bahan baku “${materialDelete?.name || materialDelete?.code || ""}” akan dihapus dari master. Riwayat pergerakan stok tetap tersimpan.`} pending={deleteMaterial.isPending} onClose={() => setMaterialDelete(null)} onConfirm={removeMaterial} />
  </>;
}