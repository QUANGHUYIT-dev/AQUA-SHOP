import type { ProductType } from "@/types/product";
import { getCategoryImage } from "@/lib/category-images";

export function isValidImageUrl(url?: string | null): url is string {
  return Boolean(url?.trim());
}

/** URL thumbnail hợp lệ, hoặc ảnh mặc định theo loại sản phẩm. */
export function resolveProductThumbnailUrl(
  thumbnailUrl?: string | null,
  productType?: ProductType,
): string {
  if (isValidImageUrl(thumbnailUrl)) return thumbnailUrl.trim();
  return getCategoryImage(productType);
}
