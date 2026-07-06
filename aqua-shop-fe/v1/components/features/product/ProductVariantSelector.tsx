"use client";

import type { ProductVariant } from "@/types/product";
import {
  applyDimensionSelection,
  getActiveDimensions,
  getDimensionOptions,
  getVariantAttribute,
  isDimensionOptionAvailable,
  isDimensionOptionOutOfStock,
  resolveVariantFromSelection,
  shouldUseFlatVariantList,
  VARIANT_DIMENSION_LABELS,
  type VariantDimension,
  type VariantSelection,
} from "@/utils/variant-selector-utils";
import { getVariantLabel } from "@/utils/product-detail-utils";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selection: VariantSelection;
  selectedVariantId: string;
  onSelectionChange: (selection: VariantSelection, variantId: string) => void;
}

function optionClassName({
  selected,
  disabled,
  outOfStock,
}: {
  selected: boolean;
  disabled: boolean;
  outOfStock: boolean;
}) {
  if (disabled) {
    return "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through";
  }

  if (selected) {
    return "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500";
  }

  if (outOfStock) {
    return "border-slate-200 bg-white text-slate-400 line-through hover:border-slate-300";
  }

  return "border-slate-200 bg-white text-slate-700 hover:border-teal-200";
}

function DimensionRow({
  dimension,
  variants,
  selection,
  activeDimensions,
  onSelect,
}: {
  dimension: VariantDimension;
  variants: ProductVariant[];
  selection: VariantSelection;
  activeDimensions: VariantDimension[];
  onSelect: (dimension: VariantDimension, value: string) => void;
}) {
  const options = getDimensionOptions(variants, dimension);
  if (options.length === 0) return null;

  const isSingleOption = options.length === 1;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ocean-900">
        {VARIANT_DIMENSION_LABELS[dimension]}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((value) => {
          const selected =
            selection[dimension] === value ||
            (isSingleOption && options[0] === value);
          const available = isDimensionOptionAvailable(
            variants,
            selection,
            dimension,
            value,
            activeDimensions,
          );
          const outOfStock = available
            ? isDimensionOptionOutOfStock(
                variants,
                selection,
                dimension,
                value,
                activeDimensions,
              )
            : false;

          return (
            <button
              key={`${dimension}-${value}`}
              type="button"
              disabled={!available}
              onClick={() => onSelect(dimension, value)}
              className={`min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition-all ${optionClassName({
                selected,
                disabled: !available,
                outOfStock,
              })}`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlatVariantList({
  variants,
  selectedVariantId,
  onSelectVariant,
}: {
  variants: ProductVariant[];
  selectedVariantId: string;
  onSelectVariant: (variantId: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ocean-900">
        Chọn phân loại
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const outOfStock = (variant.stockQuantity ?? 1) <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant.id)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${optionClassName({
                selected: isSelected,
                disabled: false,
                outOfStock,
              })}`}
            >
              {getVariantLabel(variant)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductVariantSelector({
  variants,
  selection,
  selectedVariantId,
  onSelectionChange,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) return null;

  const activeDimensions = getActiveDimensions(variants);

  if (variants.length <= 1 && activeDimensions.length === 0) return null;

  if (shouldUseFlatVariantList(variants)) {
    return (
      <FlatVariantList
        variants={variants}
        selectedVariantId={selectedVariantId}
        onSelectVariant={(variantId) => {
          const variant = variants.find((item) => item.id === variantId);
          if (!variant) return;

          const nextSelection: VariantSelection = {};
          for (const dimension of activeDimensions) {
            const value = getVariantAttribute(variant, dimension);
            if (value) nextSelection[dimension] = value;
          }
          onSelectionChange(nextSelection, variantId);
        }}
      />
    );
  }

  const handleSelect = (dimension: VariantDimension, value: string) => {
    const nextSelection = applyDimensionSelection(
      variants,
      selection,
      dimension,
      value,
      activeDimensions,
    );

    const matched = resolveVariantFromSelection(
      variants,
      nextSelection,
      activeDimensions,
    );

    onSelectionChange(nextSelection, matched?.id ?? selectedVariantId);
  };

  return (
    <div className="space-y-5">
      {activeDimensions.map((dimension) => (
        <DimensionRow
          key={dimension}
          dimension={dimension}
          variants={variants}
          selection={selection}
          activeDimensions={activeDimensions}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
