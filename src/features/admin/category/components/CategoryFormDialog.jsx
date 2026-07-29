import { useEffect, useMemo, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { ImageFilePicker } from "@/shared/components/form/ImageFilePicker";
import { required, validateFields } from "@/core/utils/formValidation";
import { useAdminCatalogGroups } from "@/features/admin/catalogGroup/services/adminCatalogGroupService";
import { getCategoryError, useCreateAdminCategory, useUpdateAdminCategory } from "@/features/admin/category/services/adminCategoryService";
import { toTitleCase } from "@/shared/utils/textFormatter";

function descendantIds(categories, parentId) {
  const ids = new Set();
  const visit = (id) => {
    categories.filter((category) => category.parentId === id).forEach((category) => {
      ids.add(category.id);
      visit(category.id);
    });
  };
  if (parentId) visit(parentId);
  return ids;
}

function getDepth(category) {
  if (!category) return 0;
  if (Number.isFinite(Number(category.depth))) return Number(category.depth);
  return Math.max(0, Number(category.level || 1) - 1);
}

function initialValues(entity) {
  return {
    name: toTitleCase(entity?.name || ""),
    slug: entity?.slug || "",
    catalogGroupId: entity?.catalogGroupId || "",
    parentId: entity?.parentId || "",
    imageUrl: entity?.imageUrl || "",
    iconUrl: entity?.iconUrl || "",
    sortOrder: entity?.sortOrder || 0,
    isActive: entity?.isActive ?? true,
    isVisibleInMenu: entity?.isVisibleInMenu ?? true,
  };
}

function LevelPreview({ level }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      {[1, 2, 3].map((item) => (
        <div key={item} className={`px-3 py-2 text-center text-xs font-extrabold ${level === item ? "bg-teal-600 text-white" : "text-slate-500"}`}>
          Level {item}
        </div>
      ))}
    </div>
  );
}

