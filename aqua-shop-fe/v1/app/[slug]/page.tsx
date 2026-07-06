import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CategoryPageClient from "@/components/features/category/CategoryPageClient";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function CategoryFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
    </div>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<CategoryFallback />}>
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}
