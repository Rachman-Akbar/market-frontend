import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerBannerCard } from "@/features/seller/banner/components/SellerBannerCard";
import { SellerBannerForm } from "@/features/seller/banner/components/SellerBannerForm";
import { useSellerBanners } from "@/features/seller/banner/services/sellerBannerService";

export default function SellerBannerPage() {
  const bannersQuery = useSellerBanners();
  const rows = bannersQuery.data || [];

  return (
    <SellerPanelShell title="Banner & Campaign" subtitle="Kelola visual campaign toko untuk hero banner, product feed, dan voucher strip.">
      <SellerBannerForm />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((banner) => <SellerBannerCard key={banner.id} banner={banner} />)}
        {!bannersQuery.isLoading && rows.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">Banner toko belum tersedia.</div> : null}
      </div>
    </SellerPanelShell>
  );
}
