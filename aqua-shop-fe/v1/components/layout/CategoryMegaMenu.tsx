"use client";

import Link from "next/link";
import type { Category } from "@/types/product";
import { Box, Fish, Leaf, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "cay-thuy-sinh": Leaf,
  "ca-canh": Fish,
  "phu-kien": Package,
  "be-ho-tu-ke": Box,
};

function getCategoryIcon(slug: string): LucideIcon | null {
  return ICON_BY_SLUG[slug] ?? null;
}

interface CategoryMegaMenuProps {
  roots: Category[];
  onNavigate?: () => void;
  variant?: "dropdown" | "mobile";
}

function CategoryTreeLinks({
  categories,
  depth = 0,
  onNavigate,
}: {
  categories: Category[];
  depth?: number;
  onNavigate?: () => void;
}) {
  return (
    <ul className={depth === 0 ? "space-y-0" : "mt-1 space-y-0 border-l border-slate-100 pl-3"}>
      {categories.map((category) => {
        const Icon = depth === 0 ? getCategoryIcon(category.slug) : null;

        return (
          <li key={category.id}>
            <Link
              href={`/${category.slug}`}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 border-b border-slate-100 py-2.5 text-sm transition-colors hover:bg-slate-50 hover:text-[#9b1c31] ${
                depth === 0
                  ? "font-medium text-slate-800"
                  : "text-slate-600"
              }`}
            >
              {Icon && (
                <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              )}
              <span className="line-clamp-2">{category.name}</span>
            </Link>
            {category.children?.length ? (
              <CategoryTreeLinks
                categories={category.children}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function CategoryMegaColumns({
  roots,
  onNavigate,
}: {
  roots: Category[];
  onNavigate?: () => void;
}) {
  return (
    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roots.map((root) => {
        const RootIcon = getCategoryIcon(root.slug);

        return (
        <div
          key={root.id}
          className="border-b border-slate-100 sm:border-b-0 sm:border-r last:sm:border-r-0"
        >
          <Link
            href={`/${root.slug}`}
            onClick={onNavigate}
            className="flex items-center gap-2 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#001a33] transition-colors hover:bg-slate-100"
          >
            {RootIcon && (
              <RootIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            )}
            {root.name}
          </Link>
          <div className="px-2 pb-2">
            {root.children?.length ? (
              <CategoryTreeLinks
                categories={root.children}
                onNavigate={onNavigate}
              />
            ) : (
              <p className="px-2 py-3 text-sm text-slate-400">
                Chưa có danh mục con
              </p>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
}

export default function CategoryMegaMenu({
  roots,
  onNavigate,
  variant = "dropdown",
}: CategoryMegaMenuProps) {
  if (!roots.length) {
    return (
      <div className="px-4 py-6 text-sm text-slate-500">
        Đang tải danh mục...
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="max-h-[70vh] overflow-y-auto bg-white">
        <CategoryMegaColumns roots={roots} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full z-50 hidden w-[min(100vw,80rem)] border border-slate-200 bg-white shadow-xl group-hover/mega:block group-focus-within/mega:block">
      <CategoryMegaColumns roots={roots} onNavigate={onNavigate} />
    </div>
  );
}

export { CategoryTreeLinks, getCategoryIcon };
