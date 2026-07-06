"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { Banner } from "@/types/banner";
import type { Brand } from "@/types/brand";
import {
  createAdminBanner,
  filterAdminBrands,
  updateAdminBanner,
  uploadImage,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  BANNER_DISPLAY_CLASS,
  BANNER_IMAGE_CLASS,
  normalizeBannerImage,
  resolveBannerDisplayUrl,
} from "@/lib/banner-image";
import { isValidImageUrl } from "@/lib/image-utils";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import {
  buildCreateBannerPayload,
  buildUpdateBannerPayload,
  createBannerFormFromBanner,
  createEmptyBannerForm,
  type BannerFormState,
} from "@/utils/admin-banner-form";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

interface AdminBannerEditModalProps {
  banner: Banner | null;
  mode: "create" | "edit" | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminBannerEditModal({
  banner,
  mode,
  onClose,
  onSaved,
}: AdminBannerEditModalProps) {
  const { toast } = useFeedback();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BannerFormState>(createEmptyBannerForm());
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isOpen = mode !== null;

  useEffect(() => {
    if (!isOpen) {
      setForm(createEmptyBannerForm());
      setFormError(null);
      return;
    }

    if (mode === "edit" && banner) {
      setForm(createBannerFormFromBanner(banner));
    } else {
      setForm(createEmptyBannerForm());
    }
    setFormError(null);

    let cancelled = false;

    async function loadBrands() {
      setLoadingBrands(true);
      try {
        const result = await filterAdminBrands({
          isActive: true,
          page: 0,
          size: 100,
          sort: "name,asc",
        });
        if (!cancelled) setBrands(result.content);
      } catch (err) {
        if (!cancelled) setFormError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingBrands(false);
      }
    }

    loadBrands();
    return () => {
      cancelled = true;
    };
  }, [banner, isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting && !uploading) onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, submitting, uploading]);

  const patch = (partial: Partial<BannerFormState>) => {
    setForm((current) => ({ ...current, ...partial }));
    setFormError(null);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const normalized = await normalizeBannerImage(file);
      const uploaded = await uploadImage(normalized, "BANNERS");
      patch({ imageUrl: uploaded.url });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (mode === "create") {
        await createAdminBanner(buildCreateBannerPayload(form));
      } else if (mode === "edit" && banner) {
        await updateAdminBanner(banner.id, buildUpdateBannerPayload(form));
      }
      toast.success(SYSTEM_MESSAGES.SAVE_SUCCESS);
      onSaved();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : getApiErrorMessage(err);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-ocean-900">
            {mode === "create" ? "Thêm banner" : "Sửa banner"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || uploading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label htmlFor="brand-select" className={labelClass}>
              Thương hiệu *
            </label>
            <select
              id="brand-select"
              value={form.brandId}
              onChange={(e) => patch({ brandId: e.target.value })}
              className={inputClass}
              disabled={loadingBrands}
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Click banner sẽ mở trang sản phẩm của hãng này.
            </p>
          </div>

          <div>
            <label className={labelClass}>Ảnh banner *</label>
            <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
              {isValidImageUrl(form.imageUrl) ? (
                <div className="bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveBannerDisplayUrl(form.imageUrl)}
                    alt="Xem trước banner"
                    className={BANNER_IMAGE_CLASS}
                  />
                </div>
              ) : (
                <div
                  className={`flex ${BANNER_DISPLAY_CLASS} max-h-40 items-center justify-center bg-slate-100 text-sm text-slate-400`}
                >
                  Chưa có ảnh
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Ảnh giữ nguyên tỷ lệ — chỉ thu nhỏ nếu rộng hơn 1920px, không cắt
              nội dung.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploading ? "Đang tải..." : "Tải ảnh lên"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Upload banner image"
              onChange={handleImageUpload}
            />
          </div>

          <div>
            <label className={labelClass}>Tiêu đề (tuỳ chọn)</label>
            <input
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Để trống sẽ dùng tên thương hiệu"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Mô tả phụ (tuỳ chọn)</label>
            <input
              value={form.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
              placeholder="VD: Khuyến mãi đến 30%"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Thứ tự hiển thị</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => patch({ sortOrder: e.target.value })}
                aria-label="Upload banner image"
                className={inputClass}
              />
            </div>

            {mode === "edit" ? (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => patch({ isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Đang hiển thị
                </label>
              </div>
            ) : null}
          </div>

          {formError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-ocean-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-800 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
