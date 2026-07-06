"use client";

import type { AccessoryDetail, FishDetail, PlantDetail, ProductType } from "@/types/product";
import { usesAccessoryDetail } from "@/utils/product-utils";
import {
  ACCESSORY_TYPE_OPTIONS,
  FISH_DIET_OPTIONS,
  FISH_TEMPERAMENT_OPTIONS,
  LIGHT_LEVEL_OPTIONS,
  PLANT_DIFFICULTY_OPTIONS,
  PLANT_PLACEMENT_OPTIONS,
} from "@/utils/admin-product-form";

const inputClass =
  "w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

interface AdminProductTypeDetailFieldsProps {
  productType: ProductType;
  plantDetail: PlantDetail;
  fishDetail: FishDetail;
  accessoryDetail: AccessoryDetail;
  onPlantChange: (detail: PlantDetail) => void;
  onFishChange: (detail: FishDetail) => void;
  onAccessoryChange: (detail: AccessoryDetail) => void;
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        className={inputClass}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PlantFields({
  detail,
  onChange,
}: {
  detail: PlantDetail;
  onChange: (detail: PlantDetail) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className={labelClass}>Tên khoa học</span>
        <input
          value={detail.scientificName ?? ""}
          onChange={(e) =>
            onChange({ ...detail, scientificName: e.target.value })
          }
          className={inputClass}
          placeholder="Anubias barteri var. nana"
        />
      </label>
      <SelectField
        label="Độ khó"
        value={detail.difficulty}
        options={PLANT_DIFFICULTY_OPTIONS}
        onChange={(difficulty) => onChange({ ...detail, difficulty })}
      />
      <SelectField
        label="Ánh sáng"
        value={detail.lightLevel}
        options={LIGHT_LEVEL_OPTIONS}
        onChange={(lightLevel) => onChange({ ...detail, lightLevel })}
      />
      <SelectField
        label="Vị trí trồng"
        value={detail.placement}
        options={PLANT_PLACEMENT_OPTIONS}
        onChange={(placement) => onChange({ ...detail, placement })}
      />
      <label className="block">
        <span className={labelClass}>Tốc độ sinh trưởng</span>
        <input
          value={detail.growthRate ?? ""}
          onChange={(e) => onChange({ ...detail, growthRate: e.target.value })}
          className={inputClass}
          placeholder="Chậm"
        />
      </label>
      <NumberField
        label="Chiều cao tối đa (cm)"
        value={detail.maxHeightCm}
        onChange={(maxHeightCm) => onChange({ ...detail, maxHeightCm })}
      />
      <label className="flex items-center gap-2 pt-7">
        <input
          type="checkbox"
          checked={detail.co2Required ?? false}
          onChange={(e) =>
            onChange({ ...detail, co2Required: e.target.checked })
          }
          className="h-4 w-4 rounded border-slate-300 text-teal-600"
        />
        <span className="text-sm text-slate-700">Cần bổ sung CO2</span>
      </label>
    </div>
  );
}

function FishFields({
  detail,
  onChange,
}: {
  detail: FishDetail;
  onChange: (detail: FishDetail) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className={labelClass}>Tên khoa học</span>
        <input
          value={detail.scientificName ?? ""}
          onChange={(e) =>
            onChange({ ...detail, scientificName: e.target.value })
          }
          className={inputClass}
          placeholder="Betta splendens"
        />
      </label>
      <SelectField
        label="Tính cách"
        value={detail.temperament}
        options={FISH_TEMPERAMENT_OPTIONS}
        onChange={(temperament) => onChange({ ...detail, temperament })}
      />
      <SelectField
        label="Chế độ ăn"
        value={detail.diet}
        options={FISH_DIET_OPTIONS}
        onChange={(diet) => onChange({ ...detail, diet })}
      />
      <NumberField
        label="Bể tối thiểu (lít)"
        value={detail.minTankSizeLiters}
        onChange={(minTankSizeLiters) =>
          onChange({ ...detail, minTankSizeLiters })
        }
      />
      <NumberField
        label="Kích thước tối đa (cm)"
        value={detail.maxSizeCm}
        onChange={(maxSizeCm) => onChange({ ...detail, maxSizeCm })}
      />
      <NumberField
        label="Nhiệt độ tối thiểu (°C)"
        value={detail.waterTempMinC}
        onChange={(waterTempMinC) => onChange({ ...detail, waterTempMinC })}
      />
      <NumberField
        label="Nhiệt độ tối đa (°C)"
        value={detail.waterTempMaxC}
        onChange={(waterTempMaxC) => onChange({ ...detail, waterTempMaxC })}
      />
      <NumberField
        label="pH tối thiểu"
        value={detail.phMin}
        onChange={(phMin) => onChange({ ...detail, phMin })}
        step="0.1"
      />
      <NumberField
        label="pH tối đa"
        value={detail.phMax}
        onChange={(phMax) => onChange({ ...detail, phMax })}
        step="0.1"
      />
      <label className="flex items-center gap-2 pt-7">
        <input
          type="checkbox"
          checked={detail.isSchooling ?? false}
          onChange={(e) =>
            onChange({ ...detail, isSchooling: e.target.checked })
          }
          className="h-4 w-4 rounded border-slate-300 text-teal-600"
        />
        <span className="text-sm text-slate-700">Sống theo đàn</span>
      </label>
      <NumberField
        label="Số lượng tối thiểu (con/đàn)"
        value={detail.minSchoolSize}
        onChange={(minSchoolSize) => onChange({ ...detail, minSchoolSize })}
      />
    </div>
  );
}

function AccessoryFields({
  detail,
  onChange,
}: {
  detail: AccessoryDetail;
  onChange: (detail: AccessoryDetail) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        label="Loại phụ kiện *"
        value={detail.accessoryType}
        options={ACCESSORY_TYPE_OPTIONS}
        onChange={(accessoryType) => onChange({ ...detail, accessoryType })}
      />
      <label className="block">
        <span className={labelClass}>Chất liệu</span>
        <input
          value={detail.material ?? ""}
          onChange={(e) => onChange({ ...detail, material: e.target.value })}
          className={inputClass}
          placeholder="Nhôm"
        />
      </label>
      <NumberField
        label="Bể tương thích tối thiểu (lít)"
        value={detail.compatibleTankMinLiters}
        onChange={(compatibleTankMinLiters) =>
          onChange({ ...detail, compatibleTankMinLiters })
        }
      />
      <NumberField
        label="Bể tương thích tối đa (lít)"
        value={detail.compatibleTankMaxLiters}
        onChange={(compatibleTankMaxLiters) =>
          onChange({ ...detail, compatibleTankMaxLiters })
        }
      />
      <NumberField
        label="Công suất (W)"
        value={detail.powerWattage}
        onChange={(powerWattage) => onChange({ ...detail, powerWattage })}
        step="0.1"
      />
      <NumberField
        label="Lưu lượng (L/h)"
        value={detail.flowRateLph}
        onChange={(flowRateLph) => onChange({ ...detail, flowRateLph })}
      />
      <NumberField
        label="Bảo hành (tháng)"
        value={detail.warrantyMonths}
        onChange={(warrantyMonths) => onChange({ ...detail, warrantyMonths })}
      />
      <label className="block sm:col-span-2">
        <span className={labelClass}>Thông số kỹ thuật</span>
        <textarea
          value={detail.specifications ?? ""}
          onChange={(e) =>
            onChange({ ...detail, specifications: e.target.value })
          }
          rows={3}
          className={inputClass}
        />
      </label>
    </div>
  );
}

export default function AdminProductTypeDetailFields({
  productType,
  plantDetail,
  fishDetail,
  accessoryDetail,
  onPlantChange,
  onFishChange,
  onAccessoryChange,
}: AdminProductTypeDetailFieldsProps) {
  if (productType === "PLANT") {
    return (
      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-ocean-900">
          Chi tiết cây thủy sinh
        </h2>
        <PlantFields detail={plantDetail} onChange={onPlantChange} />
      </section>
    );
  }

  if (productType === "FISH") {
    return (
      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-ocean-900">
          Chi tiết cá cảnh
        </h2>
        <FishFields detail={fishDetail} onChange={onFishChange} />
      </section>
    );
  }

  if (usesAccessoryDetail(productType)) {
    return (
      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-ocean-900">
          Chi tiết phụ kiện / thiết bị
        </h2>
        <AccessoryFields detail={accessoryDetail} onChange={onAccessoryChange} />
      </section>
    );
  }

  return null;
}
