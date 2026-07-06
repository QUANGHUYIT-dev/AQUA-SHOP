"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Package, Search } from "lucide-react";
import type { OrderStatus } from "@/types/order";
import type { AdminOrderFilterParams } from "@/types/order";
import { getAdminOrders } from "@/lib/admin-order-api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  formatOrderStatus,
  getOrderStatusColor,
} from "@/utils/order-utils";
import { formatPrice } from "@/utils/product-utils";
import { ROUTES, getAdminOrderDetailPath } from "@/constants/routes";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function AdminOrdersClient() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof getAdminOrders>>["content"]
  >([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminOrderFilterParams = {
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      };
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const result = await getAdminOrders(params);
      setOrders(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setError(null);
    } catch (err) {
      setOrders([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <>
      <AdminPageHeader
        title="Đơn hàng"
        description={`${totalElements} đơn hàng trong hệ thống`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(0);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === filter.value
                ? "bg-teal-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Không có đơn hàng</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Mã đơn</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Khách hàng</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Người nhận</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Loại</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Tổng tiền</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Ngày đặt</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-ocean-900">
                    #{order.orderId}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.customerName ?? order.customerId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{order.receiverName ?? "—"}</p>
                    {order.receiverPhone && (
                      <p className="text-xs text-slate-400">
                        {order.receiverPhone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.orderType === "OFFLINE"
                          ? "bg-violet-100 text-violet-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {order.orderType === "OFFLINE" ? "POS" : "Online"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ocean-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={getAdminOrderDetailPath(order.orderId)}
                      className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
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
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
