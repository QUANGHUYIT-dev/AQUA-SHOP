import type {
  AdminBrandFilterParams,
  AdminCustomer,
  AdminCustomerApi,
  AdminCustomerFilterParams,
  AdminDashboardStats,
  AdminProductFilterParams,
} from "@/types/admin";
import type {
  AdminBannerFilterParams,
  Banner,
  BannerApi,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "@/types/banner";
import type { Brand, BrandApi } from "@/types/brand";
import api, { unwrapData } from "@/lib/axios-client";
import type {
  ApiEnvelope,
  Category,
  CategoryApi,
  Product,
  ProductDetail,
  ProductSummary,
  SpringPage,
} from "@/types/product";
import {
  filterActiveCategoryTree,
  normalizeCategories,
} from "@/lib/category-mapper";
import { normalizeBanner, normalizeBanners } from "@/lib/banner-utils";
import {
  normalizeProductDetail,
  normalizeProducts,
} from "@/lib/product-mapper";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "@/utils/admin-product-form";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/utils/admin-category-form";

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

function normalizeAdminCustomer(raw: AdminCustomerApi): AdminCustomer {
  return {
    id: raw.customerId,
    fullName: raw.fullName,
    email: raw.email,
    phoneNumber: raw.phoneNumber ?? null,
    role: raw.role,
    membershipTier: raw.membershipTier,
    points: Number(raw.points ?? 0),
    walletBalance: Number(raw.walletBalance ?? 0),
  };
}

function countCategoryNodes(categories: Category[]): number {
  return categories.reduce(
    (total, category) =>
      total + 1 + countCategoryNodes(category.children ?? []),
    0,
  );
}

export async function getAdminCategoryTree(): Promise<Category[]> {
  const { data } = await api.get<CategoryApi[] | ApiEnvelope<CategoryApi[]>>(
    "/categories/tree",
  );

  const raw = Array.isArray(data) ? data : unwrapData<CategoryApi[]>(data);

  if (!Array.isArray(raw)) return [];
  return filterActiveCategoryTree(normalizeCategories(raw));
}

export async function filterAdminProducts(
  params: AdminProductFilterParams = {},
): Promise<SpringPage<Product>> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<ProductSummary>> | SpringPage<ProductSummary>
  >("/products/filter", {
    params: {
      page: 0,
      size: 10,
      sort: "createdAt,desc",
      ...params,
    },
  });

  const page = unwrapPage<ProductSummary>(data);
  return {
    ...page,
    content: normalizeProducts(page.content),
  };
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await api.delete(`/products/${productId}`);
}

export async function createAdminProduct(
  payload: CreateProductPayload,
): Promise<ProductDetail> {
  const { data } = await api.post<ApiEnvelope<Record<string, unknown>>>(
    "/products",
    payload,
  );
  return normalizeProductDetail(
    unwrapData<Record<string, unknown>>(data) ?? {},
  );
}

export async function getAdminProductById(
  productId: string,
): Promise<ProductDetail> {
  const { data } = await api.get<ApiEnvelope<Record<string, unknown>>>(
    `/products/${productId}`,
  );
  return normalizeProductDetail(
    unwrapData<Record<string, unknown>>(data) ?? {},
  );
}

export async function updateAdminProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<ProductDetail> {
  const { data } = await api.put<ApiEnvelope<Record<string, unknown>>>(
    `/products/${productId}`,
    payload,
  );
  return normalizeProductDetail(
    unwrapData<Record<string, unknown>>(data) ?? {},
  );
}

export async function filterAdminCustomers(
  params: AdminCustomerFilterParams = {},
): Promise<SpringPage<AdminCustomer>> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<AdminCustomerApi>> | SpringPage<AdminCustomerApi>
  >("/customers/filter", {
    params: {
      page: 0,
      size: 10,
      sort: "fullName,asc",
      ...params,
    },
  });

  const page = unwrapPage<AdminCustomerApi>(data);
  return {
    ...page,
    content: page.content.map(normalizeAdminCustomer),
  };
}

export async function deleteAdminCustomer(customerId: string): Promise<void> {
  await api.delete(`/customers/${customerId}`);
}

export async function filterAdminBrands(
  params: AdminBrandFilterParams = {},
): Promise<SpringPage<Brand>> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<BrandApi>> | SpringPage<BrandApi>
  >("/brands", {
    params: {
      page: 0,
      size: 10,
      sort: "name,asc",
      ...params,
    },
  });

  const page = unwrapPage<BrandApi>(data);
  return {
    ...page,
    content: page.content.map((brand) => ({
      id: brand.brandId,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
      isActive: brand.isActive,
    })),
  };
}

export async function deleteAdminBrand(brandId: string): Promise<void> {
  await api.delete(`/brands/${brandId}`);
}

export async function filterAdminBanners(
  params: AdminBannerFilterParams = {},
): Promise<SpringPage<Banner>> {
  const { data } = await api.get<
    ApiEnvelope<SpringPage<BannerApi>> | SpringPage<BannerApi>
  >("/banners", {
    params: {
      page: 0,
      size: 10,
      sort: "sortOrder,asc",
      ...params,
    },
  });

  const page = unwrapPage<BannerApi>(data);
  return {
    ...page,
    content: normalizeBanners(page.content),
  };
}

export async function createAdminBanner(
  payload: CreateBannerPayload,
): Promise<Banner> {
  const { data } = await api.post<ApiEnvelope<BannerApi>>("/banners", payload);
  return normalizeBanner(unwrapData<BannerApi>(data));
}

export async function updateAdminBanner(
  bannerId: string,
  payload: UpdateBannerPayload,
): Promise<Banner> {
  const { data } = await api.put<ApiEnvelope<BannerApi>>(
    `/banners/${bannerId}`,
    payload,
  );
  return normalizeBanner(unwrapData<BannerApi>(data));
}

export async function deleteAdminBanner(bannerId: string): Promise<void> {
  await api.delete(`/banners/${bannerId}`);
}

export async function deleteAdminCategory(categoryId: string): Promise<void> {
  await api.delete(`/categories/${categoryId}`);
}

export async function createAdminCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  const { data } = await api.post<ApiEnvelope<CategoryApi>>(
    "/categories",
    payload,
  );
  return normalizeCategories([unwrapData<CategoryApi>(data)])[0];
}

export async function updateAdminCategory(
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const { data } = await api.put<ApiEnvelope<CategoryApi>>(
    `/categories/${categoryId}`,
    payload,
  );
  return normalizeCategories([unwrapData<CategoryApi>(data)])[0];
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [products, categories, brands, customers] = await Promise.all([
    filterAdminProducts({ page: 0, size: 1 }),
    getAdminCategoryTree(),
    filterAdminBrands({ page: 0, size: 1 }),
    filterAdminCustomers({ page: 0, size: 1 }),
  ]);

  return {
    productCount: products.totalElements,
    categoryCount: countCategoryNodes(categories),
    brandCount: brands.totalElements,
    customerCount: customers.totalElements,
  };
}
