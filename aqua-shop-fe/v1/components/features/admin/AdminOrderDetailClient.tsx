"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types/order";
import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from "@/lib/admin-order-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { ROUTES } from "@/constants/routes";
import { useFeedback } from "@/hooks/useFeedback";
import { isValidImageUrl } from "@/lib/image-utils";
import {
  buildVariantLabel,
  formatDateTime,
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
  getAdminNextStatuses,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "@/utils/order-utils";
import { formatPrice } from "@/utils/product-utils";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";

interface AdminOrderDetailClientProps {
  orderId: string;
}

export default function AdminOrderDetailClient({
  orderId,
}: AdminOrderDetailClientProps) {
  const { toast } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Awaited<
    ReturnType<typeof getAdminOrderById>
  > | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminOrderById(orderId);
      setOrder(result);
      setError(null);
      const options = getAdminNextStatuses(result.status);
      setNextStatus(options[0] ?? "");
    } catch (err) {
      setOrder(null);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStatus) return;

    setSubmitting(true);
    try {
      const updated = await updateAdminOrderStatus(orderId, {
        status: nextStatus,
        note: statusNote.trim() || undefined,
      });
      setOrder(updated);
      setStatusNote("");
      const options = getAdminNextStatuses(updated.status);
      setNextStatus(options[0] ?? "");
      toast.success(SYSTEM_MESSAGES.SAVE_SUCCESS);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
        {error}
        <div className="mt-4">
          <Link
            href={ROUTES.ADMIN_ORDERS}
            className="text-sm font-semibold text-teal-600 hover:underline"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const nextStatusOptions = getAdminNextStatuses(order.status);

  return (
    <>
      <Link
        href={ROUTES.ADMIN_ORDERS}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại danh sách đơn
      </Link>

      <AdminPageHeader
        title={`Đơn hàng #${order.orderId}`}
        description={`Đặt ngày ${formatDateTime(order.createdAt)}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusColor(order.status)}`}
        >
          {formatOrderStatus(order.status)}
        </span>
        <span className="text-sm text-slate-500">
          Khách: {order.customerId}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-ocean-900">
                Sản phẩm ({order.totalItems})
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const variantLabel = buildVariantLabel(
                  item.variantSize,
                  item.variantVolume,
                  item.variantColor,
                );
                return (
                  <li key={item.orderItemId} className="flex gap-4 px-5 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                      {isValidImageUrl(item.thumbnailUrl) ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ocean-900">
                        {item.productName}
                      </p>
                      {variantLabel && (
                        <p className="text-sm text-slate-500">{variantLabel}</p>
                      )}
                      <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ocean-900">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          {order.histories.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-ocean-900">Lịch sử đơn</h2>
              </div>
              <ol className="space-y-4 px-5 py-4">
                {order.histories.map((history) => (
                  <li key={history.orderHistoryId} className="text-sm">
                    <p className="font-medium text-ocean-900">
                      {history.toStatus && formatOrderStatus(history.toStatus)}
                    </p>
                    {history.note && (
                      <p className="text-slate-600">{history.note}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {formatDateTime(history.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-ocean-900">Giao hàng</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Người nhận</dt>
                <dd className="font-medium text-ocean-900">
                  {order.receiverName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">SĐT</dt>
                <dd>{order.receiverPhone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Địa chỉ</dt>
                <dd>{order.shippingAddress}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-ocean-900">Thanh toán</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Phương thức</dt>
                <dd>{formatPaymentMethod(order.paymentMethod)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Trạng thái</dt>
                <dd>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                  >
                    {formatPaymentStatus(order.paymentStatus)}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                <dt>Tổng cộng</dt>
                <dd>{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          {nextStatusOptions.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-ocean-900">
                Cập nhật trạng thái
              </h2>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <select
                  title="Trạng thái đơn"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                >
                  {nextStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatOrderStatus(status)}
                    </option>
                  ))}
                </select>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú (tùy chọn)"
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="submit"
                  disabled={submitting || !nextStatus}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Lưu trạng thái
                </button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
