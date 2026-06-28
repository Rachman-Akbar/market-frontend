"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Truck, CreditCard, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cartContext";
import { mockAddresses, shippingOptions } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import type { Address, ShippingOption } from "@/lib/types";
import Link from "next/link";

type Step = "address" | "shipping" | "payment" | "review";

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: "address", label: "Alamat", icon: <MapPin size={16} /> },
  { key: "shipping", label: "Pengiriman", icon: <Truck size={16} /> },
  { key: "payment", label: "Pembayaran", icon: <CreditCard size={16} /> },
  { key: "review", label: "Review", icon: <ShoppingBag size={16} /> },
];

const PAYMENT_METHODS = [
  { id: "transfer-bca", label: "Transfer Bank BCA", icon: "🏦" },
  { id: "transfer-mandiri", label: "Transfer Bank Mandiri", icon: "🏦" },
  { id: "gopay", label: "GoPay", icon: "💚" },
  { id: "ovo", label: "OVO", icon: "💜" },
  { id: "dana", label: "DANA", icon: "💙" },
  { id: "cod", label: "Bayar di Tempat (COD)", icon: "💵" },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<Address>(mockAddresses[0]);
  const [shipping, setShipping] = useState<ShippingOption>(shippingOptions[0]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id);
  const [newAddr, setNewAddr] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Keranjang kosong</h2>
        <Link href="/"><Button className="mt-4">Kembali Belanja</Button></Link>
      </div>
    );
  }

  const total = subtotal + shipping.price;
  const currentStepIdx = STEPS.findIndex((s) => s.key === step);
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;

  const handleConfirmOrder = () => {
    clearCart();
    router.push(`/orders/${orderId}?total=${total}&payment=${payment}&shipping=${shipping.courier} ${shipping.service}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              i < currentStepIdx ? "bg-green-100 text-green-600" : i === currentStepIdx ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
            }`}>
              {i < currentStepIdx ? <CheckCircle size={14} /> : s.icon}
              <span className="hidden sm:inline font-medium">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 min-w-[20px] ${i < currentStepIdx ? "bg-green-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form area */}
        <div className="lg:col-span-2 space-y-4">

          {/* Step: Address */}
          {step === "address" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-orange-500" />Pilih Alamat Pengiriman</h2>
              <div className="space-y-3">
                {mockAddresses.map((addr) => (
                  <label key={addr.id} className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${address.id === addr.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                    <input type="radio" className="mt-1 accent-orange-500" checked={address.id === addr.id} onChange={() => setAddress(addr)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-800">{addr.recipientName}</p>
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Utama</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                    </div>
                  </label>
                ))}

                {newAddr ? (
                  <div className="border-2 border-dashed border-orange-300 rounded-xl p-4 space-y-3">
                    <p className="font-medium text-sm text-gray-700">Tambah Alamat Baru (Demo)</p>
                    <Input placeholder="Nama penerima" />
                    <Input placeholder="Nomor HP" />
                    <Input placeholder="Alamat lengkap" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Kota" />
                      <Input placeholder="Kode pos" />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setNewAddr(false)}>Batal</Button>
                  </div>
                ) : (
                  <button onClick={() => setNewAddr(true)} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-3 text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition">
                    + Tambah Alamat Baru
                  </button>
                )}
              </div>
              <Button className="w-full mt-4" onClick={() => setStep("shipping")}>Pilih Pengiriman →</Button>
            </div>
          )}

          {/* Step: Shipping */}
          {step === "shipping" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Truck size={18} className="text-orange-500" />Pilih Metode Pengiriman</h2>
              <div className="space-y-2">
                {shippingOptions.map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${shipping.id === opt.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                    <input type="radio" className="accent-orange-500" checked={shipping.id === opt.id} onChange={() => setShipping(opt)} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{opt.courier} — {opt.service}</p>
                      <p className="text-xs text-gray-500">{opt.estimatedDays}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-800">{formatPrice(opt.price)}</p>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep("address")} className="flex-1">← Kembali</Button>
                <Button onClick={() => setStep("payment")} className="flex-1">Pilih Pembayaran →</Button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === "payment" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-orange-500" />Metode Pembayaran</h2>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${payment === m.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                    <input type="radio" className="accent-orange-500" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                    <span>{m.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep("shipping")} className="flex-1">← Kembali</Button>
                <Button onClick={() => setStep("review")} className="flex-1">Review Pesanan →</Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingBag size={18} className="text-orange-500" />Review Pesanan</h2>

              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-gray-700">📍 Alamat</p>
                <p className="text-gray-600">{address.recipientName} · {address.phone}</p>
                <p className="text-gray-600">{address.street}, {address.city}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">🚚 Pengiriman: <span className="font-normal">{shipping.courier} {shipping.service} — {shipping.estimatedDays}</span></p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">💳 Pembayaran: <span className="font-normal">{PAYMENT_METHODS.find(m => m.id === payment)?.label}</span></p>
              </div>

              <div>
                <p className="font-medium text-sm text-gray-700 mb-2">Produk ({items.length} item)</p>
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm text-gray-600 py-1.5 border-b border-gray-100 last:border-0">
                    <span className="line-clamp-1 flex-1">{item.productName} <span className="text-gray-400">({item.variantLabel}) x{item.quantity}</span></span>
                    <span className="font-medium ml-4 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("payment")} className="flex-1">← Kembali</Button>
                <Button onClick={handleConfirmOrder} className="flex-1 bg-green-600 hover:bg-green-700">
                  ✓ Buat Pesanan — {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-24">
          <h3 className="font-bold text-gray-800 mb-3">Ringkasan</h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir ({shipping.courier})</span><span>{formatPrice(shipping.price)}</span>
            </div>
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
