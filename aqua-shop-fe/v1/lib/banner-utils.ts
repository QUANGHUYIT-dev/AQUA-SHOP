import type { Banner, BannerApi } from "@/types/banner";

export function normalizeBanner(raw: BannerApi): Banner {
  return {
    id: raw.bannerId ?? "",
    brandId: raw.brandId ?? "",
    brandName: raw.brandName ?? "",
    brandSlug: raw.brandSlug,
    title: raw.title,
    subtitle: raw.subtitle,
    imageUrl: raw.imageUrl ?? "",
    sortOrder: raw.sortOrder ?? 0,
    isActive: raw.isActive !== false,
  };
}

export function normalizeBanners(items: BannerApi[]): Banner[] {
  return items.map(normalizeBanner);
}

export function getBannerBrandHref(brandId: string): string {
  return `/search?brand=${encodeURIComponent(brandId)}`;
}

export function getBannerProductHref(banner: Banner): string {
  if (banner.brandId) {
    return getBannerBrandHref(banner.brandId);
  }

  const fallbackKeyword = banner.brandName || banner.title || banner.subtitle;

  if (fallbackKeyword?.trim()) {
    return `/search?q=${encodeURIComponent(fallbackKeyword.trim())}`;
  }

  return "/search";
}
