import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Banknote,
  CreditCard,
  Info,
  Landmark,
  MapPin,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { useCart } from "@/features/order/cart/context/CartContext";
import { useAddresses } from "@/features/profile/address/addressService";
import InstantAddressModal from "@/features/profile/address/components/InstantAddressModal";
import {
  getOrderError,
  isDestinationShippingOption,
  useCreateOrder,
  useShippingOptions,
} from "@/features/order/ordering/orderService";
import { openMidtransPayment } from "@/features/order/ordering/midtransService";
import VoucherSearchSelect from "@/features/order/voucher/components/VoucherSearchSelect";
import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";
import { formatPrice } from "@/shared/utils/utils";

const PAYMENT_METHODS = [
  { id: "midtrans", label: "Midtrans", icon: Landmark },
  { id: "cod", label: "Bayar di Tempat", icon: Banknote },
  { id: "transfer_manual", label: "Transfer Manual", icon: CreditCard },
  { id: "tunai_toko", label: "Bayar Tunai di Toko", icon: Store },
];

const PICKUP_OPTION = {
  id: "ambil_sendiri:pickup",
  courier: "ambil_sendiri",
  courier_label: "Ambil Sendiri",
  service: "PICKUP",
  description: "Ambil pesanan langsung di toko tanpa biaya pengiriman.",
  cost: 0,
  price: 0,
};

