"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ChevronLeft, Loader2, Minus, Plus } from "lucide-react";

import {
  useInventoryAdjust,
  useInventoryDetail,
  useInventoryHistory,
  useInventorySetQuantity,
} from "@/hooks/useInventory";

import { SYSTEM_MESSAGES } from "@/constants/systemMessages";

import { ROUTES } from "@/constants/routes";

import { useFeedback } from "@/hooks/useFeedback";

import { formatDateTime, formatInventoryChangeType } from "@/utils/order-utils";

import AdminPageHeader from "@/components/features/admin/AdminPageHeader";

interface Props {
  sku: string;
}

export default function InventoryDetailPageClient({ sku: decodedSku }: Props) {
  const { toast } = useFeedback();

  const { inventory, isLoading, error, refresh } =
    useInventoryDetail(decodedSku);

  const {
    history,

    isLoading: historyLoading,

    refresh: refreshHistory,
  } = useInventoryHistory(decodedSku);

  const {
    save,
    isSubmitting,
    error: saveError,
  } = useInventorySetQuantity(decodedSku);

  const {
    adjust,

    isSubmitting: isAdjusting,

    error: adjustError,
  } = useInventoryAdjust(decodedSku);

  const [quantityOnHand, setQuantityOnHand] = useState("");

  const [adjustDelta, setAdjustDelta] = useState("");

  const [note, setNote] = useState("");

  const [adjustNote, setAdjustNote] = useState("");

  useEffect(() => {
    if (inventory) {
      setTimeout(() => {
        setQuantityOnHand(String(inventory.quantityOnHand ?? 0));
      }, 0);
    }
  }, [inventory]);

  const handleSetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = Number.parseInt(quantityOnHand, 10);

    if (!Number.isFinite(parsed) || parsed < 0) return;

    const result = await save({
      quantityOnHand: parsed,

      note: note.trim() || undefined,
    });

    if (result) {
      setNote("");

      await refresh();

      refreshHistory();

      toast.success(SYSTEM_MESSAGES.SAVE_SUCCESS);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = Number.parseInt(adjustDelta, 10);

    if (!Number.isFinite(parsed) || parsed === 0) return;

    const result = await adjust({
      quantityChange: parsed,

      note: adjustNote.trim() || undefined,
    });

    if (result) {
      setAdjustDelta("");

      setAdjustNote("");

      await refresh();

      refreshHistory();

      toast.success("Đã điều chỉnh tồn kho");
    }
  };

  const quickAdjust = async (delta: number) => {
    const result = await adjust({
      quantityChange: delta,

      note: delta < 0 ? "Hao hụt / mất mát" : "Nhập bổ sung",
    });

    if (result) {
      await refresh();

      refreshHistory();

      toast.success("Đã điều chỉnh tồn kho");
    }
  };

  if (isLoading && !inventory) {
    return (
      <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error && !inventory) {
    return (
      <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
        {error}

        <div className="mt-4">
          <Link
            href={ROUTES.ADMIN_INVENTORY}
            className="text-sm font-semibold text-teal-600 hover:underline"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (!inventory) return null;

  const onHold = inventory.quantityOnHold ?? 0;

  return (
    <>
      <Link
        href={ROUTES.ADMIN_INVENTORY}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại tồn kho
      </Link>

      <AdminPageHeader
        title={inventory.productName}
        description={`SKU: ${inventory.sku} — Kiểm kho & điều chỉnh (hao hụt, nhập thêm)`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-ocean-900">
              Điều chỉnh nhanh (delta)
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Dùng khi cá chết, hao hụt — không cần tạo đơn ảo. Số âm = trừ, số
              dương = nhập thêm.
            </p>

            {adjustError && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {adjustError}
              </div>
            )}

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => quickAdjust(-1)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                <Minus className="h-4 w-4" />
                Trừ 1
              </button>

              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => quickAdjust(1)}
                className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Thêm 1
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Thay đổi (+/-) <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  placeholder="VD: -3 (mất 3 con)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ghi chú
                </label>

                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="VD: Cá chết sau vận chuyển"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {isAdjusting ? "Đang lưu..." : "Điều chỉnh kho"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-semibold text-ocean-900">
              Đặt tồn thực tuyệt đối
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Sau kiểm kho đếm tay — không được thấp hơn số đang giữ ({onHold}).
            </p>

            {saveError && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSetSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tồn thực mới <span className="text-red-500">*</span>
                </label>

                <input
                  title="Tồn thực mới"
                  placeholder="VD: 100"
                  type="number"
                  min={onHold}
                  value={quantityOnHand}
                  onChange={(e) => setQuantityOnHand(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ghi chú
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Lý do kiểm kho (tùy chọn)"
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800 disabled:opacity-60"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu tồn thực"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-ocean-900">
                Lịch sử biến động
              </h2>
            </div>

            {historyLoading && history.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              </div>
            ) : history.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-500">
                Chưa có lịch sử biến động
              </p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {history.map((item) => (
                  <li
                    key={item.inventoryHistoryId}
                    className="px-6 py-4 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ocean-900">
                        {formatInventoryChangeType(item.changeType)}
                      </p>

                      <span
                        className={`font-semibold ${item.quantityChange > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.quantityChange > 0 ? "+" : ""}

                        {item.quantityChange}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.quantityBefore} → {item.quantityAfter}
                    </p>

                    {item.note && (
                      <p className="mt-1 text-slate-600">{item.note}</p>
                    )}

                    {item.referenceId && (
                      <p className="mt-1 text-xs text-slate-400">
                        Ref: {item.referenceType} {item.referenceId}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside>
          <section className="sticky top-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-ocean-900">
              Tóm tắt kho
            </h2>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">SKU</dt>

                <dd className="font-medium text-ocean-900">{inventory.sku}</dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Sản phẩm</dt>

                <dd className="font-medium text-ocean-900">
                  {inventory.productName}
                </dd>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <dt className="text-xs text-slate-500">Tồn thực (on hand)</dt>

                <dd className="text-2xl font-bold text-slate-800">
                  {inventory.quantityOnHand}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Đang giữ (HOLD)</dt>

                <dd className="text-xl font-bold text-amber-600">
                  {inventory.quantityOnHold ?? 0}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Có thể bán</dt>

                <dd className="text-2xl font-bold text-teal-700">
                  {inventory.quantityAvailable ?? 0}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
