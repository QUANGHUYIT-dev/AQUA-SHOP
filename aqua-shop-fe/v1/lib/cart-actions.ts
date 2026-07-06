import { addToCart, getProductById } from "@/lib/api";

export async function resolveVariantSku(
  productId: string,
  variantId: string,
): Promise<string> {
  const product = await getProductById(productId);
  const variant = product.variants.find((item) => item.id === variantId);

  if (!variant?.sku?.trim()) {
    throw new Error("Không tìm thấy SKU cho biến thể sản phẩm");
  }

  return variant.sku.trim();
}

export async function addProductToServerCart(
  productId: string,
  variantId: string,
  quantity = 1,
): Promise<void> {
  const sku = await resolveVariantSku(productId, variantId);
  await addToCart(sku, quantity);
}
