"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { ServerCart, SessionCartItem } from "@/types/cart";
import type { ProductDetail, ProductVariant } from "@/types/product";
import { ROUTES, getProductDetailPath } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useFeedback } from "@/hooks/useFeedback";
import { getProductById } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getVariantLabel,
  getVariantPriceDisplay,
} from "@/utils/product-detail-utils";
import { formatPrice } from "@/utils/product-utils";
import { isValidImageUrl, resolveProductThumbnailUrl } from "@/lib/image-utils";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

interface CartLineView {
  key: string;
  cartItemId?: string;
  productId: string;
  variantId: string;
  sku?: string;
  name: string;
  variantLabel?: string;
  thumbnailUrl: string;
  slug?: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  lineTotal?: number;
  loading: boolean;
  error: string | null;
}

function findVariant(
  product: ProductDetail | null,
  variantId: string,
): ProductVariant | null {
  if (!product) return null;
  return product.variants.find((variant) => variant.id === variantId) ?? null;
}

function buildSessionLines(
  items: SessionCartItem[],
  productCache: Map<string, ProductDetail | null>,
): CartLineView[] {
  return items.map((item) => {
    const product = productCache.get(item.productId) ?? null;
    const variant = findVariant(product, item.variantId);
    const priceInfo = variant ? getVariantPriceDisplay(variant) : null;

    return {
      key: `${item.productId}-${item.variantId}`,
      productId: item.productId,
      variantId: item.variantId,
      sku: variant?.sku ?? undefined,
      name: product?.name ?? "Sản phẩm",
      variantLabel: variant ? getVariantLabel(variant) : undefined,
      thumbnailUrl: resolveProductThumbnailUrl(
        product?.thumbnailUrl,
        product?.productType,
      ),
      slug: product?.slug ?? undefined,
      price: priceInfo?.price ?? 0,
      salePrice: priceInfo?.salePrice ?? null,
      quantity: item.quantity,
      loading: false,
      error: product ? null : "Không tải được thông tin sản phẩm",
    };
  });
}

function buildServerLines(serverCart: ServerCart): CartLineView[] {
  return serverCart.items.map((item) => ({
    key: item.cartItemId || `${item.productId}-${item.variantId}`,
    cartItemId: item.cartItemId,
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    name: item.productName,
    variantLabel: item.variantLabel,
    thumbnailUrl: resolveProductThumbnailUrl(item.thumbnailUrl, undefined),
    slug: item.slug,
    price: item.price,
    salePrice: item.salePrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    loading: false,
    error: null,
  }));
}

