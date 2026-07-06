import type { ProductVariant } from "@/types/product";

export type VariantDimension = "size" | "volume" | "color";

export const VARIANT_DIMENSIONS: VariantDimension[] = [
  "size",
  "volume",
  "color",
];

export const VARIANT_DIMENSION_LABELS: Record<VariantDimension, string> = {
  size: "Kích thước",
  volume: "Dung tích",
  color: "Màu sắc",
};

const PLACEHOLDER_VALUES = new Set(["string", "null", "undefined", "-", "n/a"]);

export type VariantSelection = Partial<Record<VariantDimension, string>>;

export function isMeaningfulVariantValue(
  value?: string | null,
): value is string {
  if (!value?.trim()) return false;
  return !PLACEHOLDER_VALUES.has(value.trim().toLowerCase());
}

export function getVariantAttribute(
  variant: ProductVariant,
  dimension: VariantDimension,
): string | undefined {
  const value = variant[dimension];
  return isMeaningfulVariantValue(value) ? value.trim() : undefined;
}

export function getDimensionOptions(
  variants: ProductVariant[],
  dimension: VariantDimension,
): string[] {
  const values = new Set<string>();
  for (const variant of variants) {
    const value = getVariantAttribute(variant, dimension);
    if (value) values.add(value);
  }
  return Array.from(values);
}

export function getActiveDimensions(
  variants: ProductVariant[],
): VariantDimension[] {
  return VARIANT_DIMENSIONS.filter(
    (dimension) => getDimensionOptions(variants, dimension).length >= 1,
  );
}

export function shouldUseFlatVariantList(variants: ProductVariant[]): boolean {
  return variants.length > 1 && getActiveDimensions(variants).length === 0;
}

function variantMatchesSelection(
  variant: ProductVariant,
  selection: VariantSelection,
  dimensions: VariantDimension[],
): boolean {
  return dimensions.every((dimension) => {
    const selected = selection[dimension];
    if (!selected) return true;
    return getVariantAttribute(variant, dimension) === selected;
  });
}

export function findVariantsMatchingSelection(
  variants: ProductVariant[],
  selection: VariantSelection,
  dimensions: VariantDimension[],
): ProductVariant[] {
  return variants.filter((variant) =>
    variantMatchesSelection(variant, selection, dimensions),
  );
}

export function resolveVariantFromSelection(
  variants: ProductVariant[],
  selection: VariantSelection,
  dimensions: VariantDimension[],
): ProductVariant | undefined {
  const matches = findVariantsMatchingSelection(variants, selection, dimensions);
  if (!matches.length) return undefined;

  if (dimensions.every((dimension) => selection[dimension])) {
    return matches[0];
  }

  return (
    matches.find((variant) => variant.isDefault) ??
    matches[0]
  );
}

export function getSelectionFromVariant(
  variant: ProductVariant,
): VariantSelection {
  const selection: VariantSelection = {};
  for (const dimension of VARIANT_DIMENSIONS) {
    const value = getVariantAttribute(variant, dimension);
    if (value) selection[dimension] = value;
  }
  return selection;
}

export function applyDimensionSelection(
  variants: ProductVariant[],
  current: VariantSelection,
  dimension: VariantDimension,
  value: string,
  activeDimensions: VariantDimension[],
): VariantSelection {
  const next: VariantSelection = { ...current, [dimension]: value };
  let candidates = findVariantsMatchingSelection(
    variants,
    next,
    activeDimensions,
  );

  if (!candidates.length) {
    candidates = variants.filter(
      (variant) => getVariantAttribute(variant, dimension) === value,
    );
    if (!candidates.length) return current;

    const matched =
      candidates.find((variant) => variant.isDefault) ?? candidates[0];
    return getSelectionFromVariant(matched);
  }

  const resolved: VariantSelection = { ...next };
  for (const activeDimension of activeDimensions) {
    if (resolved[activeDimension]) continue;

    const fallback = getVariantAttribute(candidates[0], activeDimension);
    if (fallback) resolved[activeDimension] = fallback;
  }

  candidates = findVariantsMatchingSelection(
    variants,
    resolved,
    activeDimensions,
  );

  if (!candidates.length) return current;

  const matched = resolveVariantFromSelection(
    variants,
    resolved,
    activeDimensions,
  );
  if (!matched) return resolved;

  return getSelectionFromVariant(matched);
}

export function isDimensionOptionAvailable(
  variants: ProductVariant[],
  _selection: VariantSelection,
  dimension: VariantDimension,
  value: string,
  _activeDimensions: VariantDimension[],
): boolean {
  return variants.some(
    (variant) => getVariantAttribute(variant, dimension) === value,
  );
}

function findVariantsForDimensionValue(
  variants: ProductVariant[],
  selection: VariantSelection,
  dimension: VariantDimension,
  value: string,
  activeDimensions: VariantDimension[],
): ProductVariant[] {
  const exactMatches = findVariantsMatchingSelection(
    variants,
    { ...selection, [dimension]: value },
    activeDimensions,
  );
  if (exactMatches.length) return exactMatches;

  return variants.filter(
    (variant) => getVariantAttribute(variant, dimension) === value,
  );
}

export function isDimensionOptionOutOfStock(
  variants: ProductVariant[],
  selection: VariantSelection,
  dimension: VariantDimension,
  value: string,
  activeDimensions: VariantDimension[],
): boolean {
  const matches = findVariantsForDimensionValue(
    variants,
    selection,
    dimension,
    value,
    activeDimensions,
  );

  if (!matches.length) return true;
  return matches.every((variant) => (variant.stockQuantity ?? 1) <= 0);
}

export function buildInitialVariantSelection(
  variants: ProductVariant[],
  defaultVariant?: ProductVariant,
): VariantSelection {
  const activeDimensions = getActiveDimensions(variants);
  if (!activeDimensions.length || !defaultVariant) return {};

  const selection: VariantSelection = {};
  for (const dimension of activeDimensions) {
    const value = getVariantAttribute(defaultVariant, dimension);
    if (value) selection[dimension] = value;
  }
  return selection;
}
