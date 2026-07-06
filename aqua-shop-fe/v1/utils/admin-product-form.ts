import type {
  AccessoryDetail,
  FishDetail,
  PlantDetail,
  ProductDetail,
  ProductStatus,
  ProductType,
} from "@/types/product";
import { usesAccessoryDetail } from "@/utils/product-utils";

export interface VariantAttributesForm {
  size: string;
  volume: string;
  color: string;
}

export interface ProductVariantForm {
  variantId?: string;
  sku: string;
  attributes: VariantAttributesForm;
  price: string;
  salePrice: string;
  stockQuantity: string;
  weightGrams: string;
  isDefault: boolean;
}

export interface ProductImageForm {
  clientId: string;
  file: File | null;
  previewUrl: string;
  imageUrl?: string;
  publicId?: string;
  altText: string;
  sortOrder: string;
  isPrimary: boolean;
}

export interface AdminProductFormState {
  name: string;
  modelCode: string;
  description: string;
  shortDescription: string;
  productType: ProductType;
  categoryId: string;
  brandId: string;
  status: ProductStatus;
  thumbnailUrl: string;
  variants: ProductVariantForm[];
  plantDetail: PlantDetail;
  fishDetail: FishDetail;
  accessoryDetail: AccessoryDetail;
  images: ProductImageForm[];
}

export interface CreateProductVariantPayload {
  sku?: string;
  attributes?: {
    size?: string;
    volume?: string;
    color?: string;
  };
  price: number;
  salePrice?: number;
  stockQuantity?: number;
  weightGrams?: number;
  isDefault?: boolean;
}

