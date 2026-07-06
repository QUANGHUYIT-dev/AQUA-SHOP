import type { Metadata } from "next";
import InventoryListPageClient from "@/components/features/inventory/InventoryListPageClient";

export const metadata: Metadata = {
  title: "Quản lý tồn kho | AquaShop Admin",
  description: "Danh sách tồn kho sản phẩm",
};

export default function InventoryListPage() {
  return <InventoryListPageClient />;
}
