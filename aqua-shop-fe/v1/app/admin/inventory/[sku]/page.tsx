import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InventoryDetailPageClient from "@/components/features/inventory/InventoryDetailPageClient";

interface Props {
  params: Promise<{ sku: string }>;
}

export const metadata: Metadata = {
  title: "Chi tiết tồn kho | AquaShop Admin",
  description: "Xem chi tiết và điều chỉnh tồn kho sản phẩm",
};

export default async function InventoryDetailPage({ params }: Props) {
  const { sku } = await params;

  if (!sku) {
    notFound();
  }

  const decodedSku = decodeURIComponent(sku);

  return <InventoryDetailPageClient sku={decodedSku} />;
}
