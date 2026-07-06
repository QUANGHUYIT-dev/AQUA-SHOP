"use client";

import { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useInventoryHistory } from "@/hooks/useInventory";
import {
  formatDateTime,
  formatInventoryChangeType,
} from "@/utils/order-utils";

interface InventoryHistoryModalProps {
  sku: string | null;
  productName?: string;
  onClose: () => void;
}

export default function InventoryHistoryModal({
  sku,
  productName,
  onClose,
}: InventoryHistoryModalProps) {
  const { history, isLoading, error } = useInventoryHistory(sku ?? "");

  useEffect(() => {
    if (!sku) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sku, onClose]);

  if (!sku) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-history-title"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h2
              id="inventory-history-title"
              className="text-lg font-bold text-ocean-900"
            >
              Lịch sử biến động tồn kho
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {productName ? `${productName} · ` : ""}
              SKU: {sku}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && history.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-sm text-red-700">
              {error}
            </div>
          ) : history.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-slate-500">
              Chưa có lịch sử biến động cho SKU này
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Loại biến động
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Thay đổi
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Trước → Sau
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Ghi chú
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Người thực hiện
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Tham chiếu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.inventoryHistoryId} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-ocean-900">
                        {formatInventoryChangeType(item.changeType)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          item.quantityChange > 0
                            ? "text-green-600"
                            : item.quantityChange < 0
                              ? "text-red-600"
                              : "text-slate-600"
                        }`}
                      >
                        {item.quantityChange > 0 ? "+" : ""}
                        {item.quantityChange}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                        {item.quantityBefore} → {item.quantityAfter}
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-slate-600">
                        {item.note || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {item.changedBy || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {item.referenceId
                          ? `${item.referenceType ?? "REF"} ${item.referenceId}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
