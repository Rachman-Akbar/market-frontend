import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { minimumNumber, required, validateFields } from "@/core/utils/formValidation";
import { toDateTimeLocal } from "@/core/utils/dateTime";
import { getVoucherManagementError, useCreateVoucher, useUpdateVoucher } from "@/features/order/voucher/services/voucherManagementService";
import { toTitleCase } from "@/shared/utils/textFormatter";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";
import { useObjectUrl } from "@/shared/hooks/useObjectUrl";

function initialValues(entity) {
  return {
    code: entity?.code || "",
    name: entity?.name || "",
    imageFile: null,
    imageUrl: entity?.imageUrl || "",
    discountTarget: entity?.discountTarget || "product",
    discountType: entity?.discountType || "fixed",
    discountValue: entity?.discountValue || 0,
    minSpend: entity?.minSpend || 0,
    maxDiscount: entity?.maxDiscount ?? "",
    startsAt: toDateTimeLocal(entity?.startsAt) || toDateTimeLocal(new Date()),
    endsAt: toDateTimeLocal(entity?.endsAt) || toDateTimeLocal(new Date(Date.now() + 7 * 86400000)),
    usageLimit: entity?.usageLimit || 0,
    isActive: entity?.isActive ?? true,
  };
}

export function VoucherFormDialog({ open, entity, portal, onClose, onSaved, onDelete }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const createMutation = useCreateVoucher(portal);
  const updateMutation = useUpdateVoucher(portal);
  const mutation = entity ? updateMutation : createMutation;
  const selectedImageUrl = useObjectUrl(values.imageFile);
  const previewImageUrl = selectedImageUrl || resolveMediaUrl(values.imageUrl);
  const seller = portal === "seller";
  const effectiveScope = entity?.voucherScope || (seller ? "store" : "platform");

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
      const saved = entity
        ? await updateMutation.mutateAsync({ id: entity.id, values })
        : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getVoucherManagementError(error));
    }
  };

  const targetLabel = values.discountTarget === "shipping" ? "ongkir" : "produk";

  return (
    <CrudDialog
      open={open}
      onClose={onClose}
      title={entity ? "Edit Voucher" : "Tambah Voucher"}
      subtitle={seller ? "Voucher otomatis menjadi milik toko yang sedang login." : entity?.voucherScope === "store" ? "Admin dapat memperbarui voucher toko tanpa mengubah kepemilikannya." : "Voucher baru dari Admin selalu menjadi voucher platform tanpa store_id."}
      size="max-w-3xl"
    >
      <form onSubmit={submit}>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center justify-between bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Cakupan voucher</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{effectiveScope === "store" ? "Voucher Toko" : "Voucher Platform"}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-extrabold ${effectiveScope === "store" ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"}`}>
              {effectiveScope === "store" ? toTitleCase(entity?.storeName || "Store otomatis") : "Global"}
            </span>
          </div>

          <FormField label="Kode voucher" error={errors.code} required>
            <input value={values.code} onChange={(event) => setField("code", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Nama voucher" error={errors.name} required>
            <input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Target diskon">
            <SearchableSelect
              value={values.discountTarget}
              onChange={(nextValue) => setField("discountTarget", nextValue)}
              options={[{ value: "product", label: "Harga Produk" }, { value: "shipping", label: "Ongkos Kirim" }]}
              clearable={false}
            />
          </FormField>
          <FormField label="Tipe diskon">
            <SearchableSelect
              value={values.discountType}
              onChange={(nextValue) => setField("discountType", nextValue)}
              options={[{ value: "fixed", label: "Nominal" }, { value: "percentage", label: "Persentase" }]}
              clearable={false}
            />
          </FormField>
          <FormField label={`Nilai diskon ${targetLabel}`} error={errors.discountValue} required hint={values.discountTarget === "shipping" && values.discountType === "percentage" && Number(values.discountValue) === 100 ? "100% berarti gratis ongkir sesuai batas maksimum." : ""}>
            <input type="number" min="0.01" max={values.discountType === "percentage" ? 100 : undefined} step="0.01" value={values.discountValue} onChange={(event) => setField("discountValue", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Minimum belanja">
            <input type="number" min="0" value={values.minSpend} onChange={(event) => setField("minSpend", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Maksimum diskon" hint="Kosongkan jika tidak dibatasi.">
            <input type="number" min="0" value={values.maxDiscount} onChange={(event) => setField("maxDiscount", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Mulai" error={errors.startsAt} required>
            <input type="datetime-local" value={values.startsAt} onChange={(event) => setField("startsAt", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Berakhir" error={errors.endsAt} required>
            <input type="datetime-local" value={values.endsAt} onChange={(event) => setField("endsAt", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Batas penggunaan">
            <input type="number" min="0" value={values.usageLimit} onChange={(event) => setField("usageLimit", event.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="Gambar voucher" hint="JPG, PNG, atau WEBP maksimal 3 MB.">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setField("imageFile", event.target.files?.[0] || null)} className="block w-full bg-slate-50 p-2.5 text-sm" />
          </FormField>
          {previewImageUrl ? (
            <div className="md:col-span-2 overflow-hidden bg-slate-100">
              <img src={previewImageUrl} alt="Preview voucher" className="h-40 w-full object-cover" />
            </div>
          ) : null}
          <div className="md:col-span-2"><ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} /></div>
          {message ? <p className="md:col-span-2 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          {entity && onDelete ? <button type="button" onClick={() => onDelete(entity)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600">Hapus</button> : null}
          <button type="submit" disabled={mutation.isPending} className={`h-10 px-4 text-sm font-extrabold text-white disabled:opacity-60 ${portal === "admin" ? "bg-teal-600" : "bg-emerald-600"}`}>
            "Simpan"
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}
