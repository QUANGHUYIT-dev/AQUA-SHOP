import { getCart } from "@/lib/api";
import { addProductToServerCart } from "@/lib/cart-actions";
import { clearSessionCart, readSessionCart } from "@/lib/cart-session-storage";
import type { ServerCart } from "@/types/cart";

/**
 * Sync session cart to server:
 * 1. GET /products/{id} → resolve variants[].sku
 * 2. POST /cart/items { sku, quantity } for each item
 * 3. Clear session cart
 * 4. GET /cart
 */
export async function syncSessionCartToServer(): Promise<ServerCart> {
  const pendingItems = readSessionCart();

  for (const item of pendingItems) {
    try {
      await addProductToServerCart(
        item.productId,
        item.variantId,
        item.quantity,
      );
    } catch (error) {
      console.warn(
        `[cart-sync] Skip item product=${item.productId} variant=${item.variantId}`,
        error,
      );
    }
  }

  clearSessionCart();
  return getCart();
}
