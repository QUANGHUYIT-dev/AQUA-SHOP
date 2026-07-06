"use client";

import { useEffect, useState } from "react";
import { Flame, Loader2, Sparkles } from "lucide-react";
import type { Category, CategoryProductSection, Product } from "@/types/product";
import {
  filterProducts,
  getChildCategories,
  getTopSellingProducts,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import ProductRow from "@/components/features/home/ProductRow";

/** Số SP tối đa mỗi hàng trên trang chủ — chỉ preview, xem thêm ở trang danh mục */
const HOME_ROW_PRODUCT_LIMIT = 12;

async function fetchCategorySection(
  category: Category,
): Promise<CategoryProductSection | null> {
  const page = await filterProducts({
    categoryId: category.id,
    status: "ACTIVE",
    page: 0,
    size: HOME_ROW_PRODUCT_LIMIT,
    sort: "createdAt,desc",
  });

  const products = page.content.slice(0, HOME_ROW_PRODUCT_LIMIT);
  if (!products.length) return null;

  return {
    category,
    products,
    totalElements: page.totalElements,
  };
}

async function fetchCategorySections(): Promise<CategoryProductSection[]> {
  const categories = await getChildCategories();
  if (!categories.length) return [];

  const sections = await Promise.all(
    categories.map((category) => fetchCategorySection(category)),
  );

  return sections.filter(
    (section): section is CategoryProductSection => section != null,
  );
}

export default function HomeCategorySections() {
  const [mounted, setMounted] = useState(false);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<CategoryProductSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function load() {
      const [topSellingResult, newestResult, categorySectionsResult] =
        await Promise.allSettled([
          getTopSellingProducts(HOME_ROW_PRODUCT_LIMIT),
          filterProducts({
            status: "ACTIVE",
            page: 0,
            size: HOME_ROW_PRODUCT_LIMIT,
            sort: "createdAt,desc",
          }),
          fetchCategorySections(),
        ]);

      if (cancelled) return;

      const topSelling =
        topSellingResult.status === "fulfilled" ? topSellingResult.value : [];
      const newestPage =
        newestResult.status === "fulfilled"
          ? newestResult.value
          : { content: [] as Product[] };
      const categorySections =
        categorySectionsResult.status === "fulfilled"
          ? categorySectionsResult.value
          : [];

      const failures = [
        topSellingResult,
        newestResult,
        categorySectionsResult,
      ].filter((result) => result.status === "rejected");

      const hasContent =
        topSelling.length > 0 ||
        newestPage.content.length > 0 ||
        categorySections.length > 0;

      if (!hasContent && failures.length > 0) {
        setError(
          getApiErrorMessage(
            (failures[0] as PromiseRejectedResult).reason,
          ),
        );
      } else {
        setError(null);
      }

      setTopSellingProducts(topSelling.slice(0, HOME_ROW_PRODUCT_LIMIT));
      setNewProducts(
        newestPage.content.slice(0, HOME_ROW_PRODUCT_LIMIT),
      );
      setSections(categorySections);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const hasFeatured =
    topSellingProducts.length > 0 || newProducts.length > 0;
  const hasCategories = sections.length > 0;

  return (
    <section id="san-pham" className="bg-slate-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {hasFeatured || hasCategories ? (
          <div className="space-y-14">
            <ProductRow
              sectionId="top-ban-chay"
              title="Top sản phẩm bán chạy"
              icon={Flame}
              products={topSellingProducts}
              viewAllHref={ROUTES.SEARCH}
            />

            <ProductRow
              sectionId="san-pham-moi"
              title="Sản phẩm mới"
              icon={Sparkles}
              products={newProducts}
              viewAllHref={`${ROUTES.SEARCH}?sort=createdAt,desc`}
            />

            {sections.map((section) => (
              <ProductRow
                key={section.category.id}
                category={section.category}
                products={section.products}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500">
            Chưa có sản phẩm theo danh mục.
          </p>
        )}
      </div>
    </section>
  );
}
