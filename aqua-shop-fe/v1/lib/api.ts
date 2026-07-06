import type { CustomerProfile, CustomerProfileApi } from "@/types/auth";
import type { Brand, BrandApi } from "@/types/brand";
import type { Banner, BannerApi } from "@/types/banner";
import { normalizeBanners } from "@/lib/banner-utils";
import api, { unwrapData } from "@/lib/axios-client";
import type {
  ApiEnvelope,
  CartSummary,
  Category,
  CategoryApi,
  CategoryWithProducts,
  Product,
  ProductDetail,
  ProductFilterParams,
  ProductSummary,
  SpringPage,
} from "@/types/product";
import type { ServerCart } from "@/types/cart";
import {
  extractDirectChildrenFromRoots,
  filterActiveCategoryTree,
  normalizeCategories,
  normalizeCategory,
  resolveRootCategories,
} from "@/lib/category-mapper";
import {
  normalizeProductDetail,
  normalizeProducts,
} from "@/lib/product-mapper";

export {
  loginRequest,
  logoutRequest,
  refreshAccessToken,
} from "@/lib/axios-client";

export async function getCurrentProfile(): Promise<CustomerProfile> {
  const { data } = await api.get<ApiEnvelope<CustomerProfileApi>>("/auth/me");
  const raw = unwrapData<CustomerProfileApi>(data);

  return {
    customerId: raw.customerId,
    fullName: raw.fullName,
    phoneNumber: raw.phoneNumber ?? null,
    email: raw.email,
    address: raw.address ?? null,
    membershipTier: raw.membershipTier,
    points: raw.points ?? 0,
    role: raw.role,
    imageUrl: raw.imageUrl ?? null,
    dateOfBirth: raw.dateOfBirth ?? null,
    walletBalance: raw.walletBalance ?? 0,
  };
}

function unwrapPage<T>(payload: unknown): SpringPage<T> {
  const data = unwrapData<SpringPage<T> | T[]>(payload);

  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
    };
  }

  if (data && typeof data === "object" && Array.isArray(data.content)) {
    return data;
  }

  return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };
}

export async function getCategoryTree(): Promise<Category[]> {
  const { data } = await api.get<CategoryApi[] | ApiEnvelope<CategoryApi[]>>(
    "/categories/tree",
  );

  const raw = Array.isArray(data) ? data : unwrapData<CategoryApi[]>(data);

  if (!Array.isArray(raw)) return [];

  return filterActiveCategoryTree(normalizeCategories(raw));
}

export async function getNavParentCategories(): Promise<Category[]> {
  const tree = await getCategoryTree();
  return resolveRootCategories(tree);
}

function findCategoryWithParent(
  categories: Category[],
  target: Category,
  parent?: Category,
): { category: Category; parent?: Category } | null {
  for (const category of categories) {
    const isMatch =
      (target.id && category.id === target.id) ||
      (target.slug && category.slug === target.slug);

    if (isMatch) return { category, parent };

    if (category.children?.length) {
      const found = findCategoryWithParent(category.children, target, category);
      if (found) return found;
    }
  }

  return null;
}

async function withResolvedParentCategory(
  category: Category,
): Promise<Category> {
  if (category.parentSlug || (!category.id && !category.slug)) {
    return category;
  }

  try {
    const tree = await getCategoryTree();
    const found = findCategoryWithParent(tree, category);

    if (!found) return category;

    return {
      ...category,
      id: category.id || found.category.id,
      name: category.name || found.category.name,
      slug: category.slug || found.category.slug,
      description: category.description ?? found.category.description,
      productType: category.productType ?? found.category.productType,
      imageUrl: category.imageUrl || found.category.imageUrl,
      parentId: category.parentId ?? found.parent?.id,
      parentName: category.parentName ?? found.parent?.name,
      parentSlug: category.parentSlug ?? found.parent?.slug,
    };
  } catch {
    return category;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await api.get<ApiEnvelope<CategoryApi>>(
    `/categories/${slug}`,
  );
  return withResolvedParentCategory(
    normalizeCategory(unwrapData<CategoryApi>(data)),
  );
}

export async function getChildCategories(): Promise<Category[]> {
  const tree = await getCategoryTree();
  const roots = resolveRootCategories(tree);
  return extractDirectChildrenFromRoots(roots);
}

export async function getParentCategories(): Promise<Category[]> {
  return getNavParentCategories();
}

export async function getCategories(): Promise<Category[]> {
  return getChildCategories();
}

export async function getActiveBrands(): Promise<Brand[]> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<BrandApi>> | SpringPage<BrandApi>
  >("/brands", {
    params: { isActive: true, size: 100, sort: "name,asc" },
  });

  const page = unwrapPage<BrandApi>(data);
  return page.content.map((brand) => ({
    id: brand.brandId,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    isActive: brand.isActive,
  }));
}

export async function filterProducts(
  params: ProductFilterParams = {},
): Promise<SpringPage<Product>> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<ProductSummary>> | SpringPage<ProductSummary>
  >("/products/filter", {
    params: {
      page: 0,
      size: 8,
      sort: "createdAt,desc",
      status: "ACTIVE",
      ...params,
    },
  });

  const page = unwrapPage<ProductSummary>(data);
  return {
    ...page,
    content: normalizeProducts(page.content),
  };
}

