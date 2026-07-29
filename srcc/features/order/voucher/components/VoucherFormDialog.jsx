import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { minimumNumber, required, validateFields } from "@/core/utils/formValidation";
import { toDateTimeLocal } from "@/core/utils/dateTime";
import { getVoucherManagementError, useCreateVoucher, useUpdateVoucher } from "@/features/order/voucher/services/voucherManagementService";
import { useManagedStores } from "@/features/catalog/store/services/storeManagementService";

function initialValues(entity) {
  return {
    code: entity?.code || "",
    name: entity?.name || "",
    imageFile: null,
    imageUrl: entity?.imageUrl || "",
    discountType: entity?.discountType || "fixed",
    discountValue: entity?.discountValue || 0,
    minSpend: entity?.minSpend || 0,
    maxDiscount: entity?.maxDiscount ?? "",
    startsAt: toDateTimeLocal(entity?.startsAt) || toDateTimeLocal(new Date()),
    endsAt: toDateTimeLocal(entity?.endsAt) || toDateTimeLocal(new Date(Date.now() + 7 * 86400000)),
    usageLimit: entity?.usageLimit || 0,
    storeId: entity?.storeId || "",
    isActive: entity?.isActive ?? true,
  };
}

export function VoucherFormDialog({ open, entity, portal, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const mutation = entity ? updateMutation : createMutation;
  const storesQuery = useManagedStores({ per_page: 100 }, { enabled: open && portal === "admin" });

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
      setMessage("");
    }
  }, [entity, open]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      code: required("Kode voucher"),
      name: required("Nama voucher"),
      discountValue: minimumNumber("Nilai diskon", 0.01),
      startsAt: required("Tanggal mulai"),
      endsAt: required("Tanggal berakhir"),
    });
    if (new Date(values.endsAt) <= new Date(values.startsAt)) nextErrors.endsAt = "Tanggal berakhir harus setelah tanggal mulai.";
    if (values.discountType === "percentage" && Number(values.discountValue) > 100) nextErrors.discountValue = "Persentase diskon maksimal 100%.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity ? await updateMutation.mutateAsync({ id: entity.id, values }) : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getVoucherManagementError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Voucher" : "Tambah Voucher"} subtitle="Kode dan nama otomatis dinormalisasi lowercase oleh backend." size="max-w-3xl">
      <form onSubmit={submit}>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <FormField label="Kode voucher" error={errors.code} required><input value={values.code} onChange={(event) => setField("code", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Nama voucher" error={errors.name} required><input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Jenis diskon"><select value={values.discountType} onChange={(event) => setField("discountType", event.target.value)} className={inputClassName}><option value="fixed">Nominal</option><option value="percentage">Persentase</option></select></FormField>
          <FormField label="Nilai diskon" error={errors.discountValue} required><input type="number" min="0.01" step="0.01" value={values.discountValue} onChange={(event) => setField("discountValue", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Minimum belanja"><input type="number" min="0" value={values.minSpend} onChange={(event) => setField("minSpend", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Maksimum diskon"><input type="number" min="0" value={values.maxDiscount} onChange={(event) => setField("maxDiscount", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Mulai" error={errors.startsAt} required><input type="datetime-local" value={values.startsAt} onChange={(event) => setField("startsAt", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Berakhir" error={errors.endsAt} required><input type="datetime-local" value={values.endsAt} onChange={(event) => setField("endsAt", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Batas penggunaan"><input type="number" min="0" value={values.usageLimit} onChange={(event) => setField("usageLimit", event.target.value)} className={inputClassName} /></FormField>
          {portal === "admin" ? (
            <FormField label="Toko" hint="Kosongkan untuk voucher platform.">
              <select value={values.storeId} onChange={(event) => setField("storeId", event.target.value)} className={inputClassName}>
                <option value="">Voucher platform</option>
                {(storesQuery.data || []).map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
              </select>
            </FormField>
          ) : null}
          <FormField label="Gambar voucher" hint="JPG, PNG, atau WEBP maksimal 3 MB."><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setField("imageFile", event.target.files?.[0] || null)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm" /></FormField>
          <div className="md:col-span-2"><ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} /></div>
          {message ? <p className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button><button type="submit" disabled={mutation.isPending} className={`h-10 rounded-xl px-4 text-sm font-extrabold text-white disabled:opacity-60 ${portal === "admin" ? "bg-teal-600" : "bg-emerald-600"}`}>{mutation.isPending ? "Menyimpan..." : "Simpan"}</button></div>
      </form>
    </CrudDialog>
  );
}
