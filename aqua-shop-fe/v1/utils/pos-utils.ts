import type { InventoryResponse } from "@/types/inventory";
import type { ProductSummary, ProductVariant } from "@/types/product";
import { formatPrice } from "@/utils/product-utils";
import { buildVariantLabel } from "@/utils/order-utils";

export interface ProductInventoryGroup {
  productId: string;
  productName: string;
  variants: InventoryResponse[];
}

export function resolveInventoryUnitPrice(item: InventoryResponse): number {
  if (item.salePrice != null && item.salePrice > 0) return item.salePrice;
  return item.price ?? 0;
}

export function getInventoryVariantLabel(item: InventoryResponse): string {
  const fromAttributes = buildVariantLabel(
    item.size ?? null,
    item.volume ?? null,
    item.color ?? null,
  );
  return fromAttributes ?? item.sku;
}

export function formatInventoryVariantOption(item: InventoryResponse): string {
  const label = getInventoryVariantLabel(item);
  const price = resolveInventoryUnitPrice(item);
  const available = item.quantityAvailable ?? 0;
  return `${label} — ${formatPrice(price)} (còn ${available})`;
}

export function groupInventoryByProduct(
  items: InventoryResponse[],
): ProductInventoryGroup[] {
  const map = new Map<string, ProductInventoryGroup>();

  for (const item of items) {
    const key = item.productId || item.sku;
    const existing = map.get(key);
    if (existing) {
      existing.variants.push(item);
      continue;
    }

    map.set(key, {
      productId: key,
      productName: item.productName,
      variants: [item],
    });
  }

  for (const group of map.values()) {
    group.variants = sortPosVariants(group.variants);
  }

  return Array.from(map.values());
}

function sortPosVariants(variants: InventoryResponse[]): InventoryResponse[] {
  return [...variants].sort((a, b) =>
    getInventoryVariantLabel(a).localeCompare(getInventoryVariantLabel(b), "vi"),
  );
}

function variantToInventoryItem(
  product: Pick<ProductSummary, "id" | "name">,
  variant: ProductVariant,
  inventoryBySku: Map<string, InventoryResponse>,
): InventoryResponse | null {
  if (!variant.sku) return null;

  const fromInventory = inventoryBySku.get(variant.sku);
  if (fromInventory) {
    return {
      ...fromInventory,
      size: variant.size,
      volume: variant.volume,
      color: variant.color,
    };
  }

  const stock = variant.stockQuantity ?? 0;
  return {
    inventoryId: null,
    variantId: variant.id,
    sku: variant.sku,
    productId: product.id,
    productName: product.name,
    size: variant.size,
    volume: variant.volume,
    color: variant.color,
    quantityOnHand: stock,
    quantityOnHold: 0,
    quantityAvailable: stock,
    price: variant.price,
    salePrice: variant.salePrice ?? null,
  };
}

/** Tìm theo sản phẩm — gộp variant từ product API với tồn kho (nếu có). */
export function buildPosProductGroupsFromProducts(
  products: ProductSummary[],
  inventoryItems: InventoryResponse[] = [],
): ProductInventoryGroup[] {
  const inventoryBySku = new Map(inventoryItems.map((item) => [item.sku, item]));

  return products
    .map((product) => ({
      productId: product.id,
      productName: product.name,
      variants: sortPosVariants(
        product.variants
          .map((variant) =>
            variantToInventoryItem(product, variant, inventoryBySku),
          )
          .filter((item): item is InventoryResponse => item != null),
      ),
    }))
    .filter((group) => group.variants.length > 0);
}
