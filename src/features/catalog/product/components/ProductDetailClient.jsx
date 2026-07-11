import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageGallery } from "@/features/catalog/product/components/ImageGallery";
import { VariantSelector } from "./VariantSelector";
import { ProductCheckoutPanel } from "@/features/catalog/product/components/ProductCheckoutPanel";
import { ReviewSection } from "@/features/order/review/components/ReviewSection";
import { formatPrice } from "@/shared/utils/utils";
import { useProductBySlug, useProductVariants } from "@/features/catalog/product/services/productService";
import { getCategoryHref } from "@/features/catalog/category/services/categoryService";

const DETAIL_TABS = ["Detail Produk", "Panduan"];

function getProductCategories(product) {
  const categories = product?.categories || [];
  if (categories.length) return categories;
  if (product?.primary_category) return [product.primary_category];
  return [];
}

export function ProductDetailClient({ slug }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const productQuery = useProductBySlug(slug);
  const baseProduct = productQuery.data || null;
  const variantsQuery = useProductVariants(baseProduct?.id, {
    enabled: Boolean(baseProduct?.id && !baseProduct?.variants?.length),
  });
  const product = useMemo(() => {
    if (!baseProduct) return null;
    if (baseProduct.variants?.length || !variantsQuery.data?.data?.length) return baseProduct;
    const variants = variantsQuery.data.data;
    return {
      ...baseProduct,
      variants,
      default_variant: variants.find((variant) => variant.is_default) || variants[0] || null,
    };
  }, [baseProduct, variantsQuery.data]);

  useEffect(() => {
    setSelectedVariant(product?.default_variant || product?.variants?.[0] || null);
  }, [product?.id, product?.default_variant?.id]);

  const loading = productQuery.isLoading || variantsQuery.isLoading;
  const error = productQuery.error?.message || variantsQuery.error?.message || "";

  const handleVariantChange = useCallback((variant) => {
    setSelectedVariant(variant || null);
  }, []);

  const categories = useMemo(() => getProductCategories(product), [product]);
  const activePrice = Number(selectedVariant?.price || product?.price || 0);
  const activeStock = Number(selectedVariant?.stock ?? product?.stock ?? 0);

  if (loading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-sm text-gray-500">Memuat detail produk...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-sm text-red-500">{error}</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-sm text-gray-500">Produk tidak ditemukan.</div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4">
      <nav className="mb-6 text-xs text-[#03ac0e] font-semibold">
        <div className="flex items-center flex-wrap gap-1">
          <span className="after:content-['>'] after:mx-2 after:text-gray-400">
            <a href="#" className="hover:underline">Home</a>
          </span>
          {categories.slice(0, 3).map((crumb) => (
            <span key={crumb.id || crumb.slug || crumb.name} className="after:content-['>'] after:mx-2 after:text-gray-400">
              <a href={getCategoryHref(crumb)} className="hover:underline">{crumb.name}</a>
            </span>
          ))}
          <span className="text-gray-400">{product.name}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-4">
          <ImageGallery images={product.images} alt={product.name} />
        </section>

        <section className="lg:col-span-5">
          <h1 className="text-xl font-bold leading-tight mb-1">
            {product.name}
          </h1>

          <div className="flex items-center text-sm mb-4 gap-2">
            {!!product.sold && (
              <span className="text-gray-500">
                Terjual <span className="text-gray-800 font-semibold">{product.sold}</span>
              </span>
            )}
            {!!product.sold && !!product.rating && <span className="text-gray-300">•</span>}
            {!!product.rating && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">{product.rating}</span>
              </div>
            )}
          </div>

          <div className="text-3xl font-bold mb-6">{formatPrice(activePrice)}</div>
          <hr className="mb-6 border-gray-100" />

          <VariantSelector variants={product.variants} onVariantChange={handleVariantChange} />

          <div className="border-b border-gray-200 mb-4">
            <div className="flex gap-8">
              {DETAIL_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    i === activeTab
                      ? "border-[#03ac0e] text-[#03ac0e] font-bold"
                      : "border-transparent text-gray-500 hover:text-[#03ac0e]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 text-sm">
            {activeTab === 0 && (
              <>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    ["Brand:", product.brand || "-"],
                    ["Stok:", activeStock],
                    ["Status:", product.status || "-"],
                    ["Kategori:", categories[0]?.name || "-"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-gray-500 w-24">{label}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <p className="leading-relaxed whitespace-pre-line">
                    {product.description || "Deskripsi produk belum tersedia."}
                  </p>
                </div>
              </>
            )}
            {activeTab === 1 && (
              <div className="space-y-4">
                <p className="leading-relaxed">Panduan produk belum tersedia.</p>
              </div>
            )}

            <hr className="border-gray-100" />

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.brand || product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{product.brand || "Toko"}</span>
                    <svg className="w-4 h-4 text-[#03ac0e]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {product.location || "Lokasi toko belum tersedia"}
                  </div>
                </div>
              </div>
              <button className="px-6 py-1.5 border border-[#03ac0e] text-[#03ac0e] font-bold rounded-lg hover:bg-gray-50">
                Follow
              </button>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-3">
          <ProductCheckoutPanel product={product} variant={selectedVariant} />
        </aside>

        <div className="lg:col-span-9">
          <ReviewSection reviews={product.reviews} summary={product.review_summary} />
        </div>
      </div>
    </main>
  );
}
