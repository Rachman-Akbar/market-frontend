import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { required, validateFields } from "@/core/utils/formValidation";
import { getCatalogGroupError, useCreateAdminCatalogGroup, useUpdateAdminCatalogGroup } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";

function initialValues(entity) {
  return { name: entity?.name || "", slug: entity?.slug || "", isActive: entity?.isActive ?? true };
}

export function CatalogGroupFormDialog({ open, entity, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const createMutation = useCreateAdminCatalogGroup();
  const updateMutation = useUpdateAdminCatalogGroup();
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
    const nextErrors = validateFields(values, { name: required("Nama catalog group") });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity
        ? await updateMutation.mutateAsync({ id: entity.id, values })
        : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getCatalogGroupError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Catalog Group" : "Tambah Catalog Group"} subtitle="Nama disimpan lowercase oleh backend untuk mencegah data ganda." size="max-w-xl">
      <form onSubmit={submit}>
        <div className="space-y-4 p-6">
          <FormField label="Nama" error={errors.name} required><input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} className={inputClassName} /></FormField>
          <FormField label="Slug" hint="Kosongkan agar dibuat otomatis."><input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} className={inputClassName} /></FormField>
          <ActiveToggle checked={values.isActive} onChange={(isActive) => setValues((current) => ({ ...current, isActive }))} />
          {message ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          <button type="submit" disabled={mutation.isPending} className="h-10 rounded-xl bg-teal-600 px-4 text-sm font-extrabold text-white hover:bg-teal-700 disabled:opacity-60">{mutation.isPending ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </CrudDialog>
  );
}
