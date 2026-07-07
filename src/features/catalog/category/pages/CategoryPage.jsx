import { useRef, useState } from "react";
import { FilterSidebar } from "@/shared/components/ui/FilterSidebar";
import { Pagination } from "@/shared/components/ui/Pagination";
import { ProductCard } from "@/features/catalog/product/components/ProductCard";

const CATEGORY_BUBBLES = [
  {
    label: "Alat Pemotong",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlSYQRXr-qdODrme8pSwNgcwd1BHLbfeHq94qh_o-3tJHfR1za-WqFk8Fm2abT6NtQxClK0mtmaBX5bcrO1KAZ79_s3Dabrvvcd1RnuKEpRVK4cz0qN8W18DHfiWwIrqdIKFtv9bwZHv8WrLq6PuRsJ153lh56zlNPq-8mwWnSKjD3k67hWkRk_SYgTtLY5ksPnknMqaUcSmgazlsYNPN6Fdt58InjPJaC9b9GfViodxeKYvlnodk-mLXUIaX4mVkVgrAlgDGq9B3l",
  },
  {
    label: "Capit Makanan",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-YYUXA7LjRhjR7_r0s9VwCgBZWrU7Si7WrCj5qq1yC9F8R_0whmtJpUiF02tJLgn6kimdGno-6UG0EnU2uqnvg9Fi_O1kLfW1epB_I-svke6_vqWX-fpkc0CctTidTZ2nm_yg9Cp2kvslDfoABo-2zfkGjOBVRLhhCjvh-rXfgWcec5zunMlGcet4J63qyHMJvlS8-NXChs36meS7pV8_xqNttiW45yrfkA2qSwCUQr0vdb6kVjESBMPeBajmGI3l6poUX-164ptO",
  },
  {
    label: "Celemek",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBO4vxPjGaSDwHtATbLjSVoAgU183YtSPTxZcCE5HIOXiZA-8FaLQQIy_2TYt6LCGmdntVpWYobZofK704Afe4Ijc-YOdZnNbrP5x41P2eBUonEIdTG0KgD2yoyGwLtXJICA9qAXI781MBd0TWpBL-l_DbHcoVZA8z31Sla7lxBPU-4W4QTEAbn_sBk3LRsbODYe8QFJidRy2mP9q1NTyLrcoH8MJRcH89LesYoelpA_FQsPO4r6IeG4zrjGkcgKpW77nNz-e7mSYG5",
  },
  {
    label: "Chopper",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlk07qM_Xp52EcNv5YZpdBsrLHx43mxIDmQ4nD00JK0jn370pJTCIVc0JdFJKZoo65Vg7T-KGJdmFY3230jRqah1gL45pp5HgaqsVHiYAW8fJYtqgo6EHQbugj1z7F27GOEQ0hIXlRAZQWVJ7YBgw4dN4HiPHIn2bK7vpSc6IiNmSD2i6dz8YiKSbVJKVJOVkV9KvJ56QVWvcQxBOxzIi7EvkvRoVfHbNTu7Zkg_lSHLgwkdnIa-ipZlYlRmvCDula0ZlYrW5JgyZM",
  },
  {
    label: "Grinder",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-3V2_aKriT830ZB9lFkft8dJBjAyKFDrFXlN5g4TM0oqpmfG3LKAJWsLOYJlyc7DUAHOFzrZVyLoi83ThA2q1pMkisWxloyNThl78Ap9Bj5oLWl0HbTiDX0RGFwgkW1Oqm93h9mtZ4rJjb3wPXleQKtk3Ckgfi9w8fTUaHP2j5OHgoM6ticPqpc5LS1gueFCs64x8Jdi3AWefs30wty00dZaWWx_H6k4zncC4uX9PcXhugG51zfsAeCLPHrZfWFjKVwl0yEndvFAW",
  },
  {
    label: "Baking Tools",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8r3hlptxUZolmvXDPw2Z9vcaJdOzipVpB-B-qKKULTz3vrz5sJ3tHscHdbcrN1foWrWZAfZEPllau93HxFTRPBv5V9WWwVU30rERVr6QHcIQduxXOaVcz_psj4Ps__nGoSvxgFZUSfmfie3qldDRPzElnsdpcp-QIlhiW8MhFZf3svE8BqHzjtb9MNa9iTAALNfB-L7BudG_jTcvLOAGikgc-ZYcCL_QfD8ElHO-eeuzZbQ79TMlDy6z6ckkZsz_W40R4NY9Wf2GR",
  },
];

