import type {
  AccessoryDetail,
  FishDetail,
  PlantDetail,
  ProductDetail,
  ProductImage,
  ProductVariant,
} from "@/types/product";
import { isValidImageUrl } from "@/lib/image-utils";
import { formatPrice, usesAccessoryDetail } from "@/utils/product-utils";
import { isMeaningfulVariantValue } from "@/utils/variant-selector-utils";

const ENUM_LABELS: Record<string, Record<string, string>> = {
  difficulty: {
    EASY: "Dễ",
    MEDIUM: "Trung bình",
    HARD: "Khó",
  },
  lightLevel: {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
  },
  placement: {
    FOREGROUND: "Tiền cảnh",
    MIDGROUND: "Trung cảnh",
    BACKGROUND: "Hậu cảnh",
    FLOATING: "Nổi",
  },
  temperament: {
    PEACEFUL: "Hiền lành",
    SEMI_AGGRESSIVE: "Hơi hung",
    AGGRESSIVE: "Hung dữ",
  },
  diet: {
    HERBIVORE: "Ăn cỏ",
    OMNIVORE: "Tạp thực",
    CARNIVORE: "Ăn thịt",
  },
  accessoryType: {
    FILTER: "Lọc",
    LIGHT: "Đèn",
    HEATER: "Sưởi",
    PUMP: "Bơm",
    SUBSTRATE: "Nền",
    FOOD: "Thức ăn",
    DECORATION: "Trang trí",
    OTHER: "Khác",
  },
};

function labelEnum(group: string, value?: string): string | undefined {
  if (!value) return undefined;
  return ENUM_LABELS[group]?.[value] ?? value;
}

function formatRange(min?: number, max?: number, unit = ""): string | undefined {
  if (min == null && max == null) return undefined;
  if (min != null && max != null) return `${min}–${max}${unit}`;
  if (min != null) return `≥ ${min}${unit}`;
  return `≤ ${max}${unit}`;
}

export interface DetailRow {
  label: string;
  value: string;
}

export function sortGalleryImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) {
      return a.isPrimary ? -1 : 1;
    }
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

export function getProductGalleryImages(product: ProductDetail): ProductImage[] {
  if (product.images?.length) {
    return sortGalleryImages(product.images);
  }

  if (isValidImageUrl(product.thumbnailUrl)) {
    return [
      {
        imageId: 0,
        imageUrl: product.thumbnailUrl.trim(),
        altText: product.name,
        isPrimary: true,
      },
    ];
  }

  return [];
}

export function getVariantLabel(variant: ProductVariant): string {
  const parts = [variant.size, variant.volume, variant.color].filter(
    isMeaningfulVariantValue,
  );
  if (parts.length) return parts.join(" · ");
  return variant.sku ?? variant.id;
}

export function getVariantPriceDisplay(variant: ProductVariant) {
  const hasSale =
    variant.salePrice != null && variant.salePrice < variant.price;

  return {
    price: variant.price,
    salePrice: hasSale ? variant.salePrice! : null,
    displayPrice: hasSale ? variant.salePrice! : variant.price,
  };
}

export function getPlantDetailRows(detail: PlantDetail): DetailRow[] {
  const rows: DetailRow[] = [];

  if (detail.scientificName) {
    rows.push({ label: "Tên khoa học", value: detail.scientificName });
  }
  const difficulty = labelEnum("difficulty", detail.difficulty);
  if (difficulty) rows.push({ label: "Độ khó", value: difficulty });
  const lightLevel = labelEnum("lightLevel", detail.lightLevel);
  if (lightLevel) rows.push({ label: "Ánh sáng", value: lightLevel });
  if (detail.co2Required != null) {
    rows.push({
      label: "CO₂",
      value: detail.co2Required ? "Cần bổ sung" : "Không bắt buộc",
    });
  }
  const placement = labelEnum("placement", detail.placement);
  if (placement) rows.push({ label: "Vị trí trồng", value: placement });
  if (detail.growthRate) {
    rows.push({ label: "Tốc độ sinh trưởng", value: detail.growthRate });
  }
  if (detail.maxHeightCm != null) {
    rows.push({ label: "Chiều cao tối đa", value: `${detail.maxHeightCm} cm` });
  }

  return rows;
}

