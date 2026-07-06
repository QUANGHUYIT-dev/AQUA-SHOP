"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { deleteAdminBrand, filterAdminBrands } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";

const PAGE_SIZE = 10;

export default function AdminBrandsClient() {
  const { toast, confirm } = useFeedback();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [brands, setBrands] = useState<
    Awaited<ReturnType<typeof filterAdminBrands>>["content"]
  >([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const result = await filterAdminBrands({
        search: search.trim() || undefined,
        page,
        size: PAGE_SIZE,
        sort: "name,asc",
      });
      setBrands(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setError(null);
    } catch (err) {
      setBrands([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadBrands();
  };

  const handleDelete = async (brandId: string, brandName: string) => {
    const ok = await confirm({
      title: "Xóa thương hiệu",
      message: `Xóa thương hiệu "${brandName}"?`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;

    setDeletingId(brandId);
    try {
      await deleteAdminBrand(brandId);
      await loadBrands();
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
        title="Thương hiệu"
        description={`${totalElements} thương hiệu trong hệ thống`}
      />

      <form onSubmit={handleSearch} className="mb-4 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thương hiệu..."
            className="w-full border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button
          type="submit"
          className="bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800"
        >
          Tìm
        </button>
      </form>

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
                <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    Không có thương hiệu
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-ocean-900">
                      {brand.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {brand.slug ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold ${
                          brand.isActive !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {brand.isActive !== false ? "Hoạt động" : "Ngừng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={deletingId === brand.id}
                        onClick={() => handleDelete(brand.id, brand.name)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Trang trước"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Trang sau"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
