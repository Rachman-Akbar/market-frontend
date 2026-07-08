import { useEffect, useState } from "react";
import { SellerPanelShell } from "@/features/seller/dashboard/components/SellerPanelShell";
import { SellerBannerCard } from "@/features/seller/banner/components/SellerBannerCard";
import { SellerBannerForm } from "@/features/seller/banner/components/SellerBannerForm";
import { getSellerBannerRows } from "@/features/seller/banner/services/sellerBannerService";

export default function SellerBannerPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getSellerBannerRows().then(setRows);
  }, []);

  return (
    <SellerPanelShell title="Banner & Campaign" subtitle="Kelola visual campaign toko untuk hero banner, product feed, dan voucher strip.">
      <SellerBannerForm />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((banner) => <SellerBannerCard key={banner.id} banner={banner} />)}
      </div>
    </SellerPanelShell>
  );
}