export default function CartPageClient() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const {
    items,
    serverCart,
    itemCount,
    isLoading: cartLoading,
    isServerCart,
    refreshCart,
    updateItemQuantity,
    removeItem,
  } = useCart();
  const { toast } = useFeedback();

  const [lines, setLines] = useState<CartLineView[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    let cancelled = false;

    async function loadLines() {
      if (isServerCart && serverCart) {
        setLines(buildServerLines(serverCart));
        setLoadingProducts(false);
        return;
      }

      if (items.length === 0) {
        setLines([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);

      const productCache = new Map<string, ProductDetail | null>();
      const uniqueProductIds = [
        ...new Set(items.map((item) => item.productId)),
      ];

      await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const product = await getProductById(productId);
            productCache.set(productId, product);
          } catch {
            productCache.set(productId, null);
          }
        }),
      );

      if (cancelled) return;

      setLines(buildSessionLines(items, productCache));
      setLoadingProducts(false);
    }

    loadLines();
    return () => {
      cancelled = true;
    };
  }, [items, isServerCart, serverCart]);

  const subtotal = useMemo(() => {
    if (isServerCart && serverCart) {
      return serverCart.totalPrice;
    }

    return lines.reduce((total, line) => {
      const displayPrice = line.salePrice != null ? line.salePrice : line.price;
      return total + displayPrice * line.quantity;
    }, 0);
  }, [isServerCart, serverCart, lines]);

  const handleQuantityChange = useCallback(
    async (line: CartLineView, quantity: number) => {
      setUpdatingKey(line.key);
      try {
        await updateItemQuantity(
          {
            cartItemId: line.cartItemId,
            productId: line.productId,
            variantId: line.variantId,
          },
          quantity,
        );
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setUpdatingKey(null);
      }
    },
    [toast, updateItemQuantity],
  );

  const handleRemove = useCallback(
    async (line: CartLineView) => {
      setUpdatingKey(line.key);
      try {
        await removeItem({
          cartItemId: line.cartItemId,
          productId: line.productId,
          variantId: line.variantId,
        });
        toast.success(SYSTEM_MESSAGES.CART_ITEM_REMOVED);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setUpdatingKey(null);
      }
    },
    [removeItem, toast],
  );

  const handleCheckout = useCallback(() => {
    if (itemCount === 0) {
      toast.error(SYSTEM_MESSAGES.CART_CHECKOUT_EMPTY);
      return;
    }

    if (!isAuthenticated) {
      router.push(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`,
      );
      return;
    }

    router.push(ROUTES.CHECKOUT);
  }, [isAuthenticated, itemCount, router, toast]);

  const showLoading = cartLoading || loadingProducts || !isHydrated;
  const hasItems = lines.length > 0;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ocean-900 sm:text-3xl">
              Giỏ hàng
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isAuthenticated
                ? "Giỏ hàng của bạn được lưu trên hệ thống."
                : "Sản phẩm được lưu tạm trên trình duyệt. Đăng nhập để đồng bộ lên hệ thống."}
            </p>
          </div>

          {showLoading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-100 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : !hasItems ? (
            <div className="rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-ocean-900">
                Giỏ hàng trống
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Hãy thêm sản phẩm yêu thích để bắt đầu mua sắm.
              </p>
              <Link
                href={ROUTES.HOME}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {lines.map((line) => (
                    <CartLineRow
                      key={line.key}
                      line={line}
                      disabled={updatingKey === line.key}
                      onQuantityChange={(quantity) =>
                        handleQuantityChange(line, quantity)
                      }
                      onRemove={() => handleRemove(line)}
                    />
                  ))}
                </ul>
              </section>

              <aside className="h-fit rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-ocean-900">
                  Tóm tắt đơn hàng
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <dt>Tạm tính ({itemCount} sản phẩm)</dt>
                    <dd className="font-medium text-ocean-900">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <dt>Phí vận chuyển</dt>
                    <dd>Tính khi thanh toán</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ocean-900">
                      Tổng tạm tính
                    </span>
                    <span className="text-lg font-bold text-teal-700">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {isAuthenticated
                      ? "Giá đã được tính trên hệ thống."
                      : "Giá cuối cùng sẽ được tính trên hệ thống sau khi đăng nhập."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Thanh toán
                </button>

                {!isAuthenticated && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Bạn cần{" "}
                    <Link
                      href={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CART)}`}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      đăng nhập
                    </Link>{" "}
                    để thanh toán.
                  </p>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

interface CartLineRowProps {
  line: CartLineView;
  disabled?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

function CartLineRow({
  line,
  disabled = false,
  onQuantityChange,
  onRemove,
}: CartLineRowProps) {
  const displayPrice = line.salePrice != null ? line.salePrice : line.price;
  const lineTotal =
    line.lineTotal != null ? line.lineTotal : displayPrice * line.quantity;
  const detailHref = line.slug != null ? getProductDetailPath(line.slug) : null;

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-6">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
        {isValidImageUrl(line.thumbnailUrl) ? (
          <Image
            src={line.thumbnailUrl}
            alt={line.name}
            fill
            className="object-contain p-2"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {detailHref ? (
          <Link
            href={detailHref}
            className="line-clamp-2 text-base font-semibold text-ocean-900 hover:text-teal-700"
          >
            {line.name}
          </Link>
        ) : (
          <h3 className="line-clamp-2 text-base font-semibold text-ocean-900">
            {line.name}
          </h3>
        )}

        {line.variantLabel && (
          <p className="mt-1 text-sm text-slate-500">
            Phân loại: {line.variantLabel}
          </p>
        )}

        {line.sku && (
          <p className="mt-0.5 text-xs text-slate-400">SKU: {line.sku}</p>
        )}

        {line.error && (
          <p className="mt-1 text-sm text-red-600">{line.error}</p>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {line.salePrice != null && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(line.price)}
            </span>
          )}
          <span className="text-sm font-semibold text-ocean-800">
            {formatPrice(displayPrice)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-lg border border-slate-200">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onQuantityChange(line.quantity - 1)}
            className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            aria-label="Giảm số lượng"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium text-ocean-900">
            {line.quantity}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onQuantityChange(line.quantity + 1)}
            className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            aria-label="Tăng số lượng"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-ocean-900 sm:text-base">
            {formatPrice(lineTotal)}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
