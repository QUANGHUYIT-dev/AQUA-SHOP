"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { getInventoryList } from "@/lib/inventory-api";
import { createPosOrder } from "@/lib/order-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { filterAdminProducts, getProductById } from "@/lib/api";
import { useFeedback } from "@/hooks/useFeedback";
import type { ProductInventoryGroup } from "@/utils/pos-utils";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import { formatPrice } from "@/utils/product-utils";
import {
  buildPosProductGroupsFromProducts,
  formatInventoryVariantOption,
  getInventoryVariantLabel,
  resolveInventoryUnitPrice,
} from "@/utils/pos-utils";

const POS_PAGE_SIZE = 20;

interface CartLine {
  sku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  quantityAvailable: number;
}

interface ProductDraft {
  selectedSku: string;
  quantity: string;
}

export default function AdminPosClient() {
  const { toast } = useFeedback();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [productGroups, setProductGroups] = useState<ProductInventoryGroup[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const trimmedSearch = searchQuery.trim();
  const isFiltering = trimmedSearch.length > 0;

  useEffect(() => {
    setPage(0);
  }, [trimmedSearch]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsSearching(true);
      setLoadError(null);
      const effectivePage = isFiltering ? 0 : page;

      try {
        const productsPage = await filterAdminProducts({
          search: isFiltering ? trimmedSearch : undefined,
          status: "ACTIVE",
          page: effectivePage,
          size: POS_PAGE_SIZE,
          sort: "name,asc",
        });
        const inventoryPage = await getInventoryList({
          search: isFiltering ? trimmedSearch : undefined,
          page: 0,
          size: isFiltering ? 100 : 300,
        }).catch(() => null);
        if (cancelled) return;

        const productIds = (productsPage.content ?? []).map((product) => product.id);
        const productDetails =
          productIds.length > 0
            ? await Promise.all(productIds.map((id) => getProductById(id)))
            : [];
        if (cancelled) return;

        const groups = buildPosProductGroupsFromProducts(
          productDetails,
          inventoryPage?.content ?? [],
        );
        setProductGroups(groups);
        setTotalPages(productsPage.totalPages ?? 0);
        setTotalElements(productsPage.totalElements ?? 0);
        setDrafts((prev) => {
          const next = { ...prev };
          for (const group of groups) {
            if (!next[group.productId]) {
              next[group.productId] = {
                selectedSku: group.variants[0]?.sku ?? "",
                quantity: "1",
              };
            }
          }
          return next;
        });
      } catch (err) {
        if (cancelled) return;
        setProductGroups([]);
        setTotalPages(0);
        setTotalElements(0);
        setLoadError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };

    const delay = isFiltering ? 300 : 0;
    const timer = window.setTimeout(loadProducts, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedSearch, isFiltering, page]);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );

  const updateDraft = useCallback(
    (productId: string, patch: Partial<ProductDraft>) => {
      setDrafts((prev) => ({
        ...prev,
        [productId]: {
          selectedSku: prev[productId]?.selectedSku ?? "",
          quantity: prev[productId]?.quantity ?? "1",
          ...patch,
        },
      }));
    },
    [],
  );

  const addToCart = useCallback(
    (group: ProductInventoryGroup) => {
      const draft = drafts[group.productId];
      if (!draft?.selectedSku) return;

      const selectedItem =
        group.variants.find((variant) => variant.sku === draft.selectedSku) ??
        group.variants[0];
      if (!selectedItem) return;

      const qty = Number.parseInt(draft.quantity, 10);
      if (!Number.isFinite(qty) || qty <= 0) {
        toast.error("Số lượng không hợp lệ");
        return;
      }

      const available = selectedItem.quantityAvailable ?? 0;
      const existing = cart.find((line) => line.sku === selectedItem.sku);
      const currentInCart = existing?.quantity ?? 0;
      if (currentInCart + qty > available) {
        toast.error(`Chỉ còn ${available} có thể bán`);
        return;
      }

      const unitPrice = resolveInventoryUnitPrice(selectedItem);
      const variantLabel = getInventoryVariantLabel(selectedItem);

      setCart((prev) => {
        const idx = prev.findIndex((line) => line.sku === selectedItem.sku);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + qty,
          };
          return next;
        }

        return [
          ...prev,
          {
            sku: selectedItem.sku,
            productName: selectedItem.productName,
            variantLabel,
            quantity: qty,
            unitPrice,
            quantityAvailable: available,
          },
        ];
      });

      updateDraft(group.productId, { quantity: "1" });
      toast.success("Đã thêm vào giỏ POS");
    },
    [cart, drafts, toast, updateDraft],
  );

  const updateLineQty = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.sku !== sku) return line;
          const nextQty = line.quantity + delta;
          if (nextQty > line.quantityAvailable) return line;
          return { ...line, quantity: nextQty };
        })
        .filter((line) => line.quantity > 0),
    );
  };

  const removeLine = (sku: string) => {
    setCart((prev) => prev.filter((line) => line.sku !== sku));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const order = await createPosOrder({
        orderType: "OFFLINE",
        items: cart.map((line) => ({ sku: line.sku, quantity: line.quantity })),
        paymentMethod: "CASH",
        note: "Bán tại quầy (POS)",
      });
      setCart([]);
      setSearchQuery("");
      setPage(0);
      toast.success(`Thanh toán thành công — đơn ${order.orderId}`);
    } catch (err) {
      setCheckoutError(getApiErrorMessage(err));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Bán tại quầy (POS)"
        description="Tìm sản phẩm → chọn loại & số lượng → thanh toán & trừ kho ngay"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tìm nhanh sản phẩm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Gõ tên sản phẩm, ví dụ "Neon", "Atman"...'
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {!isFiltering && !isSearching && (
              <p className="mt-2 text-xs text-slate-500">
                Hiển thị {productGroups.length} / {totalElements} sản phẩm đang bán
              </p>
            )}

            {isSearching && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isFiltering ? "Đang tìm sản phẩm..." : "Đang tải danh sách..."}
              </div>
            )}

            {loadError && (
              <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {loadError}
              </div>
            )}

            {!isSearching &&
              !loadError &&
              isFiltering &&
              productGroups.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">Không tìm thấy sản phẩm</p>
            )}

            {!isSearching &&
              !loadError &&
              !isFiltering &&
              productGroups.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                {totalElements > 0
                  ? "Sản phẩm thiếu SKU/variant — kiểm tra lại trong admin sản phẩm."
                  : "Chưa có sản phẩm trạng thái ACTIVE. Vào Admin → Sản phẩm để bật trạng thái \"Đang bán\"."}
              </p>
            )}

            {productGroups.length > 0 && (
              <ul className="mt-3 max-h-[520px] divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
                {productGroups.map((group) => {
                  const draft = drafts[group.productId] ?? {
                    selectedSku: group.variants[0]?.sku ?? "",
                    quantity: "1",
                  };
                  const selectedVariant =
                    group.variants.find(
                      (variant) => variant.sku === draft.selectedSku,
                    ) ?? group.variants[0];
                  const hasMultipleVariants = group.variants.length > 1;

                  return (
                    <li key={group.productId} className="px-3 py-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ocean-900">
                            {group.productName}
                          </p>
                          {selectedVariant && (
                            <p className="mt-1 text-xs text-slate-500">
                              {formatPrice(resolveInventoryUnitPrice(selectedVariant))}
                              {" · "}
                              Còn {selectedVariant.quantityAvailable ?? 0}
                            </p>
                          )}
                        </div>

                        <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1.4fr)_88px_auto] lg:w-auto lg:min-w-[320px]">
                          {hasMultipleVariants ? (
                            <div>
                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                Loại
                              </label>
                              <select
                                value={draft.selectedSku}
                                onChange={(e) =>
                                  updateDraft(group.productId, {
                                    selectedSku: e.target.value,
                                  })
                                }
                                aria-label={`Loại ${group.productName}`}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                              >
                                {group.variants.map((variant) => (
                                  <option key={variant.sku} value={variant.sku}>
                                    {formatInventoryVariantOption(variant)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="hidden sm:block" aria-hidden />
                          )}

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">
                              Số lượng
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={selectedVariant?.quantityAvailable ?? 1}
                              value={draft.quantity}
                              onChange={(e) =>
                                updateDraft(group.productId, {
                                  quantity: e.target.value,
                                })
                              }
                              aria-label={`Số lượng ${group.productName}`}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(group)}
                            className="rounded-lg bg-ocean-700 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-800 sm:self-end"
                          >
                            Thêm
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {!isFiltering && !isSearching && totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Trang {page + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 0}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages - 1, current + 1))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <ShoppingCart className="h-5 w-5 text-teal-600" />
            <h2 className="font-semibold text-ocean-900">Giỏ POS</h2>
            <span className="ml-auto text-xs text-slate-500">
              {cart.length} dòng
            </span>
          </div>

          {cart.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              Chưa có sản phẩm
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cart.map((line) => (
                <li key={line.sku} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ocean-900">
                        {line.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {line.variantLabel} · {line.sku}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.sku)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateLineQty(line.sku, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-slate-200"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateLineQty(line.sku, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-slate-200"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-teal-700">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-100 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-600">Tổng cộng</span>
              <span className="text-xl font-bold text-ocean-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            {checkoutError && (
              <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {checkoutError}
              </div>
            )}

            <button
              type="button"
              disabled={cart.length === 0 || isCheckingOut}
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Thanh toán — Trừ kho"
              )}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
