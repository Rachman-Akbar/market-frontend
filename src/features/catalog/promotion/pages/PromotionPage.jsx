import { useEffect, useState } from "react";
import { PromotionHighlightCard } from "@/features/catalog/promotion/components/PromotionHighlightCard";
import { getPromotionHighlights } from "@/features/catalog/promotion/services/promotionService";

export default function PromotionPage() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    getPromotionHighlights().then(setPromotions);
  }, []);

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#03ac0e]">Promo pilihan</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#1b1c1c]">Promo, voucher, dan campaign terbaru</h1>
          <p className="mt-1 text-sm text-[#3e4a39]">Halaman promosi marketplace dengan dummy data yang siap diganti API.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promotions.map((promotion) => (
          <PromotionHighlightCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </main>
  );
}
