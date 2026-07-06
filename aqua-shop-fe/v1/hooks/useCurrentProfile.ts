"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerProfile } from "@/types/auth";
import { getCurrentProfile } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

interface UseCurrentProfileOptions {
  enabled?: boolean;
  loginRedirectPath?: string;
}

export function useCurrentProfile({
  enabled = true,
  loginRedirectPath = ROUTES.PROFILE,
}: UseCurrentProfileOptions = {}) {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        const result = await getCurrentProfile();
        if (!cancelled) {
          setProfile(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            logout();
            router.replace(
              `${ROUTES.LOGIN}?redirect=${encodeURIComponent(loginRedirectPath)}`,
            );
            return;
          }
          setProfile(null);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [enabled, loginRedirectPath, logout, router]);

  return { profile, loading, error };
}
