import { useEffect, useState } from "react";
import { CrudDialog, FormActionDock, FormEditorFooter, FormEditorLayout } from "@/shared/components/crud";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { ImageFilePicker } from "@/shared/components/form/ImageFilePicker";
import { InlineActiveSwitch } from "@/shared/components/form/InlineActiveSwitch";
import { required, validateFields } from "@/core/utils/formValidation";
import { getAdminBannerError, useCreateAdminBanner, useUpdateAdminBanner } from "@/features/admin/banner/services/adminBannerService";
import { toTitleCase } from "@/shared/utils/textFormatter";
import { useRelationCreateTab } from "@/shared/hooks/useRelationCreateTab";
import { useFormDirty } from "@/shared/hooks/useFormDirty";
import { useTabDirtyGuard } from "@/shared/hooks/useTabDirtyGuard";
import { toastError } from "@/shared/utils/userFeedback";

function initialValues(entity) {
  return {
    storeId: entity?.storeId || "",
    name: entity?.name || "",
    imageUrl: entity?.imageUrl || "",
    sortOrder: entity?.sortOrder || 0,
    isActive: entity?.isActive ?? true,
  };
}

export function AdminBannerEditor({ open, entity, stores, onClose, onSaved, onDelete }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const pristine = initialValues(entity);
  const dirty = useFormDirty(pristine, values);
  useTabDirtyGuard(dirty);
  const createMutation = useCreateAdminBanner();
  const updateMutation = useUpdateAdminBanner();
  const mutation = entity ? updateMutation : createMutation;
  const openRelationCreateTab = useRelationCreateTab();

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
    }
  }, [entity, open]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      storeId: required("Toko"),
      name: required("Nama banner"),
      imageUrl: required("Gambar banner"),
    });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity ? await updateMutation.mutateAsync({ id: entity.id, values }) : await createMutation.mutateAsync(values);
      onSaved?.(saved);
            window.setTimeout(() => onClose?.(), 350);
    } catch (error) {
      toastError("Gagal menyimpan banner", getAdminBannerError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Banner" : "Tambah Banner"} size="max-w-3xl">
      <form onSubmit={submit}>
        <FormEditorLayout
          actions={
            <FormActionDock tone="teal" save={{ icon: "save", label: "Simpan" }} disabled={mutation.isPending || !dirty} onDelete={entity && onDelete ? () => onDelete(entity) : undefined} />
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Toko" error={errors.storeId} required>
              <SearchableSelect value={values.storeId} disabled={Boolean(entity)} onChange={(nextValue) => setField("storeId", nextValue)} options={stores.map((store) => ({ value: store.id, label: toTitleCase(store.name), keywords: `${store.slug || ""} ${store.city || ""}` }))} placeholder="Pilih toko" searchPlaceholder="Cari toko" onCreate={(name) => openRelationCreateTab({ href: "/admin/stores", relationLabel: "Toko", searchName: name })} createLabel={(name) => `Data tidak ditemukan, buka Data Baru Toko untuk “${name}”`} />
            </FormField>
            <FormField label="Nama banner" error={errors.name} required><input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} /></FormField>
            <FormField label="Gambar banner" error={errors.imageUrl} required className="md:col-span-2"><ImageFilePicker value={values.imageUrl} onChange={(imageUrl) => setField("imageUrl", imageUrl)} scope="banners" label="Pilih gambar banner" aspectClassName="aspect-[3/1]" /></FormField>
            <FormField label="Urutan"><input type="number" min="0" value={values.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} className={inputClassName} /></FormField>
            <div className="flex items-end"><div className="flex h-10 w-full items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3"><span className="text-sm font-bold text-slate-700">Status</span><InlineActiveSwitch checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} showLabel={false} /></div></div>
          </div>
        </FormEditorLayout>
        <FormEditorFooter onCancel={onClose} submitLabel="Simpan" submitIcon="save" disabled={mutation.isPending || !dirty} tone="teal" onDelete={entity && onDelete ? () => onDelete(entity) : undefined} />
      </form>
    </CrudDialog>
  );
}
