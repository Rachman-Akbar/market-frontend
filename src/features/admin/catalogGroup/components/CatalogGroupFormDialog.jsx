import { useEffect, useState } from "react";
import { CrudDialog, FormActionDock, FormEditorLayout } from "@/shared/components/crud";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { required, validateFields } from "@/core/utils/formValidation";
import { getCatalogGroupError, useCreateAdminCatalogGroup, useUpdateAdminCatalogGroup } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";
import { useFormDirty } from "@/shared/hooks/useFormDirty";
import { toastError, toastSuccess } from "@/shared/utils/userFeedback";

function initialValues(entity) {
  return { name: entity?.name || "", slug: entity?.slug || "", isActive: entity?.isActive ?? true };
}

export function CatalogGroupFormDialog({ open, entity, onClose, onSaved, onDelete }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const pristine = initialValues(entity);
  const dirty = useFormDirty(pristine, values);
  const createMutation = useCreateAdminCatalogGroup();
  const updateMutation = useUpdateAdminCatalogGroup();
  const mutation = entity ? updateMutation : createMutation;

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
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
      toastSuccess(entity ? "Catalog Group berhasil diperbarui." : "Catalog Group berhasil ditambahkan.");
      window.setTimeout(() => onClose?.(), 350);
    } catch (error) {
      toastError("Gagal menyimpan catalog group", getCatalogGroupError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Catalog Group" : "Tambah Catalog Group"} subtitle="Nama disimpan lowercase oleh backend untuk mencegah data ganda." size="max-w-xl">
      <form onSubmit={submit}>
        <FormEditorLayout
          contentClassName="max-w-2xl"
          actions={
            <FormActionDock tone="teal" save={{ icon: "save", label: "Simpan" }} disabled={mutation.isPending || !dirty} onDelete={entity && onDelete ? () => onDelete(entity) : undefined} />
          }
        >
          <div className="space-y-4">
            <FormField label="Nama" error={errors.name} required><input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} className={inputClassName} /></FormField>
            <FormField label="Slug" hint="Kosongkan agar dibuat otomatis."><input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} className={inputClassName} /></FormField>
            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3">
              <span className="text-sm font-bold text-slate-700">Status aktif</span>
              <InlineActiveSwitch checked={values.isActive} onChange={(isActive) => setValues((current) => ({ ...current, isActive }))} showLabel={false} />
            </div>
          </div>
        </FormEditorLayout>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 lg:hidden">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          {entity && onDelete ? <button type="button" onClick={() => onDelete(entity)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600">Hapus</button> : null}
          <button type="submit" disabled={mutation.isPending || !dirty} className={`h-10 px-4 text-sm font-extrabold ${dirty ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>Simpan</button>
        </div>
      </form>
    </CrudDialog>
  );
}
