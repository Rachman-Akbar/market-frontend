import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { ConfirmDialog, CrudDialog } from "@/shared/components/crud";
import { FormPageLayout } from "@/shared/components/crud/FormPageLayout";
import { SearchableSelect } from "@/shared/components/form/SearchableSelect";
import { Input } from "@/shared/components/ui/Input";
import { resolveMediaUrl } from "@/core/utils/mediaUrl";
import { formatPrice } from "@/shared/utils/utils";
import { getOrderManagementError, useDeleteOrder, useUpdateOrderStatus } from "@/features/admin/order/services/orderManagementService";
import { OrderFormActionButton, OrderFormLayout } from "@/features/seller/order/components/OrderFormLayout";
import OrderPrintSheet from "@/features/seller/order/components/OrderPrintSheet";

const STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "received", label: "Diterima" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("id-ID");
}

function itemsOf(row) {
  if (Array.isArray(row?.items) && row.items.length) {
    return row.items.map((item, index) => {
      const unitPrice = Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0);
      const quantity = Number(item.quantity || 0);
      return {
        id: item.id ?? index,
        name: item.productName || item.product_name || item.name || `Item ${index + 1}`,
        sku: item.sku || "-",
        thumbnail: resolveMediaUrl(item.thumbnail || item.image_url || item.image || ""),
        quantity,
        unitPrice,
        subtotal: Number(item.subtotal) || unitPrice * quantity,
      };
    });
  }
  const raw = row?.raw || {};
  if (Array.isArray(raw.items)) {
    return raw.items.map((item, index) => {
      const unitPrice = Number(item.unit_price ?? item.price ?? 0);
      const quantity = Number(item.quantity || 0);
      return {
        id: item.id ?? index,
        name: item.product_name || item.name || item.product?.name || `Item ${index + 1}`,
        sku: item.sku || "-",
        thumbnail: resolveMediaUrl(item.thumbnail || item.image_url || item.image || ""),
        quantity,
        unitPrice,
        subtotal: Number(item.subtotal) || unitPrice * quantity,
      };
    });
  }
  return [];
}

function StatusEditDialog({ open, row, onClose, onSaved }) {
  const updateMutation = useUpdateOrderStatus();
  const [status, setStatus] = useState(row?.status || "pending");
  const [tracking, setTracking] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(row?.status || "pending");
      setTracking((row?.raw?.tracking_number || row?.trackingNumber || "").trim());
      setMessage("");
    }
  }, [open, row]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!row?.id) return;
    try {
      const result = await updateMutation.mutateAsync({ id: row.id, status, trackingNumber: tracking });
      onSaved?.({ status: result?.data?.status || status, trackingNumber: tracking });
      onClose?.();
    } catch (error) {
      setMessage(getOrderManagementError(error));
    }
  };

  return (
    <CrudDialog open={open} onClose={onClose} title="Ubah Status Pesanan" subtitle={`Order ${row?.orderNumber || row?.subOrderNumber || `#${row?.id}`}`} size="max-w-md" presentation="modal">
      <form onSubmit={submit} className="space-y-4 p-5">
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          <span>Status</span>
          <SearchableSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} clearable={false} buttonClassName="h-10" />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          <span>No. Resi</span>
          <Input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Opsional — contoh: JNE1234567890" />
        </label>
        {message ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{message}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 border border-slate-200 px-4 text-sm font-bold text-slate-600">Batal</button>
          <button type="submit" disabled={updateMutation.isPending} className="h-10 bg-indigo-600 px-4 text-sm font-extrabold text-white disabled:opacity-60">Simpan Status</button>
        </div>
      </form>
    </CrudDialog>
  );
}

