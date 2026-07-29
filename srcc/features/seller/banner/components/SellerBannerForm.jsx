import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { required, validateFields, validUrl } from "@/core/utils/formValidation";
import { getSellerBannerError, useCreateSellerBanner, useUpdateSellerBanner } from "@/features/seller/banner/services/sellerBannerService";

function initialValues(entity) {
  return { name: entity?.name || "", imageUrl: entity?.imageUrl || "", sortOrder: entity?.sortOrder || 0, isActive: entity?.isActive ?? true };
}

export function SellerBannerForm({ open, entity, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const createMutation = useCreateSellerBanner();
  const updateMutation = useUpdateSellerBanner();
  const mutation = entity ? updateMutation : createMutation;

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
      setMessage("");
    }
  }, [entity, open]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, { name: required("Nama banner"), imageUrl: [required("URL banner"), validUrl("URL banner")] });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity ? await updateMutation.mutateAsync({ id: entity.id, values }) : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getSellerBannerError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Banner Toko" : "Tambah Banner Toko"} subtitle="Banner hanya ditampilkan pada halaman detail toko buyer." size="max-w-xl">
      <form onSubmit={submit}>
        <div className="space-y-4 p-6">
          <FormField label="Nama banner" error={errors.name} required><input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} className={inputClassName} /></FormField>
          <FormField label="URL gambar" error={errors.imageUrl} required><input value={values.imageUrl} onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))} className={inputClassName} placeholder="https://..." /></FormField>
          <FormField label="Urutan"><input type="number" min="0" value={values.sortOrder} onChange={(event) => setValues((current) => ({ ...current, sortOrder: event.target.value }))} className={inputClassName} /></FormField>
          {values.imageUrl ? <img src={values.imageUrl} alt="Preview banner" className="aspect-[3/1] w-full rounded-xl bg-slate-100 object-cover" /> : null}
          <ActiveToggle checked={values.isActive} onChange={(isActive) => setValues((current) => ({ ...current, isActive }))} />
          {message ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button><button type="submit" disabled={mutation.isPending} className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white disabled:opacity-60">{mutation.isPending ? "Menyimpan..." : "Simpan"}</button></div>
      </form>
    </CrudDialog>
  );
}
