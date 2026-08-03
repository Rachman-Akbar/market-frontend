import { useEffect, useMemo, useState } from "react";
import { CrudDialog } from "@/shared/components/crud/CrudDialog";
import { ActiveToggle } from "@/shared/components/form/ActiveToggle";
import { FormField, inputClassName, textAreaClassName } from "@/shared/components/form/FormField";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { validateFields, minimumNumber, required } from "@/core/utils/formValidation";
import { ProductEditorTabs } from "@/features/seller/product/components/ProductEditorTabs";
import { ProductImageFields } from "@/features/seller/product/components/ProductImageFields";
import { ProductStockFields } from "@/features/seller/product/components/ProductStockFields";
import { ProductVariantFields } from "@/features/seller/product/components/ProductVariantFields";
import { createClientId } from "@/core/utils/clientId";
import { toTitleCase } from "@/shared/utils/textFormatter";
import { useNotificationCenter } from "@/shared/notifications/NotificationCenterContext";
import { useRelationCreateTab } from "@/shared/hooks/useRelationCreateTab";
import { getRelationQuickCreateError, useQuickCreateCategory, useQuickCreateProductAttribute } from "@/shared/services/relationQuickCreateService";
import {
  getSellerProductError,
  useCreateSellerProduct,
  useSellerProductAttributes,
  useSellerProductCategories,
  useUpdateSellerProduct,
} from "@/features/seller/product/services/sellerProductService";

function createInitialValues(product) {
  if (!product) {
    return {
      storeId: "",
      name: "",
      brand: "",
      description: "",
      categoryId: "",
      status: "draft",
      isActive: true,
      mode: "simple",
      sku: "",
      price: "",
      stock: 0,
      thumbnail: "",
      images: [],
      variants: [{ clientId: createClientId("variant"), id: null, name: "", sku: "", price: "", stock: 0, values: [] }],
    };
  }

  return {
    storeId: product.storeId || "",
    name: product.name,
    brand: product.brand,
    description: product.description,
    categoryId: product.categoryId || "",
    status: product.status,
    isActive: product.isActive,
    mode: product.mode,
    sku: product.sku,
    price: product.price,
    stock: product.stock,
    thumbnail: product.thumbnail,
    images: product.images.length
      ? product.images.map((image) => ({ ...image, clientId: image.clientId || createClientId("image") }))
      : product.thumbnail ? [{ clientId: createClientId("image"), url: product.thumbnail, altText: "" }] : [],
    variants: product.variants.length
      ? product.variants.map((variant) => ({
          ...variant,
          clientId: variant.clientId || createClientId("variant"),
          values: (variant.values || []).map((value) => ({
            ...value,
            clientId: value.clientId || createClientId("attribute-value"),
          })),
        }))
      : [{ clientId: createClientId("variant"), id: null, name: product.name, sku: product.sku, price: product.price, stock: product.stock, values: [] }],
  };
}

function getCategoryDepth(category) {
  if (Number.isFinite(Number(category?.depth))) return Number(category.depth);
  if (Number.isFinite(Number(category?.level))) return Math.max(0, Number(category.level) - 1);
  const prefix = String(category?.name || "").match(/^(?:—\s*)+/)?.[0] || "";
  return (prefix.match(/—/g) || []).length;
}

function getCategoryName(category) {
  return category?.rawName || String(category?.name || "").replace(/^(?:—\s*)+/, "") || "Kategori";
}

function getCategoryPath(category) {
  if (Array.isArray(category?.pathNames) && category.pathNames.length) {
    return category.pathNames.map(toTitleCase).join(" / ");
  }
  if (category?.path) {
    return String(category.path).split("/").map((item) => toTitleCase(item)).join(" / ");
  }
  return toTitleCase(getCategoryName(category));
}

function getErrorTabs(errors) {
  const tabs = [];
  if (errors.storeId || errors.name || errors.categoryId) tabs.push("general");
  if (errors.variants) tabs.push("variant");
  if (errors.images || errors.thumbnail) tabs.push("images");
  if (errors.price || errors.stock || errors.variantStock) tabs.push("stock");
  return tabs;
}

