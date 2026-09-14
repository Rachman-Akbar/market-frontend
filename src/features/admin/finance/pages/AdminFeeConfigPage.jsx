import { useMemo, useState } from "react";
import { AdminShell } from "@/features/admin/dashboard/components/AdminShell";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { AsyncState } from "@/shared/components/feedback/AsyncState";
import { SkeletonTable } from "@/shared/components/feedback/Skeleton";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { useAdminCategoryList } from "@/features/admin/category/services/adminCategoryService";
import {
  getFinanceError,
  useAdminFeeConfigs,
  useCreateAdminFeeConfig,
  useUpdateAdminFeeConfig,
  useDeleteAdminFeeConfig,
} from "@/features/admin/finance/services/adminFinanceService";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value || 0));
}

function describeFee(cfg) {
  const parts = [];
  if (cfg.percentage > 0) parts.push(`${cfg.percentage}%`);
  if (cfg.fixedAmount > 0) parts.push(formatRupiah(cfg.fixedAmount));
  if (cfg.percentage <= 0 && cfg.fixedAmount <= 0) parts.push("Rp 0");
  const result = parts.join(" + ");
  const limits = [];
  if (cfg.minFee != null) limits.push(`min ${formatRupiah(cfg.minFee)}`);
  if (cfg.maxFee != null) limits.push(`max ${formatRupiah(cfg.maxFee)}`);
  return limits.length ? `${result} (${limits.join(", ")})` : result;
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function FeeConfigModal({ title, onClose, onSave, pending, initial, categories, form, setForm }) {
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: `${c.path || c.name}` })),
    [categories]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="mt-4 space-y-3">
          <Field label="Nama (wajib)">
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Komisi Marketplace 5%" />
          </Field>
          <Field label="Kode (wajib, unik)">
            <Input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MARKETPLACE_COMMISSION_5" disabled={Boolean(initial)} />
          </Field>
          <Field label="Kategori (opsional, kosong = global)">
            <SearchableSelect
              value={form.categoryId || ""}
              onChange={(v) => setForm({ ...form, categoryId: v })}
              options={categoryOptions}
              placeholder="Semua kategori"
              emptyText="Tidak ada kategori"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Persentase (%)">
              <Input type="number" step="0.01" value={form.percentage || 0} onChange={(e) => setForm({ ...form, percentage: e.target.value })} />
            </Field>
            <Field label="Fee Tetap (Rp)">
              <Input type="number" value={form.fixedAmount != null ? form.fixedAmount : 0} onChange={(e) => setForm({ ...form, fixedAmount: e.target.value })} />
            </Field>
            <Field label="Fee Minimum (Rp)">
              <Input type="number" value={form.minFee != null ? form.minFee : ""} onChange={(e) => setForm({ ...form, minFee: e.target.value })} placeholder="Opsional" />
            </Field>
            <Field label="Fee Maksimum (Rp)">
              <Input type="number" value={form.maxFee != null ? form.maxFee : ""} onChange={(e) => setForm({ ...form, maxFee: e.target.value })} placeholder="Opsional" />
            </Field>
          </div>
          <Field label="Deskripsi (opsional)">
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSave} disabled={pending} className="bg-teal-600 hover:bg-teal-700">
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminFeeConfigPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const notifications = useNotificationCenter();

  const configsQuery = useAdminFeeConfigs();
  const categoriesQuery = useAdminCategoryList();
  const createMut = useCreateAdminFeeConfig();
  const updateMut = useUpdateAdminFeeConfig();
  const deleteMut = useDeleteAdminFeeConfig();

  const rows = configsQuery.data || [];
  const categories = categoriesQuery.data || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ percentage: 0, fixedAmount: 0, minFee: "", maxFee: "", description: "" });
    setIsOpen(true);
  };

  const openEdit = (cfg) => {
    setEditing(cfg);
    setForm({
      name: cfg.name,
      code: cfg.code,
      categoryId: cfg.categoryId ? String(cfg.categoryId) : "",
      percentage: cfg.percentage,
      fixedAmount: cfg.fixedAmount,
      minFee: cfg.minFee != null ? cfg.minFee : "",
      maxFee: cfg.maxFee != null ? cfg.maxFee : "",
      description: cfg.description,
      isActive: cfg.isActive,
    });
    setIsOpen(true);
  };

  const save = async () => {
    const common = {
      name: form.name,
      percentage: Number(form.percentage || 0),
      fixedAmount: Number(form.fixedAmount || 0),
      minFee: form.minFee !== "" && form.minFee != null ? Number(form.minFee) : null,
      maxFee: form.maxFee !== "" && form.maxFee != null ? Number(form.maxFee) : null,
      description: form.description || null,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, values: { ...common, isActive: form.isActive } });
        notifications.push({ type: "success", title: "Konfigurasi Fee", message: "Konfigurasi fee berhasil diperbarui." });
      } else {
        await createMut.mutateAsync({
          ...common,
          code: form.code,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
        });
        notifications.push({ type: "success", title: "Konfigurasi Fee", message: "Konfigurasi fee berhasil dibuat." });
      }
      setIsOpen(false);
    } catch (e) {
      notifications.push({ type: "error", title: "Konfigurasi Fee", message: getFinanceError(e) });
    }
  };

  const remove = async (cfg) => {
    if (!confirm(`Hapus konfigurasi fee "${cfg.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(cfg.id);
      notifications.push({ type: "success", title: "Konfigurasi Fee", message: "Konfigurasi fee berhasil dihapus." });
    } catch (e) {
      notifications.push({ type: "error", title: "Konfigurasi Fee", message: getFinanceError(e) });
    }
  };

  return (
    <AdminShell title="Konfigurasi Fee" subtitle="Kelola biaya admin/fee marketplace per kategori atau global.">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
            <span className="material-symbols-outlined text-base">add</span> Tambah Konfigurasi Fee
          </Button>
        </div>

        <AsyncState loading={false} error={configsQuery.error ? getFinanceError(configsQuery.error, "Gagal memuat konfigurasi fee.") : ""} empty={!configsQuery.isLoading && !rows.length} emptyText="Belum ada konfigurasi fee." />
        {configsQuery.isLoading && !rows.length ? <SkeletonTable rows={5} cols={5} /> : null}
        {!configsQuery.isLoading && rows.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Nama</th>
                      <th className="py-2 pr-3 font-semibold">Cakupan</th>
                      <th className="py-2 pr-3 font-semibold">Fee</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((cfg) => (
                      <tr key={cfg.id} className="border-b border-slate-100 align-top">
                        <td className="py-2 pr-3">
                          <p className="font-semibold text-slate-900">{cfg.name}</p>
                          <p className="text-xs text-slate-400">{cfg.code}</p>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">{cfg.categoryName || "Global"}</td>
                        <td className="py-2 pr-3 text-slate-600">{describeFee(cfg)}</td>
                        <td className="py-2 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                            {cfg.isActive ? "Aktif" : "Non-aktif"}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEdit(cfg)} title="Edit" className="text-slate-500 hover:text-teal-700">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button type="button" onClick={() => remove(cfg)} title="Hapus" className="text-red-600 hover:text-red-800">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {isOpen && (
          <FeeConfigModal
            title={editing ? "Edit Konfigurasi Fee" : "Tambah Konfigurasi Fee"}
            onClose={() => setIsOpen(false)}
            onSave={save}
            pending={editing ? updateMut.isPending : createMut.isPending}
            initial={editing}
            categories={categories}
            form={form}
            setForm={setForm}
          />
        )}
      </div>
    </AdminShell>
  );
}