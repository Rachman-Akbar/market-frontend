import { useEffect, useMemo, useState } from "react";
import {
  getSellerProductError,
  useCreateSellerProduct,
  useSellerProductCategories,
  useUpdateSellerProduct,
} from "@/features/seller/product/services/sellerProductService";

const EMPTY_FORM = {
  name: "",
  sku: "",
  description: "",
  categoryId: "",
  price: "",
  stock: "",
  weight: "",
  isActive: true,
  images: [],
};

function getInitialForm(product) {
  if (!product) return EMPTY_FORM;

  return {
    name: product.name || "",
    sku: product.sku || "",
    description: product.description || "",
    categoryId: product.categoryId || "",
    price: product.price || "",
    stock: product.stock || "",
    weight: product.weight || "",
    isActive: product.isActive !== false,
    images: [],
  };
}

function Field({ label, required, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-slate-600">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export function SellerProductEditor({ product, mode, onClose, onSaved }) {
  const categoriesQuery = useSellerProductCategories();
  const createMutation = useCreateSellerProduct();
  const updateMutation = useUpdateSellerProduct();
  const [form, setForm] = useState(() => getInitialForm(product));
  const [message, setMessage] = useState("");
  const [previews, setPreviews] = useState([]);
  const isEdit = mode === "edit" && Boolean(product?.id);
  const pending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setForm(getInitialForm(product));
    setMessage("");
    setPreviews([]);
  }, [product, mode]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const existingImages = useMemo(
    () => product?.images?.filter((image) => image.url) || [],
    [product],
  );

  const update = (key, value) => {
    setMessage("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImages = (files) => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const nextFiles = Array.from(files || []).slice(0, 6);
    setForm((current) => ({ ...current, images: nextFiles }));
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.categoryId ||
      Number(form.price) <= 0 ||
      Number(form.stock) < 0
    ) {
      setMessage("Lengkapi nama, SKU, kategori, harga, dan stok produk.");
      return;
    }

    try {
      setMessage("");
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        weight: Number(form.weight || 0),
        categoryId: Number(form.categoryId),
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: product.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSaved?.();
    } catch (error) {
      setMessage(getSellerProductError(error));
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white"
    >
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#10B981]">
            Seller product
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">
            {isEdit ? "Ubah Produk" : "Tambah Produk"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Data akan disimpan langsung melalui Laravel API.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup editor"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-4 p-5">
        <Field label="Nama Produk" required>
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU" required>
            <input
              value={form.sku}
              onChange={(event) => update("sku", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
            />
          </Field>
          <Field label="Kategori" required>
            <select
              value={form.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Pilih kategori</option>
              {(categoriesQuery.data || []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Harga" required>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
            />
          </Field>
          <Field label="Stok" required>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => update("stock", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
            />
          </Field>
          <Field label="Berat (gram)">
            <input
              type="number"
              min="0"
              value={form.weight}
              onChange={(event) => update("weight", event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
            />
          </Field>
        </div>

        <Field label="Deskripsi">
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
          />
        </Field>

        <Field label="Gambar Produk">
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => handleImages(event.target.files)}
            className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
          />
        </Field>

        {existingImages.length || previews.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {existingImages.slice(0, 6).map((image) => (
              <img
                key={image.id || image.url}
                src={image.url}
                alt={product?.name || "Produk"}
                className="aspect-square w-full rounded-xl border border-slate-200 object-cover"
              />
            ))}
            {previews.map((url) => (
              <img
                key={url}
                src={url}
                alt="Preview produk"
                className="aspect-square w-full rounded-xl border border-emerald-200 object-cover"
              />
            ))}
          </div>
        ) : null}

        <label className="flex items-center gap-3 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update("isActive", event.target.checked)}
            className="h-4 w-4 accent-[#10B981]"
          />
          Produk aktif dan dapat ditampilkan kepada pembeli
        </label>

        {message ? (
          <p className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600">
            {message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-[#10B981] hover:text-[#047857]"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-xl bg-[#10B981] px-5 text-sm font-bold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah Produk"}
        </button>
      </div>
    </form>
  );
}
