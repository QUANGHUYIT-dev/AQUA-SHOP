export interface Banner {
  id: string;
  brandId: string;
  brandName: string;
  brandSlug?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface BannerApi {
  bannerId: string;
  brandId: string;
  brandName: string;
  brandSlug?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateBannerPayload {
  brandId: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  sortOrder?: number;
}

export interface UpdateBannerPayload {
  brandId?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AdminBannerFilterParams {
  search?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}
