import { useEffect, useMemo, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { required, validateFields, validUrl } from "@/core/utils/formValidation";
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
    name: entity?.name || "",
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

export function CategoryFormDialog({ open, entity, categories, onClose, onSaved }) {
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
      imageUrl: validUrl("URL gambar"),
      iconUrl: validUrl("URL ikon"),
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
                <select value={values.catalogGroupId} onChange={(event) => setField("catalogGroupId", event.target.value)} className={inputClassName}>
                  <option value="">Pilih group</option>
                  {(groupsQuery.data || []).map((group) => (
                    <option key={group.id} value={group.id}>{toTitleCase(group.name)}{group.isActive ? "" : " (non-active)"}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Parent kategori" error={errors.parentId} hint="Tanpa parent berarti Level 1.">
                <select value={values.parentId} onChange={(event) => setParent(event.target.value)} className={inputClassName}>
                  <option value="">Tanpa parent · Level 1</option>
                  {parentOptions.map((category) => {
                    const level = getDepth(category) + 1;
                    return (
                      <option key={category.id} value={category.id}>
                        {`L${level} · ${"— ".repeat(level - 1)}${toTitleCase(category.name)}`}
                      </option>
                    );
                  })}
                </select>
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
              <FormField label="URL gambar" error={errors.imageUrl}>
                <input value={values.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} className={inputClassName} placeholder="https://..." />
              </FormField>

              <FormField label="URL ikon" error={errors.iconUrl}>
                <input value={values.iconUrl} onChange={(event) => setField("iconUrl", event.target.value)} className={inputClassName} placeholder="https://..." />
              </FormField>

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

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
          <button type="submit" disabled={mutation.isPending} className="h-10 rounded-lg bg-teal-600 px-5 text-sm font-extrabold text-white hover:bg-teal-700 disabled:opacity-60">
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}
