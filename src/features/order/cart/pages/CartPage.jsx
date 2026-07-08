import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/features/order/cart/context/CartContext";
import { CartItemRow } from "@/features/order/cart/components/CartItemRow";
import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";
import { formatPrice } from "@/shared/utils/utils";

export default function CartPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const shippingEst = 18000;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Keranjang kosong</h2>
        <p className="text-gray-400 mt-2 mb-6">Yuk, tambahkan produk favoritmu!</p>
        <Link to="/"><Button>Mulai Belanja</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/"><ArrowLeft size={20} className="text-gray-600 hover:text-orange-500" /></Link>
        <h1 className="text-xl font-bold text-gray-800">Keranjang Belanja</h1>
        <span className="text-sm text-gray-500">({items.length} item)</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-6">
          
          {(() => {
            const storeGroups = items.reduce((acc, item) => {
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

          <Button className="w-full mt-4" size="lg" onClick={() => navigate("/checkout")}>
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
