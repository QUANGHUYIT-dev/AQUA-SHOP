import type { Metadata } from "next";
import CheckoutPageClient from "@/components/features/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Thanh toán | AquaShop",
  description: "Trang thanh toán đơn hàng AquaShop",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
