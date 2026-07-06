"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import type { ToastItem, ToastVariant } from "@/types/feedback";

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: "text-red-600",
    Icon: AlertCircle,
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    Icon: Info,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
};

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const styles = VARIANT_STYLES[toast.variant];
  const Icon = styles.Icon;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles.container}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} />
      <p className="min-w-0 flex-1 text-sm leading-relaxed">{toast.message}</p>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-500 hover:text-slate-800"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[110] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