export function SellerProductEditor({
  open,
  product,
  portal = "seller",
  stores = [],
  categories = null,
  attributes = null,
  useCreateMutation = useCreateSellerProduct,
  useUpdateMutation = useUpdateSellerProduct,
  getError = getSellerProductError,
  onClose,
  onSaved,
  onDelete,
}) {
  const [values, setValues] = useState(() => createInitialValues(product));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const notifications = useNotificationCenter();
  const openRelationCreateTab = useRelationCreateTab();
  const quickCreateCategoryMutation = useQuickCreateCategory();
  const quickCreateAttributeMutation = useQuickCreateProductAttribute();
  const categoriesQuery = useSellerProductCategories({ enabled: categories === null });
  const attributesQuery = useSellerProductAttributes({ enabled: attributes === null });
  const categoryOptions = categories || categoriesQuery.data || [];
  const attributeOptions = attributes || attributesQuery.data || [];
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();
  const isAdmin = portal === "admin";
  const mutation = product ? updateMutation : createMutation;

  useEffect(() => {
    if (open) {
      setValues(createInitialValues(product));
      setErrors({});
      setMessage("");
      setActiveSection("general");
    }
  }, [open, product]);

  const selectedCategory = useMemo(
    () => categoryOptions.find((category) => category.id === Number(values.categoryId)) || null,
    [categoryOptions, values.categoryId],
  );

  const quickCreateCategory = async (name) => {
    try {
      const created = await quickCreateCategoryMutation.mutateAsync({ name, catalogGroupName: "Lainnya" });
      notifications.push({ type: "success", title: "Category siap digunakan", message: `${created.name} berhasil tersedia dan langsung dipilih.` });
      return { value: created.id, label: `L${created.level || 1} · ${toTitleCase(created.name)}` };
    } catch (error) {
      notifications.push({ type: "error", title: "Category gagal dibuat", message: getRelationQuickCreateError(error) });
      throw error;
    }
  };

  const quickCreateAttribute = async (name) => {
    try {
      const created = await quickCreateAttributeMutation.mutateAsync({ name, type: "text" });
      notifications.push({ type: "success", title: "Atribut siap digunakan", message: `${created.name} berhasil dibuat dan langsung dipilih.` });
      return { value: created.id, label: toTitleCase(created.name) };
    } catch (error) {
      notifications.push({ type: "error", title: "Atribut gagal dibuat", message: getRelationQuickCreateError(error) });
      throw error;
    }
  };

  const sortedCategoryOptions = useMemo(() => categoryOptions, [categoryOptions]);

  const rules = useMemo(() => ({
    storeId: isAdmin ? required("Toko") : () => "",
    name: required("Nama produk"),
    categoryId: required("Kategori"),
    price: values.mode === "simple" ? [required("Harga"), minimumNumber("Harga", 1)] : () => "",
    stock: values.mode === "simple" ? [required("Stok"), minimumNumber("Stok", 0)] : () => "",
  }), [isAdmin, values.mode]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const changeMode = (mode) => {
    setValues((current) => {
      const firstVariant = current.variants[0];

      if (mode === "simple" && firstVariant) {
        return {
          ...current,
          mode,
          sku: firstVariant.sku || current.sku,
          price: firstVariant.price ?? current.price,
          stock: firstVariant.stock ?? current.stock,
        };
      }

      if (mode === "variant") {
        const variants = current.variants.length
          ? current.variants.map((variant, index) => index === 0 && !variant.name
            ? {
                ...variant,
                name: current.name,
                sku: variant.sku || current.sku,
                price: variant.price || current.price,
                stock: variant.stock || current.stock,
              }
            : variant)
          : [{
              clientId: createClientId("variant"),
              id: null,
              name: current.name,
              sku: current.sku,
              price: current.price,
              stock: current.stock,
              values: [],
            }];

        return { ...current, mode, variants };
      }

      return { ...current, mode };
    });
    setErrors((current) => ({ ...current, variants: "", variantStock: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields(values, rules);

    if (values.mode === "variant") {
      if (!values.variants.length) nextErrors.variants = "Minimal satu variant wajib dibuat.";

      if (values.variants.some((variant) => !variant.name.trim() || !variant.sku.trim())) {
        nextErrors.variants = "Nama dan SKU setiap variant wajib diisi.";
      }

      const normalizedSkus = values.variants.map((variant) => variant.sku.trim().toLowerCase()).filter(Boolean);
      if (new Set(normalizedSkus).size !== normalizedSkus.length) {
        nextErrors.variants = "SKU variant tidak boleh duplikat.";
      }

      const hasDuplicateAttribute = values.variants.some((variant) => {
        const attributeIds = variant.values.map((item) => Number(item.attributeId)).filter(Boolean);
        return new Set(attributeIds).size !== attributeIds.length;
      });

      if (hasDuplicateAttribute) {
        nextErrors.variants = "Satu atribut hanya boleh dipakai sekali pada setiap variant.";
      }

      if (values.variants.some((variant) => String(variant.price ?? "").trim() === "" || String(variant.stock ?? "").trim() === "")) {
        nextErrors.variantStock = "Harga dan stok setiap variant wajib diisi.";
      } else if (values.variants.some((variant) => Number(variant.price) <= 0 || Number(variant.stock) < 0)) {
        nextErrors.variantStock = "Harga setiap variant harus lebih dari 0 dan stok tidak boleh kurang dari 0.";
      }
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const [firstTab] = getErrorTabs(nextErrors);
      if (firstTab) setActiveSection(firstTab);
      return;
    }

    try {
      setMessage("");
      const saved = product
        ? await updateMutation.mutateAsync({ id: product.id, values })
        : await createMutation.mutateAsync(values);
      onSaved?.(saved);
      onClose?.();
    } catch (error) {
      setMessage(getError(error));
    }
  };

  return (
    <CrudDialog
      open={open}
      onClose={onClose}
      size="max-w-6xl"
      title={product ? "Edit Produk" : "Tambah Produk"}
      subtitle="Informasi produk dipisahkan ke tab Umum, Variant, Gambar, dan Stok agar lebih mudah dikelola."
    >
      <form onSubmit={submit}>
        <ProductEditorTabs activeTab={activeSection} onChange={setActiveSection} errorTabs={getErrorTabs(errors)} />

        <div className="min-h-[420px] space-y-6 p-5 sm:p-6">
          {activeSection === "general" ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-extrabold text-slate-800">Informasi Umum</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Data utama yang digunakan pada katalog dan halaman toko.</p>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-2">
                  {isAdmin ? (
                    <FormField label="Toko" error={errors.storeId} required>
                      <SearchableSelect
                        value={values.storeId}
                        onChange={(nextValue) => setField("storeId", nextValue)}
                        options={stores.map((store) => ({ value: store.id, label: toTitleCase(store.name), keywords: `${store.slug || ""} ${store.city || ""}` }))}
                        placeholder="Pilih toko"
                        searchPlaceholder="Cari toko"
                        onCreate={(name) => openRelationCreateTab({ href: "/admin/stores", relationLabel: "Toko", searchName: name })}
                        createLabel={(name) => `Data tidak ditemukan, buka Data Baru Toko untuk “${name}”`}
                      />
                    </FormField>
                  ) : null}

                  <FormField label="Nama produk" error={errors.name} required>
                    <input value={values.name} onChange={(event) => setField("name", event.target.value)} className={inputClassName} />
                  </FormField>

                  <FormField label="Brand">
                    <input value={values.brand} onChange={(event) => setField("brand", event.target.value)} className={inputClassName} />
                  </FormField>

                  <FormField label="Kategori" error={errors.categoryId} required>
                    <SearchableSelect
                      value={values.categoryId}
                      onChange={(nextValue) => setField("categoryId", nextValue)}
                      options={sortedCategoryOptions.map((category) => {
                        const depth = getCategoryDepth(category);
                        return {
                          value: category.id,
                          label: `L${depth + 1} · ${"— ".repeat(depth)}${toTitleCase(getCategoryName(category))}`,
                          keywords: getCategoryPath(category),
                        };
                      })}
                      placeholder="Pilih kategori"
                      searchPlaceholder="Cari kategori"
                      onCreate={quickCreateCategory}
                      creating={quickCreateCategoryMutation.isPending}
                      createLabel={(name) => `Data tidak ditemukan, tambahkan “${name}” sebagai Category baru`}
                    />
                  </FormField>

                  {isAdmin ? (
                    <FormField label="Status publikasi" hint="Draft belum tampil, Published tampil jika aktif, Archived disimpan sebagai arsip.">
                      <SearchableSelect
                        value={values.status}
                        onChange={(nextValue) => setField("status", nextValue)}
                        options={[
                          { value: "draft", label: "Draft" },
                          { value: "published", label: "Published" },
                          { value: "archived", label: "Archived" },
                        ]}
                        clearable={false}
                        placeholder="Pilih status"
                      />
                    </FormField>
                  ) : (
                    <div className="flex items-center bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Status publikasi ditentukan Admin. Seller hanya mengatur Active / Non-Active.
                    </div>
                  )}

                  {selectedCategory ? (
                    <div className="md:col-span-2 rounded-lg bg-slate-50 px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-white px-2 py-1 text-[11px] font-extrabold text-teal-700 ring-1 ring-inset ring-slate-200">Level {getCategoryDepth(selectedCategory) + 1}</span>
                        <p className="text-xs font-bold text-slate-600">{getCategoryPath(selectedCategory)}</p>
                      </div>
                    </div>
                  ) : null}

                  <FormField label="Deskripsi" className="md:col-span-2">
                    <textarea value={values.description} onChange={(event) => setField("description", event.target.value)} className={textAreaClassName} />
                  </FormField>

                  {values.mode === "simple" ? (
                    <div className="md:col-span-2 grid gap-4 bg-slate-50 p-4 sm:grid-cols-3">
                      <FormField label="SKU">
                        <input value={values.sku} onChange={(event) => setField("sku", event.target.value)} className={inputClassName} placeholder="Kosongkan untuk otomatis" />
                      </FormField>
                      <FormField label="Harga" error={errors.price} required>
                        <input type="number" min="0" value={values.price} onChange={(event) => setField("price", event.target.value)} className={inputClassName} placeholder="0" />
                      </FormField>
                      <FormField label="Stok" error={errors.stock} required>
                        <input type="number" min="0" value={values.stock} onChange={(event) => setField("stock", event.target.value)} className={inputClassName} placeholder="0" />
                      </FormField>
                    </div>
                  ) : (
                    <div className="md:col-span-2 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                      Harga dan stok setiap variant diatur pada tab Stok.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <ActiveToggle checked={values.isActive} onChange={(checked) => setField("isActive", checked)} />
              </section>
            </div>
          ) : null}

          {activeSection === "variant" ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-extrabold text-slate-800">Mode Produk</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Tentukan apakah produk memiliki satu SKU atau beberapa kombinasi variant.</p>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {[
                    ["simple", "Tanpa Variant", "Satu SKU dengan satu harga dan stok."],
                    ["variant", "Dengan Variant", "Mendukung ukuran, warna, SKU, harga, dan stok berbeda."],
                  ].map(([mode, label, description]) => (
                    <label key={mode} className={`cursor-pointer rounded-lg border p-4 transition-colors ${values.mode === mode ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <input type="radio" className="sr-only" checked={values.mode === mode} onChange={() => changeMode(mode)} />
                      <span className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${values.mode === mode ? "border-emerald-600" : "border-slate-300"}`}>
                          {values.mode === mode ? <span className="h-2 w-2 rounded-full bg-emerald-600" /> : null}
                        </span>
                        {label}
                      </span>
                      <span className="mt-1.5 block pl-6 text-xs text-slate-500">{description}</span>
                    </label>
                  ))}
                </div>
              </section>

              {values.mode === "variant" ? (
                <div>
                  <ProductVariantFields variants={values.variants} attributes={attributeOptions} onChange={(variants) => setField("variants", variants)} onCreateAttribute={quickCreateAttribute} creatingAttribute={quickCreateAttributeMutation.isPending} />
                  {errors.variants ? <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{errors.variants}</p> : null}
                </div>
              ) : (
                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div>
                    <span className="material-symbols-outlined text-3xl text-slate-400">inventory_2</span>
                    <p className="mt-2 text-sm font-extrabold text-slate-700">Produk tanpa variant</p>
                    <p className="mt-1 text-xs text-slate-500">SKU, harga, dan stok dapat diisi pada tab Stok.</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {activeSection === "images" ? (
            <div className="space-y-5">
              <ProductImageFields
                images={values.images}
                error={errors.images}
                onChange={(images) => {
                  setValues((current) => ({
                    ...current,
                    images,
                    thumbnail: images[0]?.url || "",
                  }));
                  setErrors((current) => ({ ...current, images: "", thumbnail: "" }));
                }}
              />
            </div>
          ) : null}

          {activeSection === "stock" ? (
            <ProductStockFields
              mode={values.mode}
              sku={values.sku}
              price={values.price}
              stock={values.stock}
              variants={values.variants}
              errors={errors}
              onSimpleChange={setField}
              onVariantsChange={(variants) => setField("variants", variants)}
            />
          ) : null}

          {message ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
          {product && onDelete ? (
            <button type="button" onClick={() => onDelete(product)} className="h-10 bg-red-50 px-4 text-sm font-extrabold text-red-600 hover:bg-red-100">Hapus</button>
          ) : null}
          <button type="submit" disabled={mutation.isPending} className={`h-10 px-5 text-sm font-extrabold text-white disabled:opacity-60 ${isAdmin ? "bg-teal-600 hover:bg-teal-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {mutation.isPending ? "Menyimpan..." : product ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </div>
      </form>
    </CrudDialog>
  );
}
