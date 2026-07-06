import { Fish, Flame, Leaf, Settings2, type LucideIcon } from "lucide-react";
import type { Category } from "@/types/product";
import ProductSectionHeader from "@/components/features/home/ProductSectionHeader";

interface CategorySectionHeaderProps {
  category: Category;
  viewAllHref: string;
}

function getCategoryIcon(category: Category): LucideIcon {
  switch (category.productType) {
    case "FISH":
      return Fish;
    case "PLANT":
      return Leaf;
    case "ACCESSORY":
      return Settings2;
    default:
      return Flame;
  }
}

export default function CategorySectionHeader({
  category,
  viewAllHref,
}: CategorySectionHeaderProps) {
  return (
    <ProductSectionHeader
      title={category.name}
      icon={getCategoryIcon(category)}
      viewAllHref={viewAllHref}
    />
  );
}
