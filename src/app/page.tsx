import { BannerCarousel } from "@/features/home/BannerCarousel";
import { CategorySection } from "@/features/home/CategorySection";
import { ProductFeed } from "@/features/home/ProductFeed";

export default function HomePage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-6 space-y-6">
      <BannerCarousel />
      <CategorySection />
      <ProductFeed />
    </div>
  );
}
