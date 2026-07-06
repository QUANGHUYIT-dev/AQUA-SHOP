export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  durationMs: number;
}

export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmState extends ConfirmOptions {
  open: boolean;
  confirmLabel: string;
  cancelLabel: string;
  variant: ConfirmVariant;
}
