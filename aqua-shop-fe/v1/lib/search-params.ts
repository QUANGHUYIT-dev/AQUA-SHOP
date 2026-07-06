import type { ProductType } from "@/types/product";

export const DEFAULT_PRICE_MIN = 0;
export const DEFAULT_PRICE_MAX = 50_000_000;

export interface SearchFilters {
  search: string;
  productType: ProductType | "";
  categoryId: string;
  brandId: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
  page: number;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  search: "",
  productType: "",
  categoryId: "",
  brandId: "",
  minPrice: DEFAULT_PRICE_MIN,
  maxPrice: DEFAULT_PRICE_MAX,
  sort: "createdAt,desc",
  page: 0,
};

export const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Mới nhất" },
  { value: "name,asc", label: "Tên A → Z" },
  { value: "name,desc", label: "Tên Z → A" },
] as const;

export function parseSearchFilters(
  params: URLSearchParams,
): SearchFilters {
  const minRaw = params.get("minPrice");
  const maxRaw = params.get("maxPrice");

  return {
    search: params.get("q") ?? "",
    productType: (params.get("type") as ProductType | "") ?? "",
    categoryId: params.get("category") ?? "",
    brandId: params.get("brand") ?? "",
    minPrice: minRaw != null ? Number(minRaw) : DEFAULT_PRICE_MIN,
    maxPrice: maxRaw != null ? Number(maxRaw) : DEFAULT_PRICE_MAX,
    sort: params.get("sort") ?? DEFAULT_SEARCH_FILTERS.sort,
    page: Math.max(0, Number(params.get("page") ?? "0") || 0),
  };
}

export function buildSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.productType) params.set("type", filters.productType);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.brandId) params.set("brand", filters.brandId);
  if (filters.minPrice > DEFAULT_PRICE_MIN) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice < DEFAULT_PRICE_MAX) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.sort !== DEFAULT_SEARCH_FILTERS.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.page > 0) params.set("page", String(filters.page));

  return params;
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.productType) count += 1;
  if (filters.categoryId) count += 1;
  if (filters.brandId) count += 1;
  if (filters.minPrice > DEFAULT_PRICE_MIN || filters.maxPrice < DEFAULT_PRICE_MAX) {
    count += 1;
  }
  return count;
}
