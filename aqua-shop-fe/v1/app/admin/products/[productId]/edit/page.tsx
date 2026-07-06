import AdminEditProductClient from "@/components/features/admin/AdminEditProductClient";

interface AdminEditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { productId } = await params;
  return <AdminEditProductClient productId={productId} />;
}
