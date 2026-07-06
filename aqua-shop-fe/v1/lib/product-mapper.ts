import type { Category, CategoryApi, Product, ProductDetail, ProductSummary } from "@/types/product";
import { normalizeCategory } from "@/lib/category-mapper";
import { getCategoryImage } from "@/lib/category-images";
import { isValidImageUrl, resolveProductThumbnailUrl } from "@/lib/image-utils";
import { sortGalleryImages } from "@/utils/product-detail-utils";

type RawRecord = Record<string, unknown>;

function normalizeVariant(raw: RawRecord) {
  const attributes =
    raw.attributes && typeof raw.attributes === "object"
      ? (raw.attributes as RawRecord)
      : null;

  return {
    id: String(raw.variantId ?? raw.id ?? ""),
    sku: raw.sku as string | undefined,
    size: String(raw.size ?? attributes?.size ?? "") || undefined,
    volume: String(raw.volume ?? attributes?.volume ?? "") || undefined,
    color: String(raw.color ?? attributes?.color ?? "") || undefined,
    price: Number(raw.price ?? 0),
    salePrice:
      raw.salePrice != null ? Number(raw.salePrice) : (null as number | null),
    isDefault: Boolean(raw.isDefault),
    stockQuantity:
      raw.stockQuantity != null ? Number(raw.stockQuantity) : undefined,
    weightGrams:
      raw.weightGrams != null ? Number(raw.weightGrams) : undefined,
  };
}

function normalizeImages(raw: unknown) {
  if (!Array.isArray(raw)) return undefined;

  const images = raw
    .map((item) => {
      const image = item as RawRecord;
      return {
        imageId: Number(image.imageId ?? 0),
        imageUrl: String(image.imageUrl ?? ""),
        altText: image.altText as string | undefined,
        isPrimary: Boolean(image.isPrimary),
        sortOrder:
          image.sortOrder != null ? Number(image.sortOrder) : undefined,
        publicId: image.publicId as string | undefined,
      };
    })
    .filter((image) => isValidImageUrl(image.imageUrl));

  return sortGalleryImages(images);
}

function normalizeVariants(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeVariant(item as RawRecord));
}

function normalizeProductCategory(item: RawRecord): Category {
  const rawCategory = item.category;
  if (rawCategory && typeof rawCategory === "object") {
    const category = normalizeCategory(rawCategory as CategoryApi);

    return {
      ...category,
      id: category.id || String(item.categoryId ?? ""),
      name: category.name || String(item.categoryName ?? ""),
      slug: category.slug || String(item.categorySlug ?? ""),
      parentId:
        category.parentId ??
        ((item.parentCategoryId ?? item.categoryParentId) as
          | string
          | undefined),
      parentName:
        category.parentName ??
        ((item.parentCategoryName ?? item.categoryParentName) as
          | string
          | undefined),
      parentSlug:
        category.parentSlug ??
        ((item.parentCategorySlug ?? item.categoryParentSlug) as
          | string
          | undefined),
    };
  }

  const productType = item.productType as Product["productType"] | undefined;

  return {
    id: String(item.categoryId ?? ""),
    name: String(item.categoryName ?? ""),
    slug: String(item.categorySlug ?? ""),
    productType,
    parentId: (item.parentCategoryId ?? item.categoryParentId) as
      | string
      | undefined,
    parentName: (item.parentCategoryName ?? item.categoryParentName) as
      | string
      | undefined,
    parentSlug: (item.parentCategorySlug ?? item.categoryParentSlug) as
      | string
      | undefined,
    imageUrl: getCategoryImage(productType),
  };
}

export function normalizeProduct(raw: ProductSummary | RawRecord): Product {
  const item = raw as RawRecord;

  return {
    id: String(item.productId ?? item.id ?? ""),
    name: String(item.name ?? ""),
    modelCode: String(item.modelCode ?? ""),
    slug:
      item.slug != null && String(item.slug).trim() !== ""
        ? String(item.slug)
        : undefined,
    productType: item.productType as Product["productType"],
    thumbnailUrl: resolveProductThumbnailUrl(
      item.thumbnailUrl as string | undefined,
      item.productType as Product["productType"],
    ),
    categoryId: item.categoryId as string | undefined,
    categoryName: item.categoryName as string | undefined,
    category: normalizeProductCategory(item),
    status: item.status as Product["status"],
    minPrice: item.minPrice != null ? Number(item.minPrice) : undefined,
    displayListPrice:
      item.displayListPrice != null ? Number(item.displayListPrice) : undefined,
    maxPrice: item.maxPrice != null ? Number(item.maxPrice) : undefined,
    totalSold: item.totalSold != null ? Number(item.totalSold) : undefined,
    defaultVariantId:
      item.defaultVariantId != null
        ? String(item.defaultVariantId)
        : undefined,
    variants: normalizeVariants(item.variants),
    availableSizes: item.availableSizes as string[] | undefined,
    availableVolumes: item.availableVolumes as string[] | undefined,
  };
}

export function normalizeProductDetail(raw: RawRecord): ProductDetail {
  const product = normalizeProduct(raw);

  return {
    ...product,
    description: raw.description as string | undefined,
    shortDescription: raw.shortDescription as string | undefined,
    brandId: raw.brandId as string | undefined,
    brandName: raw.brandName as string | undefined,
    totalStock:
      raw.totalStock != null ? Number(raw.totalStock) : undefined,
    images: normalizeImages(raw.images),
    plantDetail: raw.plantDetail as ProductDetail["plantDetail"],
    fishDetail: raw.fishDetail as ProductDetail["fishDetail"],
    accessoryDetail: raw.accessoryDetail as ProductDetail["accessoryDetail"],
  };
}

export function normalizeProducts(
  items: Array<ProductSummary | RawRecord>,
): Product[] {
  return items.map((item) => normalizeProduct(item));
}
