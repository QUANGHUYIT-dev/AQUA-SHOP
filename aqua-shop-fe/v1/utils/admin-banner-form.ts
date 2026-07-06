import type { Banner } from "@/types/banner";

export interface BannerFormState {
  brandId: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

export function createEmptyBannerForm(): BannerFormState {
  return {
    brandId: "",
    title: "",
    subtitle: "",
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
  };
}

export function createBannerFormFromBanner(banner: Banner): BannerFormState {
  return {
    brandId: banner.brandId ?? "",
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    imageUrl: banner.imageUrl ?? "",
    sortOrder: String(banner.sortOrder ?? 0),
    isActive: banner.isActive !== false,
  };
}

function trimField(value?: string): string {
  return (value ?? "").trim();
}

export function buildCreateBannerPayload(form: BannerFormState) {
  const brandId = trimField(form.brandId);
  const imageUrl = trimField(form.imageUrl);

  if (!brandId) {
    throw new Error("Vui lòng chọn thương hiệu.");
  }
  if (!imageUrl) {
    throw new Error("Vui lòng tải ảnh banner.");
  }

  const sortOrder = Number.parseInt(form.sortOrder, 10);

  return {
    brandId,
    title: trimField(form.title) || undefined,
    subtitle: trimField(form.subtitle) || undefined,
    imageUrl,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

export function buildUpdateBannerPayload(form: BannerFormState) {
  const base = buildCreateBannerPayload(form);
  return {
    ...base,
    isActive: form.isActive,
  };
}
