export type ProductType =
  | "PLANT"
  | "FISH"
  | "ACCESSORY"
  | "CHEMICAL"
  | "EQUIPMENT"
  | "FOOD"
  | "SUBSTRATE";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export interface ProductVariant {
  id: string;
  sku?: string;
  size?: string;
  volume?: string;
  color?: string;
  price: number;
  salePrice?: number | null;
  isDefault: boolean;
  stockQuantity?: number;
  weightGrams?: number;
}

export interface PlantDetail {
  scientificName?: string;
  difficulty?: string;
  lightLevel?: string;
  co2Required?: boolean;
  placement?: string;
  growthRate?: string;
  maxHeightCm?: number;
}

export interface FishDetail {
  scientificName?: string;
  temperament?: string;
  diet?: string;
  minTankSizeLiters?: number;
  waterTempMinC?: number;
  waterTempMaxC?: number;
  phMin?: number;
  phMax?: number;
  maxSizeCm?: number;
  isSchooling?: boolean;
  minSchoolSize?: number;
}

export interface AccessoryDetail {
  accessoryType?: string;
  material?: string;
  compatibleTankMinLiters?: number;
  compatibleTankMaxLiters?: number;
  powerWattage?: number;
  flowRateLph?: number;
  warrantyMonths?: number;
  specifications?: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  modelCode: string;
  slug?: string;
  productType: ProductType;
  thumbnailUrl: string;
  categoryId?: string;
  categoryName?: string;
  status?: ProductStatus;
  minPrice?: number;
  displayListPrice?: number;
  maxPrice?: number;
  totalSold?: number;
  defaultVariantId?: string;
  variants: ProductVariant[];
  availableSizes?: string[];
  availableVolumes?: string[];
}

export interface Product extends ProductSummary {
  category: Category;
}

export interface ProductDetail extends Product {
  description?: string;
  shortDescription?: string;
  brandId?: string;
  brandName?: string;
  totalStock?: number;
  images?: ProductImage[];
  plantDetail?: PlantDetail;
  fishDetail?: FishDetail;
  accessoryDetail?: AccessoryDetail;
}

export interface ProductImage {
  imageId: number;
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  publicId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productType?: ProductType;
  parentId?: string;
  parentName?: string;
  parentSlug?: string;
  imageUrl: string;
  productCount?: number;
  sortOrder?: number;
  isActive?: boolean;
  children?: Category[];
}

export interface CategoryApi {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  categoryType?: ProductType;
  parentId?: string | null;
  parentName?: string | null;
  parentSlug?: string | null;
  children?: Array<CategoryApi | string>;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface CartSummary {
  itemCount: number;
}

export interface ApiEnvelope<T> {
  timestamp?: string;
  message?: string;
  data: T;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ProductFilterParams {
  search?: string;
  productType?: ProductType;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CategoryProductSection {
  category: Category;
  products: Product[];
  totalElements: number;
}

export interface CategoryWithProducts {
  category: Category;
  products: Product[];
  totalElements: number;
  totalPages: number;
}
