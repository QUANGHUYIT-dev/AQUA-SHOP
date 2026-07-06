"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Category, Product } from "@/types/product";
import { filterProducts, getCategoryTree } from "@/lib/api";
import { findCategoryById, isLikelyCategoryId } from "@/lib/category-mapper";
import ProductCard from "@/components/features/product/ProductCard";

const RELATED_SIZE = 4;

interface ProductRelatedSectionProps {
  category: Category;
  categoryId: string;
  currentProductId: string;
}

export default function ProductRelatedSection({
  category,
  categoryId,
  currentProductId,
}: ProductRelatedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categorySlug, setCategorySlug] = useState("");
  const [loading, setLoading] = useState(() => Boolean(categoryId.trim()));

  useEffect(() => {
    let cancelled = false;

    async function resolveCategorySlug() {
      const initialSlug = category.slug?.trim() ?? "";
      if (
        initialSlug &&
        initialSlug !== categoryId &&
        !isLikelyCategoryId(initialSlug)
      ) {
        setCategorySlug(initialSlug);
        return;
      }

      try {
        const tree = await getCategoryTree();
        if (cancelled) return;
        const matched = findCategoryById(tree, categoryId);
        setCategorySlug(matched?.slug ?? "");
      } catch {
        if (!cancelled) setCategorySlug("");
      }
    }

    resolveCategorySlug();
    return () => {
      cancelled = true;
    };
  }, [category.slug, categoryId]);

  useEffect(() => {
    const id = categoryId.trim();
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const page = await filterProducts({
          categoryId: id,
          status: "ACTIVE",
          page: 0,
          size: RELATED_SIZE + 1,
          sort: "createdAt,desc",
        });

        if (!cancelled) {
          setProducts(
            page.content
              .filter((item) => item.id !== currentProductId)
              .slice(0, RELATED_SIZE),
          );
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [categoryId, currentProductId]);

  if (!categoryId.trim()) return null;

  if (loading) {
    return (
      <section className="mt-16 border-t border-slate-200 pt-12">
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ocean-900 sm:text-2xl">
            Sản phẩm tương tự
          </h2>
          <p className="mt-1 text-sm text-slate-500">{category.name}</p>
        </div>
        {categorySlug && (
          <Link
            href={`/${categorySlug}`}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={category.name}
          />
        ))}
      </div>
    </section>
  );
}
