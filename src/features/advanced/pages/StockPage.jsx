import { useDeferredValue, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useAdjustRawMaterial, useAdjustStock, useManageableProducts, useProductCosting, useRawMaterialCostImpacts, useRawMaterialMovements, useRawMaterials, useSaveRawMaterial, useStockMovements } from "@/features/advanced/services/advancedMarketplaceService";
import { ModuleFrame } from "@/features/advanced/components/ModuleFrame";
import { DataGrid } from "@/features/advanced/components/DataGrid";
import { Field, FormModal } from "@/features/advanced/components/FormModal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { SpreadsheetOperationPanel } from "@/shared/spreadsheet/SpreadsheetOperationPanel";
import { useSpreadsheetWorkspace } from "@/shared/spreadsheet/useSpreadsheetWorkspace";

const MATERIAL_EMPTY = { code: "", name: "", unit: "pcs", minimum_stock: 0, average_cost: 0, is_active: true };

function number(value, digits = 4) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(Number(value || 0));
}

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function StockPage() {
  const { activeRole } = useAuth();
  const [tab, setTab] = useState("product");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim());
  const [productAdjust, setProductAdjust] = useState(null);
  const [materialForm, setMaterialForm] = useState(null);
  const [materialAdjust, setMaterialAdjust] = useState(null);
  const [delta, setDelta] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const products = useManageableProducts({ per_page: 100, is_active: true });
  const productMovements = useStockMovements({ per_page: 100, ...(deferred ? { search: deferred } : {}) });
  const materials = useRawMaterials({ per_page: 100, ...(deferred ? { search: deferred } : {}) });
  const materialMovements = useRawMaterialMovements({ per_page: 100 });
  const costImpacts = useRawMaterialCostImpacts({ per_page: 100, direction: "increase" });
  const productionCosting = useProductCosting(productAdjust?.product_id, Boolean(productAdjust?.product_id && Number(delta) > 0));
  const adjustStock = useAdjustStock();
  const saveMaterial = useSaveRawMaterial();
  const adjustMaterial = useAdjustRawMaterial();

  const stockSpreadsheet = useSpreadsheetWorkspace({ module: "stock", label: "Stok Produk", allowBulkDelete: false, onCompleted: () => productMovements.refetch() });
  const materialSpreadsheet = useSpreadsheetWorkspace({ module: "raw-material", label: "Bahan Baku", allowBulkDelete: false, onCompleted: () => materials.refetch() });
  const materialStockSpreadsheet = useSpreadsheetWorkspace({ module: "raw-material-stock", label: "Stok Bahan Baku", allowBulkDelete: false, onCompleted: () => { materials.refetch(); materialMovements.refetch(); costImpacts.refetch(); } });
  const impactSpreadsheet = useSpreadsheetWorkspace({ module: "cost-impact", label: "Laporan Dampak HPP", allowImport: false, allowBulkDelete: false });

  const workspaceByModule = { stock: stockSpreadsheet, "raw-material": materialSpreadsheet, "raw-material-stock": materialStockSpreadsheet, "cost-impact": impactSpreadsheet };
  const activeSpreadsheetModule = stockSpreadsheet.activeOperation?.payload?.module;
  const activeWorkspace = workspaceByModule[activeSpreadsheetModule] || stockSpreadsheet;

  const storeOptions = useMemo(() => {
    const map = new Map();
    (products.data?.rows || []).forEach((product) => {
      const id = Number(product.store_id || product.storeId || product.store?.id || 0);
      const name = product.store_name || product.storeName || product.store?.name || `Toko ${id}`;
      if (id) map.set(id, { id, name });
    });
    return [...map.values()];
  }, [products.data?.rows]);

  const variants = useMemo(() => (products.data?.rows || []).flatMap((product) => (product.variants || []).map((variant) => ({ ...variant, product_name: product.name, product_id: product.id }))), [products.data?.rows]);
  const materialRows = materials.data?.rows || [];
  const productionMaterials = productionCosting.data?.materials || [];
  const productionQuantity = Math.max(0, Number(delta || 0));
  const productionPreview = useMemo(() => productionMaterials.map((recipe) => {
    const master = materialRows.find((item) => Number(item.id) === Number(recipe.raw_material_id));
    const required = Number(recipe.quantity || 0) * productionQuantity;
    return { ...recipe, stock: Number(master?.stock || recipe.material_stock || 0), required, unit: master?.unit || recipe.unit || "", enough: Number(master?.stock || recipe.material_stock || 0) + 0.0000001 >= required };
  }), [productionMaterials, materialRows, productionQuantity]);

  const productColumns = [
    { key: "product_name", label: "Produk" }, { key: "name", label: "Varian" }, { key: "sku", label: "SKU" }, { key: "stock", label: "Stok" },
  ];
  const materialColumns = [
    { key: "code", label: "Kode" }, { key: "name", label: "Bahan Baku" }, { key: "unit", label: "Satuan" }, { key: "stock", label: "Stok" }, { key: "minimum_stock", label: "Minimum" }, { key: "average_cost", label: "Biaya Rata-rata", render: (row) => money(row.average_cost) },
  ];
  const productHistoryColumns = [
    { key: "occurred_at", label: "Waktu", render: (row) => row.occurred_at ? new Date(row.occurred_at).toLocaleString("id-ID") : "-" }, { key: "product_name", label: "Produk" }, { key: "variant_name", label: "Varian" }, { key: "type", label: "Jenis" }, { key: "quantity_delta", label: "Perubahan" }, { key: "balance_after", label: "Saldo" }, { key: "notes", label: "Catatan" },
  ];
  const materialHistoryColumns = [
    { key: "occurred_at", label: "Waktu", render: (row) => row.occurred_at ? new Date(row.occurred_at).toLocaleString("id-ID") : "-" }, { key: "material_name", label: "Bahan Baku", render: (row) => row.material?.name || row.material_name || "-" }, { key: "type", label: "Jenis" }, { key: "quantity_delta", label: "Perubahan" }, { key: "balance_after", label: "Saldo" }, { key: "unit_cost", label: "Biaya/Satuan", render: (row) => money(row.unit_cost) }, { key: "reference_number", label: "Referensi" },
  ];
  const impactColumns = [
    { key: "occurred_at", label: "Waktu", render: (row) => row.occurred_at ? new Date(row.occurred_at).toLocaleString("id-ID") : "-" },
    { key: "material", label: "Bahan Baku", render: (row) => `${row.material?.code || ""} ${row.material?.name || ""}`.trim() || "-" },
    { key: "product", label: "Produk", render: (row) => row.product?.name || "-" },
    { key: "old_cost", label: "Biaya Lama", render: (row) => money(row.cost_history?.old_average_cost || row.costHistory?.old_average_cost) },
    { key: "new_cost", label: "Biaya Baru", render: (row) => money(row.cost_history?.new_average_cost || row.costHistory?.new_average_cost) },
    { key: "old_hpp", label: "HPP Lama", render: (row) => money(row.old_hpp) },
    { key: "new_hpp", label: "HPP Baru", render: (row) => money(row.new_hpp) },
    { key: "hpp_change_percent", label: "Kenaikan HPP", render: (row) => `${number(row.hpp_change_percent, 2)}%` },
    { key: "new_suggested_price", label: "Saran Harga Baru", render: (row) => money(row.new_suggested_price) },
  ];

  const spreadsheetActions = tab === "materials" ? materialSpreadsheet.actions
    : tab === "material-history" ? materialStockSpreadsheet.actions
      : tab === "cost-impact" ? impactSpreadsheet.actions
        : stockSpreadsheet.actions;

  async function submitProductStock(event) {
    event.preventDefault();
    if (adjustStock.isPending) return;
    if (productionQuantity > 0 && productionPreview.some((row) => !row.enough)) {
      setMessageType("error");
      setMessage("Stok bahan baku belum mencukupi untuk jumlah produksi tersebut.");
      return;
    }
    try {
      await adjustStock.mutateAsync({ variant_id: productAdjust.id, quantity_delta: Number(delta), reference_type: Number(delta) > 0 ? "production_restock" : "manual", notes: Number(delta) > 0 ? "Produksi / restock dari Persediaan" : "Penyesuaian dari Persediaan" });
      setProductAdjust(null);
      setDelta("");
      setMessageType("success");
      setMessage("Stok produk berhasil diperbarui dan pemakaian bahan baku telah dicatat.");
      products.refetch();
      productMovements.refetch();
      materials.refetch();
      materialMovements.refetch();
    } catch (error) {
      setMessageType("error");
      setMessage(advancedError(error));
    }
  }

  async function submitMaterial(event) {
    event.preventDefault();
    if (saveMaterial.isPending) return;
    try {
      await saveMaterial.mutateAsync({ id: materialForm?.id, values: materialForm });
      setMaterialForm(null);
      setMessageType("success");
      setMessage("Bahan baku berhasil disimpan. Jika biaya berubah, HPP produk terkait telah dihitung ulang.");
      costImpacts.refetch();
    } catch (error) {
      setMessageType("error");
      setMessage(advancedError(error));
    }
  }

  async function submitMaterialStock(event) {
    event.preventDefault();
    if (adjustMaterial.isPending) return;
    try {
      await adjustMaterial.mutateAsync({ id: materialAdjust.id, values: { quantity_delta: Number(delta), unit_cost: unitCost ? Number(unitCost) : null, reference_type: Number(delta) > 0 ? "restock" : "usage", notes: "Pergerakan dari Persediaan" } });
      setMaterialAdjust(null);
      setDelta("");
      setUnitCost("");
      setMessageType("success");
      setMessage("Stok bahan baku berhasil diperbarui. Dampak biaya terhadap HPP sudah disinkronkan.");
      materials.refetch();
      materialMovements.refetch();
      costImpacts.refetch();
    } catch (error) {
      setMessageType("error");
      setMessage(advancedError(error));
    }
  }

  const tabs = [["product", "Stok Produk"], ["materials", "Bahan Baku"], ["product-history", "Riwayat Produk"], ["material-history", "Riwayat Bahan Baku"], ["cost-impact", "Kenaikan Bahan & HPP"]];

  return <>
    <ModuleFrame
      title="Persediaan"
      subtitle="Stok produk, bahan baku, produksi, audit pergerakan, import/export terpisah, dan laporan dampak kenaikan biaya terhadap HPP."
      query={query}
      onQueryChange={setQuery}
      onRefresh={() => { products.refetch(); productMovements.refetch(); materials.refetch(); materialMovements.refetch(); costImpacts.refetch(); }}
      refreshing={false}
      bulkActions={spreadsheetActions}
    >
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={`h-9 px-4 text-sm font-bold ${tab === id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}</div>
      {message ? <p className={`border px-4 py-3 text-sm font-semibold ${messageType === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
      {tab === "product" ? <DataGrid storageKey="inventory.product-stock" columns={productColumns} rows={variants} emptyText="Produk belum tersedia." actions={(row) => <Button size="sm" variant="outline" onClick={() => { setProductAdjust(row); setDelta(""); }}>Stock / Restock</Button>} /> : null}
      {tab === "materials" ? <><div className="flex justify-end"><Button onClick={() => setMaterialForm({ ...MATERIAL_EMPTY })}>Data Baru Bahan Baku</Button></div><DataGrid storageKey="inventory.raw-materials" columns={materialColumns} rows={materialRows} emptyText="Bahan baku belum tersedia." actions={(row) => <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setMaterialForm({ ...row })}>Edit</Button><Button size="sm" onClick={() => { setMaterialAdjust(row); setDelta(""); setUnitCost(String(row.average_cost || "")); }}>Stock / Restock</Button></div>} /></> : null}
      {tab === "product-history" ? <DataGrid storageKey="inventory.product-history" columns={productHistoryColumns} rows={productMovements.data?.rows || []} emptyText="Riwayat stok produk belum tersedia." /> : null}
      {tab === "material-history" ? <DataGrid storageKey="inventory.material-history" columns={materialHistoryColumns} rows={materialMovements.data?.rows || []} emptyText="Riwayat stok bahan baku belum tersedia." /> : null}
      {tab === "cost-impact" ? <><div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Laporan ini muncul otomatis saat average cost bahan baku naik dan perubahan tersebut menaikkan HPP produk. Harga jual aktif tidak diubah otomatis; Seller dapat memakai kolom Saran Harga Baru sebagai dasar keputusan.</div><DataGrid storageKey="inventory.cost-impact" columns={impactColumns} rows={costImpacts.data?.rows || []} emptyText="Belum ada kenaikan biaya bahan baku yang memengaruhi HPP." /></> : null}
    </ModuleFrame>

    <SpreadsheetOperationPanel workspace={activeWorkspace} />

    <FormModal open={Boolean(productAdjust)} title="Stock / Restock Produk" onClose={() => setProductAdjust(null)} onSubmit={submitProductStock} busy={adjustStock.isPending || (productionQuantity > 0 && productionPreview.some((row) => !row.enough))} submitLabel="Simpan">
      <Field label="Perubahan Stok" required hint="Positif berarti produksi/restock dan otomatis memakai bahan baku resep. Negatif berarti pengeluaran stok produk."><Input type="number" value={delta} onChange={(event) => setDelta(event.target.value)} required /></Field>
      {productionQuantity > 0 ? <div className="space-y-2 border border-blue-200 bg-blue-50 p-3"><p className="text-xs font-black uppercase text-blue-700">Estimasi pemakaian bahan untuk {productionQuantity} produk</p>{productionPreview.length ? productionPreview.map((row) => <div key={row.raw_material_id} className="flex items-center justify-between gap-3 text-sm"><span>{row.material_code} - {row.material_name}</span><span className={row.enough ? "font-bold text-slate-700" : "font-bold text-red-700"}>Butuh {number(row.required)} {row.unit} / Stok {number(row.stock)} {row.unit}</span></div>) : <p className="text-sm text-blue-800">Produk belum memiliki resep bahan baku. Penambahan stok tetap diperbolehkan tanpa konsumsi bahan.</p>}</div> : null}
    </FormModal>

    <FormModal open={Boolean(materialForm)} title={materialForm?.id ? "Edit Bahan Baku" : "Data Baru Bahan Baku"} onClose={() => setMaterialForm(null)} onSubmit={submitMaterial} busy={saveMaterial.isPending} submitLabel="Simpan">
      <div className="grid gap-4 md:grid-cols-2">
        {activeRole === "admin" ? <Field label="Toko" required><select className="h-10 border border-slate-300 bg-white px-3 text-sm" value={materialForm?.store_id || ""} onChange={(event) => setMaterialForm((current) => ({ ...current, store_id: event.target.value }))} required><option value="">Pilih toko</option>{storeOptions.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></Field> : null}
        <Field label="Kode" required><Input value={materialForm?.code || ""} onChange={(event) => setMaterialForm((current) => ({ ...current, code: event.target.value }))} required /></Field>
        <Field label="Nama" required><Input value={materialForm?.name || ""} onChange={(event) => setMaterialForm((current) => ({ ...current, name: event.target.value }))} required /></Field>
        <Field label="Satuan" required><Input value={materialForm?.unit || "pcs"} onChange={(event) => setMaterialForm((current) => ({ ...current, unit: event.target.value }))} required /></Field>
        <Field label="Minimum Stok"><Input type="number" min="0" value={materialForm?.minimum_stock || 0} onChange={(event) => setMaterialForm((current) => ({ ...current, minimum_stock: event.target.value }))} /></Field>
        <Field label="Biaya Rata-rata" hint={materialForm?.id ? "Biaya rata-rata berubah melalui Stock / Restock Bahan Baku agar weighted average dan histori HPP tercatat." : "Biaya awal bahan sebelum transaksi restock pertama."}><Input type="number" min="0" value={materialForm?.average_cost || 0} disabled={Boolean(materialForm?.id)} onChange={(event) => setMaterialForm((current) => ({ ...current, average_cost: event.target.value }))} className={materialForm?.id ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} /></Field>
      </div>
    </FormModal>

    <FormModal open={Boolean(materialAdjust)} title="Stock / Restock Bahan Baku" onClose={() => setMaterialAdjust(null)} onSubmit={submitMaterialStock} busy={adjustMaterial.isPending} submitLabel="Simpan">
      <Field label="Perubahan Stok" required hint="Positif untuk restock, negatif untuk pemakaian."><Input type="number" step="0.0001" value={delta} onChange={(event) => setDelta(event.target.value)} required /></Field>
      <Field label="Biaya per Satuan" hint="Saat restock, nilai ini dipakai untuk average cost tertimbang dan laporan dampak HPP."><Input type="number" step="0.0001" min="0" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} /></Field>
    </FormModal>
  </>;
}
