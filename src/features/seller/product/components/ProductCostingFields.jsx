import { useEffect, useMemo, useState } from "react";
import { advancedError, useProductCosting, useRawMaterials, useSaveProductCosting } from "@/features/advanced/services/advancedMarketplaceService";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function qty(value) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 4 }).format(Number(value || 0));
}

export function ProductCostingFields({ productId }) {
  const materialsQuery = useRawMaterials({ per_page: 100 });
  const costingQuery = useProductCosting(productId, Boolean(productId));
  const save = useSaveProductCosting();
  const [form, setForm] = useState({ materials: [], labor_cost: 0, overhead_cost: 0, other_cost: 0, margin_percent: 30, selling_price: 0, apply_to_variants: false });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const data = costingQuery.data || {};

  useEffect(() => {
    if (!data.costing && !data.materials) return;
    setForm({
      materials: (data.materials || []).map((row) => ({ raw_material_id: row.raw_material_id, quantity: row.quantity })),
      labor_cost: data.costing?.labor_cost || 0,
      overhead_cost: data.costing?.overhead_cost || 0,
      other_cost: data.costing?.other_cost || 0,
      margin_percent: data.costing?.margin_percent || 30,
      selling_price: data.costing?.selling_price || 0,
      apply_to_variants: false,
    });
  }, [data.costing, data.materials]);

  const materialOptions = materialsQuery.data?.rows || [];
  const materialCost = useMemo(() => form.materials.reduce((sum, row) => {
    const material = materialOptions.find((item) => Number(item.id) === Number(row.raw_material_id));
    return sum + Number(row.quantity || 0) * Number(material?.average_cost || 0);
  }, 0), [form.materials, materialOptions]);
  const hpp = materialCost + Number(form.labor_cost || 0) + Number(form.overhead_cost || 0) + Number(form.other_cost || 0);
  const suggested = hpp * (1 + Number(form.margin_percent || 0) / 100);

  if (!productId) return <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Simpan produk terlebih dahulu. Setelah produk memiliki ID, tab HPP dapat digunakan.</div>;

  function updateMaterial(index, field, value) {
    setForm((current) => ({ ...current, materials: current.materials.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row) }));
  }

  async function submit(event) {
    event.preventDefault();
    const rows = form.materials.filter((row) => row.raw_material_id);
    const ids = rows.map((row) => Number(row.raw_material_id));
    if (ids.length !== new Set(ids).size) {
      setMessageType("error");
      setMessage("Bahan baku yang sama tidak boleh dipilih lebih dari satu kali.");
      return;
    }
    if (rows.some((row) => Number(row.quantity || 0) <= 0)) {
      setMessageType("error");
      setMessage("Jumlah pemakaian setiap bahan baku harus lebih besar dari nol.");
      return;
    }
    try {
      await save.mutateAsync({ productId, values: { ...form, materials: rows, selling_price: Number(form.selling_price || suggested) } });
      setMessageType("success");
      setMessage("HPP dan harga jual berhasil disimpan menggunakan biaya bahan baku terbaru dari database.");
      costingQuery.refetch();
    } catch (error) {
      setMessageType("error");
      setMessage(advancedError(error));
    }
  }

  return <form onSubmit={submit} className="space-y-5">
    {message ? <p className={`border px-4 py-3 text-sm font-semibold ${messageType === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}

    <section className="border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Tahap 1</p>
          <h3 className="text-sm font-black">Pilih bahan baku dan quantity per 1 produk</h3>
          <p className="text-xs text-slate-500">Biaya satuan dikunci dari average cost bahan baku aktual sehingga HPP selalu sinkron dengan database.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setForm((current) => ({ ...current, materials: [...current.materials, { raw_material_id: "", quantity: 1 }] }))}>Tambah Bahan</Button>
      </div>
      <div className="space-y-2">
        {form.materials.map((row, index) => {
          const material = materialOptions.find((item) => Number(item.id) === Number(row.raw_material_id));
          return <div key={`${row.raw_material_id}-${index}`} className="grid gap-2 border border-slate-100 p-2 md:grid-cols-[minmax(0,1fr)_120px_140px_130px_70px]">
            <select className="h-10 border border-slate-300 bg-white px-3 text-sm" value={row.raw_material_id} onChange={(event) => updateMaterial(index, "raw_material_id", event.target.value)}>
              <option value="">Pilih bahan baku</option>
              {materialOptions.filter((item) => item.is_active !== false).map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
            </select>
            <Input type="number" step="0.0001" min="0.0001" value={row.quantity} onChange={(event) => updateMaterial(index, "quantity", event.target.value)} />
            <div className="flex h-10 items-center border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">{money(material?.average_cost || 0)}</div>
            <div className="flex h-10 items-center border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">Stok {qty(material?.stock || 0)} {material?.unit || ""}</div>
            <button type="button" className="text-sm font-bold text-red-600" onClick={() => setForm((current) => ({ ...current, materials: current.materials.filter((_, rowIndex) => rowIndex !== index) }))}>Hapus</button>
          </div>;
        })}
        {!form.materials.length ? <p className="border border-dashed border-slate-200 p-4 text-sm text-slate-500">Belum ada bahan baku pada resep produk.</p> : null}
      </div>
    </section>

    <section className="border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Tahap 2</p>
      <h3 className="mb-3 text-sm font-black">Perhitungan HPP</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-bold">Tenaga Kerja<Input type="number" min="0" value={form.labor_cost} onChange={(event) => setForm((current) => ({ ...current, labor_cost: event.target.value }))} /></label>
        <label className="text-xs font-bold">Overhead<Input type="number" min="0" value={form.overhead_cost} onChange={(event) => setForm((current) => ({ ...current, overhead_cost: event.target.value }))} /></label>
        <label className="text-xs font-bold">Biaya Lain<Input type="number" min="0" value={form.other_cost} onChange={(event) => setForm((current) => ({ ...current, other_cost: event.target.value }))} /></label>
        <div className="border border-slate-200 bg-white p-3"><span className="text-xs text-slate-500">Biaya Bahan</span><strong className="block text-base">{money(materialCost)}</strong></div>
      </div>
    </section>

    <section className="border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Tahap 3</p>
      <h3 className="mb-3 text-sm font-black">Pembentukan harga jual</h3>
      <div className="grid gap-3 sm:grid-cols-4">
        <div><span className="text-xs text-slate-500">Modal / HPP</span><strong className="block text-lg">{money(hpp)}</strong></div>
        <label className="text-xs font-bold">Margin %<Input type="number" min="0" step="0.01" value={form.margin_percent} onChange={(event) => setForm((current) => ({ ...current, margin_percent: event.target.value }))} /></label>
        <div><span className="text-xs text-slate-500">Saran Harga Jual</span><strong className="block text-lg text-emerald-700">{money(suggested)}</strong></div>
        <label className="text-xs font-bold">Harga Jual<Input type="number" min="0" value={form.selling_price} onChange={(event) => setForm((current) => ({ ...current, selling_price: event.target.value }))} /></label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.apply_to_variants} onChange={(event) => setForm((current) => ({ ...current, apply_to_variants: event.target.checked }))} /> Terapkan harga jual ke seluruh variant produk</label>
    </section>

    <section className="border border-blue-200 bg-blue-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-blue-700">Tahap 4</p>
      <h3 className="text-sm font-black">Produksi melalui Stock / Restock Produk</h3>
      <p className="mt-1 text-sm text-blue-800">Setelah resep HPP disimpan, penambahan stok produk pada menu Persediaan otomatis mengurangi stok bahan baku sesuai quantity resep. Jika salah satu bahan tidak cukup, penambahan stok produk ditolak seluruhnya agar saldo tidak setengah berubah.</p>
    </section>

    <div className="flex justify-end"><Button type="submit" disabled={save.isPending}>Simpan Pembentukan Harga</Button></div>
  </form>;
}