const CATEGORY_PRODUCTS = [
  { slug: "peugeot-pepper-mill", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi8jynQRRQOhNP18cM_V4DVYTxQQ0NMYMWUvX6yDXimBpqLDlss4jQJBa5otEy2ma_KJAkrKAVnYy6Mbk9kMv6d5xliYRIfkAM2O6tLEeXhLH2QFVxWVe8aq0jq0QNdNsd2fIQ6sB6x1q_rtviVGLNHT0fC0pTW1PyASW40T0CnuKjnBxzezjwNHPrx3Zw85pPQiVtoQJylGwUlrQzRqpUBsp1GG_HZne25OPhV2abacAlIxfLpzolVyIbGebLNXVOLKRM3DL5wb8I", title: "Peugeot BBQ Pepper mill Wood graphite 30cm", price: "Rp1.287.090", rating: "4.9", sold: "50+", location: "Jakarta Pusat", wishlistBtn: true },
  { slug: "garlic-peeler", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHDbsC7n2ZrQaTvIIpJnqBtzjeSd3iGz7qLyaDlMd-WRF84bGaBmFagGQJzrNMGTnh2h_J7OJFyvhdjsOW-bGkuXs6Y1yafjxVX7x08iiFgkJzwMhyzt6iC_9uPoZpD-jyI2579Z4ARY-_ULhhYknXDAZMkFB9cqBgyTEyWNzHGNoG7_fBcyGaeE3ijmzXb6IL5X20G8nXcfpXvGDmdAcNgAVikqMo8W3BPsAG2oPyWLOod-jT2vGZWnXDRbP97ZuMbnh1mTQbbH_r", title: "Garlic Peeler Mesin Kupas Bawang Putih", price: "Rp1.575.000", rating: "4.8", sold: "100+", location: "Tangerang", wishlistBtn: true },
  { slug: "kitchenaid-y-peeler", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5lMoLi5Nx3aTTvKombTw59Uqfj1muMkcaUwuI3dRc9MpE_Im6SN9CRAveBfNY2z9BorVWbm1aUivWXUdWm0yLfaJLHpru5ioonsc4BRgGIf9KJNfRCOX6MhGIHh0inBPSrpKXnwrRRui7pcXRdsydqWYTDvse9NV2yqfgSuXvHlGw5MY68utrRIUtcZaR1Ya9nXsQpJ_V60TreFWynSSEt7-J_4Zd1dA6r0_mYo4s00OzadC2bRRGtIjXFn4hGWl37iBfqxB4OIVU", title: "KitchenAid Y Peeler Black - Stainless Steel", price: "Rp133.500", rating: "5.0", sold: "500+", location: "Jakarta Barat", wishlistBtn: true },
  { slug: "pisau-dapur-pro", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm27HSPHwPWh_druA1O5Bm0qBz2DjI4Bzud5mspYp7yvail1YlqjFPZZQf2CZg_ygbdzTH36LxOVAS__tB0gKbkZ_QECqP87M9rWZv3sA-wYLNi_DX01bQdgvk61Lrhusvy3VH1cMDbYVvD0JB2LPjBCSUth7iuJRu3qEuuWo6jR0VVgI3BHf0KprE7PEE1opaox3oJAL_6z0aRyPDHSw-R3cwuN0Rhs-BSuRs2VoobhFp6W_h5mPxUj5MAObCrKVL4xN2smXFrTJN", title: "Pisau Dapur Professional Steel 15cm", price: "Rp116.496", discountPct: "15%", originalPrice: "Rp137.000", rating: "4.9", sold: "1rb+", location: "Jakarta Pusat", wishlistBtn: true },
  { slug: "turbo-fino-chopper", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbl9KA1V_joAUqt7TAbiDGV30BWKR3PsRumVm2yTlBa4VMIumw2CQ46s8nlr-1oOl5nyTV7qX_bJdTFfUGjuFlmazKUjXHJy64BC6E0sRlZOcOytH3M2-ljkoqvLElaK9N5JnVONlkTNael6IhyBxKN-gydsmIl-_e2t--shYAcTeXJkorMcJ74qvJBRbfW8PTGgw1JL0XW7q9H37WRwoS0bvDPA-zz82Tcw5y9fn7FwGRw1coJb5k55ttbHJsgx2OL-KRWgj2PrbK", title: "Turbo Fino Chopper Blender 2 Liter", price: "Rp575.518", rating: "4.7", sold: "250+", location: "Tangerang", wishlistBtn: true },
  { slug: "talenan-dejavu", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOKBeLeXIFGzrdvVJ1djaFMnlX8ywFT7-a01W97rtPO2qyU5PPXfPwwAA9yB8UBR_Q7uq_SMNnpp6NhHZwBBZo3htoLHcV6XhSrBkBYvLYBkRErrsIXlDhVoxz5KUkn3RNTWf8A76cbiWSDWKC9Op5sXB_A_GQGqQE0VTwp16iNOVsFxg4SgQUL4hBNMcGjJxChWP0002CTf5dR50wo8_QnFsuvKybDqci8El9SlT-nupl2K-JoXch7YTw6kaN3k_JUL2uENI06gmQ", title: "Dejavu Talenan Pemotong Sayur Premium", price: "Rp89.000", rating: "4.9", sold: "2rb+", location: "Bandung" },
  { slug: "penggiling-merica", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHuW9w8YmMEeXf1fOGw0Aig8d48usqMNYmtGnEa9YDOmmDnDJRsv3aqhqimQSWlOsyWxEDND4sTxqELo5vubQTb-oc-FzCm5Qng65PmaEmtQoPf6h3h2ScB7Eiw4lFHb1tmt1BtT0vDvWesjNeENdWj99ZIt5U-SjrJoX3BJwTbUZo2zt6txoMX4XnA1m5RbO2knjpxM77QeDfINgxojKIqRgzjHBOte37KAeEdm4pNRDhJByw10rBe1kH8OAiDgC6XZGtLsSqgNsT", title: "Set Penggiling Merica Modern Black", price: "Rp44.900", rating: "4.8", sold: "300+", location: "Jakarta Barat" },
  { slug: "ohsome-kitchen-set", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzsR-0gXQwrmTJOjtWz5jUPFMDyvtir10IDd1ql1dcXtj_d1C7DfxBFCv7j37_CQWXwLQkdv0Lko8GQ1yHRNjMFssmiHWPxIyNstktnWgFiTrQaJHqEEZudV3cYGCT47BtSziE1bxA3RXSHTuGLAbUVNmnian2_-7W9A-0j7H1Xr0qdo6Bl8Fel9_f6FsVWltKxw4KEgCl24lTriMr-PxhQSAp4VZ_AFp8M-AizNTllAkS1Mzy_V1wlHQ0qVtNFfVuSi47m1_UsD4E", title: "OHSOME Solo Corner Cat Series Kitchen Set", price: "Rp15.900", rating: "5.0", sold: "100+", location: "Tangerang" },
  { slug: "maxpump-penghalus-bumbu", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuTjqZacK93RgQCCfJCW-8SKvpnsbKgtjeOyRNx16Y2v6Qj1e1DIkh4-1I0ZUNySLylkjFKYPdpydYrq-OMmIQtjWFH72g13D2L7gS9Vm1wYu0Yq8l7dOYeu1-J6Z3026_wEmQXI-RRne0Mt0ITdGU2pxw4h5G57DQA4dcJVnE-EA-urgQi7SR0YdYoNfr_SGAO1R7iGjuzumhods97rtuvkUCCGg1j3CChX63T2PllZXio7fcdFGm7DzNkaAM-hise5VdOu41fuUt", title: "MAXPUMP Mesin Penghalus Bumbu Premium", price: "Rp4.495.000", rating: "4.9", sold: "20+", location: "Jakarta Utara" },
  { slug: "wadah-bumbu-keramik", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVzjrb7aFFJJedFs2RbrZWpa9IoyuvvN3LrAs5w-k0OlO71WwL1TfVDte_mzcJJ2ibPJtFjMKeMitBH5081h5JSg6yM49MqBAY4gbUCBykP6ojWHXXknaatV-G_Z9hE9MRdjyBLWKIEfxXNGH7wiema9rgeRw2S5mD_7Ke6R75cphRDg44v4tdUOsVjoNhqgnwjxFlD79XjcMi7RyMoiBH0jL4o-I32_RF16i0Mkesno8gzf4eaXnGrl6xlblBLKzckoganV_x6Atw", title: "Wadah Bumbu Keramik Minimalis Putih", price: "Rp145.000", rating: "4.8", sold: "500+", location: "Surabaya" },
];

const CATEGORIES = ["Aksesoris Dapur", "Alat Masak Khusus", "Bekal", "Peralatan Baking", "Peralatan Masak"];

export default function CategoryPage() {
  const scrollerRef = useRef(null);
  const categoryName = "Aksesoris Dapur";

  return (
    <div className="w-full">
      
      <section className="bg-[#03ac0e] text-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">{categoryName}</h2>
          <div className="relative group">
            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth"
            >
              {CATEGORY_BUBBLES.map((bubble) => (
                <div key={bubble.label} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border-2 border-transparent hover:border-[#76ff64] transition-all">
                    <img src={bubble.image} alt={bubble.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-center w-20">{bubble.label}</span>
                </div>
              ))}
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white text-[#1b1c1c] rounded-full shadow-lg flex items-center justify-center hover:bg-[#f6f3f2] transition-colors"
              onClick={() => scrollerRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        
        <nav className="text-xs text-[#3e4a39] mb-6">
          <span>Beranda</span>
          <span className="mx-2">&gt;</span>
          <span>Kategori Utama</span>
          <span className="mx-2">&gt;</span>
          <span>Dapur</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#1b1c1c] font-bold">{categoryName}</span>
        </nav>

        <div className="flex gap-4">
          
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <FilterSidebar showCategories categories={CATEGORIES} />
          </aside>

          
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#3e4a39]">Menampilkan 138.002 produk untuk "{categoryName}"</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Urutkan:</span>
                <select className="border border-[#bccbb4] rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-[#006e04] bg-white">
                  <option>Paling Sesuai</option>
                  <option>Terbaru</option>
                  <option>Harga Terendah</option>
                  <option>Harga Tertinggi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {CATEGORY_PRODUCTS.map((p) => (
                <ProductCard key={p.slug} {...p} />
              ))}
            </div>

            <Pagination current={1} total={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
