export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "WALLET" | "BANK_TRANSFER" | "CASH";

export type OrderType = "ONLINE" | "OFFLINE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

/** Cancellable statuses — FE only shows cancel button for these */
export const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED"];

export interface CancelOrderRequest {
  reason: string;
}

export interface CheckoutRequest {
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  note?: string;
  paymentMethod: PaymentMethod;
  shippingFee?: number;
}

export interface OrderItemResponse {
  orderItemId: string;
  sku: string;
  productId: string;
  productName: string;
  thumbnailUrl: string | null;
  variantSize: string | null;
  variantVolume: string | null;
  variantColor: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderHistoryResponse {
  orderHistoryId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  fromPaymentStatus: PaymentStatus | null;
  toPaymentStatus: PaymentStatus;
  note: string | null;
  changedBy: string;
  actorType: "CUSTOMER" | "ADMIN" | "SYSTEM";
  createdAt: string;
}

export interface OrderResponse {
  orderId: string;
  customerId: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  note: string | null;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  items: OrderItemResponse[];
  histories: OrderHistoryResponse[];
}

export interface OrderSummaryResponse {
  orderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  totalItems: number;
  createdAt: string;
}

export interface OrderFilterParams {
  status?: OrderStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminOrderSummaryResponse extends OrderSummaryResponse {
  customerId?: string;
  customerName?: string;
  orderType?: OrderType;
  receiverName?: string;
  receiverPhone?: string;
}

export interface CreateOrderItemRequest {
  sku: string;
  quantity: number;
}

export interface CreateOrderRequest {
  orderType: "OFFLINE";
  items: CreateOrderItemRequest[];
  receiverName?: string;
  receiverPhone?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}

export interface AdminOrderFilterParams extends OrderFilterParams {}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}
