import { uploadImage } from "@/lib/upload-api";
import { isValidImageUrl } from "@/lib/image-utils";
import type {
  CreateProductImagePayload,
  ProductImageForm,
} from "@/utils/admin-product-form";

function parseSortOrder(value: string, fallback: number): number {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : fallback;
}

export async function resolveGalleryImagesPayload(
  images: ProductImageForm[],
  onProgress?: (message: string) => void,
): Promise<CreateProductImagePayload[]> {
  const result: CreateProductImagePayload[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    let imageUrl = image.imageUrl?.trim() ?? "";
    let publicId = image.publicId?.trim() ?? "";

    if (image.file) {
      onProgress?.(`Đang upload ảnh gallery ${index + 1}/${images.length}...`);
      const uploaded = await uploadImage(image.file);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }

    if (!imageUrl) continue;

    result.push({
      imageUrl,
      publicId: publicId || undefined,
      altText: image.altText.trim() || undefined,
      sortOrder: parseSortOrder(image.sortOrder, index),
      isPrimary: image.isPrimary,
    });
  }

  return result;
}

export async function resolveThumbnailUrl(
  currentUrl: string,
  thumbnailFile: File | null,
  galleryImages: ProductImageForm[],
  onProgress?: (message: string) => void,
): Promise<string> {
  if (thumbnailFile) {
    onProgress?.("Đang upload ảnh đại diện...");
    return (await uploadImage(thumbnailFile)).url;
  }

  if (currentUrl.trim()) return currentUrl.trim();

  const primary =
    galleryImages.find((image) => image.isPrimary) ?? galleryImages[0];
  if (primary?.file) {
    onProgress?.("Đang upload ảnh đại diện từ gallery...");
    return (await uploadImage(primary.file)).url;
  }

  if (primary?.imageUrl?.trim()) return primary.imageUrl.trim();

  return "";
}

export function revokeBlobPreview(url: string) {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function getImagePreviewSrc(image: ProductImageForm): string {
  const src = image.previewUrl || image.imageUrl || "";
  return isValidImageUrl(src) ? src.trim() : "";
}
