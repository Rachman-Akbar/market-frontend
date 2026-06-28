"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/store/cartContext";
import { CartItemRow } from "@/features/cart/CartItemRow";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const shippingEst = 18000;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Keranjang kosong</h2>
        <p className="text-gray-400 mt-2 mb-6">Yuk, tambahkan produk favoritmu!</p>
        <Link href="/"><Button>Mulai Belanja</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/"><ArrowLeft size={20} className="text-gray-600 hover:text-orange-500" /></Link>
        <h1 className="text-xl font-bold text-gray-800">Keranjang Belanja</h1>
        <span className="text-sm text-gray-500">({items.length} item)</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-6">
          {/* Group by store */}
          {(() => {
            const storeGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
              acc[item.storeName] = [...(acc[item.storeName] ?? []), item];
              return acc;
            }, {});
            return Object.entries(storeGroups).map(([storeName, storeItems], gi) => (
              <div key={storeName}>
                {gi > 0 && <Separator />}
                <p className="text-xs font-semibold text-gray-500 py-3 flex items-center gap-1.5">🏪 {storeName}</p>
                {storeItems.map((item, idx) => (
                  <div key={`${item.productId}-${item.variantId}`}>
                    {idx > 0 && <Separator />}
                    <CartItemRow item={item} idx={idx} />
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-24">
          <h2 className="font-bold text-gray-800 mb-4">Ringkasan Belanja</h2>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Harga ({items.reduce((s, i) => s + i.quantity, 0)} barang)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimasi Ongkir</span>
              <span>{formatPrice(shippingEst)}</span>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-gray-800">
            <span>Total Belanja</span>
            <span className="text-orange-500">{formatPrice(subtotal + shippingEst)}</span>
          </div>

          <Button className="w-full mt-4" size="lg" onClick={() => router.push("/checkout")}>
            Beli ({items.length})
          </Button>
          <Button variant="ghost" size="sm" className="w-full mt-2 text-red-400 hover:text-red-600" onClick={clearCart}>
            Kosongkan Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}
