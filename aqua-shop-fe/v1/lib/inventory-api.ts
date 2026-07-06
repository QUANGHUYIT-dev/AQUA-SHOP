import api, { unwrapData } from "@/lib/axios-client";
import type { ApiEnvelope, SpringPage } from "@/types/product";
import type {
  InventoryAdjustRequest,
  InventoryFilterParams,
  InventoryHistoryResponse,
  InventoryResponse,
  SetInventoryQuantityRequest,
} from "@/types/inventory";

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

function encodeSku(sku: string): string {
  return encodeURIComponent(sku);
}

/** GET /inventory — list inventory (paginated, searchable) */
export async function getInventoryList(
  params: InventoryFilterParams = {},
): Promise<SpringPage<InventoryResponse>> {
  const { data } = await api.get<ApiEnvelope<SpringPage<InventoryResponse>>>(
    "/inventory",
    {
      params: {
        page: 0,
        size: 20,
        ...params,
      },
    },
  );
  return unwrapPage<InventoryResponse>(data);
}

/** GET /inventory/sku/{sku} — inventory by SKU */
export async function getInventoryBySku(
  sku: string,
): Promise<InventoryResponse> {
  const { data } = await api.get<ApiEnvelope<InventoryResponse>>(
    `/inventory/sku/${encodeSku(sku)}`,
  );
  return unwrapData<InventoryResponse>(data);
}

/** GET /inventory/{inventoryId} — inventory by ID */
export async function getInventoryById(
  inventoryId: string,
): Promise<InventoryResponse> {
  const { data } = await api.get<ApiEnvelope<InventoryResponse>>(
    `/inventory/${inventoryId}`,
  );
  return unwrapData<InventoryResponse>(data);
}

/** GET /inventory/sku/{sku}/history — inventory change history */
export async function getInventoryHistory(
  sku: string,
): Promise<InventoryHistoryResponse[]> {
  const { data } = await api.get<
    ApiEnvelope<InventoryHistoryResponse[] | SpringPage<InventoryHistoryResponse>>
  >(`/inventory/sku/${encodeSku(sku)}/history`);

  const raw = unwrapData<InventoryHistoryResponse[] | SpringPage<InventoryHistoryResponse>>(data);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray(raw.content)) {
    return raw.content;
  }
  return [];
}

/** PUT /inventory/sku/{sku}/adjust — nhập/xuất theo delta */
export async function adjustInventory(
  sku: string,
  request: InventoryAdjustRequest,
): Promise<InventoryResponse> {
  const { data } = await api.put<ApiEnvelope<InventoryResponse>>(
    `/inventory/sku/${encodeSku(sku)}/adjust`,
    request,
  );
  return unwrapData<InventoryResponse>(data);
}

/** PUT /inventory/sku/{sku} — đặt tồn kho tuyệt đối */
export async function setInventoryQuantity(
  sku: string,
  request: SetInventoryQuantityRequest,
): Promise<InventoryResponse> {
  const { data } = await api.put<ApiEnvelope<InventoryResponse>>(
    `/inventory/sku/${encodeSku(sku)}`,
    request,
  );
  return unwrapData<InventoryResponse>(data);
}
