import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";
import type { InventoryChangeType } from "@/types/inventory";

export function formatOrderStatus(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };
  return map[status] ?? status;
}

export function formatPaymentMethod(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    COD: "Thanh toán khi nhận hàng",
    WALLET: "Ví AquaShop",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
    CASH: "Tiền mặt",
  };
  return map[method] ?? method;
}

export function formatPaymentStatus(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
  };
  return map[status] ?? status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPING: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-teal-100 text-teal-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-slate-100 text-slate-800";
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-slate-100 text-slate-800",
  };
  return map[status] ?? "bg-slate-100 text-slate-800";
}

export function formatInventoryChangeType(type: InventoryChangeType): string {
  const map: Record<InventoryChangeType, string> = {
    ORDER_HOLD: "Giữ hàng (đặt online)",
    ORDER_HOLD_RELEASE: "Giải phóng hàng giữ",
    ORDER_DEDUCT: "Trừ tồn thật",
    ORDER_RESTORE: "Hoàn kho",
    MANUAL_IN: "Nhập kho thủ công",
    MANUAL_OUT: "Xuất kho thủ công",
    MANUAL_ADJUST: "Kiểm kho / điều chỉnh",
    SYNC_INITIAL: "Khởi tạo đồng bộ",
  };
  return map[type] ?? type;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/** Build variant label from order item parts */
export function buildVariantLabel(
  size: string | null,
  volume: string | null,
  color: string | null,
): string | undefined {
  const parts = [size, volume, color].filter(
    (v): v is string => v != null && v.trim() !== "",
  );
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

const ADMIN_STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
};

export function getAdminNextStatuses(status: OrderStatus): OrderStatus[] {
  return ADMIN_STATUS_TRANSITIONS[status] ?? [];
}
