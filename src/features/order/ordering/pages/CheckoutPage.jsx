import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Truck, CreditCard, ShoppingBag, Landmark, Banknote, Store } from "lucide-react";
import { useCart } from "@/features/order/cart/context/CartContext";
import { useAddresses } from "@/features/profile/address/addressService";
import { getOrderError, useCreateOrder, useShippingOptions } from "@/features/order/ordering/orderService";
import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";
import { formatPrice } from "@/shared/utils/utils";

const STEPS = [
  { key: "address", label: "Alamat", icon: <MapPin size={16} /> },
  { key: "shipping", label: "Pengiriman", icon: <Truck size={16} /> },
  { key: "payment", label: "Pembayaran", icon: <CreditCard size={16} /> },
  { key: "review", label: "Review", icon: <ShoppingBag size={16} /> },
];

const PAYMENT_METHODS = [
  { id: "midtrans", label: "Midtrans", icon: Landmark },
  { id: "cod", label: "Bayar di Tempat", icon: Banknote },
  { id: "transfer_manual", label: "Transfer Manual", icon: CreditCard },
  { id: "tunai_toko", label: "Bayar Tunai di Toko", icon: Store },
];

let snapScriptPromise = null;

function loadSnapScript() {
  if (window.snap) return Promise.resolve(window.snap);
  if (snapScriptPromise) return snapScriptPromise;

  const clientKey = String(import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "").trim();
  if (!clientKey) return Promise.reject(new Error("VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi."));
  const production = String(import.meta.env.VITE_MIDTRANS_IS_PRODUCTION || "false") === "true";
  const src = production ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";

  snapScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (clientKey) script.dataset.clientKey = clientKey;
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error("Midtrans Snap gagal dimuat."));
    document.head.appendChild(script);
  });

  return snapScriptPromise;
}

function formatAddress(address) {
  return [address.fullAddress, address.subdistrict, address.district, address.cityOrRegency, address.province, address.postalCode]
    .filter(Boolean)
    .join(", ");
}

