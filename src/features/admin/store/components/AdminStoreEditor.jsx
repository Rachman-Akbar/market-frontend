import { useEffect, useState } from "react";
import { CrudDialog, FormActionDock, FormEditorFooter, FormEditorLayout } from "@/shared/components/crud";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { required, validateFields } from "@/core/utils/formValidation";
import { getAdminStoreError, useUpdateAdminStore } from "@/features/admin/store/services/adminStoreService";
import { toTitleCase } from "@/shared/utils/textFormatter";
import { useFormDirty } from "@/shared/hooks/useFormDirty";
import { useTabDirtyGuard } from "@/shared/hooks/useTabDirtyGuard";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";

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
  const pristine = initialValues(store);
  const dirty = useFormDirty(pristine, values);
  useTabDirtyGuard(dirty);
  const mutation = useUpdateAdminStore();

  useEffect(() => {
    if (open) {
      setValues(initialValues(store));
      setErrors({});
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
      toastSuccess("Perubahan toko berhasil disimpan.");
      window.setTimeout(() => onClose?.(), 350);
    } catch (error) {
      toastError("Gagal menyimpan toko", getAdminStoreError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title="Edit Toko" subtitle="Status moderasi dikelola Admin, sedangkan Active/Non-Active adalah kondisi operasional toko." size="max-w-4xl">
      <form onSubmit={submit}>
        <FormEditorLayout
          actions={
            <FormActionDock tone="teal" save={{ icon: "save", label: "Simpan Perubahan" }} disabled={mutation.isPending || !dirty} />
          }
        >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Nama toko" error={errors.name} required><input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Status moderasi">
            <SearchableSelect value={values.status} onChange={(nextValue) => setField("status", nextValue)} options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "suspended", label: "Suspended" }]} clearable={false} />
          </FormField>
          <FormField label="Telepon"><input value={values.phone} onChange={(event) => setField("phone", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Email"><input type="email" value={values.email} onChange={(event) => setField("email", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Kota"><input value={values.city} onChange={(event) => setField("city", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Provinsi"><input value={values.province} onChange={(event) => setField("province", event.target.value)} className={inputClassName} /></FormField>
          <div className="md:col-span-2">
            <div className="flex h-11 items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3">
              <div>
                <span className="block text-sm font-bold text-slate-700">Status operasional</span>
                <span className="block text-[11px] text-slate-400">{values.status === "suspended" ? "Toko suspended otomatis non-active." : "Active/Non-Active mengatur ketersediaan toko tanpa mengubah status approval."}</span>
              </div>
              <InlineActiveSwitch
                checked={values.isActive}
                disabled={values.status === "suspended"}
                onChange={(isActive) => setField("isActive", isActive)}
                showLabel={false}
              />
            </div>
          </div>
        </div>
        </FormEditorLayout>
        <FormEditorFooter onCancel={onClose} submitLabel="Simpan Perubahan" submitIcon="save" disabled={mutation.isPending || !dirty} tone="teal" />
      </form>
    </CrudDialog>
  );
}