function formatAddress(address) {
  return [
    address.fullAddress,
    address.subdistrict,
    address.district,
    address.cityOrRegency,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function shippingKey(option) {
  return `${String(option.courier || "").toLowerCase()}:${String(
    option.service || "",
  ).toLowerCase()}:${Number(option.price || option.cost || 0)}`;
}

function mergeShippingOptions(remoteOptions, hasDestinationId) {
  const visibleRemote = remoteOptions.filter(
    (option) => hasDestinationId || !isDestinationShippingOption(option),
  );
  const rows = [PICKUP_OPTION, ...visibleRemote];
  const keys = new Set();

  return rows.filter((option) => {
    const key = shippingKey(option);

    if (keys.has(key)) {
      return false;
    }

    keys.add(key);
    return true;
  });
}

function getCreatedOrderRoute(order) {
  if (!order?.id) {
    return "/cart?tab=order";
  }

  return `/cart?tab=order&orderId=${encodeURIComponent(order.id)}`;
}

export default function CheckoutPage() {
  const { items, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const addressesQuery = useAddresses();
  const createOrderMutation = useCreateOrder();
  const [addressId, setAddressId] = useState(null);
  const [shippingId, setShippingId] = useState(PICKUP_OPTION.id);
  const [payment, setPayment] = useState("midtrans");
  const [voucherCode, setVoucherCode] = useState(
    location.state?.voucherCode || "",
  );
  const [error, setError] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const addresses = addressesQuery.data || [];
  const requestedIds = useMemo(
    () =>
      Array.isArray(location.state?.cartItemIds)
        ? location.state.cartItemIds.map(Number).filter(Boolean)
        : [],
    [location.state],
  );
  const selectedItems = useMemo(
    () =>
      requestedIds.length
        ? items.filter((item) => requestedIds.includes(item.cartItemId))
        : items,
    [items, requestedIds],
  );
  const cartItemIds = useMemo(
    () => selectedItems.map((item) => item.cartItemId).filter(Boolean),
    [selectedItems],
  );
  const subtotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );
  const selectedAddress =
    addresses.find((address) => String(address.id) === String(addressId)) ||
    null;
  const shippingQuery = useShippingOptions(
    { addressId, cartItemIds },
    Boolean(addressId && cartItemIds.length),
  );
  const hasDestinationId = Boolean(selectedAddress?.komerceDestinationId);
  const shippingOptions = useMemo(
    () => mergeShippingOptions(shippingQuery.data || [], hasDestinationId),
    [hasDestinationId, shippingQuery.data],
  );
  const shipping =
    shippingOptions.find(
      (option) => String(option.id) === String(shippingId),
    ) || shippingOptions[0];
  const availablePaymentMethods = useMemo(() => {
    if (shipping?.courier === "ambil_sendiri") {
      return PAYMENT_METHODS.filter((method) => method.id !== "cod");
    }

    return PAYMENT_METHODS.filter((method) => method.id !== "tunai_toko");
  }, [shipping?.courier]);

  useEffect(() => {
    if (!addresses.length || addressId) {
      return;
    }

    const primary =
      addresses.find((address) => address.isPrimary) || addresses[0];
    setAddressId(primary.id);
  }, [addressId, addresses]);

  useEffect(() => {
    if (
      shippingOptions.some((option) => String(option.id) === String(shippingId))
    ) {
      return;
    }

    setShippingId(String(shippingOptions[0]?.id || PICKUP_OPTION.id));
  }, [shippingId, shippingOptions]);

  useEffect(() => {
    if (availablePaymentMethods.some((method) => method.id === payment)) {
      return;
    }

    setPayment(availablePaymentMethods[0]?.id || "midtrans");
  }, [availablePaymentMethods, payment]);

  if (selectedItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-600">Keranjang kosong</h2>
        <p className="mt-2 text-sm text-slate-500">
          Produk yang sudah menjadi pesanan dapat dilihat pada tab Order.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link to="/">
            <Button variant="outline">Kembali Belanja</Button>
          </Link>
          <Link to="/cart?tab=order">
            <Button>Lihat Order</Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingPrice = Number(shipping?.price || shipping?.cost || 0);
  const total = subtotal + shippingPrice;

  const handleConfirmOrder = async () => {
    if (!shipping) {
      setError("Pilih layanan pengiriman terlebih dahulu.");
      return;
    }

    if (shipping.courier !== "ambil_sendiri" && !addressId) {
      setError("Pilih alamat pengiriman untuk layanan kurir.");
      return;
    }

    if (payment === "tunai_toko" && shipping.courier !== "ambil_sendiri") {
      setError(
        "Bayar tunai di toko hanya tersedia untuk metode ambil sendiri.",
      );
      return;
    }

    let order;

    try {
      setError("");
      order = await createOrderMutation.mutateAsync({
        addressId,
        cartItemIds,
        courier: shipping.courier,
        service: shipping.service,
        paymentMethod: payment,
        voucherCode,
      });
    } catch (requestError) {
      setError(getOrderError(requestError));
      return;
    }

    refreshCart().catch(() => null);

    const orderRoute = getCreatedOrderRoute(order);

    if (payment !== "midtrans") {
      navigate(orderRoute, {
        replace: true,
        state: { orderCreated: true },
      });
      return;
    }

    try {
      await openMidtransPayment(order, {
        onSuccess: () =>
          navigate(orderRoute, {
            replace: true,
            state: { orderCreated: true },
          }),
        onPending: () =>
          navigate(orderRoute, {
            replace: true,
            state: { orderCreated: true },
          }),
        onError: () =>
          navigate(orderRoute, {
            replace: true,
            state: {
              orderCreated: true,
              paymentError:
                "Pembayaran Midtrans belum berhasil. Pesanan tetap tersimpan.",
            },
          }),
        onClose: () =>
          navigate(orderRoute, {
            replace: true,
            state: { orderCreated: true },
          }),
      });
    } catch (paymentError) {
      navigate(orderRoute, {
        replace: true,
        state: {
          orderCreated: true,
          paymentError: paymentError.message,
        },
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#10B981]">
          Checkout
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">
          Selesaikan pesanan dalam satu halaman
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Alamat, pengiriman, pembayaran, dan voucher tampil bersamaan agar
          proses checkout lebih cepat.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <MapPin size={18} className="text-[#10B981]" />
                Alamat Pengiriman
              </h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-[#047857] hover:text-[#10B981]"
              >
                + Tambah Alamat
              </button>
            </div>

            {addressesQuery.isLoading ? (
              <p className="mt-4 text-sm text-slate-500">Memuat alamat...</p>
            ) : null}

            {!addressesQuery.isLoading && !addresses.length ? (
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 transition hover:border-[#10B981] hover:text-[#047857]"
              >
                Tambahkan alamat untuk menggunakan pengiriman Haversine
              </button>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    String(addressId) === String(address.id)
                      ? "border-[#10B981] bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      className="mt-1 accent-[#10B981]"
                      checked={String(addressId) === String(address.id)}
                      onChange={() => setAddressId(address.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-sm text-slate-900">
                          {address.recipientName}
                        </p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#047857] ring-1 ring-emerald-100">
                          {address.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {address.phoneNumber}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
                        {formatAddress(address)}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <Truck size={18} className="text-[#10B981]" />
              Metode Pengiriman
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Semua metode yang valid ditampilkan bersamaan.
            </p>

            {selectedAddress && !hasDestinationId ? (
              <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>
                  Komerce Destination ID belum tersedia. Ambil Sendiri dan
                  Haversine tetap dapat digunakan, sedangkan layanan RajaOngkir
                  disembunyikan.
                </span>
              </div>
            ) : null}

            {shippingQuery.error ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                Ongkir kurir belum dapat dihitung. Metode Ambil Sendiri tetap
                tersedia.
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    String(shipping?.id) === String(option.id)
                      ? "border-[#10B981] bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="radio"
                    className="accent-[#10B981]"
                    checked={String(shipping?.id) === String(option.id)}
                    onChange={() => setShippingId(String(option.id))}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {option.courier_label ||
                        String(option.courier || "").toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-600">
                      {option.service}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">
                      {option.description ||
                        "Estimasi mengikuti layanan pengiriman"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-[#047857]">
                    {formatPrice(Number(option.price || option.cost || 0))}
                  </p>
                </label>
              ))}

              {shippingQuery.isLoading && addressId ? (
                <div className="flex min-h-[108px] items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center text-xs text-slate-500">
                  Menghitung seluruh pengiriman yang valid...
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <CreditCard size={18} className="text-[#10B981]" />
              Metode Pembayaran
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {availablePaymentMethods.map((method) => {
                const Icon = method.icon;

                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      payment === method.id
                        ? "border-[#10B981] bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      className="accent-[#10B981]"
                      checked={payment === method.id}
                      onChange={() => setPayment(method.id)}
                    />
                    <Icon size={18} className="text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">
                      {method.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <ShoppingBag size={18} className="text-[#10B981]" />
              Produk dan Voucher
            </h2>
            <div className="mt-4 divide-y divide-slate-100">
              {selectedItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
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
                    <p className="line-clamp-2 text-sm font-bold text-slate-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.variantLabel || "Varian utama"} ×{item.quantity}
                    </p>
                  </div>
                  <strong className="shrink-0 text-sm text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <VoucherSearchSelect
                value={voucherCode}
                onChange={setVoucherCode}
                label="Cari dan pilih voucher"
              />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
          <h3 className="font-black text-slate-900">Ringkasan Pesanan</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-3">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Ongkir</span>
              <span>{formatPrice(shippingPrice)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Pengiriman</span>
              <span className="text-right font-semibold text-slate-800">
                {shipping?.courier_label || shipping?.courier}{" "}
                {shipping?.service}
              </span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between gap-4">
            <span className="font-black text-slate-900">Total</span>
            <span className="text-xl font-black text-[#047857]">
              {formatPrice(total)}
            </span>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600">
              {error}
            </div>
          ) : null}

          <Button
            disabled={createOrderMutation.isPending || !shipping}
            onClick={handleConfirmOrder}
            className="mt-5 w-full"
          >
            {createOrderMutation.isPending
              ? "Membuat Pesanan..."
              : payment === "midtrans"
                ? "Buat Pesanan & Bayar"
                : "Buat Pesanan"}
          </Button>
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
            Pesanan tetap tersimpan jika popup pembayaran Midtrans ditutup atau
            gagal dimuat.
          </p>
        </aside>
      </div>

      <InstantAddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        defaultPrimary={addresses.length === 0}
        onCreated={(address) => {
          setAddressId(address.id);
          setShowAddressModal(false);
        }}
      />
    </div>
  );
}