export default function CheckoutPage() {
  const { items, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const addressesQuery = useAddresses();
  const createOrderMutation = useCreateOrder();
  const [step, setStep] = useState("address");
  const [addressId, setAddressId] = useState(null);
  const [shippingId, setShippingId] = useState("");
  const [payment, setPayment] = useState("midtrans");
  const [voucherCode, setVoucherCode] = useState(location.state?.voucherCode || "");
  const [error, setError] = useState("");
  const addresses = addressesQuery.data || [];
  const requestedIds = useMemo(() => Array.isArray(location.state?.cartItemIds) ? location.state.cartItemIds.map(Number).filter(Boolean) : [], [location.state]);
  const selectedItems = useMemo(() => requestedIds.length ? items.filter((item) => requestedIds.includes(item.cartItemId)) : items, [items, requestedIds]);
  const cartItemIds = useMemo(() => selectedItems.map((item) => item.cartItemId).filter(Boolean), [selectedItems]);
  const subtotal = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [selectedItems]);
  const selectedAddress = addresses.find((address) => address.id === addressId) || null;
  const shippingQuery = useShippingOptions({ addressId, cartItemIds }, step !== "address");
  const shippingOptions = useMemo(() => {
    const remoteOptions = shippingQuery.data || [];
    if (remoteOptions.some((option) => option.courier === "ambil_sendiri")) return remoteOptions;
    return [
      ...remoteOptions,
      {
        id: "ambil_sendiri:pickup",
        courier: "ambil_sendiri",
        courier_label: "Ambil Sendiri",
        service: "PICKUP",
        description: "Ambil pesanan langsung di toko.",
        cost: 0,
        price: 0,
      },
    ];
  }, [shippingQuery.data]);
  const shipping = shippingOptions.find((option) => String(option.id) === String(shippingId)) || shippingOptions[0] || null;
  const availablePaymentMethods = useMemo(() => {
    if (shipping?.courier === "ambil_sendiri") {
      return PAYMENT_METHODS.filter((method) => method.id !== "cod");
    }
    return PAYMENT_METHODS.filter((method) => method.id !== "tunai_toko");
  }, [shipping?.courier]);

  useEffect(() => {
    if (!addresses.length || addressId) return;
    const primary = addresses.find((address) => address.isPrimary) || addresses[0];
    setAddressId(primary.id);
  }, [addressId, addresses]);

  useEffect(() => {
    if (!shippingOptions.length) return;
    if (!shippingOptions.some((option) => String(option.id) === String(shippingId))) {
      setShippingId(String(shippingOptions[0].id));
    }
  }, [shippingId, shippingOptions]);

  useEffect(() => {
    if (availablePaymentMethods.some((method) => method.id === payment)) return;
    setPayment(availablePaymentMethods[0]?.id || "midtrans");
  }, [availablePaymentMethods, payment]);

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Keranjang kosong</h2>
        <Link to="/"><Button className="mt-4">Kembali Belanja</Button></Link>
      </div>
    );
  }

  const shippingPrice = Number(shipping?.price || shipping?.cost || 0);
  const total = subtotal + shippingPrice;
  const currentStepIdx = STEPS.findIndex((item) => item.key === step);

  const handleContinueShipping = () => {
    setError("");
    setStep("shipping");
  };

  const openMidtrans = async (order) => {
    if (!order.snapToken) {
      navigate(`/orders/${order.id}`);
      return;
    }

    const snap = await loadSnapScript();
    snap.pay(order.snapToken, {
      onSuccess: async () => {
        await refreshCart();
        navigate(`/orders/${order.id}`);
      },
      onPending: () => navigate(`/orders/${order.id}`),
      onError: () => navigate(`/orders/${order.id}`),
      onClose: () => navigate(`/orders/${order.id}`),
    });
  };

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
      setError("Bayar tunai di toko hanya tersedia untuk metode ambil sendiri.");
      return;
    }

    try {
      setError("");
      const order = await createOrderMutation.mutateAsync({
        addressId,
        cartItemIds,
        courier: shipping.courier,
        service: shipping.service,
        paymentMethod: payment,
        voucherCode,
      });

      if (payment === "midtrans") {
        await openMidtrans(order);
        return;
      }

      await refreshCart();
      navigate(`/orders/${order.id}`);
    } catch (requestError) {
      setError(getOrderError(requestError));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex items-center mb-8">
        {STEPS.map((item, index) => (
          <div key={item.key} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${index < currentStepIdx ? "bg-green-100 text-green-600" : index === currentStepIdx ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
              {index < currentStepIdx ? <CheckCircle size={14} /> : item.icon}
              <span className="hidden sm:inline font-medium">{item.label}</span>
            </div>
            {index < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 min-w-[20px] ${index < currentStepIdx ? "bg-green-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {step === "address" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-orange-500" />Pilih Alamat Pengiriman</h2>
              {addressesQuery.isLoading ? <p className="text-sm text-gray-500">Memuat alamat...</p> : null}
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label key={address.id} className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${addressId === address.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                    <input type="radio" className="mt-1 accent-orange-500" checked={addressId === address.id} onChange={() => setAddressId(address.id)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-800">{address.recipientName}</p>
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{address.label}</span>
                        {address.isPrimary ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Utama</span> : null}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{address.phoneNumber}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{formatAddress(address)}</p>
                    </div>
                  </label>
                ))}
                <button type="button" onClick={() => navigate("/profile/addresses")} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-3 text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition">
                  + Tambah Alamat Baru
                </button>
              </div>
              {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
              <Button className="w-full mt-4" onClick={handleContinueShipping}>Pilih Pengiriman →</Button>
            </div>
          )}

          {step === "shipping" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Truck size={18} className="text-orange-500" />Pilih Metode Pengiriman</h2>
              {shippingQuery.isLoading ? <p className="text-sm text-gray-500">Menghitung ongkir...</p> : null}
              {shippingQuery.error ? <p className="text-sm text-red-500">{getOrderError(shippingQuery.error)}</p> : null}
              <div className="space-y-2">
                {shippingOptions.map((option) => (
                  <label key={option.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${String(shipping?.id) === String(option.id) ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                    <input type="radio" className="accent-orange-500" checked={String(shipping?.id) === String(option.id)} onChange={() => setShippingId(String(option.id))} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{option.courier_label || String(option.courier || "").toUpperCase()} — {option.service}</p>
                      <p className="text-xs text-gray-500">{option.description || option.estimated_days || option.etd || "Estimasi mengikuti layanan kurir"}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-800">{formatPrice(Number(option.price || option.cost || 0))}</p>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep("address")} className="flex-1">← Kembali</Button>
                <Button disabled={!shipping} onClick={() => setStep("payment")} className="flex-1">Pilih Pembayaran →</Button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-orange-500" />Metode Pembayaran</h2>
              <div className="grid grid-cols-2 gap-2">
                {availablePaymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label key={method.id} className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${payment === method.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                      <input type="radio" className="accent-orange-500" checked={payment === method.id} onChange={() => setPayment(method.id)} />
                      <Icon size={17} />
                      <span className="text-sm font-medium text-gray-700">{method.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep("shipping")} className="flex-1">← Kembali</Button>
                <Button onClick={() => setStep("review")} className="flex-1">Review Pesanan →</Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingBag size={18} className="text-orange-500" />Review Pesanan</h2>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-gray-700">Alamat</p>
                <p className="text-gray-600">{selectedAddress?.recipientName} · {selectedAddress?.phoneNumber}</p>
                <p className="text-gray-600">{selectedAddress ? formatAddress(selectedAddress) : ""}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">Pengiriman: <span className="font-normal">{shipping?.courier_label || shipping?.courier} {shipping?.service}</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">Pembayaran: <span className="font-normal">{availablePaymentMethods.find((method) => method.id === payment)?.label}</span></p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-700 mb-2">Produk ({selectedItems.length} item)</p>
                {selectedItems.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm text-gray-600 py-1.5 border-b border-gray-100 last:border-0">
                    <span className="line-clamp-1 flex-1">{item.productName} <span className="text-gray-400">({item.variantLabel}) x{item.quantity}</span></span>
                    <span className="font-medium ml-4 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">Kode Voucher</span>
                <input value={voucherCode} onChange={(event) => setVoucherCode(event.target.value.toUpperCase())} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" placeholder="Masukkan kode voucher" />
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("payment")} className="flex-1">← Kembali</Button>
                <Button disabled={createOrderMutation.isPending} onClick={handleConfirmOrder} className="flex-1 bg-green-600 hover:bg-green-700">
                  {createOrderMutation.isPending ? "Memproses..." : `Buat Pesanan — ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-24">
          <h3 className="font-bold text-gray-800 mb-3">Ringkasan</h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Ongkir</span><span>{formatPrice(shippingPrice)}</span></div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-orange-500 text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
