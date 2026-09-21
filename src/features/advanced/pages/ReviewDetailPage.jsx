import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { advancedError, useDeleteReview } from "@/features/advanced/services/advancedMarketplaceService";
import { ConfirmDialog } from "@/shared/components/crud/ConfirmDialog";
import { ActionIconButton } from "@/shared/components/crud/ActionIconButton";
import { FormPageActions, FormPageLayout } from "@/shared/components/crud/FormPageLayout";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("id-ID");
}

function stars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating || 0)));
  return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
}

function mediaItems(media) {
  if (!media) return [];
  if (Array.isArray(media)) {
    return media
      .map((item) => (typeof item === "string" ? item : item?.url || item?.path || ""))
      .filter(Boolean);
  }
  const urls = media.urls || media.images || media.paths;
  if (Array.isArray(urls)) {
    return urls.filter(Boolean);
  }
  return typeof media === "string" ? [media] : [];
}

function ReviewDetailForm({ row, onClose, onDeleted }) {
  const { activeRole } = useAuth();
  const admin = activeRole === "admin";
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteReview();

  const media = useMemo(() => mediaItems(row?.media).map(resolveMediaUrl), [row]);
  const buyerAvatar = row?.user_avatar || row?.userAvatar || "";
  const productThumb = row?.product_thumbnail || row?.productThumbnail || row?.thumbnail || "";

  if (!row) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(row.id);
      setConfirmOpen(false);
      setMessage("Review berhasil dihapus.");
      onDeleted?.();
      onClose?.();
    } catch (error) {
      setMessage(advancedError(error));
    }
  };

  return (
    <>
      <FormPageLayout
        title="Detail Review"
        subtitle={`Review #${row.id}${row.order_number ? ` · Order ${row.order_number}` : ""}`}
        lead={
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${row.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {row.is_active ? "Dipublikasikan" : "Nonaktif"}
          </span>
        }
        actions={admin ? (
          <FormPageActions>
            <ActionIconButton icon="delete" label="Hapus Review" round color="#f472b6" onClick={() => setConfirmOpen(true)} disabled={deleteMutation.isPending} />
          </FormPageActions>
        ) : undefined}
      >
        {message ? <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p> : null}

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            {productThumb ? (
              <img src={resolveMediaUrl(productThumb)} alt={row.product_name || "Produk"} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200" loading="lazy" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[32px]">inventory_2</span>
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black text-slate-900">{row.product_name || "Produk"}</p>
              <p className="text-sm text-slate-500">Order: {row.order_number || "-"}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{formatDate(row.created_at)}</p>
            </div>
            <div className="text-right text-2xl tracking-wide text-amber-400" title={`${Number(row.rating || 0)} dari 5`}>{stars(row.rating)}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            {buyerAvatar ? (
              <img src={resolveMediaUrl(buyerAvatar)} alt={row.user_name || "Buyer"} className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200" loading="lazy" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">{row.user_name || "Buyer"}</p>
              <p className="text-[11px] font-semibold text-slate-400">{row.is_active ? "Dipublikasikan" : "Nonaktif"}</p>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{row.review || "Tidak ada isi review."}</p>
          {media.length ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {media.map((url, index) => (
                <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`Lampiran ${index + 1}`} className="h-24 w-24 rounded-xl object-cover ring-1 ring-slate-200" loading="lazy" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="text-sm font-extrabold text-slate-900">Informasi Review</h2>
          <div className="mt-3 divide-y divide-slate-100">
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Rating</span><span className="text-amber-500">{stars(row.rating)} <span className="text-slate-800">{Number(row.rating || 0)} / 5</span></span></div>
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Produk</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{row.product_name || "-"}</span></div>
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Order</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{row.order_number || "-"}</span></div>
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Buyer</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{row.user_name || "-"}</span></div>
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Status</span><span className="text-right font-bold text-slate-800">{row.is_active ? "Aktif" : "Nonaktif"}</span></div>
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Dibuat</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{formatDate(row.created_at)}</span></div>
            <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="text-slate-500">Diperbarui</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{formatDate(row.updated_at)}</span></div>
          </div>
        </div>
      </FormPageLayout>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Review"
        message={`Review untuk produk “${row.product_name || ""}” akan dihapus.`}
        pending={deleteMutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default ReviewDetailForm;
export { ReviewDetailForm };