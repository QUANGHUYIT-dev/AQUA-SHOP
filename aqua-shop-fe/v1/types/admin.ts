import type { MembershipTier } from "@/types/auth";
import type { ProductStatus, ProductType } from "@/types/product";

export type StaffRole = "ADMIN" | "STAFF" | "WAREHOUSE";

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  membershipTier: MembershipTier;
  points: number;
  walletBalance: number;
}

export interface AdminCustomerFilterParams {
  search?: string;
  email?: string;
  phoneNumber?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminBrandFilterParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminProductFilterParams {
  search?: string;
  productType?: ProductType;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminDashboardStats {
  productCount: number;
  categoryCount: number;
  brandCount: number;
  customerCount: number;
}

export interface AdminCustomerApi {
  customerId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  membershipTier: MembershipTier;
  points: number;
  walletBalance: number;
}
