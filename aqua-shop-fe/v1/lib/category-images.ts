import type { ProductType } from "@/types/product";

const CATEGORY_IMAGES: Partial<Record<ProductType, string>> = {
  PLANT:
    "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&q=80",
  FISH:
    "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&q=80",
  ACCESSORY:
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80",
  EQUIPMENT:
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80",
  CHEMICAL:
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80",
  FOOD:
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
  SUBSTRATE:
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
};

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80";

export function getCategoryImage(
  categoryType?: ProductType,
  imageUrl?: string,
): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  if (categoryType && CATEGORY_IMAGES[categoryType]) {
    return CATEGORY_IMAGES[categoryType];
  }
  return DEFAULT_CATEGORY_IMAGE;
}
