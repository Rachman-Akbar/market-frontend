"use client";
import { useState } from "react";

export function CheckoutSidebar() {
  const [qty, setQty] = useState(1);

  return (
    <div className="sticky border border-gray-200 rounded-xl p-4 shadow-sm top-20">
      <h2 className="font-bold text-sm mb-4">Atur jumlah dan catatan</h2>

      {/* Mini product */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB8NbS_p7HrO3eJ8FhbYlRQy9YbL0KDXkXbz-4KbGSk7j5VWdS5jxfIbgTicaF5FX_-5aPZ-4vZixStkUvFVlcX5xWQjXef9_UiZ_rlGrsma6ou-YEj_Z8X0P-HSGrTr-x8aM3Um0Mn_icio6_2Sj2oGrhBJ0wHedxthMemc0ZQdXCUYg8IZTls5-yFI1fVaVZInTm-s79wv1c4a8ETIfLrczWrVPn1QzK-jAoqEAvu9bHk25P3M_ELiJCNS70SSMBkKIgQSWrsm7m"
          alt="variant"
          className="w-12 h-12 rounded-md object-cover"
        />
        <span className="text-sm text-gray-700 truncate">PHOENIX Citroen, 37</span>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border border-gray-200 rounded-lg h-9">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 text-gray-300 font-bold hover:text-[#03ac0e]"
          >
            -
          </button>
          <input
            type="text"
            value={qty}
            readOnly
            className="w-10 text-center border-none text-sm p-0 focus:ring-0"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-3 text-[#03ac0e] font-bold"
          >
            +
          </button>
        </div>
        <span className="text-sm">
          Stok: <span className="font-bold">49</span>
        </span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Subtotal</span>
        <span className="text-lg font-bold">Rp{(162000 * qty).toLocaleString("id-ID")}</span>
      </div>

      {/* CTA */}
      <div className="space-y-2 mb-6">
        <button className="w-full bg-[#03ac0e] text-white font-bold py-2.5 rounded-lg hover:bg-[#028a0b] transition-colors">
          + Keranjang
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-around items-center text-xs font-bold text-gray-600">
        <button className="flex items-center gap-1.5 hover:text-[#03ac0e]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          Chat
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <button className="flex items-center gap-1.5 hover:text-[#03ac0e]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          Wishlist
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <button className="flex items-center gap-1.5 hover:text-[#03ac0e]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
