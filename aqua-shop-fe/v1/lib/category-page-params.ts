import type { ProductType } from "@/types/product";
import {
  DEFAULT_PRICE_MAX,
  DEFAULT_PRICE_MIN,
  DEFAULT_SEARCH_FILTERS,
} from "@/lib/search-params";

export interface CategoryPageFilters {
  productType: ProductType | "";
  brandId: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
  page: number;
}

export const DEFAULT_CATEGORY_PAGE_FILTERS: CategoryPageFilters = {
  productType: "",
  brandId: "",
  minPrice: DEFAULT_PRICE_MIN,
  maxPrice: DEFAULT_PRICE_MAX,
  sort: DEFAULT_SEARCH_FILTERS.sort,
  page: 0,
};

export function parseCategoryPageFilters(
  params: URLSearchParams,
): CategoryPageFilters {
  const minRaw = params.get("minPrice");
  const maxRaw = params.get("maxPrice");

  return {
    productType: (params.get("type") as ProductType | "") ?? "",
    brandId: params.get("brand") ?? "",
    minPrice: minRaw != null ? Number(minRaw) : DEFAULT_PRICE_MIN,
    maxPrice: maxRaw != null ? Number(maxRaw) : DEFAULT_PRICE_MAX,
    sort: params.get("sort") ?? DEFAULT_CATEGORY_PAGE_FILTERS.sort,
    page: Math.max(0, Number(params.get("page") ?? "0") || 0),
  };
}

export function buildCategoryPageParams(
  filters: CategoryPageFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.productType) params.set("type", filters.productType);
  if (filters.brandId) params.set("brand", filters.brandId);
  if (filters.minPrice > DEFAULT_PRICE_MIN) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice < DEFAULT_PRICE_MAX) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.sort !== DEFAULT_CATEGORY_PAGE_FILTERS.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.page > 0) params.set("page", String(filters.page));

  return params;
}

export function countCategoryPageFilters(filters: CategoryPageFilters): number {
  let count = 0;
  if (filters.productType) count += 1;
  if (filters.brandId) count += 1;
  if (
    filters.minPrice > DEFAULT_PRICE_MIN ||
    filters.maxPrice < DEFAULT_PRICE_MAX
  ) {
    count += 1;
  }
  return count;
}
