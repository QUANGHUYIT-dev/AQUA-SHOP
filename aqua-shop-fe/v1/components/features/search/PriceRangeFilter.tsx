"use client";

import {
  matchPricePresetId,
  PRICE_RANGE_PRESETS,
} from "@/constants/priceRanges";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (minPrice: number, maxPrice: number) => void;
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeFilterProps) {
  const activePresetId = matchPricePresetId(minPrice, maxPrice);

  return (
    <div className="space-y-2">
      {PRICE_RANGE_PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.min, preset.max)}
            className={`w-full border px-3 py-2.5 text-left text-sm transition ${
              isActive
                ? "border-[#ee4d2d] bg-[#ee4d2d]/5 font-medium text-[#ee4d2d]"
                : "border-slate-200 bg-white text-slate-700 hover:border-[#ee4d2d]/40 hover:bg-slate-50"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
