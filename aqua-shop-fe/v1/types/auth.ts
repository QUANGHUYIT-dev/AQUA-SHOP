export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
}

export type MembershipTier =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export interface CustomerProfileApi {
  customerId: string;
  fullName: string;
  phoneNumber?: string | null;
  email: string;
  address?: string | null;
  membershipTier: MembershipTier;
  points: number;
  role: string;
  imageUrl?: string | null;
  dateOfBirth?: string | null;
  walletBalance: number;
}

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  phoneNumber: string | null;
  email: string;
  address: string | null;
  membershipTier: MembershipTier;
  points: number;
  role: string;
  imageUrl: string | null;
  dateOfBirth: string | null;
  walletBalance: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokens {
  authenticated: boolean;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}
