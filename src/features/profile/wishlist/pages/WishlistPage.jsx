import { Heart, Search, ShoppingCart } from "lucide-react";
import { profileLayout } from "@/features/profile/components/profileLayoutClasses";
import { wishlistItems } from "@/features/profile/data/profileMarketplaceData";

export default function WishlistPage() {
  return (
    <section className={profileLayout.contentShell}>
      <div className={profileLayout.contentInner}>
        <div className={profileLayout.contentHeader}>
          <div>
            <span className={profileLayout.contentEyebrow}>Wishlist product</span>
            <h2 className={profileLayout.contentTitle}>Wishlist</h2>
            <p className={`mt-2 ${profileLayout.contentDesc}`}>Produk favorit dummy dengan tampilan ringan dan clean.</p>
          </div>
          <label className={`${profileLayout.searchBox} w-full sm:max-w-xs`}>
            <Search size={17} className="mr-2" />
            <input type="search" placeholder="Cari wishlist" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </label>
        </div>

        <hr className={profileLayout.divider} />

        <div>
          {wishlistItems.map((item) => (
            <div key={item.id} className="min-h-[104px] py-6">
              <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1ec] text-[#ee4d2d]"><Heart size={22} /></div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950">{item.name}</h3>
                    <span className="rounded-full bg-[#fff1ec] px-2 py-0.5 text-[11px] font-semibold text-[#ee4d2d]">{item.tag}</span>
                  </div>
                  <p className="text-sm text-slate-500">{item.store}</p>
                  <p className="mt-1 text-sm font-semibold text-[#ee4d2d]">{item.price}</p>
                </div>
                <button type="button" className={profileLayout.primaryButton}><ShoppingCart size={16} /> Beli</button>
              </div>
              <hr className="mt-6 border-[#e5e7eb]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
