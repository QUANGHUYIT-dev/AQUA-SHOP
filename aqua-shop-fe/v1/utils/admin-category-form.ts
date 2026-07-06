import type { Category, ProductType } from "@/types/product";

export interface UpdateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  categoryType: ProductType;
  parentId?: string | null;
  sortOrder: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  categoryType: ProductType;
  parentId?: string | null;
  sortOrder: number;
}

export interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  productType: ProductType;
  parentId: string;
  sortOrder: string;
}

export interface CategorySelectOption {
  value: string;
  label: string;
}

export function createCategoryFormFromCategory(category: Category): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    productType: category.productType ?? "PLANT",
    parentId: category.parentId ?? "",
    sortOrder: String(category.sortOrder ?? 0),
  };
}

export function createEmptyCategoryForm(parentId = ""): CategoryFormState {
  return {
    name: "",
    slug: "",
    description: "",
    productType: "PLANT",
    parentId,
    sortOrder: "0",
  };
}

export function buildUpdateCategoryPayload(
  form: CategoryFormState,
): UpdateCategoryPayload {
  const name = form.name.trim();
  const slug = form.slug.trim();

  if (!name) throw new Error("Vui lòng nhập tên danh mục");
  if (!slug) throw new Error("Vui lòng nhập slug");

  const sortOrder = Number.parseInt(form.sortOrder, 10);

  return {
    name,
    slug,
    description: form.description.trim() || undefined,
    categoryType: form.productType,
    parentId: form.parentId.trim() || null,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export function buildCreateCategoryPayload(
  form: CategoryFormState,
): CreateCategoryPayload {
  const name = form.name.trim();

  if (!name) throw new Error("Vui lòng nhập tên danh mục");

  const sortOrder = Number.parseInt(form.sortOrder, 10);

  return {
    name,
    description: form.description.trim() || undefined,
    categoryType: form.productType,
    parentId: form.parentId.trim() || null,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

function collectDescendantIds(category: Category): Set<string> {
  const ids = new Set<string>();

  function walk(node: Category) {
    for (const child of node.children ?? []) {
      ids.add(child.id);
      walk(child);
    }
  }

  walk(category);
  return ids;
}

function findCategoryInTree(
  categories: Category[],
  categoryId: string,
): Category | undefined {
  for (const category of categories) {
    if (category.id === categoryId) return category;
    if (category.children?.length) {
      const found = findCategoryInTree(category.children, categoryId);
      if (found) return found;
    }
  }
  return undefined;
}

export function getParentCategoryOptions(
  categories: Category[],
  editingCategoryId: string,
): CategorySelectOption[] {
  const editingCategory = findCategoryInTree(categories, editingCategoryId);
  const excludedIds = new Set<string>([editingCategoryId]);

  if (editingCategory) {
    for (const id of collectDescendantIds(editingCategory)) {
      excludedIds.add(id);
    }
  }

  const options: CategorySelectOption[] = [
    { value: "", label: "— Không có (danh mục gốc) —" },
  ];

  function walk(nodes: Category[], depth = 0) {
    const prefix = depth > 0 ? `${"—".repeat(depth)} ` : "";

    for (const category of nodes) {
      if (!excludedIds.has(category.id)) {
        options.push({
          value: category.id,
          label: `${prefix}${category.name}`,
        });
      }
      if (category.children?.length) {
        walk(category.children, depth + 1);
      }
    }
  }

  walk(categories);
  return options;
}

export function getAllParentCategoryOptions(
  categories: Category[],
): CategorySelectOption[] {
  const options: CategorySelectOption[] = [
    { value: "", label: "— Không có (danh mục gốc) —" },
  ];

  function walk(nodes: Category[], depth = 0) {
    const prefix = depth > 0 ? `${"—".repeat(depth)} ` : "";

    for (const category of nodes) {
      options.push({
        value: category.id,
        label: `${prefix}${category.name}`,
      });
      if (category.children?.length) {
        walk(category.children, depth + 1);
      }
    }
  }

  walk(categories);
  return options;
}
