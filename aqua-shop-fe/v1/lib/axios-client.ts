import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiEnvelope } from "@/types/product";
import type { AuthTokens, LoginRequest } from "@/types/auth";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
  updateAccessToken,
} from "@/lib/auth-storage";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const body = payload as Record<string, unknown>;
  if ("data" in body && body.data !== undefined) {
    return body.data as T;
  }

  return payload as T;
}

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  refreshQueue = [];
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Không có refresh token");
  }

  const { data } = await api.post<ApiEnvelope<AuthTokens>>(
    "/auth/refresh",
    { refreshToken },
    { _skipAuthRefresh: true } as InternalAxiosRequestConfig,
  );

  const authData = unwrapData<AuthTokens>(data);
  updateAccessToken(authData.accessToken, authData.expiresIn);

  if (authData.refreshToken) {
    saveAuthSession(authData);
  }

  return authData.accessToken;
}

export async function loginRequest(
  credentials: LoginRequest,
): Promise<AuthTokens> {
  const { data } = await api.post<ApiEnvelope<AuthTokens>>(
    "/auth/login",
    credentials,
    { _skipAuthRefresh: true } as InternalAxiosRequestConfig,
  );

  const authData = unwrapData<AuthTokens>(data);
  saveAuthSession(authData);
  return authData;
}

export function logoutRequest(): void {
  clearAuthSession();
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";
    if (
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/cart/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processRefreshQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);
      clearAuthSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { unwrapData };
export default api;
