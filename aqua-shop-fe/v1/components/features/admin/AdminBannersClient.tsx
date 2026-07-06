"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { Banner } from "@/types/banner";
import { deleteAdminBanner, filterAdminBanners } from "@/lib/api";
import { getBannerBrandHref } from "@/lib/banner-utils";
import { resolveBannerDisplayUrl, BANNER_IMAGE_CLASS } from "@/lib/banner-image";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidImageUrl } from "@/lib/image-utils";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import AdminBannerEditModal from "@/components/features/admin/AdminBannerEditModal";

const PAGE_SIZE = 10;

export default function AdminBannersClient() {
  const { toast, confirm } = useFeedback();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const result = await filterAdminBanners({
        search: search.trim() || undefined,
        page,
        size: PAGE_SIZE,
        sort: "sortOrder,asc",
      });
      setBanners(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setError(null);
    } catch (err) {
      setBanners([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    loadBanners();
  };

  const openCreate = () => {
    setEditingBanner(null);
    setModalMode("create");
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingBanner(null);
  };

  const handleDelete = async (banner: Banner) => {
    const ok = await confirm({
      title: "Ẩn banner",
      message: `Ẩn banner "${banner.title || banner.brandName}"?`,
      confirmLabel: "Ẩn",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;

    setDeletingId(banner.id);
    try {
      await deleteAdminBanner(banner.id);
      await loadBanners();
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
        title="Banner"
        description={`${totalElements} banner — mỗi banner gắn một thương hiệu`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Thêm banner
          </button>
        }
      />

      <form onSubmit={handleSearch} className="mb-4 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc hãng..."
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
                <th className="px-4 py-3 font-semibold text-slate-600">Ảnh</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thương hiệu</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thứ tự</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Chưa có banner
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="relative h-14 w-28 overflow-hidden rounded-lg bg-slate-100">
                        {isValidImageUrl(banner.imageUrl) ? (
                          <Image
                            src={resolveBannerDisplayUrl(banner.imageUrl)}
                            alt={banner.title || banner.brandName}
                            fill
                            className={BANNER_IMAGE_CLASS}
                            sizes="112px"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ocean-900">
                      {banner.brandName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {banner.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{banner.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold ${
                          banner.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {banner.isActive ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(banner)}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === banner.id}
                          onClick={() => handleDelete(banner)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Ẩn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => setPage((current) => current - 1)}
                  aria-label="Trang trước"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Trang sau"
                  className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Link khi click:{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">
          /search?brand=BRD...
        </code>{" "}
        — chỉ hiện sản phẩm của hãng ({getBannerBrandHref("BRD0000001")}).
      </p>

      <AdminBannerEditModal
        banner={editingBanner}
        mode={modalMode}
        onClose={closeModal}
        onSaved={loadBanners}
      />
    </>
  );
}
