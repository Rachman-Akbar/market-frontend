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
  getShippingError,
  isDestinationShippingOption,
  useCreateOrder,
  useShippingOptions,
} from "@/features/order/ordering/orderService";
import { openMidtransPayment } from "@/features/order/ordering/midtransService";
import VoucherSearchSelect from "@/features/order/voucher/components/VoucherSearchSelect";
import { useActiveVouchers } from "@/features/order/voucher/services/voucherService";
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

function mergeShippingOptions(remoteOptions) {
  const rows = [PICKUP_OPTION, ...remoteOptions];
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

function normalizeDirectItem(item = {}) {
  const quantity = Math.max(1, Number(item.quantity || 1));
  const price = Number(item.price || 0);

  return {
    cartItemId: null,
    productId: Number(item.productId ?? item.product_id ?? 0),
    variantId: Number(item.variantId ?? item.variant_id ?? 0),
    productName: item.productName || item.product_name || item.name || "Produk",
    variantLabel: item.variantLabel || item.variant_label || item.sku || "",
    storeId: Number(item.storeId ?? item.store_id ?? 0),
    storeName: item.storeName || item.store_name || "Toko",
    sku: item.sku || "",
    price,
    quantity,
    subtotal: Number(item.subtotal ?? price * quantity),
    stock: Number(item.stock ?? 0),
    imageUrl:
      item.imageUrl || item.image_url || item.image || item.thumbnail || "",
    attributes:
      item.attributes && typeof item.attributes === "object"
        ? item.attributes
        : {},
  };
}

function calculateVoucherDiscount({
  voucher,
  eligibleSubtotal,
  shippingPrice,
}) {
  const subtotalValue = Math.max(0, Number(eligibleSubtotal || 0));
  const shippingValue = Math.max(0, Number(shippingPrice || 0));

  if (!voucher) {
    return {
      discount: 0,
      eligible: false,
      message: "",
    };
  }

  const minimumSpend = Math.max(0, Number(voucher.minSpend || 0));

  if (minimumSpend > 0 && subtotalValue < minimumSpend) {
    return {
      discount: 0,
      eligible: false,
      message: `Minimal belanja ${formatPrice(minimumSpend)} untuk menggunakan voucher ini.`,
    };
  }

  const discountType = String(voucher.discountType || "fixed")
    .trim()
    .toLowerCase();
  const discountValue = Math.max(0, Number(voucher.discountValue || 0));
  const maximumDiscount = Math.max(0, Number(voucher.maxDiscount || 0));
  let discount = 0;

  if (discountType === "free_shipping") {
    discount = shippingValue;
  } else if (discountType === "shipping_percentage") {
    discount = shippingValue * (discountValue / 100);
  } else if (
    discountType === "percentage" ||
    discountType === "percent" ||
    discountType === "persen"
  ) {
    discount = subtotalValue * (discountValue / 100);
  } else {
    discount = discountValue;
  }

  if (maximumDiscount > 0) {
    discount = Math.min(discount, maximumDiscount);
  }

  const maximumApplicableDiscount =
    discountType === "free_shipping" ||
    discountType === "shipping_percentage"
      ? shippingValue
      : subtotalValue;

  discount = Math.min(
    Math.max(0, discount),
    Math.max(0, maximumApplicableDiscount),
  );

  return {
    discount,
    eligible: discount > 0,
    message:
      discount > 0
        ? ""
        : "Voucher belum memberikan potongan untuk pesanan ini.",
  };
}

export default function CheckoutPage() {
  const { items, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const addressesQuery = useAddresses();
  const vouchersQuery = useActiveVouchers();
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
  const directItems = useMemo(
    () =>
      Array.isArray(location.state?.directItems)
        ? location.state.directItems
            .map(normalizeDirectItem)
            .filter((item) => item.productId)
        : [],
    [location.state?.directItems],
  );
  const requestedIds = useMemo(
    () =>
      Array.isArray(location.state?.cartItemIds)
        ? location.state.cartItemIds.map(Number).filter(Boolean)
        : [],
    [location.state?.cartItemIds],
  );
  const selectedItems = useMemo(() => {
    if (directItems.length) {
      return directItems;
    }

    return requestedIds.length
      ? items.filter((item) => requestedIds.includes(item.cartItemId))
      : items;
  }, [directItems, items, requestedIds]);
  const cartItemIds = useMemo(
    () =>
      directItems.length
        ? []
        : selectedItems.map((item) => item.cartItemId).filter(Boolean),
    [directItems.length, selectedItems],
  );
  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [selectedItems],
  );
  const vouchers = vouchersQuery.data || [];
  const selectedVoucher = useMemo(() => {
    const normalizedCode = String(voucherCode || "")
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      return null;
    }

    return (
      vouchers.find(
        (voucher) =>
          String(voucher.code || "")
            .trim()
            .toUpperCase() === normalizedCode,
      ) || null
    );
  }, [voucherCode, vouchers]);
  const voucherEligibleSubtotal = useMemo(() => {
    if (!selectedVoucher?.storeId) {
      return subtotal;
    }

    return selectedItems.reduce((sum, item) => {
      if (String(item.storeId) !== String(selectedVoucher.storeId)) {
        return sum;
      }

      return (
        sum + Number(item.price || 0) * Number(item.quantity || 0)
      );
    }, 0);
  }, [selectedItems, selectedVoucher, subtotal]);
  const selectedAddress =
    addresses.find((address) => String(address.id) === String(addressId)) ||
    null;
  const shippingQuery = useShippingOptions(
    {
      addressId,
      cartItemIds,
      items: directItems,
    },
    Boolean(addressId && (cartItemIds.length || directItems.length)),
  );
  const shippingResult = shippingQuery.data || {};
  const remoteShippingOptions = Array.isArray(shippingResult)
    ? shippingResult
    : Array.isArray(shippingResult.options)
      ? shippingResult.options
      : [];
  const shippingWarnings = Array.isArray(shippingResult.warnings)
    ? shippingResult.warnings.filter(Boolean)
    : [];
  const shippingErrorMessage = shippingQuery.error
    ? getShippingError(shippingQuery.error)
    : "";
  const resolvedCartItemIds = Array.isArray(shippingResult.cartItemIds)
    ? shippingResult.cartItemIds.map(Number).filter(Boolean)
    : [];
  const effectiveCartItemIds = cartItemIds.length
    ? cartItemIds
    : resolvedCartItemIds;
  const destinationValue = String(
    selectedAddress?.komerceDestinationId || "",
  ).trim();
  const hasDestinationId = Boolean(
    destinationValue && destinationValue.toLowerCase() !== "null",
  );
  const shippingOptions = useMemo(
    () => mergeShippingOptions(remoteShippingOptions),
    [remoteShippingOptions],
  );
  const hasRajaOngkirOption = shippingOptions.some((option) =>
    isDestinationShippingOption(option),
  );
  const hasHaversineOption = shippingOptions.some(
    (option) => String(option.courier || "").toLowerCase() === "haversine",
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
  const voucherCalculation = calculateVoucherDiscount({
    voucher: selectedVoucher,
    eligibleSubtotal: voucherEligibleSubtotal,
    shippingPrice,
  });
  const voucherDiscount = voucherCalculation.discount;
  const totalBeforeVoucher = subtotal + shippingPrice;
  const total = Math.max(0, totalBeforeVoucher - voucherDiscount);

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
        cartItemIds: effectiveCartItemIds,
        items: effectiveCartItemIds.length ? [] : directItems,
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

            {selectedAddress &&
            !shippingQuery.isLoading &&
            !hasDestinationId &&
            !hasRajaOngkirOption ? (
              <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>
                  Komerce Destination ID belum tersedia. Haversine tetap dapat
                  digunakan jika koordinat toko dan alamat penerima lengkap.
                </span>
              </div>
            ) : null}

            {shippingWarnings.length ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                {shippingWarnings.join(" ")}
              </div>
            ) : null}

            {shippingQuery.error && shippingErrorMessage ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                {shippingErrorMessage} Metode Ambil Sendiri tetap tersedia.
              </div>
            ) : null}

            {!shippingQuery.isLoading &&
            !shippingQuery.error &&
            !hasHaversineOption &&
            remoteShippingOptions.length > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                Haversine belum tersedia karena koordinat toko atau alamat
                penerima belum lengkap.
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
            {selectedVoucher ? (
              <div className="flex justify-between gap-3">
                <span className="min-w-0">
                  Voucher
                  <span className="ml-1 font-semibold text-slate-800">
                    ({selectedVoucher.code})
                  </span>
                </span>
                <span
                  className={`shrink-0 font-semibold ${
                    voucherDiscount > 0 ? "text-[#047857]" : "text-slate-500"
                  }`}
                >
                  -{formatPrice(voucherDiscount)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <span>Pengiriman</span>
              <span className="text-right font-semibold text-slate-800">
                {shipping?.courier_label || shipping?.courier}{" "}
                {shipping?.service}
              </span>
            </div>
          </div>

          {selectedVoucher && voucherCalculation.message ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
              {voucherCalculation.message}
            </div>
          ) : null}

          {selectedVoucher && voucherDiscount > 0 ? (
            <>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3 text-slate-500">
                  <span>Total sebelum voucher</span>
                  <span>{formatPrice(totalBeforeVoucher)}</span>
                </div>
                <div className="flex justify-between gap-3 font-semibold text-[#047857]">
                  <span>Total penghematan</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              </div>
            </>
          ) : null}

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
