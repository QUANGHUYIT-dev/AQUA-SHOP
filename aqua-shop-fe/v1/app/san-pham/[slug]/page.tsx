import ProductDetailPageClient from "@/components/features/product/ProductDetailPageClient";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  return <ProductDetailPageClient slug={slug} />;
}
