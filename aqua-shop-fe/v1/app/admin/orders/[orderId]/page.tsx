import AdminOrderDetailClient from "@/components/features/admin/AdminOrderDetailClient";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  return <AdminOrderDetailClient orderId={orderId} />;
}
