"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser, LoginRequest } from "@/types/auth";
import { getCurrentProfile, loginRequest, logoutRequest } from "@/lib/api";
import {
  getStoredUser,
  isAuthenticated as checkAuthenticated,
  updateStoredUser,
} from "@/lib/auth-storage";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsAuthenticated(checkAuthenticated());
    setIsHydrated(true);

    if (stored && !stored.role && checkAuthenticated()) {
      getCurrentProfile()
        .then((profile) => {
          const updated: AuthUser = {
            ...stored,
            id: profile.customerId,
            fullName: profile.fullName,
            email: profile.email,
            role: profile.role,
          };
          updateStoredUser(updated);
          setUser(updated);
        })
        .catch(() => {
          // Bỏ qua — user vẫn đăng nhập bình thường
        });
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const authData = await loginRequest(credentials);
    let nextUser = authData.user;

    try {
      const profile = await getCurrentProfile();
      nextUser = {
        ...authData.user,
        id: profile.customerId,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
      };
      updateStoredUser(nextUser);
    } catch {
      // Giữ user từ login nếu không lấy được profile
    }

    setUser(nextUser);
    setIsAuthenticated(true);
    setIsHydrated(true);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isHydrated,
      login,
      logout,
    }),
    [user, isAuthenticated, isHydrated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