function OrderDetailForm({ row, onDeleted }) {
  const [printOpen, setPrintOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [statusOverride, setStatusOverride] = useState(null);
  const deleteMutation = useDeleteOrder();
  const items = useMemo(() => itemsOf(row), [row]);
  const raw = row?.raw || {};
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = Number(raw.shipping_cost ?? row?.shippingCost ?? 0);
  const discount = Number(raw.discount_amount ?? raw.discountAmount ?? 0);
  const shippingDiscount = Number(raw.shipping_discount_amount ?? raw.shippingDiscountAmount ?? 0);
  const total = Number(
    raw.grand_total ?? row?.total ?? subtotal + shippingCost - discount - shippingDiscount,
  );

  if (!row) return null;

  const orderStatus = statusOverride?.status || row.status || "pending";
  const printRow = { ...row, status: orderStatus, trackingNumber: statusOverride?.trackingNumber || row.trackingNumber };
  const buyerName = row.customerName || raw.buyer_name || raw.buyer?.name || raw.user?.name || "-";
  const shippingAddress = raw.shipping_address || row.shippingAddress || "-";
  const paymentMethod = raw.payment_method || raw.paymentMethod || "-";

  const handleDelete = async () => {
    setDeleteMessage("");
    try {
      await deleteMutation.mutateAsync(row.id);
      setDeleteOpen(false);
      onDeleted?.();
    } catch (error) {
      setDeleteMessage(getOrderManagementError(error));
    }
  };

  return (
    <>
      <OrderFormLayout
        aside={
          <>
            <OrderFormActionButton tone="teal" icon="swap" label="Ubah Status" onClick={() => setStatusOpen(true)} />
            <OrderFormActionButton tone="slate" icon="print" label="Cetak Nota" onClick={() => setPrintOpen(true)} />
            <OrderFormActionButton tone="rose" icon="delete" label="Hapus Pesanan" onClick={() => setDeleteOpen(true)} />
          </>
        }
      >
      <FormPageLayout
        title="Detail Pesanan"
        subtitle={`${raw.sub_order_number || row.subOrderNumber || `#${row.id}`} · Order ${raw.order_number || row.orderNumber || "-"} · ${formatDate(raw.created_at || row.createdAt)}`}
        lead={
          <div className="flex items-center gap-2">
            <StatusBadge status={orderStatus} label={STATUS_OPTIONS.find((o) => o.value === orderStatus)?.label || orderStatus} />
            {statusOverride ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-extrabold uppercase text-amber-700">Baru saja diubah</span> : null}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Total Belanja</p>
            <p className="mt-1 truncate text-lg font-black text-slate-900">{formatPrice(total)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Pembayaran</p>
            <p className="mt-1 truncate text-lg font-black uppercase text-slate-900">{row.paymentStatus || "pending"}</p>
            <p className="text-[11px] font-semibold text-slate-500">{paymentMethod}</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Tipe Pesanan</p>
            <p className="mt-1 truncate text-lg font-black uppercase text-slate-900">{row.orderType || "normal"}</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Jumlah Item</p>
            <p className="mt-1 truncate text-lg font-black text-slate-900">{totalItems} item</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">person</span>
              <h2 className="text-sm font-extrabold text-slate-900">Pembeli</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500">Nama</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{buyerName}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">ID User</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{raw.user_id || row.userId || "-"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Metode</span><span className="max-w-[60%] truncate text-right font-bold uppercase text-slate-800">{paymentMethod}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Tanggal</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{formatDate(raw.created_at || row.createdAt)}</span></div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">local_shipping</span>
              <h2 className="text-sm font-extrabold text-slate-900">Pengiriman</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500">Kurir</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{[raw.courier, raw.service].filter(Boolean).join(" / ") || "-"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Resi</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{raw.tracking_number || row.trackingNumber || "-"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Ongkir</span><span className="max-w-[60%] truncate text-right font-bold text-slate-800">{formatPrice(shippingCost)}</span></div>
            </div>
            <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">{shippingAddress}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-extrabold text-slate-900">Produk dalam Pesanan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-2.5">Produk</th>
                  <th className="px-4 py-2.5 text-center">Qty</th>
                  <th className="px-4 py-2.5 text-right">Harga</th>
                  <th className="px-5 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 pr-2">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" loading="lazy" />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-800">{item.name}</p>
                          <p className="text-[11px] text-slate-400">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(item.unitPrice)}</td>
                    <td className="px-5 py-3 text-right font-extrabold text-slate-800">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
                {!items.length ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">Item tidak tersedia pada data pesanan.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal ({totalItems} item)</span><span className="font-bold text-slate-800">{formatPrice(subtotal)}</span></div>
              {discount > 0 ? (
                <div className="flex justify-between text-emerald-700"><span>Diskon</span><span className="font-bold">-{formatPrice(discount)}</span></div>
              ) : null}
              {shippingDiscount > 0 ? (
                <div className="flex justify-between text-emerald-700"><span>Diskon Ongkir</span><span className="font-bold">-{formatPrice(shippingDiscount)}</span></div>
              ) : null}
              <div className="flex justify-between text-slate-600"><span>Ongkir</span><span className="font-bold text-slate-800">{formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-black text-slate-900"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
        </div>
      </FormPageLayout>
      </OrderFormLayout>

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus Pesanan"
        message="Pesanan belum dibayar berstatus menunggu akan dihapus dan stok dikembalikan. Pesanan yang sudah lunas atau sedang diproses tidak dapat dihapus."
        confirmLabel="Hapus Pesanan"
        pending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
      {deleteMessage ? <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{deleteMessage}</p> : null}

      <StatusEditDialog open={statusOpen} row={row} onClose={() => setStatusOpen(false)} onSaved={(updated) => setStatusOverride(updated)} />

      {printOpen ? <OrderPrintSheet row={printRow} onClose={() => setPrintOpen(false)} /> : null}
    </>
  );
}

export default OrderDetailForm;
export { OrderDetailForm };