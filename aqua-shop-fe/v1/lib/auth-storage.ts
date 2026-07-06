import Cookies from "js-cookie";
import type { AuthTokens, AuthUser } from "@/types/auth";

export const AUTH_COOKIE_KEYS = {
  ACCESS_TOKEN: "aqua_access_token",
  REFRESH_TOKEN: "aqua_refresh_token",
  USER: "aqua_user",
} as const;

const cookieOptions = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function getAccessToken(): string | undefined {
  return Cookies.get(AUTH_COOKIE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(AUTH_COOKIE_KEYS.REFRESH_TOKEN);
}

export function getStoredUser(): AuthUser | null {
  const raw = Cookies.get(AUTH_COOKIE_KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function updateStoredUser(user: AuthUser): void {
  Cookies.set(AUTH_COOKIE_KEYS.USER, JSON.stringify(user), {
    ...cookieOptions,
    expires: 7,
  });
}

export function saveAuthSession(data: AuthTokens): void {
  const accessExpires = new Date(Date.now() + data.expiresIn * 1000);

  Cookies.set(AUTH_COOKIE_KEYS.ACCESS_TOKEN, data.accessToken, {
    ...cookieOptions,
    expires: accessExpires,
  });

  Cookies.set(AUTH_COOKIE_KEYS.REFRESH_TOKEN, data.refreshToken, {
    ...cookieOptions,
    expires: 7,
  });

  Cookies.set(AUTH_COOKIE_KEYS.USER, JSON.stringify(data.user), {
    ...cookieOptions,
    expires: 7,
  });
}

export function updateAccessToken(accessToken: string, expiresIn: number): void {
  Cookies.set(AUTH_COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + expiresIn * 1000),
  });
}

export function clearAuthSession(): void {
  Cookies.remove(AUTH_COOKIE_KEYS.ACCESS_TOKEN, { path: "/" });
  Cookies.remove(AUTH_COOKIE_KEYS.REFRESH_TOKEN, { path: "/" });
  Cookies.remove(AUTH_COOKIE_KEYS.USER, { path: "/" });
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}
