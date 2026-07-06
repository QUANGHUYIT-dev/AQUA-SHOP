"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Loader2, Pencil, X } from "lucide-react";
import type { ProductDetail, ProductStatus } from "@/types/product";
import { getAdminProductById } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { getProductDetailPath, getAdminProductEditPath } from "@/constants/routes";
import {
  PRODUCT_TYPE_LABELS,
} from "@/utils/product-utils";
import ProductDescriptionHtml from "@/components/features/product/ProductDescriptionHtml";
import { isValidImageUrl } from "@/lib/image-utils";
import {
  formatVariantPriceLine,
  getProductGalleryImages,
  getProductTypeDetailRows,
  getVariantLabel,
} from "@/utils/product-detail-utils";

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Đang bán",
  INACTIVE: "Ngừng bán",
  OUT_OF_STOCK: "Hết hàng",
};

interface AdminProductDetailModalProps {
  productId: string | null;
  onClose: () => void;
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ocean-900">{value || "—"}</dd>
    </>
  );
}

export default function AdminProductDetailModal({
  productId,
  onClose,
}: AdminProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const id = productId;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const detail = await getAdminProductById(id);
        if (!cancelled) setProduct(detail);
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
  }, [productId]);

  useEffect(() => {
    if (!productId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [productId, onClose]);

  if (!productId) return null;

  const typeDetailRows = product ? getProductTypeDetailRows(product) : [];
  const galleryImages = product ? getProductGalleryImages(product) : [];
  const productStatus = product?.status ?? "ACTIVE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-product-detail-title"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="admin-product-detail-title"
              className="truncate text-lg font-bold text-ocean-900"
            >
              {loading ? "Đang tải..." : product?.name ?? "Chi tiết sản phẩm"}
            </h2>
            {product && (
              <p className="mt-0.5 text-sm text-slate-500">
                {product.id} · {product.modelCode || "Không có mã model"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 p-1 text-slate-500 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : error ? (
            <div className="border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {error}
            </div>
          ) : product ? (
            <div className="space-y-6">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  label="Loại"
                  value={PRODUCT_TYPE_LABELS[product.productType]}
                />
                <InfoItem
                  label="Danh mục"
                  value={product.categoryName ?? product.category?.name}
                />
                <InfoItem label="Thương hiệu" value={product.brandName} />
                <InfoItem
                  label="Trạng thái"
                  value={STATUS_LABELS[productStatus]}
                />
                <InfoItem label="Tồn kho" value={product.totalStock} />
                {product.slug && (
                  <InfoItem
                    label="Trên shop"
                    value={
                      <Link
                        href={getProductDetailPath(product.slug)}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-teal-600 hover:underline"
                      >
                        Xem trang sản phẩm
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    }
                  />
                )}
              </dl>

              {product.shortDescription && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ocean-900">
                    Mô tả ngắn
                  </h3>
                  <p className="text-sm text-slate-600">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {product.description && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ocean-900">
                    Mô tả chi tiết
                  </h3>
                  <ProductDescriptionHtml
                    html={product.description}
                    className="text-sm"
                  />
                </div>
              )}

              {galleryImages.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ocean-900">
                    Ảnh ({galleryImages.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {galleryImages
                      .filter((image) => isValidImageUrl(image.imageUrl))
                      .map((image) => (
                      <div
                        key={image.imageId || image.imageUrl}
                        className="relative aspect-square overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={image.imageUrl}
                          alt={image.altText ?? product.name}
                          fill
                          className="object-contain object-center p-1"
                          sizes="120px"
                        />
                        {image.isPrimary && (
                          <span className="absolute left-1 top-1 bg-teal-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            Chính
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.variants.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ocean-900">
                    Biến thể ({product.variants.length})
                  </h3>
                  <div className="overflow-x-auto border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left">
                        <tr>
                          <th className="px-3 py-2 font-medium text-slate-600">
                            Biến thể
                          </th>
                          <th className="px-3 py-2 font-medium text-slate-600">
                            SKU
                          </th>
                          <th className="px-3 py-2 font-medium text-slate-600">
                            Giá
                          </th>
                          <th className="px-3 py-2 font-medium text-slate-600">
                            Tồn
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {product.variants.map((variant) => (
                          <tr key={variant.id}>
                            <td className="px-3 py-2">
                              {getVariantLabel(variant)}
                              {variant.isDefault && (
                                <span className="ml-2 text-xs text-teal-600">
                                  (mặc định)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {variant.sku ?? "—"}
                            </td>
                            <td className="px-3 py-2 font-medium text-ocean-800">
                              {formatVariantPriceLine(variant)}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {variant.stockQuantity ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {typeDetailRows.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-ocean-900">
                    Thông tin{" "}
                    {PRODUCT_TYPE_LABELS[product.productType].toLowerCase()}
                  </h3>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {typeDetailRows.map((row) => (
                      <InfoItem
                        key={row.label}
                        label={row.label}
                        value={row.value}
                      />
                    ))}
                  </dl>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-3">
          {product && (
            <Link
              href={getAdminProductEditPath(product.id)}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 bg-ocean-700 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-800"
            >
              <Pencil className="h-4 w-4" />
              Sửa sản phẩm
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
