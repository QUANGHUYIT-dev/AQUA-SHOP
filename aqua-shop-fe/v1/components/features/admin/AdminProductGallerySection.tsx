"use client";

import Image from "next/image";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import type { ProductImageForm } from "@/utils/admin-product-form";
import { getImagePreviewSrc, revokeBlobPreview } from "@/utils/admin-product-submit";

const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
/** Khung preview cố định — mọi ảnh fill/crop giống nhau */
const imagePreviewBoxClass =
  "relative h-44 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-48";
const imagePreviewClass = "object-cover object-center";

interface AdminProductGallerySectionProps {
  images: ProductImageForm[];
  onChange: (images: ProductImageForm[]) => void;
  mode?: "create" | "edit";
}

function revokePreview(url: string) {
  revokeBlobPreview(url);
}

export default function AdminProductGallerySection({
  images,
  onChange,
  mode = "create",
}: AdminProductGallerySectionProps) {
  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const next = [...images];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({
        clientId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: "",
        sortOrder: String(next.length),
        isPrimary: next.length === 0,
      });
    }
    onChange(next);
  };

  const removeImage = (clientId: string) => {
    const target = images.find((image) => image.clientId === clientId);
    if (target?.previewUrl) revokePreview(target.previewUrl);

    const next = images.filter((image) => image.clientId !== clientId);
    if (next.length && !next.some((image) => image.isPrimary)) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onChange(next);
  };

  const setPrimary = (clientId: string) => {
    onChange(
      images.map((image) => ({
        ...image,
        isPrimary: image.clientId === clientId,
      })),
    );
  };

  const updateAltText = (clientId: string, altText: string) => {
    onChange(
      images.map((image) =>
        image.clientId === clientId ? { ...image, altText } : image,
      ),
    );
  };

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ocean-900">
            Ảnh gallery
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "edit"
              ? "Danh sách ảnh mới sẽ thay thế toàn bộ gallery khi lưu."
              : "Chọn ảnh trước — sau khi tạo sản phẩm, hệ thống upload và gắn gallery."}
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100">
          <ImagePlus className="h-4 w-4" />
          Chọn ảnh
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center hover:border-teal-300 hover:bg-teal-50/30">
          <ImagePlus className="mb-2 h-8 w-8 text-slate-400" />
          <span className="text-sm text-slate-600">
            Kéo thả hoặc bấm để chọn ảnh gallery
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.clientId}
              className="flex h-full flex-col border border-slate-100 bg-slate-50/60 p-3"
            >
              <div className={imagePreviewBoxClass}>
                {getImagePreviewSrc(image) && (
                  <Image
                    src={getImagePreviewSrc(image)}
                    alt={image.altText || `Ảnh ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className={imagePreviewClass}
                    unoptimized
                  />
                )}
                {image.isPrimary && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 bg-teal-600 px-2 py-0.5 text-xs font-medium text-white">
                    <Star className="h-3 w-3" />
                    Chính
                  </span>
                )}
              </div>

              <label className="mb-2 mt-3 block">
                <span className={labelClass}>Alt text</span>
                <input
                  value={image.altText}
                  onChange={(e) =>
                    updateAltText(image.clientId, e.target.value)
                  }
                  className={inputClass}
                  placeholder="Mô tả ảnh"
                />
              </label>

              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="galleryPrimary"
                    checked={image.isPrimary}
                    onChange={() => setPrimary(image.clientId)}
                    className="h-4 w-4 border-slate-300 text-teal-600"
                  />
                  Ảnh chính
                </label>
                <button
                  type="button"
                  onClick={() => removeImage(image.clientId)}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
