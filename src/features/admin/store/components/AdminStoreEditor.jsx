import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { required, validateFields } from "@/core/utils/formValidation";
import { getAdminStoreError, useUpdateAdminStore } from "@/features/admin/store/services/adminStoreService";
import { toTitleCase } from "@/shared/utils/textFormatter";

function initialValues(store) {
  return {
    name: toTitleCase(store?.name || ""),
    phone: store?.phone || "",
    email: store?.email || "",
    city: toTitleCase(store?.city || ""),
    province: toTitleCase(store?.province || ""),
    status: store?.status || "pending",
    isActive: store?.isActive ?? true,
  };
}

export function AdminStoreEditor({ open, store, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(store));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const mutation = useUpdateAdminStore();

  useEffect(() => {
    if (open) {
      setValues(initialValues(store));
      setErrors({});
      setMessage("");
    }
  }, [open, store]);

  const setField = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "status" && value === "suspended" ? { isActive: false } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, { name: required("Nama toko") });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = await mutation.mutateAsync({ id: store.id, values });
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getAdminStoreError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title="Edit Toko" subtitle="Status moderasi dikelola Admin, sedangkan Active/Non-Active adalah kondisi operasional toko." size="max-w-4xl">
      <form onSubmit={submit}>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <FormField label="Nama toko" error={errors.name} required><input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Status moderasi">
            <SearchableSelect value={values.status} onChange={(nextValue) => setField("status", nextValue)} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "suspended", label: "Suspended" }]} clearable={false} />
          </FormField>
          <FormField label="Telepon"><input value={values.phone} onChange={(event) => setField("phone", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Email"><input type="email" value={values.email} onChange={(event) => setField("email", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Kota"><input value={values.city} onChange={(event) => setField("city", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Provinsi"><input value={values.province} onChange={(event) => setField("province", event.target.value)} className={inputClassName} /></FormField>
          <div className="md:col-span-2">
            <ActiveToggle
              checked={values.isActive}
              disabled={values.status === "suspended"}
              onChange={(isActive) => setField("isActive", isActive)}
              description={values.status === "suspended" ? "Toko suspended otomatis non-active." : "Mengatur ketersediaan operasional toko tanpa mengubah status approval."}
            />
          </div>
          {message ? <p className="md:col-span-2 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          <button type="submit" disabled={mutation.isPending} className="h-10 bg-teal-600 px-5 text-sm font-extrabold text-white disabled:opacity-60">{mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}</button>
        </div>
      </form>
    </CrudDialog>
  );
}
