import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { ImageFilePicker } from "@/shared/components/form/ImageFilePicker";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { required, validateFields } from "@/core/utils/formValidation";
import { getAdminBannerError, useCreateAdminBanner, useUpdateAdminBanner } from "@/features/admin/banner/services/adminBannerService";
import { toTitleCase } from "@/shared/utils/textFormatter";
import { useRelationCreateTab } from "@/shared/hooks/useRelationCreateTab";

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
  const [message, setMessage] = useState("");
  const createMutation = useCreateAdminBanner();
  const updateMutation = useUpdateAdminBanner();
  const mutation = entity ? updateMutation : createMutation;
  const openRelationCreateTab = useRelationCreateTab();

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
      storeId: required("Toko"),
      name: required("Nama banner"),
      imageUrl: required("Gambar banner"),
    });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity ? await updateMutation.mutateAsync({ id: entity.id, values }) : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getAdminBannerError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Banner" : "Tambah Banner"} size="max-w-3xl">
      <form onSubmit={submit}>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <FormField label="Toko" error={errors.storeId} required>
            <SearchableSelect value={values.storeId} disabled={Boolean(entity)} onChange={(nextValue) => setField("storeId", nextValue)} options={stores.map((store) => ({ value: store.id, label: toTitleCase(store.name), keywords: `${store.slug || ""} ${store.city || ""}` }))} placeholder="Pilih toko" searchPlaceholder="Cari toko" onCreate={(name) => openRelationCreateTab({ href: "/admin/stores", relationLabel: "Toko", searchName: name })} createLabel={(name) => `Data tidak ditemukan, buka Data Baru Toko untuk “${name}”`} />
          </FormField>
          <FormField label="Nama banner" error={errors.name} required><input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Gambar banner" error={errors.imageUrl} required className="md:col-span-2"><ImageFilePicker value={values.imageUrl} onChange={(imageUrl) => setField("imageUrl", imageUrl)} scope="banners" label="Pilih gambar banner" aspectClassName="aspect-[3/1]" /></FormField>
          <FormField label="Urutan"><input type="number" min="0" value={values.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} className={inputClassName} /></FormField>
          <div className="flex items-end"><ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} /></div>
          {message ? <p className="md:col-span-2 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          {entity && onDelete ? <button type="button" onClick={() => onDelete(entity)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600">Hapus</button> : null}
          <button type="submit" disabled={mutation.isPending} className="h-10 bg-teal-600 px-5 text-sm font-extrabold text-white disabled:opacity-60">{mutation.isPending ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </CrudDialog>
  );
}