export interface CreateProductImagePayload {
  imageUrl: string;
  publicId?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface CreateProductPayload {
  name: string;
  modelCode?: string;
  description?: string;
  shortDescription?: string;
  productType: ProductType;
  categoryId: string;
  brandId?: string;
  status?: ProductStatus;
  thumbnailUrl?: string;
  variants: CreateProductVariantPayload[];
  plantDetail?: PlantDetail;
  fishDetail?: FishDetail;
  accessoryDetail?: AccessoryDetail;
  images?: CreateProductImagePayload[];
}

export interface UpdateProductVariantPayload extends CreateProductVariantPayload {
  variantId?: string;
}

export interface UpdateProductPayload {
  name?: string;
  modelCode?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  thumbnailUrl?: string;
  variants?: UpdateProductVariantPayload[];
  plantDetail?: PlantDetail;
  fishDetail?: FishDetail;
  accessoryDetail?: AccessoryDetail;
  images?: CreateProductImagePayload[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export const PRODUCT_STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE", label: "Đang bán" },
  { value: "INACTIVE", label: "Ngừng bán" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
];

export const PLANT_DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: "EASY", label: "Dễ" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Khó" },
];

export const LIGHT_LEVEL_OPTIONS: SelectOption[] = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
];

export const PLANT_PLACEMENT_OPTIONS: SelectOption[] = [
  { value: "FOREGROUND", label: "Tiền cảnh" },
  { value: "MIDGROUND", label: "Trung cảnh" },
  { value: "BACKGROUND", label: "Hậu cảnh" },
  { value: "FLOATING", label: "Cây nổi" },
  { value: "MOSS", label: "Rêu / Moss" },
];

export const FISH_TEMPERAMENT_OPTIONS: SelectOption[] = [
  { value: "PEACEFUL", label: "Hiền lành" },
  { value: "SEMI_AGGRESSIVE", label: "Hơi hung" },
  { value: "AGGRESSIVE", label: "Hung dữ" },
];

export const FISH_DIET_OPTIONS: SelectOption[] = [
  { value: "HERBIVORE", label: "Ăn cỏ" },
  { value: "OMNIVORE", label: "Tạp thực" },
  { value: "CARNIVORE", label: "Ăn thịt" },
];

export const ACCESSORY_TYPE_OPTIONS: SelectOption[] = [
  { value: "FILTER", label: "Lọc nước" },
  { value: "LIGHT", label: "Đèn chiếu sáng" },
  { value: "SUBSTRATE", label: "Nền / Phân nền" },
  { value: "CO2", label: "Hệ thống CO2" },
  { value: "DECORATION", label: "Trang trí" },
  { value: "TOOL", label: "Dụng cụ" },
  { value: "FOOD", label: "Thức ăn" },
  { value: "MEDICATION", label: "Thuốc / Xử lý nước" },
  { value: "TANK", label: "Bể / Hồ" },
  { value: "OTHER", label: "Khác" },
];

function emptyPlantDetail(): PlantDetail {
  return {
    scientificName: "",
    difficulty: "EASY",
    lightLevel: "LOW",
    co2Required: false,
    placement: "FOREGROUND",
    growthRate: "",
    maxHeightCm: undefined,
  };
}

function emptyFishDetail(): FishDetail {
  return {
    scientificName: "",
    temperament: "PEACEFUL",
    diet: "OMNIVORE",
    minTankSizeLiters: undefined,
    waterTempMinC: undefined,
    waterTempMaxC: undefined,
    phMin: undefined,
    phMax: undefined,
    maxSizeCm: undefined,
    isSchooling: false,
    minSchoolSize: undefined,
  };
}

function emptyAccessoryDetail(): AccessoryDetail {
  return {
    accessoryType: "LIGHT",
    material: "",
    compatibleTankMinLiters: undefined,
    compatibleTankMaxLiters: undefined,
    powerWattage: undefined,
    flowRateLph: undefined,
    warrantyMonths: undefined,
    specifications: "",
  };
}

export function createEmptyVariant(isDefault = false): ProductVariantForm {
  return {
    sku: "",
    attributes: { size: "", volume: "", color: "" },
    price: "",
    salePrice: "",
    stockQuantity: "0",
    weightGrams: "",
    isDefault,
  };
}

export function createEmptyImage(isPrimary = false, file?: File): ProductImageForm {
  return {
    clientId: crypto.randomUUID(),
    file: file ?? null,
    previewUrl: file ? URL.createObjectURL(file) : "",
    altText: "",
    sortOrder: "0",
    isPrimary,
  };
}

export function createEmptyProductForm(): AdminProductFormState {
  return {
    name: "",
    modelCode: "",
    description: "",
    shortDescription: "",
    productType: "ACCESSORY",
    categoryId: "",
    brandId: "",
    status: "ACTIVE",
    thumbnailUrl: "",
    variants: [createEmptyVariant(true)],
    plantDetail: emptyPlantDetail(),
    fishDetail: emptyFishDetail(),
    accessoryDetail: emptyAccessoryDetail(),
    images: [],
  };
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

function parseRequiredNumber(value: string, fieldLabel: string): number {
  const num = parseOptionalNumber(value);
  if (num == null || num <= 0) {
    throw new Error(`${fieldLabel} phải lớn hơn 0`);
  }
  return num;
}

function buildAttributes(attributes: VariantAttributesForm) {
  const result: NonNullable<CreateProductVariantPayload["attributes"]> = {};
  if (attributes.size.trim()) result.size = attributes.size.trim();
  if (attributes.volume.trim()) result.volume = attributes.volume.trim();
  if (attributes.color.trim()) result.color = attributes.color.trim();
  return Object.keys(result).length ? result : undefined;
}

export function buildCreateProductPayload(
  form: AdminProductFormState,
): CreateProductPayload {
  if (!form.name.trim()) throw new Error("Tên sản phẩm không được để trống");
  if (!form.categoryId) throw new Error("Vui lòng chọn danh mục");
  if (!form.variants.length) throw new Error("Cần ít nhất một biến thể");

  const variants: CreateProductVariantPayload[] = form.variants.map(
    (variant, index) => {
      const price = parseRequiredNumber(
        variant.price,
        `Giá biến thể ${index + 1}`,
      );
      const salePrice = parseOptionalNumber(variant.salePrice);
      const payload: CreateProductVariantPayload = {
        price,
        isDefault: variant.isDefault,
      };

      if (variant.sku.trim()) payload.sku = variant.sku.trim();
      const attributes = buildAttributes(variant.attributes);
      if (attributes) payload.attributes = attributes;

      const stock = parseOptionalNumber(variant.stockQuantity);
      if (stock != null) payload.stockQuantity = stock;

      const weight = parseOptionalNumber(variant.weightGrams);
      if (weight != null) payload.weightGrams = weight;

      if (salePrice != null) {
        if (salePrice > price) {
          throw new Error(`Giá khuyến mãi biến thể ${index + 1} phải ≤ giá gốc`);
        }
        payload.salePrice = salePrice;
      }

      return payload;
    },
  );

  if (!variants.some((variant) => variant.isDefault)) {
    variants[0].isDefault = true;
  }

  const payload: CreateProductPayload = {
    name: form.name.trim(),
    productType: form.productType,
    categoryId: form.categoryId,
    status: form.status,
    variants,
  };

  if (form.modelCode.trim()) payload.modelCode = form.modelCode.trim();
  if (form.description.trim()) payload.description = form.description.trim();
  if (form.shortDescription.trim()) {
    payload.shortDescription = form.shortDescription.trim();
  }
  if (form.brandId) payload.brandId = form.brandId;
  if (form.thumbnailUrl.trim()) payload.thumbnailUrl = form.thumbnailUrl.trim();

  if (form.productType === "PLANT") {
    payload.plantDetail = {
      ...form.plantDetail,
      scientificName: form.plantDetail.scientificName?.trim() || undefined,
      growthRate: form.plantDetail.growthRate?.trim() || undefined,
    };
  }

  if (form.productType === "FISH") {
    payload.fishDetail = {
      ...form.fishDetail,
      scientificName: form.fishDetail.scientificName?.trim() || undefined,
    };
  }

  if (usesAccessoryDetail(form.productType)) {
    if (!form.accessoryDetail.accessoryType) {
      throw new Error("Vui lòng chọn loại phụ kiện");
    }
    payload.accessoryDetail = {
      ...form.accessoryDetail,
      material: form.accessoryDetail.material?.trim() || undefined,
      specifications: form.accessoryDetail.specifications?.trim() || undefined,
    };
  }

  return payload;
}

function buildVariantsPayload(
  variants: ProductVariantForm[],
  includeVariantId: boolean,
): CreateProductVariantPayload[] | UpdateProductVariantPayload[] {
  return variants.map((variant, index) => {
    const price = parseRequiredNumber(
      variant.price,
      `Giá biến thể ${index + 1}`,
    );
    const salePrice = parseOptionalNumber(variant.salePrice);
    const payload: UpdateProductVariantPayload = {
      price,
      isDefault: variant.isDefault,
    };

    if (includeVariantId && variant.variantId) {
      payload.variantId = variant.variantId;
    }

    if (variant.sku.trim()) payload.sku = variant.sku.trim();
    const attributes = buildAttributes(variant.attributes);
    if (attributes) payload.attributes = attributes;

    const stock = parseOptionalNumber(variant.stockQuantity);
    if (stock != null) payload.stockQuantity = stock;

    const weight = parseOptionalNumber(variant.weightGrams);
    if (weight != null) payload.weightGrams = weight;

    if (salePrice != null) {
      if (salePrice > price) {
        throw new Error(`Giá khuyến mãi biến thể ${index + 1} phải ≤ giá gốc`);
      }
      payload.salePrice = salePrice;
    }

    return payload;
  });
}

function buildTypeDetailPayload(form: AdminProductFormState) {
  if (form.productType === "PLANT") {
    return {
      plantDetail: {
        ...form.plantDetail,
        scientificName: form.plantDetail.scientificName?.trim() || undefined,
        growthRate: form.plantDetail.growthRate?.trim() || undefined,
      },
    };
  }

  if (form.productType === "FISH") {
    return {
      fishDetail: {
        ...form.fishDetail,
        scientificName: form.fishDetail.scientificName?.trim() || undefined,
      },
    };
  }

  if (usesAccessoryDetail(form.productType)) {
    if (!form.accessoryDetail.accessoryType) {
      throw new Error("Vui lòng chọn loại phụ kiện");
    }
    return {
      accessoryDetail: {
        ...form.accessoryDetail,
        material: form.accessoryDetail.material?.trim() || undefined,
        specifications: form.accessoryDetail.specifications?.trim() || undefined,
      },
    };
  }

  return {};
}

export function buildUpdateProductPayload(
  form: AdminProductFormState,
  options: {
    thumbnailUrl: string;
    images: CreateProductImagePayload[];
  },
): UpdateProductPayload {
  if (!form.name.trim()) throw new Error("Tên sản phẩm không được để trống");
  if (!form.categoryId) throw new Error("Vui lòng chọn danh mục");
  if (!form.variants.length) throw new Error("Cần ít nhất một biến thể");

  const variants = buildVariantsPayload(form.variants, true);
  if (!variants.some((variant) => variant.isDefault)) {
    variants[0].isDefault = true;
  }

  const payload: UpdateProductPayload = {
    name: form.name.trim(),
    categoryId: form.categoryId,
    status: form.status,
    variants,
    images: options.images,
    ...buildTypeDetailPayload(form),
  };

  payload.modelCode = form.modelCode.trim();
  payload.description = form.description.trim();
  payload.shortDescription = form.shortDescription.trim();
  payload.brandId = form.brandId;
  payload.thumbnailUrl = options.thumbnailUrl.trim();

  return payload;
}

export function productDetailToFormState(product: ProductDetail): AdminProductFormState {
  const plantDetail = product.plantDetail
    ? { ...emptyPlantDetail(), ...product.plantDetail }
    : emptyPlantDetail();
  const fishDetail = product.fishDetail
    ? { ...emptyFishDetail(), ...product.fishDetail }
    : emptyFishDetail();
  const accessoryDetail = product.accessoryDetail
    ? { ...emptyAccessoryDetail(), ...product.accessoryDetail }
    : emptyAccessoryDetail();

  return {
    name: product.name,
    modelCode: product.modelCode ?? "",
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    productType: product.productType,
    categoryId: product.categoryId ?? product.category?.id ?? "",
    brandId: product.brandId ?? "",
    status: product.status ?? "ACTIVE",
    thumbnailUrl: product.thumbnailUrl ?? "",
    variants:
      product.variants.length > 0
        ? product.variants.map((variant) => ({
            variantId: variant.id,
            sku: variant.sku ?? "",
            attributes: {
              size: variant.size ?? "",
              volume: variant.volume ?? "",
              color: variant.color ?? "",
            },
            price: String(variant.price),
            salePrice:
              variant.salePrice != null ? String(variant.salePrice) : "",
            stockQuantity:
              variant.stockQuantity != null ? String(variant.stockQuantity) : "0",
            weightGrams:
              variant.weightGrams != null ? String(variant.weightGrams) : "",
            isDefault: variant.isDefault,
          }))
        : [createEmptyVariant(true)],
    plantDetail,
    fishDetail,
    accessoryDetail,
    images: (product.images ?? []).map((image, index) => ({
      clientId: `existing-${image.imageId}-${index}`,
      file: null,
      previewUrl: image.imageUrl,
      imageUrl: image.imageUrl,
      publicId: image.publicId ?? "",
      altText: image.altText ?? "",
      sortOrder: String(image.sortOrder ?? index),
      isPrimary: Boolean(image.isPrimary),
    })),
  };
}

export function flattenCategoriesForSelect(
  categories: Array<{ id: string; name: string; children?: Array<{ id: string; name: string; children?: unknown[] }> }>,
  depth = 0,
): SelectOption[] {
  const options: SelectOption[] = [];
  const prefix = depth > 0 ? `${"—".repeat(depth)} ` : "";

  for (const category of categories) {
    options.push({ value: category.id, label: `${prefix}${category.name}` });
    if (category.children?.length) {
      options.push(
        ...flattenCategoriesForSelect(
          category.children as typeof categories,
          depth + 1,
        ),
      );
    }
  }

  return options;
}

interface CategorySelectNode {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  productType?: string;
  children?: CategorySelectNode[];
}

/** Chỉ danh mục con (có parentId), không hiện danh mục cha */
export function getProductCategorySelectOptions(
  categories: CategorySelectNode[],
  productType: ProductType,
): SelectOption[] {
  const options: SelectOption[] = [];

  function walk(nodes: CategorySelectNode[]) {
    for (const category of nodes) {
      const hasChildren = Boolean(category.children?.length);

      if (
        category.parentId &&
        !hasChildren &&
        category.productType === productType
      ) {
        options.push({
          value: category.id,
          label: category.parentName
            ? `${category.parentName} › ${category.name}`
            : category.name,
        });
      }

      if (hasChildren && category.children) {
        walk(category.children);
      }
    }
  }

  walk(categories);
  return options.sort((a, b) => a.label.localeCompare(b.label, "vi"));
}

export function filterCategoriesForProductType(
  categories: CategorySelectNode[],
  productType: ProductType,
): CategorySelectNode[] {
  function walk(nodes: CategorySelectNode[]): CategorySelectNode[] {
    const result: CategorySelectNode[] = [];

    for (const node of nodes) {
      const children = node.children?.length ? walk(node.children) : undefined;
      const matches = node.productType === productType;

      if (matches || (children && children.length > 0)) {
        result.push({ ...node, children });
      }
    }

    return result;
  }

  return walk(categories);
}