export function getFishDetailRows(detail: FishDetail): DetailRow[] {
  const rows: DetailRow[] = [];

  if (detail.scientificName) {
    rows.push({ label: "Tên khoa học", value: detail.scientificName });
  }
  const temperament = labelEnum("temperament", detail.temperament);
  if (temperament) rows.push({ label: "Tính cách", value: temperament });
  const diet = labelEnum("diet", detail.diet);
  if (diet) rows.push({ label: "Chế độ ăn", value: diet });
  if (detail.minTankSizeLiters != null) {
    rows.push({
      label: "Bể tối thiểu",
      value: `${detail.minTankSizeLiters} lít`,
    });
  }
  const temp = formatRange(
    detail.waterTempMinC,
    detail.waterTempMaxC,
    "°C",
  );
  if (temp) rows.push({ label: "Nhiệt độ nước", value: temp });
  const ph = formatRange(detail.phMin, detail.phMax);
  if (ph) rows.push({ label: "pH", value: ph });
  if (detail.maxSizeCm != null) {
    rows.push({ label: "Kích thước tối đa", value: `${detail.maxSizeCm} cm` });
  }
  if (detail.isSchooling != null) {
    rows.push({
      label: "Bầy đàn",
      value: detail.isSchooling
        ? `Có${detail.minSchoolSize ? ` (tối thiểu ${detail.minSchoolSize} con)` : ""}`
        : "Không",
    });
  }

  return rows;
}

export function getAccessoryDetailRows(detail: AccessoryDetail): DetailRow[] {
  const rows: DetailRow[] = [];

  const accessoryType = labelEnum("accessoryType", detail.accessoryType);
  if (accessoryType) rows.push({ label: "Loại phụ kiện", value: accessoryType });
  if (detail.material) rows.push({ label: "Chất liệu", value: detail.material });
  const tankRange = formatRange(
    detail.compatibleTankMinLiters,
    detail.compatibleTankMaxLiters,
    " lít",
  );
  if (tankRange) rows.push({ label: "Bể phù hợp", value: tankRange });
  if (detail.powerWattage != null) {
    rows.push({ label: "Công suất", value: `${detail.powerWattage} W` });
  }
  if (detail.flowRateLph != null) {
    rows.push({ label: "Lưu lượng", value: `${detail.flowRateLph} L/h` });
  }
  if (detail.warrantyMonths != null) {
    rows.push({ label: "Bảo hành", value: `${detail.warrantyMonths} tháng` });
  }
  if (detail.specifications) {
    rows.push({ label: "Thông số", value: detail.specifications });
  }

  return rows;
}

export function getProductTypeDetailRows(
  product: ProductDetail,
): DetailRow[] {
  if (product.productType === "PLANT" && product.plantDetail) {
    return getPlantDetailRows(product.plantDetail);
  }
  if (product.productType === "FISH" && product.fishDetail) {
    return getFishDetailRows(product.fishDetail);
  }
  if (usesAccessoryDetail(product.productType) && product.accessoryDetail) {
    return getAccessoryDetailRows(product.accessoryDetail);
  }
  return [];
}

export function formatStockStatus(
  stockQuantity?: number,
  totalStock?: number,
): string {
  const stock = stockQuantity ?? totalStock;
  if (stock == null) return "Liên hệ";
  if (stock <= 0) return "Hết hàng";
  if (stock <= 5) return `Còn ${stock} sản phẩm`;
  return "Còn hàng";
}

export function formatVariantPriceLine(variant: ProductVariant): string {
  const priceInfo = getVariantPriceDisplay(variant);
  if (priceInfo.salePrice != null) {
    return `${formatPrice(priceInfo.displayPrice)} (giảm từ ${formatPrice(priceInfo.price)})`;
  }
  return formatPrice(priceInfo.displayPrice);
}
