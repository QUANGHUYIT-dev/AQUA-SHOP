"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAuth(redirectTo: string) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isHydrated) return;

    if (!auth.isAuthenticated) {
      router.replace(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectTo)}`,
      );
    }
  }, [auth.isHydrated, auth.isAuthenticated, redirectTo, router]);

  return {
    ...auth,
    isReady: auth.isHydrated && auth.isAuthenticated,
  };
}
