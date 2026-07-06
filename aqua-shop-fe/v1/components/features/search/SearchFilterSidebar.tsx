"use client";

import { RotateCcw, X } from "lucide-react";
import type { Brand } from "@/types/brand";
import type { Category, ProductType } from "@/types/product";
import { ADMIN_PRODUCT_TYPE_OPTIONS, PRODUCT_TYPE_LABELS } from "@/utils/product-utils";
import type { SearchFilters } from "@/lib/search-params";
import PriceRangeFilter from "@/components/features/search/PriceRangeFilter";

const PRODUCT_TYPES = ADMIN_PRODUCT_TYPE_OPTIONS;

interface SearchFilterSidebarProps {
  filters: SearchFilters;
  categories: Category[];
  brands: Brand[];
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  onClose?: () => void;
  className?: string;
}

export default function SearchFilterSidebar({
  filters,
  categories,
  brands,
  onChange,
  onReset,
  onClose,
  className = "",
}: SearchFilterSidebarProps) {
  const patch = (partial: Partial<SearchFilters>) => {
    onChange({ ...filters, ...partial, page: 0 });
  };

  return (
    <aside
      className={`flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-ocean-900">Bộ lọc</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Đóng bộ lọc"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <div>
          <p className="mb-2 text-sm font-medium text-ocean-900">Loại sản phẩm</p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="productType"
                checked={filters.productType === ""}
                onChange={() => patch({ productType: "" })}
                className="accent-[#ee4d2d]"
              />
              Tất cả
            </label>
            {PRODUCT_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name="productType"
                  checked={filters.productType === type}
                  onChange={() => patch({ productType: type })}
                  className="accent-[#ee4d2d]"
                />
                {PRODUCT_TYPE_LABELS[type]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="filter-category"
            className="mb-2 block text-sm font-medium text-ocean-900"
          >
            Danh mục
          </label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-brand"
            className="mb-2 block text-sm font-medium text-ocean-900"
          >
            Thương hiệu
          </label>
          <select
            id="filter-brand"
            value={filters.brandId}
            onChange={(e) => patch({ brandId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-ocean-900">Khoảng giá</p>
          <PriceRangeFilter
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onChange={(minPrice, maxPrice) =>
              onChange({ ...filters, minPrice, maxPrice, page: 0 })
            }
          />
        </div>
      </div>

      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Xóa lọc
        </button>
      </div>
    </aside>
  );
}
