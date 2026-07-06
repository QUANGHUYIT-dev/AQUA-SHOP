"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";
import type { OrderStatus } from "@/types/order";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrders } from "@/hooks/useOrders";
import { formatOrderStatus, getOrderStatusColor } from "@/utils/order-utils";
import { formatPrice } from "@/utils/product-utils";
import { ROUTES, getOrderDetailPath } from "@/constants/routes";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

const STATUS_FILTERS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang chuẩn bị" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function OrdersPageClient() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { page, params, isLoading, error, goToPage, filterByStatus } =
    useMyOrders();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.ORDERS)}`,
      );
    }
  }, [isHydrated, isAuthenticated, router]);

  const activeStatus = params.status || "ALL";

  const showLoading = !isHydrated || (isLoading && !page);

  if (showLoading) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) return null;

  const orders = page?.content || [];
  const totalPages = page?.totalPages || 0;
  const currentPage = page?.number || 0;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
          <h1 className="mb-6 text-2xl font-bold text-ocean-900 sm:text-3xl">
            Đơn hàng của tôi
          </h1>

          {/* Status filters */}
          <div className="mb-6 overflow-x-auto border-b border-slate-200">
            <nav className="-mb-px flex space-x-6 whitespace-nowrap">
              {STATUS_FILTERS.map((filter) => {
                const isActive = activeStatus === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() =>
                      filterByStatus(
                        filter.value === "ALL" ? undefined : filter.value,
                      )
                    }
                    className={`border-b-2 px-1 pb-4 text-sm font-medium transition ${
                      isActive
                        ? "border-teal-600 text-teal-600"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white py-12 text-center shadow-sm">
              <Package className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-semibold text-ocean-900">
                Không tìm thấy đơn hàng
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Bạn chưa có đơn hàng nào ở trạng thái này.
              </p>
              <Link
                href={ROUTES.HOME}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ocean-900">
                          #{order.orderId}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(
                            order.status,
                          )}`}
                        >
                          {formatOrderStatus(order.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Đặt ngày{" "}
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {order.totalItems} sản phẩm
                        </p>
                        <p className="text-sm font-bold text-teal-700">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                      <Link
                        href={getOrderDetailPath(order.orderId)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-slate-500">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
