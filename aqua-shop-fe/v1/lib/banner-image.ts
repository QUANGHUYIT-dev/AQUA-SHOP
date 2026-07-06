/** Giới hạn chiều rộng khi upload / CDN — giữ nguyên tỷ lệ, không crop */
export const BANNER_MAX_WIDTH = 1920;

/** Khung hero — chiều cao cố định, ảnh thu vừa khung (object-contain, không cắt) */
export const BANNER_HERO_FRAME_CLASS =
  "relative h-[280px] w-full sm:h-[350px] md:h-[420px] lg:h-[500px]";

export const BANNER_DISPLAY_CLASS = "relative w-full";

export const BANNER_IMAGE_CLASS =
  "max-h-full max-w-full object-contain object-center";

const CLOUDINARY_TRANSFORM = `c_limit,w_${BANNER_MAX_WIDTH},f_auto,q_auto`;

/**
 * Cloudinary: thu nhỏ nếu quá rộng, không crop.
 */
export function resolveBannerDisplayUrl(url?: string | null): string {
  const raw = url?.trim() ?? "";
  if (!raw) return "";

  if (!raw.includes("res.cloudinary.com") || !raw.includes("/image/upload/")) {
    return raw;
  }

  const [prefix, rest] = raw.split("/image/upload/");
  if (!prefix || !rest) return raw;

  const path = rest.replace(/^c_[^/]+\//, "");

  return `${prefix}/image/upload/${CLOUDINARY_TRANSFORM}/${path}`;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được file ảnh."));
    };
    image.src = url;
  });
}

async function loadImageSource(file: File): Promise<CanvasImageSource> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fallback
    }
  }

  return loadImageElement(file);
}

function releaseImageSource(source: CanvasImageSource) {
  if (source instanceof ImageBitmap) {
    source.close();
  }
}

function readImageSize(source: CanvasImageSource): {
  width: number;
  height: number;
} {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
    };
  }

  return {
    width: (source as unknown as HTMLImageElement).width,
    height: (source as unknown as HTMLImageElement).height,
  };
}

/**
 * Thu nhỏ nếu ảnh rộng hơn 1920px — giữ nguyên toàn bộ nội dung.
 */
export async function normalizeBannerImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File phải là ảnh.");
  }

  const source = await loadImageSource(file);
  const { width, height } = readImageSize(source);

  if (!width || !height) {
    releaseImageSource(source);
    throw new Error("Ảnh không hợp lệ hoặc kích thước bằng 0.");
  }

  let outputWidth = width;
  let outputHeight = height;

  if (width > BANNER_MAX_WIDTH) {
    outputWidth = BANNER_MAX_WIDTH;
    outputHeight = Math.round((height * BANNER_MAX_WIDTH) / width);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    releaseImageSource(source);
    throw new Error("Không thể xử lý ảnh trên trình duyệt này.");
  }

  context.drawImage(source, 0, 0, outputWidth, outputHeight);
  releaseImageSource(source);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Không thể nén ảnh banner."));
      },
      "image/jpeg",
      0.9,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/i, "") || "banner";
  return new File([blob], `${baseName}-banner.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
