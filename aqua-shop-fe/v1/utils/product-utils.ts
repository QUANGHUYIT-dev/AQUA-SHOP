import type { Product, ProductType, ProductVariant } from "@/types/product";

export function getDefaultVariant(
  variants: ProductVariant[],
): ProductVariant | undefined {
  if (!variants?.length) return undefined;
  return variants.find((v) => v.isDefault) ?? variants[0];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function formatSoldCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${Number.isInteger(value) ? value : value.toFixed(1).replace(/\.0$/, "")}tr`;
  }

  if (count >= 1_000) {
    const value = count / 1_000;
    return `${Number.isInteger(value) ? value : value.toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(count);
}

/** Thứ tự hiển thị trong form admin — khớp enum backend */
export const ADMIN_PRODUCT_TYPE_OPTIONS: ProductType[] = [
  "ACCESSORY",
  "CHEMICAL",
  "EQUIPMENT",
  "FISH",
  "FOOD",
  "PLANT",
  "SUBSTRATE",
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  PLANT: "Cây thủy sinh",
  FISH: "Cá cảnh",
  ACCESSORY: "Phụ kiện",
  CHEMICAL: "Hóa chất",
  EQUIPMENT: "Thiết bị",
  FOOD: "Thức ăn",
  SUBSTRATE: "Nền / Substrate",
};

export const PRODUCT_TYPE_STYLES: Record<
  ProductType,
  { bg: string; text: string }
> = {
  PLANT: { bg: "bg-emerald-100", text: "text-emerald-700" },
  FISH: { bg: "bg-blue-100", text: "text-blue-700" },
  ACCESSORY: { bg: "bg-orange-100", text: "text-orange-700" },
  CHEMICAL: { bg: "bg-violet-100", text: "text-violet-700" },
  EQUIPMENT: { bg: "bg-slate-100", text: "text-slate-700" },
  FOOD: { bg: "bg-amber-100", text: "text-amber-700" },
  SUBSTRATE: { bg: "bg-stone-100", text: "text-stone-700" },
};

export function usesAccessoryDetail(productType: ProductType): boolean {
  return (
    productType === "ACCESSORY" ||
    productType === "EQUIPMENT" ||
    productType === "CHEMICAL" ||
    productType === "FOOD" ||
    productType === "SUBSTRATE"
  );
}

export function getProductPriceDisplay(product: Product) {
  const variant = getDefaultVariant(product.variants);
  if (variant) {
    const hasSale =
      variant.salePrice != null && variant.salePrice < variant.price;

    return {
      variant,
      price: variant.price,
      salePrice: hasSale ? variant.salePrice! : null,
      displayPrice: hasSale ? variant.salePrice! : variant.price,
    };
  }

  if (product.minPrice != null) {
    const listPrice = product.displayListPrice ?? product.minPrice;
    const hasSale = listPrice > product.minPrice;

    return {
      variant: null,
      price: listPrice,
      salePrice: hasSale ? product.minPrice : null,
      displayPrice: product.minPrice,
      priceFrom:
        product.maxPrice != null && product.maxPrice > product.minPrice,
    };
  }

  return null;
}
