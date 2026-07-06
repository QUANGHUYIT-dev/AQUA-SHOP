import { getProductBySlug } from "@/lib/api";
import type { Product } from "@/types/product";
import { getDefaultVariant } from "@/utils/product-utils";

export interface CartItemTarget {
  productId: string;
  variantId: string;
}

function isValidVariantId(variantId?: string): variantId is string {
  return Boolean(variantId?.trim());
}

export function canAddProductToCart(product: Product): boolean {
  const localVariant = getDefaultVariant(product.variants);
  if (isValidVariantId(localVariant?.id)) return true;
  if (isValidVariantId(product.defaultVariantId)) return true;
  return Boolean(product.slug?.trim());
}

export async function resolveProductVariantForCart(
  product: Product,
): Promise<CartItemTarget | null> {
  const localVariant = getDefaultVariant(product.variants);
  if (isValidVariantId(localVariant?.id)) {
    return {
      productId: product.id,
      variantId: localVariant.id.trim(),
    };
  }

  if (isValidVariantId(product.defaultVariantId)) {
    return {
      productId: product.id,
      variantId: product.defaultVariantId.trim(),
    };
  }

  const slug = product.slug?.trim();
  if (!slug) return null;

  const detail = await getProductBySlug(slug);
  const variant = getDefaultVariant(detail.variants);
  if (!isValidVariantId(variant?.id)) return null;

  return {
    productId: detail.id,
    variantId: variant.id.trim(),
  };
}
