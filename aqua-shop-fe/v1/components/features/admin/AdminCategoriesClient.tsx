"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/types/product";
import { deleteAdminCategory, getAdminCategoryTree } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import { PRODUCT_TYPE_LABELS } from "@/utils/product-utils";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import AdminCategoryEditModal from "@/components/features/admin/AdminCategoryEditModal";

interface FlatCategoryRow {
  category: Category;
  depth: number;
}

function flattenCategories(
  categories: Category[],
  depth = 0,
): FlatCategoryRow[] {
  const rows: FlatCategoryRow[] = [];

  for (const category of categories) {
    rows.push({ category, depth });
    if (category.children?.length) {
      rows.push(...flattenCategories(category.children, depth + 1));
    }
  }

  return rows;
}

export default function AdminCategoriesClient() {
  const { toast, confirm } = useFeedback();
  const [rows, setRows] = useState<FlatCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [createParentId, setCreateParentId] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const tree = await getAdminCategoryTree();
      setRows(flattenCategories(tree));
      setError(null);
    } catch (err) {
      setRows([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = (parentId = "") => {
    setEditingCategory(null);
    setCreateParentId(parentId);
    setModalMode("create");
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setCreateParentId("");
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
    setCreateParentId("");
  };

  const handleDelete = async (category: Category) => {
    const ok = await confirm({
      title: "Xóa danh mục",
      message: `Xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;

    setDeletingId(category.id);
    try {
      await deleteAdminCategory(category.id);
      await loadCategories();
      toast.success(SYSTEM_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Danh mục"
        description={`${rows.length} danh mục trong cây phân loại`}
        action={
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        }
      />

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Tên</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Slug</th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Loại SP
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Chưa có danh mục — bấm &quot;Thêm danh mục&quot; để bắt đầu
                  </td>
                </tr>
              ) : (
                rows.map(({ category, depth }) => (
                  <tr key={category.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${depth * 20}px` }}
                      >
                        {depth > 0 && <span className="text-slate-300">└</span>}
                        <span className="font-medium text-ocean-900">
                          {category.name}
                        </span>
                      </div>
                      {category.parentName && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          Thuộc: {category.parentName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${category.slug}`}
                        target="_blank"
                        className="text-teal-600 hover:underline"
                      >
                        /{category.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {category.productType
                        ? PRODUCT_TYPE_LABELS[category.productType]
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openCreate(category.id)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm con
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === category.id}
                          onClick={() => handleDelete(category)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminCategoryEditModal
        category={editingCategory}
        mode={modalMode}
        initialParentId={createParentId}
        onClose={closeModal}
        onSaved={loadCategories}
      />
    </>
  );
}