export function CategoryFormDialog({ open, entity, categories, onClose, onSaved, onDelete }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const groupsQuery = useAdminCatalogGroups();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const mutation = entity ? updateMutation : createMutation;

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
      setMessage("");
    }
  }, [entity, open]);

  const blockedIds = useMemo(() => {
    const ids = descendantIds(categories, entity?.id);
    if (entity?.id) ids.add(entity.id);
    return ids;
  }, [categories, entity?.id]);

  const parentOptions = useMemo(() => categories.filter((category) => (
    !blockedIds.has(category.id)
    && getDepth(category) < 2
    && (!values.catalogGroupId || category.catalogGroupId === Number(values.catalogGroupId))
  )), [blockedIds, categories, values.catalogGroupId]);

  const selectedParent = useMemo(
    () => categories.find((category) => category.id === Number(values.parentId)) || null,
    [categories, values.parentId],
  );

  const computedLevel = selectedParent ? getDepth(selectedParent) + 2 : 1;

  useEffect(() => {
    if (computedLevel === 3) return;
    setValues((current) => {
      if (!current.imageUrl && !current.iconUrl) return current;
      return { ...current, imageUrl: "", iconUrl: "" };
    });
  }, [computedLevel]);
  const computedPath = useMemo(() => {
    const parentPath = selectedParent?.pathNames || (selectedParent ? [selectedParent.name] : []);
    return [...parentPath, values.name].filter(Boolean).map(toTitleCase).join(" / ");
  }, [selectedParent, values.name]);

  const setField = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "catalogGroupId" ? { parentId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const setParent = (parentId) => {
    const parent = categories.find((category) => category.id === Number(parentId));
    setValues((current) => ({
      ...current,
      parentId,
      ...(parent ? { catalogGroupId: parent.catalogGroupId } : {}),
    }));
    setErrors((current) => ({ ...current, parentId: "", catalogGroupId: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, {
      name: required("Nama kategori"),
      catalogGroupId: required("Catalog group"),
    });

    if (computedLevel > 3) nextErrors.parentId = "Kategori hanya mendukung sampai level 3.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity
        ? await updateMutation.mutateAsync({ id: entity.id, values })
        : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getCategoryError(error));
    }
  };

  return (
    <CrudDialog
      open={open}
      onClose={onClose}
      title={entity ? "Edit Kategori" : "Tambah Kategori"}
      subtitle="Level kategori ditentukan otomatis berdasarkan parent yang dipilih."
      size="max-w-4xl"
    >
      <form onSubmit={submit}>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-extrabold text-slate-800">Struktur Kategori</h3>
              <p className="mt-0.5 text-xs text-slate-500">Pilih catalog group dan parent untuk membentuk level 1 sampai 3.</p>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <FormField label="Catalog group" error={errors.catalogGroupId} required>
                <SearchableSelect
                  value={values.catalogGroupId}
                  onChange={(nextValue) => setField("catalogGroupId", nextValue)}
                  options={(groupsQuery.data || []).map((group) => ({
                    value: group.id,
                    label: `${toTitleCase(group.name)}${group.isActive ? "" : " (non-active)"}`,
                  }))}
                  placeholder="Pilih group"
                  searchPlaceholder="Cari catalog group"
                />
              </FormField>

              <FormField label="Parent kategori" error={errors.parentId} hint="Tanpa parent berarti Level 1.">
                <SearchableSelect
                  value={values.parentId}
                  onChange={setParent}
                  options={parentOptions.map((category) => {
                    const level = getDepth(category) + 1;
                    return {
                      value: category.id,
                      label: `L${level} · ${"— ".repeat(level - 1)}${toTitleCase(category.name)}`,
                      keywords: (category.pathNames || []).join(" "),
                    };
                  })}
                  placeholder="Tanpa parent · Level 1"
                  searchPlaceholder="Cari parent kategori"
                />
              </FormField>

              <FormField label="Nama kategori" error={errors.name} required>
                <input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} />
              </FormField>

              <FormField label="Slug" hint="Kosongkan agar dibuat otomatis.">
                <input value={values.slug} onChange={(event) => setField("slug", event.target.value)} className={inputClassName} />
              </FormField>

              <FormField label="Urutan">
                <input type="number" min="0" value={values.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} className={inputClassName} />
              </FormField>

              <div>
                <span className="mb-1.5 block text-xs font-extrabold text-slate-700">Level otomatis</span>
                <LevelPreview level={computedLevel} />
              </div>

              <div className="md:col-span-2 rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Jalur kategori</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{computedPath || `Level ${computedLevel}`}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-extrabold text-slate-800">Tampilan & Status</h3>
              <p className="mt-0.5 text-xs text-slate-500">Atur gambar, ikon, menu buyer, dan status kategori.</p>
            </div>

            <div className="space-y-4 p-4">
              {computedLevel === 3 ? (
                <>
                  <FormField label="Gambar kategori Level 3" error={errors.imageUrl} hint="Gambar tampil sebagai kartu kotak 1:1 pada halaman kategori Level 2.">
                    <ImageFilePicker
                      value={values.imageUrl}
                      onChange={(imageUrl) => setField("imageUrl", imageUrl)}
                      scope="categories"
                      label="Pilih gambar kategori"
                      aspectClassName="aspect-square max-w-64"
                    />
                  </FormField>

                  <FormField label="Ikon kategori" error={errors.iconUrl}>
                    <ImageFilePicker
                      value={values.iconUrl}
                      onChange={(iconUrl) => setField("iconUrl", iconUrl)}
                      scope="categories/icons"
                      label="Pilih ikon kategori"
                      aspectClassName="aspect-square max-w-40"
                    />
                  </FormField>
                </>
              ) : (
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Gambar kategori hanya tersedia untuk Level 3. Level 1 dan Level 2 digunakan sebagai struktur navigasi.
                </div>
              )}

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} />
                <ActiveToggle
                  checked={values.isVisibleInMenu}
                  onChange={(isVisibleInMenu) => setField("isVisibleInMenu", isVisibleInMenu)}
                  label="Tampil di menu"
                  description="Kategori akan muncul pada navigasi buyer."
                />
              </div>
            </div>
          </section>

          {message ? <p className="lg:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
          {entity && onDelete ? <button type="button" onClick={() => onDelete(entity)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600">Hapus</button> : null}
          <button type="submit" disabled={mutation.isPending} className="h-10 bg-teal-600 px-5 text-sm font-extrabold text-white hover:bg-teal-700 disabled:opacity-60">
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}
