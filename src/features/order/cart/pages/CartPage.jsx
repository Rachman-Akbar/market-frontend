import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Heart,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Ticket,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCart } from "@/features/order/cart/context/CartContext";
import { useWishlist } from "@/features/order/wishlist/context/WishlistContext";
import {
  useOrderDetail,
  useOrders,
} from "@/features/order/ordering/orderService";
import { CartItemRow } from "@/features/order/cart/components/CartItemRow";
import { openMidtransPayment } from "@/features/order/ordering/midtransService";
import VoucherSearchSelect from "@/features/order/voucher/components/VoucherSearchSelect";
import { formatPrice } from "@/shared/utils/utils";

const tabs = [
  { key: "wishlist", label: "Wishlist" },
  { key: "cart", label: "Cart" },
  { key: "order", label: "Order" },
  { key: "review", label: "Review" },
];

const sortOptions = [
  { value: "latest", label: "Terbaru" },
  { value: "priceHigh", label: "Harga Tertinggi" },
  { value: "priceLow", label: "Harga Terendah" },
  { value: "popular", label: "Terpopuler" },
];

function getItemKey(item) {
  return `${item.productId}-${item.variantId || "default"}`;
}

function getItemAmount(item) {
  return item.price * (item.quantity || 1);
}

function sortByOption(list, sortBy) {
  const rows = [...list];

  if (sortBy === "priceHigh") {
    return rows.sort(
      (a, b) => (b.price || b.total || 0) - (a.price || a.total || 0),
    );
  }

  if (sortBy === "priceLow") {
    return rows.sort(
      (a, b) => (a.price || a.total || 0) - (b.price || b.total || 0),
    );
  }

  return rows;
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold leading-8 text-[#181c1f]">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-5 text-[#5f5e5e]">{description}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[#e0e3e7] bg-white px-6 text-center shadow-sm">
      <Icon size={56} className="mb-4 text-[#bccabc]" />
      <h3 className="text-lg font-bold text-[#181c1f]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#5f5e5e]">
        {description}
      </p>
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-[#bccabc] bg-white px-4 pr-10 text-sm text-[#181c1f] shadow-sm outline-none transition focus:border-[#047857] focus:ring-1 focus:ring-[#10B981] sm:w-[190px]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            Sort By: {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5e5e]"
      />
    </div>
  );
}

function TabNavigation({ activeTab, onChange }) {
  return (
    <nav className="mb-6 flex items-center gap-10 overflow-x-auto border-b border-transparent pb-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`whitespace-nowrap py-2 text-base transition-all duration-300 ${
              active
                ? "border-b-2 border-[#10B981] font-bold text-[#047857]"
                : "border-b-2 border-transparent text-[#5f5e5e] hover:text-[#047857]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function StoreGroup({
  storeName,
  items,
  selectedKeys,
  onToggleStore,
  onToggleItem,
  onDecrease,
  onIncrease,
  onRemove,
}) {
  const allChecked = items.every((item) =>
    selectedKeys.includes(getItemKey(item)),
  );

  return (
    <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#ebeef2] pb-3">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={() => onToggleStore(items)}
          className="h-5 w-5 rounded border-[#6d7b6e] text-[#047857] focus:ring-[#10B981]"
        />
        <Store size={20} className="text-[#10B981]" />
        <span className="text-base font-bold text-[#181c1f]">{storeName}</span>
        {storeName.toLowerCase().includes("official") ? (
          <span className="rounded bg-[#A7F3D0] px-2 py-0.5 text-[10px] font-bold text-[#065F46]">
            PRO
          </span>
        ) : null}
      </div>

      <div className="divide-y divide-[#ebeef2]">
        {items.map((item) => (
          <CartItemRow
            key={getItemKey(item)}
            item={item}
            checked={selectedKeys.includes(getItemKey(item))}
            onToggle={onToggleItem}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function CartSummary({
  selectedItems,
  onCheckout,
  voucherCode,
  onVoucherCodeChange,
}) {
  const itemCount = selectedItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0,
  );
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + getItemAmount(item),
    0,
  );
  const shipping = 0;
  const discount = 0;
  const total = subtotal;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
        <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-[#181c1f]">
          <Ticket size={20} className="text-[#10B981]" />
          Pakai Promo/Voucher
        </h4>
        <VoucherSearchSelect
          value={voucherCode}
          onChange={onVoucherCodeChange}
          label="Cari voucher"
        />
      </div>

      <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm">
        <h4 className="mb-5 text-base font-bold text-[#181c1f]">
          Ringkasan Belanja
        </h4>
        <div className="space-y-3 text-sm text-[#5f5e5e]">
          <div className="flex justify-between gap-4">
            <span>Subtotal ({itemCount} barang)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Ongkos Kirim</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#047857]">
            <span>Diskon Voucher</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        </div>
        <hr className="my-5 border-[#e0e3e7]" />
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="text-lg font-bold text-[#181c1f]">
            Total Pembayaran
          </span>
          <span className="text-2xl font-semibold text-[#047857]">
            {formatPrice(total)}
          </span>
        </div>
        <button
          type="button"
          disabled={!selectedItems.length}
          onClick={onCheckout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 text-lg font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lanjut ke Pembayaran
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="px-2 text-center text-[10px] leading-5 text-[#474746]">
        <ShieldCheck size={13} className="mr-1 inline align-[-2px]" />
        Transaksi Anda aman dan terlindungi. Ziip menjamin keamanan data dan
        pembayaran Anda.
      </div>
    </aside>
  );
}

function CartTab({
  items,
  selectedKeys,
  onToggleAll,
  onToggleStore,
  onToggleItem,
  onDecrease,
  onIncrease,
  onRemove,
  onClear,
  onCheckout,
  voucherCode,
  onVoucherCodeChange,
}) {
  const selectedItems = items.filter((item) =>
    selectedKeys.includes(getItemKey(item)),
  );
  const storeGroups = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.storeName || "Ziip Store";
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
  }, [items]);

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Cart kosong"
        description="Tambahkan produk pilihanmu agar bisa diproses ke pembayaran dari halaman ini."
      />
    );
  }

  return (
    <div className="grid grid-cols-12 items-start gap-6">
      <div className="col-span-12 space-y-4 lg:col-span-8">
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedKeys.length === items.length}
              onChange={onToggleAll}
              className="h-5 w-5 rounded border-[#6d7b6e] text-[#047857] focus:ring-[#10B981]"
            />
            <span className="text-base font-semibold text-[#181c1f]">
              Pilih Semua ({items.length} Barang)
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 text-sm font-semibold text-[#ba1a1a] transition hover:underline"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>

        {Object.entries(storeGroups).map(([storeName, storeItems]) => (
          <StoreGroup
            key={storeName}
            storeName={storeName}
            items={storeItems}
            selectedKeys={selectedKeys}
            onToggleStore={onToggleStore}
            onToggleItem={onToggleItem}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <CartSummary
          selectedItems={selectedItems}
          onCheckout={onCheckout}
          voucherCode={voucherCode}
          onVoucherCodeChange={onVoucherCodeChange}
        />
      </div>
    </div>
  );
}

function WishlistTab({
  items,
  onAddToCart,
  onRemoveFromWishlist,
}) {
  if (!items.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Wishlist kosong"
        description="Simpan produk favoritmu agar lebih mudah ditemukan saat ingin checkout."
      />
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-9">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={`${item.productId}-${item.variantId || "default"}`}
              id={item.productId}
              productId={item.productId}
              variantId={item.variantId}
              slug={
                item.slug ||
                String(item.productId)
              }
              image={item.imageUrl}
              title={item.productName}
              price={item.price}
              stock={item.stock}
              location={
                item.location ||
                item.storeName
              }
              wishlistBtn
              showAddToCart
              addToCartLabel="Masukkan Cart"
              onAddToCart={() =>
                onAddToCart(item)
              }
              onWishlistToggle={() =>
                onRemoveFromWishlist(item)
              }
            />
          ))}
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-3">
        <div className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <h4 className="text-base font-bold text-[#181c1f]">
            Ringkasan Wishlist
          </h4>

          <hr className="my-4 border-[#e0e3e7]" />

          <div className="space-y-3 text-sm text-[#5f5e5e]">
            <div className="flex justify-between gap-4">
              <span>Total produk</span>
              <span>{items.length} item</span>
            </div>

            <div className="flex justify-between gap-4">
              <span>Estimasi nilai</span>
              <span className="text-right font-semibold text-[#047857]">
                {formatPrice(
                  items.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.price || 0),
                    0,
                  ),
                )}
              </span>
            </div>
          </div>

          <hr className="my-4 border-[#e0e3e7]" />

          <p className="text-xs leading-5 text-[#5f5e5e]">
            Produk dapat dimasukkan langsung ke
            cart tanpa membuka halaman detail.
          </p>
        </div>
      </aside>
    </div>
  );
}

