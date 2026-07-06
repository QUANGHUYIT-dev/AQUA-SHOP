import type { Category, CategoryApi } from "@/types/product";
import { getParentCategorySlugFilter } from "@/lib/category-config";
import { getCategoryImage } from "@/lib/category-images";

function isCategoryApi(value: CategoryApi | string): value is CategoryApi {
  return typeof value === "object" && Boolean(value.categoryId);
}

export function normalizeCategory(raw: CategoryApi): Category {
  const fallback = raw as {
    id?: string;
    categoryName?: string;
    categorySlug?: string;
    type?: CategoryApi["categoryType"];
  };

  return {
    id: raw.categoryId ?? String(fallback.id ?? ""),
    name: raw.name ?? fallback.categoryName ?? "",
    slug: raw.slug ?? fallback.categorySlug ?? "",
    description: raw.description,
    productType: raw.categoryType ?? fallback.type,
    parentId: raw.parentId ?? undefined,
    parentName: raw.parentName ?? undefined,
    parentSlug: raw.parentSlug ?? undefined,
    imageUrl: getCategoryImage(raw.categoryType, raw.imageUrl),
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    children: raw.children
      ?.filter(isCategoryApi)
      .map((child) =>
        normalizeCategory({
          ...child,
          parentId: child.parentId ?? raw.categoryId,
          parentName: child.parentName ?? raw.name,
          parentSlug: child.parentSlug ?? raw.slug,
        }),
      ),
  };
}

export function normalizeCategories(items: CategoryApi[]): Category[] {
  return items.map(normalizeCategory);
}

export function filterActiveCategoryTree(categories: Category[]): Category[] {
  return categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({
      ...category,
      children: category.children?.length
        ? filterActiveCategoryTree(category.children)
        : undefined,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function pickCategoriesBySlugs(
  categories: Category[],
  slugs: string[],
): Category[] {
  const slugSet = new Set(slugs);
  return categories
    .filter((category) => slugSet.has(category.slug))
    .sort(
      (a, b) =>
        slugs.indexOf(a.slug) - slugs.indexOf(b.slug),
    );
}

export function resolveRootCategories(tree: Category[]): Category[] {
  const roots = filterActiveCategoryTree(tree);
  const slugFilter = getParentCategorySlugFilter();
  const picked = pickCategoriesBySlugs(roots, slugFilter);

  return picked.length > 0 ? picked : roots;
}

export function extractDirectChildrenFromRoots(roots: Category[]): Category[] {
  const children: Category[] = [];

  for (const root of roots) {
    if (!root.children?.length) continue;
    children.push(...root.children.filter((child) => child.isActive !== false));
  }

  return children.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function findCategoryById(
  categories: Category[],
  categoryId: string,
): Category | undefined {
  for (const category of categories) {
    if (category.id === categoryId) return category;
    if (category.children?.length) {
      const found = findCategoryById(category.children, categoryId);
      if (found) return found;
    }
  }
  return undefined;
}

export function isLikelyCategoryId(value: string): boolean {
  return /^CATE\d+$/i.test(value.trim());
}

export function extractChildCategories(
  parents: CategoryApi[],
): Category[] {
  const childCategories: Category[] = [];

  for (const parent of parents) {
    if (!parent.children?.length) continue;

    for (const child of parent.children) {
      if (isCategoryApi(child)) {
        childCategories.push(
          normalizeCategory({
            ...child,
            parentId: child.parentId ?? parent.categoryId,
            parentName: child.parentName ?? parent.name,
            parentSlug: child.parentSlug ?? parent.slug,
          }),
        );
      }
    }
  }

  return childCategories
    .filter((category) => category.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
