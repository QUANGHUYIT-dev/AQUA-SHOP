import type { SessionCartItem } from "@/types/cart";

const STORAGE_KEY = "aqua_cart_session";

function readRawItems(): SessionCartItem[] {
  if (typeof window === "undefined") return [];

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        const record = item as Record<string, unknown>;
        const productId = String(record.productId ?? "").trim();
        const variantId = String(record.variantId ?? "").trim();
        const quantity = Number(record.quantity ?? 0);

        if (!productId || !variantId || quantity <= 0) return null;

        return { productId, variantId, quantity };
      })
      .filter((item): item is SessionCartItem => item != null);
  } catch {
    return [];
  }
}

function writeRawItems(items: SessionCartItem[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function readSessionCart(): SessionCartItem[] {
  return readRawItems();
}

export function clearSessionCart(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getSessionCartItemCount(): number {
  return readRawItems().reduce((total, item) => total + item.quantity, 0);
}

export function addToSessionCart(
  productId: string,
  variantId: string,
  quantity = 1,
): SessionCartItem[] {
  const normalizedProductId = productId.trim();
  const normalizedVariantId = variantId.trim();
  const normalizedQuantity = Math.max(1, Math.floor(quantity));

  if (!normalizedProductId || !normalizedVariantId) {
    return readRawItems();
  }

  const items = readRawItems();
  const existing = items.find(
    (item) =>
      item.productId === normalizedProductId &&
      item.variantId === normalizedVariantId,
  );

  if (existing) {
    existing.quantity += normalizedQuantity;
  } else {
    items.push({
      productId: normalizedProductId,
      variantId: normalizedVariantId,
      quantity: normalizedQuantity,
    });
  }

  writeRawItems(items);
  return items;
}

export function setSessionCartItemQuantity(
  productId: string,
  variantId: string,
  quantity: number,
): SessionCartItem[] {
  const normalizedProductId = productId.trim();
  const normalizedVariantId = variantId.trim();
  const normalizedQuantity = Math.floor(quantity);

  const items = readRawItems();
  const index = items.findIndex(
    (item) =>
      item.productId === normalizedProductId &&
      item.variantId === normalizedVariantId,
  );

  if (index === -1) return items;

  if (normalizedQuantity <= 0) {
    items.splice(index, 1);
  } else {
    items[index] = { ...items[index], quantity: normalizedQuantity };
  }

  writeRawItems(items);
  return items;
}

export function removeSessionCartItem(
  productId: string,
  variantId: string,
): SessionCartItem[] {
  const normalizedProductId = productId.trim();
  const normalizedVariantId = variantId.trim();

  const items = readRawItems().filter(
    (item) =>
      !(
        item.productId === normalizedProductId &&
        item.variantId === normalizedVariantId
      ),
  );

  writeRawItems(items);
  return items;
}

export function removeFromSessionCart(
  productId: string,
  variantId: string,
  quantity = 1,
): SessionCartItem[] {
  const normalizedProductId = productId.trim();
  const normalizedVariantId = variantId.trim();
  const normalizedQuantity = Math.max(1, Math.floor(quantity));

  const items = readRawItems();
  const index = items.findIndex(
    (item) =>
      item.productId === normalizedProductId &&
      item.variantId === normalizedVariantId,
  );

  if (index === -1) return items;

  const nextQuantity = items[index].quantity - normalizedQuantity;
  if (nextQuantity <= 0) {
    items.splice(index, 1);
  } else {
    items[index] = { ...items[index], quantity: nextQuantity };
  }

  writeRawItems(items);
  return items;
}
