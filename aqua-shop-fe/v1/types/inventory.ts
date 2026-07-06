export type InventoryChangeType =
  | "ORDER_HOLD"
  | "ORDER_HOLD_RELEASE"
  | "ORDER_DEDUCT"
  | "ORDER_RESTORE"
  | "MANUAL_IN"
  | "MANUAL_OUT"
  | "MANUAL_ADJUST"
  | "SYNC_INITIAL";

export interface InventoryResponse {
  inventoryId: string | null;
  variantId: string;
  sku: string;
  productId: string;
  productName: string;
  size?: string | null;
  volume?: string | null;
  color?: string | null;
  quantityOnHand: number;
  quantityOnHold: number;
  quantityAvailable: number;
  price?: number | null;
  salePrice?: number | null;
}

export interface InventoryHistoryResponse {
  inventoryHistoryId: string;
  sku: string;
  changeType: InventoryChangeType;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  changedBy: string;
  createdAt: string;
}

export interface InventoryAdjustRequest {
  quantityChange: number;
  note?: string;
}

export interface SetInventoryQuantityRequest {
  quantityOnHand: number;
  note?: string;
}

export interface InventoryFilterParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}
