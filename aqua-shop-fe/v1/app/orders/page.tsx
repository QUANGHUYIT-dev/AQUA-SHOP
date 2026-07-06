import type { Metadata } from "next";
import OrdersPageClient from "@/components/features/orders/OrdersPageClient";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | AquaShop",
  description: "Danh sách đơn hàng của bạn tại AquaShop",
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
