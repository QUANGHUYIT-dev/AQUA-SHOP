"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ToastStack from "@/components/ui/ToastStack";
import type {
  ConfirmOptions,
  ConfirmState,
  ToastItem,
  ToastVariant,
} from "@/types/feedback";

const DEFAULT_CONFIRM: ConfirmState = {
  open: false,
  title: "",
  message: "",
  confirmLabel: "Xác nhận",
  cancelLabel: "Hủy",
  variant: "default",
};

const TOAST_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  error: 6000,
  info: 4000,
  warning: 5000,
};

export interface ToastApi {
  show: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export interface FeedbackContextValue {
  toast: ToastApi;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackContextValue | undefined>(
  undefined,
);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(DEFAULT_CONFIRM);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info",
      durationMs = TOAST_DURATION[variant],
    ) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      setToasts((prev) => [
        ...prev,
        { id: createToastId(), variant, message: trimmed, durationMs },
      ]);
    },
    [],
  );

  const toast = useMemo<ToastApi>(
    () => ({
      show: showToast,
      success: (message) => showToast(message, "success"),
      error: (message) => showToast(message, "error"),
      info: (message) => showToast(message, "info"),
      warning: (message) => showToast(message, "warning"),
    }),
    [showToast],
  );

  const closeConfirm = useCallback((result: boolean) => {
    confirmResolverRef.current?.(result);
    confirmResolverRef.current = null;
    setConfirmState(DEFAULT_CONFIRM);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState({
        open: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? "Xác nhận",
        cancelLabel: options.cancelLabel ?? "Hủy",
        variant: options.variant ?? "default",
      });
    });
  }, []);

  const value = useMemo(
    () => ({ toast, confirm }),
    [toast, confirm],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog
        state={confirmState}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </FeedbackContext.Provider>
  );
}
