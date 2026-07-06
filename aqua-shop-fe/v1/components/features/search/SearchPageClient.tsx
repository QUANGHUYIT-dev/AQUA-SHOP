"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react";
import type { Brand } from "@/types/brand";
import type { Category, Product } from "@/types/product";
import {
  filterProducts,
  getActiveBrands,
  getParentCategories,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  buildSearchParams,
  countActiveFilters,
  DEFAULT_PRICE_MAX,
  DEFAULT_PRICE_MIN,
  DEFAULT_SEARCH_FILTERS,
  parseSearchFilters,
  SORT_OPTIONS,
  type SearchFilters,
} from "@/lib/search-params";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/features/product/ProductCard";
import SearchFilterSidebar from "@/components/features/search/SearchFilterSidebar";

const PAGE_SIZE = 12;

function filtersToApiParams(filters: SearchFilters) {
  return {
    search: filters.search.trim() || undefined,
    productType: filters.productType || undefined,
    categoryId: filters.categoryId || undefined,
    brandId: filters.brandId || undefined,
    minPrice:
      filters.minPrice > DEFAULT_PRICE_MIN ? filters.minPrice : undefined,
    maxPrice:
      filters.maxPrice < DEFAULT_PRICE_MAX ? filters.maxPrice : undefined,
    status: "ACTIVE" as const,
    page: filters.page,
    size: PAGE_SIZE,
    sort: filters.sort,
  };
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => parseSearchFilters(searchParams),
    [searchParams],
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const [categoryList, brandList] = await Promise.all([
          getParentCategories(),
          getActiveBrands(),
        ]);
        if (!cancelled) {
          setCategories(categoryList);
          setBrands(brandList);
        }
      } catch {
        // Meta lỗi không chặn kết quả chính
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      try {
        const page = await filterProducts(filtersToApiParams(urlFilters));
        if (!cancelled) {
          setProducts(page.content);
          setTotalElements(page.totalElements);
          setTotalPages(page.totalPages);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setTotalElements(0);
          setTotalPages(0);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [urlFilters]);

  const pushFilters = useCallback(
    (filters: SearchFilters) => {
      const query = buildSearchParams(filters).toString();
      router.push(query ? `/search?${query}` : "/search");
    },
    [router],
  );

  const handleFilterChange = useCallback(
    (filters: SearchFilters) => {
      pushFilters(filters);
      setMobileFiltersOpen(false);
    },
    [pushFilters],
  );

  const handleReset = () => {
    pushFilters({ ...DEFAULT_SEARCH_FILTERS, search: urlFilters.search });
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (sort: string) => {
    pushFilters({ ...urlFilters, sort, page: 0 });
  };

  const handlePageChange = (page: number) => {
    pushFilters({ ...urlFilters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = countActiveFilters(urlFilters);
  const currentPage = urlFilters.page;
  const hasPrev = currentPage > 0;
  const hasNext = currentPage + 1 < totalPages;
  const selectedBrand = brands.find((brand) => brand.id === urlFilters.brandId);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ocean-900 sm:text-3xl">
                {selectedBrand
                  ? `Sản phẩm ${selectedBrand.name}`
                  : "Tìm kiếm sản phẩm"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Đang tải..."
                  : `${totalElements} sản phẩm${
                      selectedBrand
                        ? ` của ${selectedBrand.name}`
                        : urlFilters.search
                          ? ` cho "${urlFilters.search}"`
                          : ""
                    }`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[#ee4d2d] px-2 py-0.5 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={urlFilters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                aria-label="Sắp xếp"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            <SearchFilterSidebar
              filters={urlFilters}
              categories={categories}
              brands={brands}
              onChange={handleFilterChange}
              onReset={handleReset}
              className="hidden lg:flex lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]"
            />

            <div>
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-100 bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
                  {error}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrev}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Trang trước"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-sm text-slate-600">
                        Trang {currentPage + 1} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Trang sau"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-slate-100 bg-white px-6 py-16 text-center">
                  <p className="text-slate-600">Không tìm thấy sản phẩm phù hợp.</p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 text-sm font-semibold text-[#ee4d2d] hover:underline"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Đóng bộ lọc"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col bg-white shadow-xl">
            <SearchFilterSidebar
              filters={urlFilters}
              categories={categories}
              brands={brands}
              onChange={handleFilterChange}
              onReset={handleReset}
              onClose={() => setMobileFiltersOpen(false)}
              className="h-full rounded-lg border-0 shadow-none"
            />
          </div>
        </div>
      )}
    </>
  );
}
