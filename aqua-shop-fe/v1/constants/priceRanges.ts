import { DEFAULT_PRICE_MAX, DEFAULT_PRICE_MIN } from "@/lib/search-params";

export interface PriceRangePreset {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGE_PRESETS: PriceRangePreset[] = [
  {
    id: "all",
    label: "Tất cả mức giá",
    min: DEFAULT_PRICE_MIN,
    max: DEFAULT_PRICE_MAX,
  },
  {
    id: "under-100k",
    label: "Dưới 100.000₫",
    min: DEFAULT_PRICE_MIN,
    max: 100_000,
  },
  {
    id: "100k-500k",
    label: "100.000₫ - 500.000₫",
    min: 100_000,
    max: 500_000,
  },
  {
    id: "500k-1m",
    label: "500.000₫ - 1.000.000₫",
    min: 500_000,
    max: 1_000_000,
  },
  {
    id: "1m-3m",
    label: "1.000.000₫ - 3.000.000₫",
    min: 1_000_000,
    max: 3_000_000,
  },
  {
    id: "3m-10m",
    label: "3.000.000₫ - 10.000.000₫",
    min: 3_000_000,
    max: 10_000_000,
  },
  {
    id: "over-10m",
    label: "Trên 10.000.000₫",
    min: 10_000_000,
    max: DEFAULT_PRICE_MAX,
  },
];

export function matchPricePresetId(minPrice: number, maxPrice: number): string {
  const matched = PRICE_RANGE_PRESETS.find(
    (preset) => preset.min === minPrice && preset.max === maxPrice,
  );
  return matched?.id ?? "custom";
}

export function isDefaultPriceRange(minPrice: number, maxPrice: number): boolean {
  return minPrice <= DEFAULT_PRICE_MIN && maxPrice >= DEFAULT_PRICE_MAX;
}
