import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/shared/utils/utils";

function getItemKey(item) {
  return `${item.productId}-${item.variantId || "default"}`;
}

export function CartItemRow({ item, checked, onToggle, onDecrease, onIncrease, onRemove }) {
  const itemKey = getItemKey(item);
  const stock = item.stock ?? item.availableStock ?? null;

  return (
    <div className="flex gap-4 py-4 group">
      <div className="flex items-start pt-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(itemKey)}
          className="h-5 w-5 rounded border-[#6d7b6e] text-[#006d38] focus:ring-[#00aa5b]"
        />
      </div>

      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#f1f4f8]">
        {item.imageUrl || item.image ? (
          <img
            src={item.imageUrl || item.image}
            alt={item.productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8b9490]">
            <ShoppingBag size={32} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-[#181c1f]">
            {item.productName}
          </h3>
          <p className="mt-1 text-sm leading-5 text-[#5f5e5e]">
            Variant: {item.variantLabel || "Default"}
          </p>
          {stock !== null && stock <= 3 ? (
            <span className="mt-1 inline-block text-xs font-bold text-[#ba1a1a]">
              Sisa {stock} stok
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <span className="text-xl font-bold leading-6 text-[#006d38]">
            {formatPrice(item.price)}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-[#bccabc] bg-[#f1f4f8] p-1">
              <button
                type="button"
                onClick={() => onDecrease(item)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#005229] transition hover:bg-[#ebeef2]"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[48px] px-3 text-center text-sm font-bold text-[#181c1f]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease(item)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#005229] transition hover:bg-[#ebeef2]"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#ba1a1a] transition hover:bg-[#ffdad6]"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 text-right md:block">
        <p className="text-sm font-bold text-[#181c1f]">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
