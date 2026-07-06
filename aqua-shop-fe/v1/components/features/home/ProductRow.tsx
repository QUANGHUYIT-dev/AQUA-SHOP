"use client";

import type { LucideIcon } from "lucide-react";
import type { Category, Product } from "@/types/product";
import ProductCard from "@/components/features/product/ProductCard";
import CategorySectionHeader from "@/components/features/home/CategorySectionHeader";
import ProductCarousel from "@/components/features/home/ProductCarousel";
import ProductSectionHeader from "@/components/features/home/ProductSectionHeader";

interface ProductRowProps {
  products: Product[];
  category?: Category;
  title?: string;
  icon?: LucideIcon;
  viewAllHref?: string;
  sectionId?: string;
}

export default function ProductRow({
  products,
  category,
  title,
  icon,
  viewAllHref,
  sectionId,
}: ProductRowProps) {
  if (!products.length) return null;

  const categoryName = category?.name;

  return (
    <section
      id={sectionId ?? (category ? `category-${category.slug}` : undefined)}
      className="pb-10 last:pb-0"
    >
      {category ? (
        <CategorySectionHeader
          category={category}
          viewAllHref={viewAllHref ?? `/${category.slug}`}
        />
      ) : title && icon ? (
        <ProductSectionHeader
          title={title}
          icon={icon}
          viewAllHref={viewAllHref}
        />
      ) : null}

      <ProductCarousel>
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[190px] shrink-0 sm:w-[220px] md:w-[240px] lg:w-[260px]"
          >
            <ProductCard
              product={product}
              categoryName={product.categoryName ?? categoryName}
            />
          </div>
        ))}
      </ProductCarousel>
    </section>
  );
}
