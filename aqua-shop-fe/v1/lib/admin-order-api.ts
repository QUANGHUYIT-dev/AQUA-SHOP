import api, { unwrapData } from "@/lib/axios-client";
import type { ApiEnvelope, SpringPage } from "@/types/product";
import type {
  AdminOrderFilterParams,
  AdminOrderSummaryResponse,
  OrderResponse,
  UpdateOrderStatusRequest,
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

export async function getAdminOrders(
  params: AdminOrderFilterParams = {},
): Promise<SpringPage<AdminOrderSummaryResponse>> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<AdminOrderSummaryResponse>>
  >("/admin/orders", {
    params: {
      page: 0,
      size: 10,
      sort: "createdAt,desc",
      ...params,
    },
  });
  return unwrapPage<AdminOrderSummaryResponse>(data);
}

export async function getAdminOrderById(
  orderId: string,
): Promise<OrderResponse> {
  const { data } = await api.get<ApiEnvelope<OrderResponse>>(
    `/admin/orders/${orderId}`,
  );
  return unwrapData<OrderResponse>(data);
}

export async function updateAdminOrderStatus(
  orderId: string,
  request: UpdateOrderStatusRequest,
): Promise<OrderResponse> {
  const { data } = await api.put<ApiEnvelope<OrderResponse>>(
    `/admin/orders/${orderId}/status`,
    request,
  );
  return unwrapData<OrderResponse>(data);
}
