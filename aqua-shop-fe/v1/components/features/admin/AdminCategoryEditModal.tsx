"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Category, ProductType } from "@/types/product";
import {
  createAdminCategory,
  getAdminCategoryTree,
  updateAdminCategory,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import { ADMIN_PRODUCT_TYPE_OPTIONS } from "@/utils/product-utils";
import {
  buildCreateCategoryPayload,
  buildUpdateCategoryPayload,
  createCategoryFormFromCategory,
  createEmptyCategoryForm,
  getAllParentCategoryOptions,
  getParentCategoryOptions,
  type CategoryFormState,
} from "@/utils/admin-category-form";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

const PRODUCT_TYPE_OPTIONS = ADMIN_PRODUCT_TYPE_OPTIONS;

interface AdminCategoryEditModalProps {
  category: Category | null;
  mode: "create" | "edit" | null;
  initialParentId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminCategoryEditModal({
  category,
  mode,
  initialParentId = "",
  onClose,
  onSaved,
}: AdminCategoryEditModalProps) {
  const { toast } = useFeedback();
  const [form, setForm] = useState<CategoryFormState>(createEmptyCategoryForm());
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isOpen = mode !== null;
  const isCreate = mode === "create";

  useEffect(() => {
    if (!isOpen) {
      setForm(createEmptyCategoryForm());
      setFormError(null);
      return;
    }

    if (mode === "edit" && category) {
      setForm(createCategoryFormFromCategory(category));
    } else {
      setForm(createEmptyCategoryForm(initialParentId));
    }
    setFormError(null);

    let cancelled = false;

    async function loadTree() {
      setLoadingOptions(true);
      try {
        const tree = await getAdminCategoryTree();
        if (!cancelled) setCategoryTree(tree);
      } catch (err) {
        if (!cancelled) {
          setFormError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadTree();
    return () => {
      cancelled = true;
    };
  }, [category, initialParentId, isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, submitting]);

  const parentOptions = useMemo(() => {
    if (isCreate) {
      return getAllParentCategoryOptions(categoryTree);
    }
    if (!category) return [];
    return getParentCategoryOptions(categoryTree, category.id);
  }, [category, categoryTree, isCreate]);

  const patch = (partial: Partial<CategoryFormState>) => {
    setForm((current) => ({ ...current, ...partial }));
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isOpen) return;
    if (!isCreate && !category) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (isCreate) {
        const payload = buildCreateCategoryPayload(form);
        await createAdminCategory(payload);
      } else {
        const payload = buildUpdateCategoryPayload(form);
        await updateAdminCategory(category!.id, payload);
      }
      toast.success(SYSTEM_MESSAGES.SAVE_SUCCESS);
      onSaved();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error && err.message.startsWith("Vui lòng")
          ? err.message
          : getApiErrorMessage(err);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-category-edit-title"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        disabled={submitting}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="admin-category-edit-title"
              className="text-lg font-bold text-ocean-900"
            >
              {isCreate ? "Thêm danh mục" : "Sửa danh mục"}
            </h2>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {isCreate
                ? "Tạo danh mục mới trong cây phân loại"
                : category?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {formError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="category-name" className={labelClass}>
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                id="category-name"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            {!isCreate && (
              <div>
                <label htmlFor="category-slug" className={labelClass}>
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  id="category-slug"
                  value={form.slug}
                  onChange={(e) => patch({ slug: e.target.value })}
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  URL: /{form.slug || "..."}
                </p>
              </div>
            )}

            {isCreate && (
              <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Slug sẽ được tạo tự động từ tên danh mục. Bạn có thể chỉnh sau
                khi tạo.
              </p>
            )}

            <div>
              <label htmlFor="category-description" className={labelClass}>
                Mô tả
              </label>
              <textarea
                id="category-description"
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label htmlFor="category-type" className={labelClass}>
                Loại sản phẩm <span className="text-red-500">*</span>
              </label>
              <select
                id="category-type"
                value={form.productType}
                onChange={(e) =>
                  patch({ productType: e.target.value as ProductType })
                }
                className={inputClass}
                required
              >
                {PRODUCT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category-parent" className={labelClass}>
                Danh mục cha
              </label>
              <select
                id="category-parent"
                value={form.parentId}
                onChange={(e) => patch({ parentId: e.target.value })}
                className={inputClass}
                disabled={loadingOptions}
              >
                {parentOptions.map((option) => (
                  <option key={option.value || "root"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category-sort-order" className={labelClass}>
                Thứ tự hiển thị
              </label>
              <input
                id="category-sort-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => patch({ sortOrder: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOptions}
              className="inline-flex items-center gap-2 rounded-lg bg-ocean-700 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-800 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreate ? "Tạo danh mục" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
