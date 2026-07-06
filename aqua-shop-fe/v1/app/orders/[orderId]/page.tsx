import type { Metadata } from "next";
import OrderDetailPageClient from "@/components/features/orders/OrderDetailPageClient";

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Đơn hàng #${orderId} | AquaShop`,
    description: `Chi tiết đơn hàng ${orderId}`,
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  return <OrderDetailPageClient orderId={orderId} />;
}
