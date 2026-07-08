import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/features/order/cart/context/CartContext";
import { formatPrice } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/Button";

const COLORS = ["bg-orange-100", "bg-blue-100", "bg-green-100", "bg-purple-100", "bg-pink-100"];

export function CartItemRow({ item, idx }) {
  const { updateQty, removeItem } = useCart();
  const bg = COLORS[idx % COLORS.length];

  return (
    <div className="flex gap-4 py-4">
      <div className={`${bg} w-20 h-20 rounded-lg shrink-0 flex items-center justify-center`}>
        <ShoppingBag size={28} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.productName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{item.variantLabel} • {item.storeName}</p>
        <p className="text-orange-500 font-bold mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button onClick={() => item.quantity > 1 ? updateQty(item.productId, item.variantId, item.quantity - 1) : removeItem(item.productId, item.variantId)} className="px-2.5 py-1.5 hover:bg-gray-100">
              <Minus size={12} />
            </button>
            <span className="px-3 py-1.5 text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
            <button onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-100">
              <Plus size={12} />
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeItem(item.productId, item.variantId)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  );
}
