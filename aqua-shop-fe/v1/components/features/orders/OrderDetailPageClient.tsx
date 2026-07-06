"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrderDetail } from "@/hooks/useOrders";
import {
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatDateTime,
  buildVariantLabel,
} from "@/utils/order-utils";
import { formatPrice } from "@/utils/product-utils";
import { ROUTES } from "@/constants/routes";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";

interface Props {
  orderId: string;
}

const CANCEL_REASONS = [
  "Đặt nhầm sản phẩm",
  "Đổi ý / không cần nữa",
  "Tìm được giá tốt hơn",
  "Giao hàng quá lâu",
  "Muốn thay đổi thông tin giao hàng",
] as const;

const OTHER_REASON = "Khác";

export default function OrderDetailPageClient({ orderId }: Props) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { order, isLoading, isCancelling, error, cancel } =
    useOrderDetail(orderId);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const resetCancelForm = () => {
    setSelectedReason("");
    setCustomReason("");
    setReasonError(null);
    setCancelError(null);
  };

  const closeCancelModal = () => {
    setShowCancelConfirm(false);
    resetCancelForm();
  };

  const resolveCancelReason = (): string | null => {
    if (!selectedReason) {
      return null;
    }
    if (selectedReason === OTHER_REASON) {
      const trimmed = customReason.trim();
      if (trimmed.length < 5) {
        return null;
      }
      return trimmed;
    }
    return selectedReason;
  };

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=/orders/${orderId}`);
    }
  }, [isHydrated, isAuthenticated, router, orderId]);

  const handleCancel = async () => {
    const reason = resolveCancelReason();
    if (!reason) {
      if (!selectedReason) {
        setReasonError("Vui lòng chọn lý do hủy đơn.");
      } else {
        setReasonError("Lý do khác phải có ít nhất 5 ký tự.");
      }
      return;
    }

    setReasonError(null);
    setCancelError(null);
    const ok = await cancel({ reason });
    if (!ok) {
      setCancelError(error ?? "Không thể hủy đơn hàng.");
      return;
    }
    closeCancelModal();
  };

  const canSubmitCancel =
    selectedReason !== "" &&
    (selectedReason !== OTHER_REASON || customReason.trim().length >= 5);

  const canCancel =
    order && (order.status === "PENDING" || order.status === "CONFIRMED");

  if (!isHydrated || (isLoading && !order)) {
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

  if (error && !order) {
    return (
      <>
        <SiteHeader />
        <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-50">
          <div className="text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
            <p className="mt-3 text-sm text-slate-600">{error}</p>
            <Link
              href={ROUTES.ORDERS}
              className="mt-4 inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
            >
              <ChevronLeft className="h-4 w-4" /> Quay lại đơn hàng
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) return null;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
          {/* Breadcrumb */}
          <Link
            href={ROUTES.ORDERS}
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700"
          >
            <ChevronLeft className="h-4 w-4" /> Đơn hàng của tôi
          </Link>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ocean-900">
                Đơn hàng #{order.orderId}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Đặt ngày {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusColor(order.status)}`}
              >
                {formatOrderStatus(order.status)}
              </span>
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCancelling}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {isCancelling && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>

          {(cancelError ?? error) && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {cancelError ?? error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Left */}
            <div className="space-y-6">
              {/* Order items */}
              <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-base font-semibold text-ocean-900">
                    Sản phẩm ({order.totalItems})
                  </h2>
                </div>
                <ul className="divide-y divide-slate-50">
                  {order.items.map((item) => {
                    const variantLabel = buildVariantLabel(
                      item.variantSize ?? null,
                      item.variantVolume ?? null,
                      item.variantColor ?? null,
                    );
                    return (
                      <li
                        key={item.orderItemId}
                        className="flex gap-4 px-6 py-4"
                      >
                        {item.thumbnailUrl ? (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.productName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ocean-900 line-clamp-2">
                            {item.productName}
                          </p>
                          {variantLabel && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {variantLabel}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-slate-500">
                            SKU: {item.sku}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-ocean-900">
                            {formatPrice(item.lineTotal)}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Status timeline */}
              {order.histories && order.histories.length > 0 && (
                <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-semibold text-ocean-900">
                      Lịch sử đơn hàng
                    </h2>
                  </div>
                  <ol className="relative px-6 py-4">
                    {order.histories.map((h, i) => (
                      <li
                        key={h.orderHistoryId}
                        className="relative pb-6 pl-6 last:pb-0"
                      >
                        {/* line */}
                        {i < order.histories.length - 1 && (
                          <span className="absolute left-2 top-3 h-full w-px bg-slate-200" />
                        )}
                        {/* dot */}
                        <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-teal-400 bg-white" />
                        <div>
                          <p className="text-sm font-medium text-ocean-900">
                            {h.toStatus && formatOrderStatus(h.toStatus)}
                          </p>
                          {h.note && (
                            <p className="text-xs text-slate-500">{h.note}</p>
                          )}
                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatDateTime(h.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Shipping */}
              <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-ocean-900">
                  Thông tin giao hàng
                </h2>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Người nhận</dt>
                    <dd className="font-medium text-ocean-900">
                      {order.receiverName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Số điện thoại</dt>
                    <dd className="font-medium text-ocean-900">
                      {order.receiverPhone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Địa chỉ</dt>
                    <dd className="text-ocean-900">{order.shippingAddress}</dd>
                  </div>
                  {order.note && (
                    <div>
                      <dt className="text-xs text-slate-500">Ghi chú</dt>
                      <dd className="text-ocean-900">{order.note}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Payment */}
              <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-ocean-900">
                  Thanh toán
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Phương thức</dt>
                    <dd className="font-medium text-ocean-900">
                      {formatPaymentMethod(order.paymentMethod)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Trạng thái TT</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                      >
                        {formatPaymentStatus(order.paymentStatus)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Price breakdown */}
              <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-ocean-900">
                  Chi tiết giá
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <dt>Tạm tính</dt>
                    <dd>{formatPrice(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>Phí vận chuyển</dt>
                    <dd>{formatPrice(order.shippingFee)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-ocean-900">
                    <dt>Tổng cộng</dt>
                    <dd className="text-teal-700 text-base">
                      {formatPrice(order.totalAmount)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Cancel confirm modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-ocean-900">
              Hủy đơn hàng
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng #
              {order.orderId}. Thao tác này không thể hoàn tác.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-ocean-900">
                Lý do hủy <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      selectedReason === reason
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => {
                        setSelectedReason(reason);
                        setReasonError(null);
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-slate-700">{reason}</span>
                  </label>
                ))}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    selectedReason === OTHER_REASON
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={OTHER_REASON}
                    checked={selectedReason === OTHER_REASON}
                    onChange={() => {
                      setSelectedReason(OTHER_REASON);
                      setReasonError(null);
                    }}
                    className="mt-0.5"
                  />
                  <span className="text-slate-700">{OTHER_REASON}</span>
                </label>
              </div>

              {selectedReason === OTHER_REASON && (
                <textarea
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    setReasonError(null);
                  }}
                  rows={3}
                  maxLength={480}
                  placeholder="Nhập lý do cụ thể (tối thiểu 5 ký tự)..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              )}
            </div>

            {reasonError && (
              <p className="mt-3 text-sm text-red-600">{reasonError}</p>
            )}
            {cancelError && (
              <p className="mt-3 text-sm text-red-600">{cancelError}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeCancelModal}
                disabled={isCancelling}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Giữ đơn
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling || !canSubmitCancel}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