function OrderDetailPanel({ orderId, onBack, paymentNotice = "" }) {
  const orderQuery = useOrderDetail(orderId);
  const order = orderQuery.data;
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  if (orderQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
        Memuat detail pesanan...
      </div>
    );
  }

  if (orderQuery.error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-red-600">
          Detail pesanan tidak ditemukan.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-bold text-[#047857]"
        >
          Kembali ke daftar order
        </button>
      </div>
    );
  }

  const success =
    ["paid", "settlement", "success"].includes(
      String(order.paymentStatus).toLowerCase(),
    ) ||
    ["processing", "shipped", "completed", "delivered"].includes(
      String(order.status).toLowerCase(),
    );
  const failed =
    ["cancelled", "failed", "expired"].includes(
      String(order.status).toLowerCase(),
    ) || String(order.paymentStatus).toLowerCase() === "failed";
  const StatusIcon = failed ? XCircle : success ? CheckCircle2 : Clock3;
  const statusClass = failed
    ? "border-red-200 text-red-600"
    : success
      ? "border-emerald-200 text-[#047857]"
      : "border-amber-200 text-amber-700";
  const title = failed
    ? "Pesanan Dibatalkan"
    : success
      ? "Pesanan Berhasil"
      : "Pesanan Dibuat";
  const orderItems = order.items.length
    ? order.items
    : order.subOrders.flatMap((subOrder) => subOrder.items || []);
  const paymentStatus = String(order.paymentStatus || "").toLowerCase();
  const canPay =
    !["paid", "settlement", "success"].includes(paymentStatus) &&
    Boolean(order.snapToken || order.paymentUrl || order.redirectUrl);

  const handlePayNow = async () => {
    try {
      setPaying(true);
      setPaymentMessage("");
      await openMidtransPayment(order, {
        onSuccess: () => orderQuery.refetch(),
        onPending: () => orderQuery.refetch(),
        onError: () => {
          setPaymentMessage("Pembayaran Midtrans gagal. Silakan coba kembali.");
          orderQuery.refetch();
        },
        onClose: () => orderQuery.refetch(),
      });
    } catch (error) {
      setPaymentMessage(error.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#047857] hover:text-[#10B981]"
      >
        <ArrowLeft size={17} />
        Kembali ke daftar order
      </button>

      {paymentNotice || paymentMessage ? (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${paymentMessage || paymentNotice.includes("belum") || paymentNotice.includes("gagal") ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-[#047857]"}`}
        >
          {paymentMessage || paymentNotice}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border ${statusClass}`}
          >
            <StatusIcon size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              {order.orderNumber}
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString("id-ID")
                : "-"}
            </p>
          </div>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Produk</h4>
          <div className="mt-3 divide-y divide-slate-100">
            {orderItems.map((item) => (
              <div
                key={`${item.id}-${item.productId}-${item.variantId}`}
                className="flex items-center gap-3 py-3"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-14 w-14 rounded-xl border border-slate-100 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.variantLabel || item.sku || "-"} ×{item.quantity}
                  </p>
                </div>
                <strong className="text-sm text-slate-900">
                  {formatPrice(item.subtotal || item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h4 className="text-sm font-bold text-slate-900">
            Ringkasan Pembayaran
          </h4>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <div className="flex justify-between gap-3">
              <span>Subtotal</span>
              <span>
                {formatPrice(
                  order.subtotal ||
                    Math.max(0, order.grandTotal - order.shippingCost),
                )}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Ongkir</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Diskon</span>
              <span>
                -
                {formatPrice(
                  order.discountAmount + order.shippingDiscountAmount,
                )}
              </span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between gap-3 text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="text-[#047857]">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
          <hr className="my-5 border-slate-200" />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Alamat Pengiriman
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {order.shippingAddress || "-"}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Metode bayar: {order.paymentMethod || "-"}
          </p>
          {canPay ? (
            <button
              type="button"
              disabled={paying}
              onClick={handlePayNow}
              className="mt-4 w-full rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? "Membuka Midtrans..." : "Bayar Sekarang"}
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function OrderTab({ items, onOpen }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={PackageCheck}
        title="Order belum tersedia"
        description="Pesanan yang sedang berjalan dan riwayat pembelian akan muncul di tab ini."
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-[#ebeef2] pb-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#181c1f]">{order.id}</p>
              <p className="mt-1 text-xs text-[#5f5e5e]">{order.date}</p>
            </div>
            <span className="w-fit rounded-full bg-[#e5e8ec] px-3 py-1 text-xs font-bold text-[#3d4a3f]">
              {order.status}
            </span>
          </div>
          <div className="flex gap-4 py-4">
            <img
              src={order.imageUrl}
              alt={order.productName}
              className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="mb-1 flex items-center gap-2 text-sm font-bold text-[#181c1f]">
                <Store size={16} className="text-[#10B981]" />
                {order.storeName}
              </p>
              <h3 className="line-clamp-2 text-base font-semibold text-[#181c1f]">
                {order.productName}
              </h3>
              <p className="mt-1 text-sm text-[#5f5e5e]">
                Variant: {order.variantLabel} x{order.quantity}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm text-[#5f5e5e]">Total</p>
              <p className="text-lg font-bold text-[#047857]">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>
          <hr className="border-[#ebeef2]" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#5f5e5e]">
              Pesanan dari {order.storeName} tersusun sesuai urutan terbaru.
            </p>
            <button
              type="button"
              onClick={() => onOpen(order.orderId || order.id)}
              className="rounded-lg border border-[#bccabc] bg-white px-4 py-2 text-sm font-bold text-[#047857] transition hover:border-[#047857]"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          className={
            index < rating ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#bccabc]"
          }
        />
      ))}
    </div>
  );
}

function ReviewTab({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="Review belum tersedia"
        description="Ulasan pembelian yang sudah selesai akan ditampilkan di tab ini."
      />
    );
  }

  const totalRating = items.reduce(
    (sum, item) => sum + Number(item.rating || 0),
    0,
  );
  const averageRating = totalRating / items.length;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: items.filter((item) => Number(item.rating) === rating).length,
  }));

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-4">
        <div className="rounded-xl border border-[#e0e3e7] bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <Star size={42} className="fill-[#f59e0b] text-[#f59e0b]" />
            <div>
              <p className="text-5xl font-bold text-[#181c1f]">
                {averageRating.toFixed(1)}
                <span className="ml-1 text-lg font-normal text-[#5f5e5e]">
                  / 5.0
                </span>
              </p>
              <p className="mt-1 text-sm text-[#5f5e5e]">
                {items.length} ulasan
              </p>
            </div>
          </div>
          <hr className="my-5 border-[#e0e3e7]" />
          <div className="space-y-3">
            {distribution.map(({ rating, count }) => {
              const width = Math.round((count / items.length) * 100);
              return (
                <div
                  key={rating}
                  className="flex items-center gap-2 text-xs text-[#5f5e5e]"
                >
                  <Star size={14} className="fill-[#f59e0b] text-[#f59e0b]" />
                  <span className="w-3">{rating}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ebeef2]">
                    <div
                      className="h-full rounded-full bg-[#047857]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{width}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="col-span-12 space-y-4 lg:col-span-8">
        {items.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-[#e0e3e7] bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <img
                src={review.imageUrl}
                alt={review.productName}
                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-[#5f5e5e]">{review.date}</span>
                </div>
                <h3 className="line-clamp-1 text-base font-bold text-[#181c1f]">
                  {review.productName}
                </h3>
                <p className="mt-1 text-xs text-[#5f5e5e]">
                  {review.reviewer} • Variant: {review.variantLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#181c1f]">
                  {review.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    items: cartItems,
    updateQty,
    removeItem,
    clearCart,
    addItem,
  } = useCart();
  const {
  items: wishlistSource,
  removeItem: removeWishlistItem,
} = useWishlist();

  const ordersQuery = useOrders({ per_page: 30 });
  const requestedTab = searchParams.get("tab");
  const activeTab = tabs.some((tab) => tab.key === requestedTab)
    ? requestedTab
    : "cart";
  const selectedOrderId = searchParams.get("orderId");
  const [sortBy, setSortBy] = useState("latest");
  const [voucherCode, setVoucherCode] = useState(
    location.state?.voucherCode || "",
  );
  const sortedCartItems = useMemo(
    () => sortByOption(cartItems, sortBy),
    [cartItems, sortBy],
  );
  const wishlistItems = useMemo(
    () => sortByOption(wishlistSource, sortBy),
    [sortBy, wishlistSource],
  );
  const orderItems = useMemo(() => {
    const labels = {
      pending: "Menunggu Pembayaran",
      processing: "Diproses",
      shipped: "Dikirim",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return sortByOption(
      (ordersQuery.data?.data || []).map((order) => {
        const firstItem =
          order.items[0] || order.subOrders[0]?.items?.[0] || {};
        return {
          id: order.orderNumber,
          orderId: order.id,
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("id-ID")
            : "-",
          storeName:
            firstItem.storeName || order.subOrders[0]?.storeName || "Toko",
          status: labels[order.status] || order.status,
          productName: firstItem.productName || "Pesanan",
          variantLabel: firstItem.variantLabel || firstItem.sku || "-",
          quantity:
            firstItem.quantity ||
            order.items.reduce((sum, item) => sum + item.quantity, 0),
          total: order.grandTotal,
          imageUrl: firstItem.imageUrl || "",
        };
      }),
      sortBy,
    );
  }, [ordersQuery.data?.data, sortBy]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const changeTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    if (tab !== "order") next.delete("orderId");
    setSearchParams(next, { replace: true });
  };

  const openOrderDetail = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", "order");
    next.set("orderId", String(id));
    setSearchParams(next);
  };

  const closeOrderDetail = () => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", "order");
    next.delete("orderId");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setSelectedKeys((current) => {
      const available = sortedCartItems.map(getItemKey);
      const retained = current.filter((key) => available.includes(key));
      return retained.length ? retained : available;
    });
  }, [sortedCartItems]);

  const selectedItems = sortedCartItems.filter((item) =>
    selectedKeys.includes(getItemKey(item)),
  );
  const selectedCount = selectedItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0,
  );
  const goCheckout = () =>
    navigate("/checkout", {
      state: {
        cartItemIds: selectedItems
          .map((item) => item.cartItemId)
          .filter(Boolean),
        voucherCode,
      },
    });

  const handleToggleAll = () => {
    setSelectedKeys((current) =>
      current.length === sortedCartItems.length
        ? []
        : sortedCartItems.map(getItemKey),
    );
  };

  const handleToggleStore = (storeItems) => {
    const storeKeys = storeItems.map(getItemKey);
    const allChecked = storeKeys.every((key) => selectedKeys.includes(key));
    setSelectedKeys((current) =>
      allChecked
        ? current.filter((key) => !storeKeys.includes(key))
        : Array.from(new Set([...current, ...storeKeys])),
    );
  };

  const handleToggleItem = (itemKey) => {
    setSelectedKeys((current) =>
      current.includes(itemKey)
        ? current.filter((key) => key !== itemKey)
        : [...current, itemKey],
    );
  };

  const handleDecrease = (item) => {
    const nextQty = (item.quantity || 1) - 1;
    if (nextQty <= 0) removeItem(item.productId, item.variantId);
    else updateQty(item.productId, item.variantId, nextQty);
  };

  const handleIncrease = (item) => {
    updateQty(
      item.productId,
      item.variantId,
      Math.min(item.stock || Number.MAX_SAFE_INTEGER, (item.quantity || 1) + 1),
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#181c1f]">
      <main className="mx-auto max-w-[1280px] px-5 py-6">
        <TabNavigation activeTab={activeTab} onChange={changeTab} />

        <section className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeader
            title="Aktivitas Ziip"
            description="Kelola wishlist, cart, order, dan review dalam satu layout utama yang mengikuti referensi HTML."
          />
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </section>

        <div className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
              {activeTab === "wishlist" ? (
  <WishlistTab
    items={wishlistItems}
    onAddToCart={(item) =>
      addItem({
        productId: item.productId,
        variantId: item.variantId,
        quantity: 1,
      })
    }
    onRemoveFromWishlist={(item) =>
      removeWishlistItem(item.productId)
    }
  />
) : null}
          {activeTab === "cart" ? (
            <CartTab
              items={sortedCartItems}
              selectedKeys={selectedKeys}
              onToggleAll={handleToggleAll}
              onToggleStore={handleToggleStore}
              onToggleItem={handleToggleItem}
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              onRemove={(item) => removeItem(item.productId, item.variantId)}
              onClear={clearCart}
              onCheckout={goCheckout}
              voucherCode={voucherCode}
              onVoucherCodeChange={setVoucherCode}
            />
          ) : null}
          {activeTab === "order" ? (
            selectedOrderId ? (
              <OrderDetailPanel
                orderId={selectedOrderId}
                onBack={closeOrderDetail}
                paymentNotice={
                  location.state?.paymentError ||
                  (location.state?.orderCreated
                    ? "Pesanan berhasil dibuat dan tersimpan."
                    : "")
                }
              />
            ) : (
              <OrderTab items={orderItems} onOpen={openOrderDetail} />
            )
          ) : null}
          {activeTab === "review" ? <ReviewTab items={[]} /> : null}
        </div>

        {activeTab === "cart" && sortedCartItems.length ? (
          <div className="mt-6 lg:hidden">
            <button
              type="button"
              disabled={!selectedCount}
              onClick={goCheckout}
              className="w-full rounded-xl bg-[#10B981] py-5 text-2xl font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
