import { useEffect, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName } from "@/shared/components/form/FormField";
import { required, validateFields, validUrl } from "@/core/utils/formValidation";
import { getCategories } from "@/features/catalog/category/services/categoryService";
import { useQuery } from "@tanstack/react-query";
import { getSellerProducts } from "@/features/seller/product/services/sellerProductService";
import { apiClient, unwrapCollection } from "@/core/utils/apiClient";
import {
  getPromotionError,
  useCreateAdminPromotion,
  useCreateSellerPromotion,
  useUpdateAdminPromotion,
  useUpdateSellerPromotion,
} from "@/features/catalog/promotion/services/promotionManagementService";

function flattenCategories(rows = [], depth = 0, result = []) {
  rows.forEach((row) => {
    result.push({ id: Number(row.id), name: `${"— ".repeat(depth)}${row.name}` });
    flattenCategories(row.children || [], depth + 1, result);
  });
  return result;
}

async function getTargetCategories() {
  const result = await getCategories();
  return flattenCategories(result.data || []);
}

async function getPublicProducts() {
  const response = await apiClient.get("/api/v1/catalog/products", { params: { per_page: 100 } });
  return unwrapCollection(response.data).map((row) => ({ id: Number(row.id), name: row.name || `Produk ${row.id}` }));
}

function initialValues(entity) {
  return {
    storeId: entity?.storeId || "",
    name: entity?.name || "",
    imageUrl: entity?.imageUrl || "",
    mobileImageUrl: entity?.mobileImageUrl || "",
    clickAction: entity?.clickAction || "none",
    targetId: entity?.targetId || "",
    targetUrl: entity?.targetUrl || "",
    sortOrder: entity?.sortOrder || 0,
    isActive: entity?.isActive ?? true,
  };
}

export function PromotionFormDialog({ open, entity, portal, onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(entity));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const isSeller = portal === "seller";
  const categoriesQuery = useQuery({ queryKey: ["promotion", "target-categories"], queryFn: getTargetCategories, enabled: open, staleTime: 5 * 60 * 1000 });
  const productsQuery = useQuery({
    queryKey: ["promotion", portal, "target-products"],
    queryFn: async () => {
      if (isSeller) {
        const result = await getSellerProducts({ per_page: 100, is_active: true, status: "published" });
        return result.rows.map((row) => ({ id: row.id, name: row.name }));
      }
      return getPublicProducts();
    },
    enabled: open && values.clickAction === "product",
    staleTime: 2 * 60 * 1000,
  });
  const createSellerMutation = useCreateSellerPromotion();
  const createAdminMutation = useCreateAdminPromotion();
  const updateSellerMutation = useUpdateSellerPromotion();
  const updateAdminMutation = useUpdateAdminPromotion();
  const createMutation = isSeller ? createSellerMutation : createAdminMutation;
  const updateMutation = isSeller ? updateSellerMutation : updateAdminMutation;
  const mutation = entity ? updateMutation : createMutation;

  useEffect(() => {
    if (open) {
      setValues(initialValues(entity));
      setErrors({});
      setMessage("");
    }
  }, [entity, open]);

  const setField = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "clickAction" ? { targetId: "", targetUrl: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const rules = {
      name: required("Nama promosi"),
      imageUrl: [required("Gambar desktop"), validUrl("Gambar desktop")],
      mobileImageUrl: validUrl("Gambar mobile"),
      targetUrl: values.clickAction === "url" ? [required("URL target"), validUrl("URL target")] : () => "",
      targetId: ["product", "category"].includes(values.clickAction) ? required("Target") : () => "",
    };
    const nextErrors = validateFields(values, rules);
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    try {
      const saved = entity
        ? await updateMutation.mutateAsync({ id: entity.id, values })
        : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getPromotionError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title={entity ? "Edit Promosi" : "Tambah Promosi"} subtitle={isSeller ? "Setiap pengajuan seller otomatis berstatus pending sampai disetujui admin." : "Promosi baru tetap pending dan harus melalui approval sebelum tampil di homepage."} size="max-w-3xl">
      <form onSubmit={submit}>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <FormField label="Nama promosi" error={errors.name} required><input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="Urutan"><input type="number" min="0" value={values.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} className={inputClassName} /></FormField>
          <FormField label="URL gambar desktop" error={errors.imageUrl} required><input value={values.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} className={inputClassName} placeholder="https://..." /></FormField>
          <FormField label="URL gambar mobile" error={errors.mobileImageUrl}><input value={values.mobileImageUrl} onChange={(event) => setField("mobileImageUrl", event.target.value)} className={inputClassName} placeholder="https://..." /></FormField>
          <FormField label="Aksi ketika diklik">
            <select value={values.clickAction} onChange={(event) => setField("clickAction", event.target.value)} className={inputClassName}><option value="none">Tanpa aksi</option><option value="product">Buka produk</option><option value="category">Buka kategori</option><option value="url">Buka URL</option></select>
          </FormField>
          {values.clickAction === "product" ? <FormField label="Produk target" error={errors.targetId} required><select value={values.targetId} onChange={(event) => setField("targetId", event.target.value)} className={inputClassName}><option value="">Pilih produk</option>{(productsQuery.data || []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></FormField> : null}
          {values.clickAction === "category" ? <FormField label="Kategori target" error={errors.targetId} required><select value={values.targetId} onChange={(event) => setField("targetId", event.target.value)} className={inputClassName}><option value="">Pilih kategori</option>{(categoriesQuery.data || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField> : null}
          {values.clickAction === "url" ? <FormField label="URL target" error={errors.targetUrl} required><input value={values.targetUrl} onChange={(event) => setField("targetUrl", event.target.value)} className={inputClassName} placeholder="https://..." /></FormField> : null}
          <div className="md:col-span-2"><ActiveToggle checked={values.isActive} onChange={(isActive) => setField("isActive", isActive)} description="Promosi tetap tidak tampil ke buyer sebelum approval admin." /></div>
          {values.imageUrl ? <picture className="md:col-span-2"><source media="(max-width: 640px)" srcSet={values.mobileImageUrl || values.imageUrl} /><img src={values.imageUrl} alt="Preview promosi" className="aspect-[4/1] w-full rounded-2xl bg-slate-100 object-cover" /></picture> : null}
          {message ? <p className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button><button type="submit" disabled={mutation.isPending} className={`h-10 rounded-xl px-4 text-sm font-extrabold text-white disabled:opacity-60 ${isSeller ? "bg-emerald-600" : "bg-teal-600"}`}>{mutation.isPending ? "Mengirim..." : isSeller ? "Ajukan Promosi" : "Simpan Promosi"}</button></div>
      </form>
    </CrudDialog>
  );
}