export async function getTopSellingProducts(size = 8): Promise<Product[]> {
  const { data } = await api.get<
    ApiEnvelope<ProductSummary[]> | ProductSummary[]
  >("/products/top-selling", {
    params: { size },
  });

  const items = Array.isArray(data) ? data : unwrapData<ProductSummary[]>(data);
  return normalizeProducts(items);
}

export async function getActiveBanners(): Promise<Banner[]> {
  const { data } = await api.get<BannerApi[] | ApiEnvelope<BannerApi[]>>(
    "/banners/active",
  );

  const items = Array.isArray(data) ? data : unwrapData<BannerApi[]>(data);
  return normalizeBanners(items ?? []);
}

export async function getCategoryWithProducts(
  slug: string,
  page = 0,
  size = 12,
): Promise<CategoryWithProducts> {
  const category = await getCategoryBySlug(slug);
  const productsPage = await filterProducts({
    categoryId: category.id,
    status: "ACTIVE",
    page,
    size,
    sort: "createdAt,desc",
  });

  return {
    category,
    products: productsPage.content,
    totalElements: productsPage.totalElements,
    totalPages: productsPage.totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const { data } = await api.get<ApiEnvelope<Record<string, unknown>>>(
    `/products/slug/${slug}`,
  );
  const product = normalizeProductDetail(
    unwrapData<Record<string, unknown>>(data) ?? {},
  );

  return {
    ...product,
    category: await withResolvedParentCategory(product.category),
  };
}

export async function getProductById(
  productId: string,
): Promise<ProductDetail> {
  const { data } = await api.get<ApiEnvelope<Record<string, unknown>>>(
    `/products/${productId}`,
  );
  return normalizeProductDetail(
    unwrapData<Record<string, unknown>>(data) ?? {},
  );
}

function buildServerCartVariantLabel(
  item: Record<string, unknown>,
): string | undefined {
  const parts = [item.size, item.volume, item.color]
    .filter((value) => value != null && String(value).trim() !== "")
    .map((value) => String(value));

  if (parts.length > 0) return parts.join(" · ");
  if (item.variantLabel != null) return String(item.variantLabel);
  return undefined;
}

function normalizeServerCartItem(
  item: Record<string, unknown>,
): ServerCart["items"][number] {
  return {
    cartItemId: String(item.cartItemId ?? ""),
    sku: String(item.sku ?? ""),
    productId: String(item.productId ?? ""),
    variantId: String(item.variantId ?? ""),
    productName: String(item.productName ?? ""),
    variantLabel: buildServerCartVariantLabel(item),
    thumbnailUrl:
      item.thumbnailUrl != null ? String(item.thumbnailUrl) : undefined,
    slug: item.slug != null ? String(item.slug) : undefined,
    price: Number(item.unitPrice ?? item.price ?? 0),
    salePrice: item.salePrice != null ? Number(item.salePrice) : null,
    quantity: Number(item.quantity ?? 1),
    lineTotal: Number(item.lineTotal ?? 0),
    inStock: item.inStock != null ? Boolean(item.inStock) : undefined,
  };
}

/** Lấy giỏ hàng từ server (yêu cầu đã đăng nhập). */
export async function getCart(): Promise<ServerCart> {
  const { data } = await api.get<ApiEnvelope<ServerCart>>("/cart");
  const raw = unwrapData<Record<string, unknown>>(data);

  const items = Array.isArray(raw.items) ? raw.items : [];

  return {
    cartId: raw.cartId != null ? String(raw.cartId) : undefined,
    items: items.map((item) =>
      normalizeServerCartItem(item as Record<string, unknown>),
    ),
    totalItems: Number(raw.totalItems ?? raw.itemCount ?? 0),
    totalPrice: Number(raw.subtotal ?? raw.totalPrice ?? raw.total ?? 0),
  };
}

/** Lấy tóm tắt giỏ hàng (số lượng) — dùng GET /cart. */
export async function getCartSummary(): Promise<CartSummary> {
  const cart = await getCart();
  return { itemCount: cart.totalItems };
}

/** Thêm sản phẩm vào giỏ bằng SKU (cộng dồn nếu trùng SKU). */
export async function addToCart(sku: string, quantity = 1): Promise<void> {
  await api.post("/cart/items", { sku, quantity });
}

/** Cập nhật số lượng dòng giỏ trên server. */
export async function updateCartItem(
  cartItemId: string,
  quantity: number,
): Promise<void> {
  await api.put(`/cart/items/${cartItemId}`, { quantity });
}

/** Xóa một dòng khỏi giỏ trên server. */
export async function removeCartItem(cartItemId: string): Promise<void> {
  await api.delete(`/cart/items/${cartItemId}`);
}

export default api;

export {
  uploadAdminProductImage,
  uploadAdminProductImagesBatch,
  uploadImage,
} from "@/lib/upload-api";

export {
  createAdminBanner,
  createAdminCategory,
  createAdminProduct,
  deleteAdminBanner,
  deleteAdminBrand,
  deleteAdminCategory,
  deleteAdminCustomer,
  deleteAdminProduct,
  filterAdminBanners,
  filterAdminBrands,
  filterAdminCustomers,
  filterAdminProducts,
  getAdminCategoryTree,
  getAdminDashboardStats,
  getAdminProductById,
  updateAdminBanner,
  updateAdminCategory,
  updateAdminProduct,
} from "@/lib/admin-api";
