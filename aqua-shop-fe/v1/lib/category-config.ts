/** Danh mục cha cố định — khớp DB (CATE0001 → CATE0004) */
export const PARENT_CATEGORY_SLUGS = [
  "cay-thuy-sinh", // CATE0001 — Cây thủy sinh
  "ca-canh", // CATE0002 — Cá cảnh
  "phu-kien", // CATE0003 — Phụ kiện
  "be-ho-tu-ke", // CATE0004 — Bể hồ & Tủ kệ
] as const;

export function getParentCategorySlugFilter(): string[] {
  const raw = process.env.NEXT_PUBLIC_PARENT_CATEGORY_SLUGS;

  if (!raw?.trim()) {
    return [...PARENT_CATEGORY_SLUGS];
  }

  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

export function getParentCategorySlugs(): string[] {
  return getParentCategorySlugFilter();
}
