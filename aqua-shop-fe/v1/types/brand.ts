export interface Brand {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface BrandApi {
  brandId: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  isActive?: boolean;
}
