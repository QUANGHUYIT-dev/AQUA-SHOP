"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "@/lib/api";
import { isStaffRole } from "@/lib/admin-auth";
import { ROUTES } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useAuth } from "@/hooks/useAuth";

export function useAdminAccess() {
  const router = useRouter();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.ADMIN)}`,
      );
      return;
    }

    let cancelled = false;

    async function verifyAccess() {
      setChecking(true);
      try {
        if (isStaffRole(user?.role)) {
          if (!cancelled) {
            setAllowed(true);
            setError(null);
          }
          return;
        }

        const profile = await getCurrentProfile();
        if (!cancelled) {
          const canAccess = isStaffRole(profile.role);
          setAllowed(canAccess);
          setError(canAccess ? null : SYSTEM_MESSAGES.ADMIN_FORBIDDEN);
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
          setError(SYSTEM_MESSAGES.GENERIC_ERROR);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    verifyAccess();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, isAuthenticated, user?.role, router]);

  return {
    isLoading: !isHydrated || !isAuthenticated || checking,
    allowed,
    error,
  };
}
