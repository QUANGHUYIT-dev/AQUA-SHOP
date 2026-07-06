import api, { unwrapData } from "@/lib/axios-client";
import type { ApiEnvelope, SpringPage } from "@/types/product";
import type {
  CancelOrderRequest,
  CheckoutRequest,
  CreateOrderRequest,
  OrderFilterParams,
  OrderHistoryResponse,
  OrderResponse,
  OrderSummaryResponse,
} from "@/types/order";

function unwrapPage<T>(payload: unknown): SpringPage<T> {
  const data = unwrapData<SpringPage<T> | T[]>(payload);

  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
    };
  }

  if (data && typeof data === "object" && Array.isArray(data.content)) {
    return data;
  }

  return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };
}

/** POST /orders — tạo đơn POS (orderType=OFFLINE) */
export async function createPosOrder(
  request: CreateOrderRequest,
): Promise<OrderResponse> {
  const { data } = await api.post<ApiEnvelope<OrderResponse>>("/orders", request);
  return unwrapData<OrderResponse>(data);
}

/** POST /orders/checkout — create order from current cart */
export async function checkout(
  request: CheckoutRequest,
): Promise<OrderResponse> {
  const { data } = await api.post<ApiEnvelope<OrderResponse>>(
    "/orders/checkout",
    request,
  );
  return unwrapData<OrderResponse>(data);
}

/** GET /orders — list my orders (paginated) */
export async function getMyOrders(
  params: OrderFilterParams = {},
): Promise<SpringPage<OrderSummaryResponse>> {
  const { data } = await api.get<ApiEnvelope<SpringPage<OrderSummaryResponse>>>(
    "/orders",
    {
      params: {
        page: 0,
        size: 10,
        sort: "createdAt,desc",
        ...params,
      },
    },
  );
  return unwrapPage<OrderSummaryResponse>(data);
}

/** GET /orders/{orderId} — order detail */
export async function getOrderById(orderId: string): Promise<OrderResponse> {
  const { data } = await api.get<ApiEnvelope<OrderResponse>>(
    `/orders/${orderId}`,
  );
  return unwrapData<OrderResponse>(data);
}

/** GET /orders/{orderId}/history — order status timeline */
export async function getOrderHistory(
  orderId: string,
): Promise<OrderHistoryResponse[]> {
  const { data } = await api.get<ApiEnvelope<OrderHistoryResponse[]>>(
    `/orders/${orderId}/history`,
  );
  return unwrapData<OrderHistoryResponse[]>(data);
}

/** POST /orders/{orderId}/cancel — cancel order */
export async function cancelOrder(
  orderId: string,
  request: CancelOrderRequest,
): Promise<OrderResponse> {
  const { data } = await api.post<ApiEnvelope<OrderResponse>>(
    `/orders/${orderId}/cancel`,
    request,
  );
  return unwrapData<OrderResponse>(data);
}
