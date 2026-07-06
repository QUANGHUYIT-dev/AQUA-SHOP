"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProductVariantForm } from "@/utils/admin-product-form";

const inputClass =
  "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

interface AdminProductVariantListProps {
  variants: ProductVariantForm[];
  onChange: (variants: ProductVariantForm[]) => void;
}

export default function AdminProductVariantList({
  variants,
  onChange,
}: AdminProductVariantListProps) {
  const updateVariant = (index: number, patch: Partial<ProductVariantForm>) => {
    onChange(
      variants.map((variant, i) =>
        i === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const updateAttributes = (
    index: number,
    key: keyof ProductVariantForm["attributes"],
    value: string,
  ) => {
    onChange(
      variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              attributes: { ...variant.attributes, [key]: value },
            }
          : variant,
      ),
    );
  };

  const setDefault = (index: number) => {
    onChange(
      variants.map((variant, i) => ({
        ...variant,
        isDefault: i === index,
      })),
    );
  };

  const addVariant = () => {
    onChange([
      ...variants,
      {
        sku: "",
        attributes: { size: "", volume: "", color: "" },
        price: "",
        salePrice: "",
        stockQuantity: "0",
        weightGrams: "",
        isDefault: variants.length === 0,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    const next = variants.filter((_, i) => i !== index);
    if (!next.some((variant) => variant.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ocean-900">Biến thể</h2>
          <p className="mt-1 text-sm text-slate-500">
            SKU, giá, tồn kho và thuộc tính size / dung tích / màu
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100"
        >
          <Plus className="h-4 w-4" />
          Thêm biến thể
        </button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="border border-slate-100 bg-slate-50/60 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-medium text-ocean-900">
                Biến thể {index + 1}
                {variant.variantId && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({variant.variantId})
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="defaultVariant"
                    checked={variant.isDefault}
                    onChange={() => setDefault(index)}
                    className="h-4 w-4 border-slate-300 text-teal-600"
                  />
                  Mặc định
                </label>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className={labelClass}>SKU</span>
                <input
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, { sku: e.target.value })}
                  className={inputClass}
                  placeholder="CHIHIROS-WRGB2-60"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Giá *</span>
                <input
                  type="number"
                  min="0"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(index, { price: e.target.value })
                  }
                  className={inputClass}
                  placeholder="3200000"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Giá khuyến mãi</span>
                <input
                  type="number"
                  min="0"
                  value={variant.salePrice}
                  onChange={(e) =>
                    updateVariant(index, { salePrice: e.target.value })
                  }
                  className={inputClass}
                  placeholder="2990000"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Tồn kho</span>
                <input
                  type="number"
                  min="0"
                  value={variant.stockQuantity}
                  onChange={(e) =>
                    updateVariant(index, { stockQuantity: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Khối lượng (gram)</span>
                <input
                  type="number"
                  min="0"
                  value={variant.weightGrams}
                  onChange={(e) =>
                    updateVariant(index, { weightGrams: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Size</span>
                <input
                  value={variant.attributes.size}
                  onChange={(e) =>
                    updateAttributes(index, "size", e.target.value)
                  }
                  className={inputClass}
                  placeholder="60cm"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Dung tích</span>
                <input
                  value={variant.attributes.volume}
                  onChange={(e) =>
                    updateAttributes(index, "volume", e.target.value)
                  }
                  className={inputClass}
                  placeholder="500ml"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Màu sắc</span>
                <input
                  value={variant.attributes.color}
                  onChange={(e) =>
                    updateAttributes(index, "color", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Đen"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
