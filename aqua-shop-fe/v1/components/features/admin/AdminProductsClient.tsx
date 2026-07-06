"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { ProductStatus } from "@/types/product";
import { deleteAdminProduct, filterAdminProducts } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidImageUrl } from "@/lib/image-utils";
import {
  formatPrice,
  getProductPriceDisplay,
  PRODUCT_TYPE_LABELS,
} from "@/utils/product-utils";
import { getProductDetailPath, getAdminProductEditPath, ROUTES } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import AdminProductDetailModal from "@/components/features/admin/AdminProductDetailModal";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Đang bán",
  INACTIVE: "Ngừng bán",
  OUT_OF_STOCK: "Hết hàng",
};

const STATUS_STYLES: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

export default function AdminProductsClient() {
  const { toast, confirm } = useFeedback();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof filterAdminProducts>>["content"]
  >([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await filterAdminProducts({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });
      setProducts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setError(null);
    } catch (err) {
      setProducts([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadProducts();
  };

  const handleDelete = async (productId: string, productName: string) => {
    const ok = await confirm({
      title: "Ngừng bán sản phẩm",
      message: `Ngừng bán "${productName}"? (soft delete — chuyển trạng thái INACTIVE)`,
      confirmLabel: "Ngừng bán",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;

    setDeletingId(productId);
    try {
      await deleteAdminProduct(productId);
      await loadProducts();
      toast.success(SYSTEM_MESSAGES.DEACTIVATE_SUCCESS);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Sản phẩm"
        description={`${totalElements} sản phẩm trong hệ thống`}
        action={
          <Link
            href={ROUTES.ADMIN_PRODUCT_CREATE}
            className="inline-flex items-center gap-1.5 bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex min-w-[240px] flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, mã, SKU..."
              className="w-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <button
            type="submit"
            className="bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800"
          >
            Tìm
          </button>
        </form>

        <select
          value={status}
          aria-label="Lọc theo trạng thái"
          onChange={(e) => {
            setStatus(e.target.value as ProductStatus | "");
            setPage(0);
          }}
          className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bán</option>
          <option value="INACTIVE">Ngừng bán</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
        </select>
        <p className="self-center text-xs text-slate-500">
          Double-click vào dòng để xem chi tiết
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Ảnh</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Loại</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Danh mục</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Giá</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Không có sản phẩm
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const priceInfo = getProductPriceDisplay(product);
                  const productStatus = product.status ?? "ACTIVE";

                  return (
                    <tr
                      key={product.id}
                      className="cursor-pointer hover:bg-slate-50/80"
                      onDoubleClick={() => setDetailProductId(product.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden bg-slate-100">
                          {isValidImageUrl(product.thumbnailUrl) && (
                            <Image
                              src={product.thumbnailUrl.trim()}
                              alt={product.name}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ocean-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.modelCode}</p>
                        {product.slug && (
                          <Link
                            href={getProductDetailPath(product.slug)}
                            target="_blank"
                            className="text-xs text-teal-600 hover:underline"
                            onDoubleClick={(e) => e.stopPropagation()}
                          >
                            Xem trên shop
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {PRODUCT_TYPE_LABELS[product.productType]}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.categoryName ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-ocean-800">
                        {priceInfo
                          ? formatPrice(priceInfo.displayPrice)
                          : "Liên hệ"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold ${STATUS_STYLES[productStatus]}`}
                        >
                          {STATUS_LABELS[productStatus]}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href={getAdminProductEditPath(product.id)}
                            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700"
                          >
                            <Pencil className="h-4 w-4" />
                            Sửa
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Ngừng bán
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Trang trước"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Trang sau"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AdminProductDetailModal
        productId={detailProductId}
        onClose={() => setDetailProductId(null)}
      />
    </>
  );
}
