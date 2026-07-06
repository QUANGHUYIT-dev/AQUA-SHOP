"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { Category } from "@/types/product";
import {
  filterAdminBrands,
  getAdminCategoryTree,
  getAdminProductById,
  updateAdminProduct,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidImageUrl } from "@/lib/image-utils";
import { ROUTES } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import { ADMIN_PRODUCT_TYPE_OPTIONS } from "@/utils/product-utils";
import {
  buildUpdateProductPayload,
  getProductCategorySelectOptions,
  productDetailToFormState,
  PRODUCT_STATUS_OPTIONS,
  type AdminProductFormState,
} from "@/utils/admin-product-form";
import {
  resolveGalleryImagesPayload,
  resolveThumbnailUrl,
  revokeBlobPreview,
} from "@/utils/admin-product-submit";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import AdminProductDescriptionEditor from "@/components/features/admin/AdminProductDescriptionEditor";
import AdminProductGallerySection from "@/components/features/admin/AdminProductGallerySection";
import AdminProductTypeDetailFields from "@/components/features/admin/AdminProductTypeDetailFields";
import AdminProductVariantList from "@/components/features/admin/AdminProductVariantList";

const inputClass =
  "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

interface AdminEditProductClientProps {
  productId: string;
}

export default function AdminEditProductClient({
  productId,
}: AdminEditProductClientProps) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [form, setForm] = useState<AdminProductFormState | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<
    Awaited<ReturnType<typeof filterAdminBrands>>["content"]
  >([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      revokeBlobPreview(thumbnailPreview);
      for (const image of form?.images ?? []) {
        revokeBlobPreview(image.previewUrl);
      }
    };
  }, [form?.images, thumbnailPreview]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [product, categoryTree, brandPage] = await Promise.all([
          getAdminProductById(productId),
          getAdminCategoryTree(),
          filterAdminBrands({ page: 0, size: 200, sort: "name,asc" }),
        ]);
        if (cancelled) return;

        const nextForm = productDetailToFormState(product);
        setForm(nextForm);
        setCategories(categoryTree);
        setBrands(brandPage.content.filter((brand) => brand.isActive !== false));
        setThumbnailPreview(product.thumbnailUrl || "");
        setThumbnailFile(null);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const categoryOptions = useMemo(
    () =>
      form
        ? getProductCategorySelectOptions(categories, form.productType)
        : [],
    [categories, form],
  );

  const updateForm = (patch: Partial<AdminProductFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleThumbnailChange = (file: File | null) => {
    revokeBlobPreview(thumbnailPreview);
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview(form?.thumbnailUrl ?? "");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSubmitting(true);
    setSubmitStep("");
    setError(null);

    try {
      const galleryImages = await resolveGalleryImagesPayload(
        form.images,
        setSubmitStep,
      );
      const thumbnailUrl = await resolveThumbnailUrl(
        form.thumbnailUrl,
        thumbnailFile,
        form.images,
        setSubmitStep,
      );

      setSubmitStep("Đang lưu sản phẩm...");
      const payload = buildUpdateProductPayload(form, {
        thumbnailUrl,
        images: galleryImages,
      });
      await updateAdminProduct(productId, payload);

      toast.success(SYSTEM_MESSAGES.SAVE_SUCCESS);
      router.push(ROUTES.ADMIN_PRODUCTS);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : getApiErrorMessage(err),
      );
    } finally {
      setSubmitting(false);
      setSubmitStep("");
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Sửa sản phẩm"
        description={`Cập nhật thông tin · ${productId}`}
        action={
          <Link
            href={ROUTES.ADMIN_PRODUCTS}
            className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        }
      />

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : !form ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error ?? "Không tải được sản phẩm"}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-ocean-900">
              Thông tin cơ bản
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelClass}>Tên sản phẩm *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Mã model</span>
                <input
                  value={form.modelCode}
                  onChange={(e) => updateForm({ modelCode: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Loại sản phẩm</span>
                <input
                  readOnly
                  value={form.productType}
                  className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Không thể đổi loại sau khi tạo
                </p>
              </label>
              <label className="block">
                <span className={labelClass}>Danh mục *</span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => updateForm({ categoryId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">— Chọn danh mục —</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Thương hiệu</span>
                <select
                  value={form.brandId}
                  onChange={(e) => updateForm({ brandId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">— Không chọn —</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Trạng thái</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateForm({
                      status: e.target.value as AdminProductFormState["status"],
                    })
                  }
                  className={inputClass}
                >
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <span className={labelClass}>Ảnh đại diện (thumbnail)</span>
                <div className="mt-2 flex flex-wrap items-start gap-4">
                  {isValidImageUrl(thumbnailPreview) ? (
                    <div className="relative h-44 w-44 shrink-0 overflow-hidden border border-slate-200 bg-slate-100 sm:h-48 sm:w-48">
                      <Image
                        src={thumbnailPreview.trim()}
                        alt="Thumbnail"
                        fill
                        sizes="192px"
                        className="object-contain object-center p-2"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-44 w-44 shrink-0 items-center justify-center border border-dashed border-slate-200 bg-slate-50 text-slate-400 sm:h-48 sm:w-48">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex min-w-[200px] flex-1 flex-col gap-2">
                    <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100">
                      Đổi ảnh đại diện
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          handleThumbnailChange(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    {thumbnailFile && (
                      <button
                        type="button"
                        onClick={() => handleThumbnailChange(null)}
                        className="inline-flex w-fit items-center gap-1 text-sm text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hủy ảnh mới
                      </button>
                    )}
                    <label className="block">
                      <span className="text-xs text-slate-500">
                        Hoặc dán URL
                      </span>
                      <input
                        value={form.thumbnailUrl}
                        onChange={(e) => {
                          updateForm({ thumbnailUrl: e.target.value });
                          if (!thumbnailFile) {
                            setThumbnailPreview(e.target.value);
                          }
                        }}
                        className={inputClass}
                        disabled={Boolean(thumbnailFile)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className={labelClass}>Mô tả ngắn</span>
                <input
                  value={form.shortDescription}
                  onChange={(e) =>
                    updateForm({ shortDescription: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <div className="sm:col-span-2">
                <span className={labelClass}>Mô tả chi tiết</span>
                <p className="mb-2 text-xs text-slate-500">
                  Trình soạn HTML — in đậm, danh sách, chèn ảnh. Lưu vào field{" "}
                  <code className="text-[11px]">description</code> trên BE.
                </p>
                <AdminProductDescriptionEditor
                  value={form.description}
                  onChange={(description) => updateForm({ description })}
                />
              </div>
            </div>
          </section>

          <AdminProductVariantList
            variants={form.variants}
            onChange={(variants) => updateForm({ variants })}
          />

          <AdminProductTypeDetailFields
            productType={form.productType}
            plantDetail={form.plantDetail}
            fishDetail={form.fishDetail}
            accessoryDetail={form.accessoryDetail}
            onPlantChange={(plantDetail) => updateForm({ plantDetail })}
            onFishChange={(fishDetail) => updateForm({ fishDetail })}
            onAccessoryChange={(accessoryDetail) =>
              updateForm({ accessoryDetail })
            }
          />

          <AdminProductGallerySection
            mode="edit"
            images={form.images}
            onChange={(images) => updateForm({ images })}
          />

          <div className="flex flex-wrap items-center gap-3 border border-slate-200 bg-white p-4 shadow-sm">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-ocean-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-ocean-800 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </button>
            {submitStep && (
              <span className="text-sm text-slate-500">{submitStep}</span>
            )}
            <Link
              href={ROUTES.ADMIN_PRODUCTS}
              className="inline-flex items-center px-5 py-2.5 text-sm text-slate-600 hover:text-slate-800"
            >
              Hủy
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
