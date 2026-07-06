"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CancelOrderRequest,
  CheckoutRequest,
  OrderFilterParams,
  OrderResponse,
  OrderSummaryResponse,
} from "@/types/order";
import type { SpringPage } from "@/types/product";
import {
  cancelOrder,
  checkout,
  getMyOrders,
  getOrderById,
} from "@/lib/order-api";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCheckout = useCallback(
    async (request: CheckoutRequest): Promise<OrderResponse | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const order = await checkout(request);
        return order;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { submitCheckout, isSubmitting, error };
}

export function useMyOrders(initialParams: OrderFilterParams = {}) {
  const [orders, setOrders] = useState<SpringPage<OrderSummaryResponse> | null>(
    null,
  );
  const [currentParams, setCurrentParams] = useState<OrderFilterParams>({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
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
        const result = await getMyOrders(currentParams);
        if (!cancelled) setOrders(result);
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

  const filterByStatus = useCallback((status: OrderFilterParams["status"]) => {
    setCurrentParams((prev) => ({ ...prev, status, page: 0 }));
  }, []);

  return {
    page: orders,
    params: currentParams,
    isLoading,
    error,
    refresh,
    goToPage,
    filterByStatus,
  };
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    async function doFetch() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getOrderById(orderId);
        if (!cancelled) setOrder(result);
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
  }, [orderId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const cancel = useCallback(async (request: CancelOrderRequest): Promise<boolean> => {
    if (!orderId) return false;
    setIsCancelling(true);
    setError(null);
    try {
      const updated = await cancelOrder(orderId, request);
      setOrder(updated);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsCancelling(false);
    }
  }, [orderId]);

  return { order, isLoading, isCancelling, error, refresh, cancel };
}
