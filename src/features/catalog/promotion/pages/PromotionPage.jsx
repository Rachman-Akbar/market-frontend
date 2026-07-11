import { PromotionHighlightCard } from "@/features/catalog/promotion/components/PromotionHighlightCard";
import { usePromotionHighlights } from "@/features/catalog/promotion/services/promotionService";

export default function PromotionPage() {
  const promotionsQuery = usePromotionHighlights();
  const promotions = promotionsQuery.data || [];

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#03ac0e]">Promo pilihan</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#1b1c1c]">Promo, voucher, dan campaign terbaru</h1>
          <p className="mt-1 text-sm text-[#3e4a39]">Voucher aktif yang tersedia dari backend order.</p>
        </div>
      </div>

      {promotionsQuery.isLoading ? <p className="py-12 text-sm text-gray-500">Memuat promo...</p> : null}
      {promotionsQuery.error ? <p className="py-12 text-sm text-red-600">{promotionsQuery.error.message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promotions.map((promotion) => <PromotionHighlightCard key={promotion.id} promotion={promotion} />)}
      </div>
      {!promotionsQuery.isLoading && !promotions.length ? <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">Belum ada voucher aktif.</div> : null}
    </main>
  );
}
