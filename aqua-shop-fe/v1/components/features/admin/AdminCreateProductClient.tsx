"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { Category, ProductType } from "@/types/product";
import {
  createAdminProduct,
  filterAdminBrands,
  getAdminCategoryTree,
} from "@/lib/api";
import {
  uploadAdminProductImage,
  uploadImage,
} from "@/lib/upload-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidImageUrl } from "@/lib/image-utils";
import { ROUTES } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import { useFeedback } from "@/hooks/useFeedback";
import { ADMIN_PRODUCT_TYPE_OPTIONS } from "@/utils/product-utils";
import {
  buildCreateProductPayload,
  createEmptyProductForm,
  getProductCategorySelectOptions,
  PRODUCT_STATUS_OPTIONS,
  type AdminProductFormState,
  type ProductImageForm,
} from "@/utils/admin-product-form";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import AdminProductDescriptionEditor from "@/components/features/admin/AdminProductDescriptionEditor";
import AdminProductGallerySection from "@/components/features/admin/AdminProductGallerySection";
import AdminProductTypeDetailFields from "@/components/features/admin/AdminProductTypeDetailFields";
import AdminProductVariantList from "@/components/features/admin/AdminProductVariantList";

const inputClass =
  "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

function revokePreview(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

async function attachGalleryImages(
  productId: string,
  images: ProductImageForm[],
): Promise<void> {
  const pending = images.filter((image) => image.file);
  for (let index = 0; index < pending.length; index += 1) {
    const image = pending[index];
    if (!image.file) continue;

    await uploadAdminProductImage(productId, image.file, {
      altText: image.altText.trim() || undefined,
      sortOrder: index,
      isPrimary: image.isPrimary,
    });
  }
}

export default function AdminCreateProductClient() {
  const router = useRouter();
  const { toast } = useFeedback();
  const [form, setForm] = useState<AdminProductFormState>(createEmptyProductForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<
    Awaited<ReturnType<typeof filterAdminBrands>>["content"]
  >([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      revokePreview(thumbnailPreview);
      for (const image of form.images) {
        revokePreview(image.previewUrl);
      }
    };
  }, [form.images, thumbnailPreview]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [categoryTree, brandPage] = await Promise.all([
          getAdminCategoryTree(),
          filterAdminBrands({ page: 0, size: 200, sort: "name,asc" }),
        ]);
        if (!cancelled) {
          setCategories(categoryTree);
          setBrands(brandPage.content.filter((brand) => brand.isActive !== false));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOptions = useMemo(
    () => getProductCategorySelectOptions(categories, form.productType),
    [categories, form.productType],
  );

  useEffect(() => {
    if (
      form.categoryId &&
      !categoryOptions.some((option) => option.value === form.categoryId)
    ) {
      setForm((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [categoryOptions, form.categoryId]);

  const updateForm = (patch: Partial<AdminProductFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleThumbnailChange = (file: File | null) => {
    revokePreview(thumbnailPreview);
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview("");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStep("");
    setError(null);

    try {
      let thumbnailUrl = form.thumbnailUrl.trim();
      const galleryFiles = form.images.filter((image) => image.file);

      if (thumbnailFile) {
        setSubmitStep("Đang upload ảnh đại diện...");
        thumbnailUrl = (await uploadImage(thumbnailFile)).url;
      } else if (!thumbnailUrl && galleryFiles.length > 0) {
        const primary =
          galleryFiles.find((image) => image.isPrimary) ?? galleryFiles[0];
        if (primary.file) {
          setSubmitStep("Đang upload ảnh đại diện từ gallery...");
          thumbnailUrl = (await uploadImage(primary.file)).url;
        }
      }

      setSubmitStep("Đang tạo sản phẩm...");
      const payload = buildCreateProductPayload({
        ...form,
        thumbnailUrl,
      });
      const created = await createAdminProduct(payload);

      if (galleryFiles.length > 0) {
        setSubmitStep("Đang gắn ảnh gallery...");
        await attachGalleryImages(created.id, form.images);
      }

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
        title="Thêm sản phẩm"
        description="Tạo sản phẩm mới với biến thể và thông tin chi tiết theo loại"
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

      {loadingOptions ? (
        <div className="flex min-h-[320px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
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
                  placeholder="Đèn LED Chihiros WRGB2"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Mã model</span>
                <input
                  value={form.modelCode}
                  onChange={(e) => updateForm({ modelCode: e.target.value })}
                  className={inputClass}
                  placeholder="WRGB2"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Loại sản phẩm *</span>
                <select
                  value={form.productType}
                  onChange={(e) =>
                    updateForm({ productType: e.target.value as ProductType })
                  }
                  className={inputClass}
                >
                  {ADMIN_PRODUCT_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
                <p className="mb-3 text-xs text-slate-500">
                  Upload qua{" "}
                  <code className="text-[11px]">/uploads/image</code> — không
                  cần productId. Nếu bỏ trống, dùng ảnh chính trong gallery.
                </p>
                <div className="flex flex-wrap items-start gap-4">
                  {isValidImageUrl(thumbnailPreview) ? (
                    <div className="relative h-44 w-44 shrink-0 overflow-hidden border border-slate-200 bg-slate-100 sm:h-48 sm:w-48">
                      <Image
                        src={thumbnailPreview.trim()}
                        alt="Thumbnail preview"
                        fill
                        sizes="192px"
                        className="object-cover object-center"
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
                      Chọn ảnh đại diện
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
                        Xóa ảnh đại diện
                      </button>
                    )}
                    <label className="block">
                      <span className="text-xs text-slate-500">
                        Hoặc dán URL sẵn có
                      </span>
                      <input
                        value={form.thumbnailUrl}
                        onChange={(e) =>
                          updateForm({ thumbnailUrl: e.target.value })
                        }
                        className={inputClass}
                        placeholder="https://..."
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
              Tạo sản phẩm
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
