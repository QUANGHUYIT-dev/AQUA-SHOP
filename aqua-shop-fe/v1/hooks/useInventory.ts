"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  InventoryHistoryResponse,
  InventoryResponse,
  InventoryAdjustRequest,
  SetInventoryQuantityRequest,
} from "@/types/inventory";
import type { SpringPage } from "@/types/product";
import {
  getInventoryBySku,
  getInventoryHistory,
  getInventoryList,
  setInventoryQuantity,
  adjustInventory,
} from "@/lib/inventory-api";
import { getApiErrorMessage } from "@/lib/api-error";

export function useInventoryList(initialParams: Parameters<typeof getInventoryList>[0] = {}) {
  const [inventory, setInventory] =
    useState<SpringPage<InventoryResponse> | null>(null);
  const [currentParams, setCurrentParams] = useState({
    page: 0,
    size: 20,
    ...initialParams,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getInventoryList(currentParams);
        if (!cancelled) setInventory(result);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    doFetch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParams, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const goToPage = useCallback((pageNumber: number) => {
    setCurrentParams((prev) => ({ ...prev, page: pageNumber }));
  }, []);

  const search = useCallback((query: string) => {
    setCurrentParams((prev) => ({
      ...prev,
      search: query || undefined,
      page: 0,
    }));
  }, []);

  return {
    page: inventory,
    params: currentParams,
    isLoading,
    error,
    refresh,
    goToPage,
    search,
  };
}

export function useInventoryDetail(sku: string) {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!sku) return;
    let cancelled = false;

    async function doFetch() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getInventoryBySku(sku);
        if (!cancelled) setInventory(result);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    doFetch();
    return () => {
      cancelled = true;
    };
  }, [sku, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { inventory, isLoading, error, refresh };
}

export function useInventoryHistory(sku: string) {
  const [history, setHistory] = useState<InventoryHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!sku) return;
    let cancelled = false;

    async function doFetch() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getInventoryHistory(sku);
        if (!cancelled) setHistory(result);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    doFetch();
    return () => {
      cancelled = true;
    };
  }, [sku, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { history, isLoading, error, refresh };
}

export function useInventorySetQuantity(sku: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (
      request: SetInventoryQuantityRequest,
    ): Promise<InventoryResponse | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await setInventoryQuantity(sku, request);
        return result;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [sku],
  );

  return { save, isSubmitting, error };
}

export function useInventoryAdjust(sku: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjust = useCallback(
    async (
      request: InventoryAdjustRequest,
    ): Promise<InventoryResponse | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await adjustInventory(sku, request);
        return result;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [sku],
  );

  return { adjust, isSubmitting, error };
}
