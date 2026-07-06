import api, { unwrapData } from "@/lib/axios-client";
import type { ApiEnvelope, ProductImage } from "@/types/product";
import type { CloudinaryUploadResponse } from "@/types/upload";

const UPLOAD_TIMEOUT_MS = 60_000;

/** Spring bind enum theo tên (PRODUCTS), không phải path (products). */
type UploadFolderParam = "PRODUCTS" | "BRANDS" | "BANNERS" | "CATEGORIES" | "GENERAL";

export async function uploadImage(
  file: File,
  folder: UploadFolderParam = "PRODUCTS",
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiEnvelope<CloudinaryUploadResponse>>(
    "/uploads/image",
    formData,
    {
      params: { folder },
      headers: { "Content-Type": "multipart/form-data" },
      timeout: UPLOAD_TIMEOUT_MS,
    },
  );

  return unwrapData<CloudinaryUploadResponse>(data);
}

export interface UploadProductImageOptions {
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

function normalizeUploadedProductImage(raw: Record<string, unknown>): ProductImage {
  return {
    imageId: Number(raw.imageId ?? 0),
    imageUrl: String(raw.imageUrl ?? ""),
    altText: raw.altText as string | undefined,
    isPrimary: Boolean(raw.isPrimary),
    sortOrder: raw.sortOrder != null ? Number(raw.sortOrder) : undefined,
    publicId: raw.publicId as string | undefined,
  };
}

export async function uploadAdminProductImage(
  productId: string,
  file: File,
  options: UploadProductImageOptions = {},
): Promise<ProductImage> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiEnvelope<Record<string, unknown>>>(
    `/products/${productId}/images/upload`,
    formData,
    {
      params: {
        altText: options.altText || undefined,
        sortOrder: options.sortOrder,
        isPrimary: options.isPrimary,
      },
      headers: { "Content-Type": "multipart/form-data" },
      timeout: UPLOAD_TIMEOUT_MS,
    },
  );

  return normalizeUploadedProductImage(
    unwrapData<Record<string, unknown>>(data) ?? {},
  );
}

export async function uploadAdminProductImagesBatch(
  productId: string,
  files: File[],
  options: Pick<UploadProductImageOptions, "altText" | "isPrimary"> = {},
): Promise<ProductImage[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const { data } = await api.post<ApiEnvelope<Record<string, unknown>[]>>(
    `/products/${productId}/images/upload/batch`,
    formData,
    {
      params: {
        altText: options.altText || undefined,
        isPrimary: options.isPrimary,
      },
      headers: { "Content-Type": "multipart/form-data" },
      timeout: UPLOAD_TIMEOUT_MS,
    },
  );

  const raw = unwrapData<Record<string, unknown>[]>(data) ?? [];
  return raw.map(normalizeUploadedProductImage);
}
