"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import type { ProductDetail, ProductVariant } from "@/types/product";
import { getProductBySlug } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useCart } from "@/hooks/useCart";
import { useFeedback } from "@/hooks/useFeedback";
import {
  formatStockStatus,
  getProductGalleryImages,
  getProductTypeDetailRows,
  getVariantPriceDisplay,
} from "@/utils/product-detail-utils";
import {
  formatPrice,
  getDefaultVariant,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_STYLES,
} from "@/utils/product-utils";
import {
  buildInitialVariantSelection,
  type VariantSelection,
} from "@/utils/variant-selector-utils";
import SiteHeader from "@/components/layout/SiteHeader";
import BreadcrumbBar from "@/components/layout/BreadcrumbBar";
import Footer from "@/components/layout/Footer";
import ProductDescriptionHtml from "@/components/features/product/ProductDescriptionHtml";
import ProductImageGallery from "@/components/features/product/ProductImageGallery";
import ProductRelatedSection from "@/components/features/product/ProductRelatedSection";
import ProductVariantSelector from "@/components/features/product/ProductVariantSelector";

interface ProductDetailPageClientProps {
  slug: string;
}

function getInitialVariant(
  variants: ProductVariant[],
): ProductVariant | undefined {
  return getDefaultVariant(variants);
}

export default function ProductDetailPageClient({
  slug,
}: ProductDetailPageClientProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [variantSelection, setVariantSelection] = useState<VariantSelection>(
    {},
  );
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { toast } = useFeedback();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getProductBySlug(slug);
        if (!cancelled) {
          setProduct(result);
          setError(null);
          const initialVariant = getInitialVariant(result.variants);
          setSelectedVariantId(initialVariant?.id ?? "");
          setVariantSelection(
            buildInitialVariantSelection(result.variants, initialVariant),
          );
          setAdded(false);
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const galleryImages = useMemo(
    () => (product ? getProductGalleryImages(product) : []),
    [product],
  );

  const selectedVariant = useMemo(() => {
    if (!product?.variants.length) return undefined;
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      getDefaultVariant(product.variants)
    );
  }, [product, selectedVariantId]);

  const priceInfo = selectedVariant
    ? getVariantPriceDisplay(selectedVariant)
    : null;

  const detailRows = product ? getProductTypeDetailRows(product) : [];
  const typeStyle = product ? PRODUCT_TYPE_STYLES[product.productType] : null;
  const categoryName = product?.categoryName ?? product?.category.name;
  const stockLabel = formatStockStatus(
    selectedVariant?.stockQuantity,
    product?.totalStock,
  );
  const outOfStock = stockLabel === "Hết hàng";

  const handleVariantChange = (
    selection: VariantSelection,
    variantId: string,
  ) => {
    setVariantSelection(selection);
    setSelectedVariantId(variantId);
    setAdded(false);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || outOfStock) return;

    setAdding(true);
    try {
      await addItem(product.id, selectedVariant.id);
      setAdded(true);
      toast.success(SYSTEM_MESSAGES.CART_ADD_SUCCESS);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <SiteHeader />
      {product && (
        <BreadcrumbBar
          items={[
            ...(product.category.parentName
              ? [
                  {
                    label: product.category.parentName,
                    href: product.category.parentSlug
                      ? `/${product.category.parentSlug}`
                      : undefined,
                  },
                ]
              : []),
            {
              label: categoryName ?? product.category.name,
              href: product.category.slug
                ? `/${product.category.slug}`
                : undefined,
            },
            { label: product.name },
          ]}
        />
      )}
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
              {error}
            </div>
          ) : product ? (
            <>
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <ProductImageGallery
                images={galleryImages}
                productName={product.name}
              />

              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  {typeStyle && (
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}
                    >
                      {PRODUCT_TYPE_LABELS[product.productType]}
                    </span>
                  )}
                  {product.brandName && (
                    <span className="text-sm text-slate-500">
                      {product.brandName}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-bold text-ocean-900 sm:text-3xl">
                  {product.name}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Mã: {product.modelCode}
                  {categoryName ? ` · ${categoryName}` : ""}
                </p>

                {product.shortDescription && (
                  <p className="mt-4 text-slate-600">
                    {product.shortDescription}
                  </p>
                )}

                <div className="mt-6 flex items-baseline gap-3">
                  {priceInfo ? (
                    <>
                      {priceInfo.salePrice != null && (
                        <span className="text-lg text-slate-400 line-through">
                          {formatPrice(priceInfo.price)}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-ocean-800">
                        {formatPrice(priceInfo.displayPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg text-slate-400">Liên hệ</span>
                  )}
                </div>

                <p
                  className={`mt-2 text-sm font-medium ${
                    outOfStock ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {stockLabel}
                </p>

                <div className="mt-6">
                  <ProductVariantSelector
                    variants={product.variants}
                    selection={variantSelection}
                    selectedVariantId={selectedVariant?.id ?? ""}
                    onSelectionChange={handleVariantChange}
                  />
                </div>

                {selectedVariant?.sku && (
                  <p className="mt-4 text-xs text-slate-500">
                    SKU: {selectedVariant.sku}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || !priceInfo || outOfStock}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-700 to-teal-600 py-3.5 text-base font-semibold text-white transition-all hover:from-ocean-800 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {adding
                    ? "Đang thêm..."
                    : outOfStock
                      ? "Hết hàng"
                      : added
                        ? "Đã thêm vào giỏ"
                        : "Thêm vào giỏ hàng"}
                </button>
              </div>
            </div>

              {(product.description || detailRows.length > 0) && (
                <div className="mt-10 grid gap-8 border-t border-slate-200 pt-8 lg:mt-12 lg:grid-cols-2 lg:items-start lg:gap-12">
                  {product.description && (
                    <div
                      className={`text-left ${
                        detailRows.length === 0 ? "lg:col-span-2" : ""
                      }`}
                    >
                      <h2 className="text-lg font-semibold text-ocean-900">
                        Mô tả sản phẩm
                      </h2>
                      <ProductDescriptionHtml
                        html={product.description}
                        className="mt-3"
                      />
                    </div>
                  )}

                  {detailRows.length > 0 && (
                    <div
                      className={
                        product.description ? "" : "lg:col-span-2 lg:max-w-xl"
                      }
                    >
                      <h2 className="text-lg font-semibold text-ocean-900">
                        Thông tin sản phẩm
                      </h2>
                      <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
                        {detailRows.map((row) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4"
                          >
                            <dt className="text-sm font-medium text-slate-500">
                              {row.label}
                            </dt>
                            <dd className="text-sm text-ocean-900 sm:col-span-2">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )}

              <ProductRelatedSection
                category={product.category}
                categoryId={product.categoryId ?? product.category.id}
                currentProductId={product.id}
              />
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
