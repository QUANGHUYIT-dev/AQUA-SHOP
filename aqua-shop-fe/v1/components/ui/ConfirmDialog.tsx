"use client";

import { useEffect } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import type { ConfirmState } from "@/types/feedback";

interface ConfirmDialogProps {
  state: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  state,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!state.open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.open, onCancel]);

  if (!state.open) return null;

  const isDanger = state.variant === "danger";
  const Icon = isDanger ? AlertTriangle : HelpCircle;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/45"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isDanger ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-700"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-ocean-900"
            >
              {state.title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="mt-2 text-sm leading-relaxed text-slate-600"
            >
              {state.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {state.cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-ocean-700 hover:bg-ocean-800"
            }`}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
