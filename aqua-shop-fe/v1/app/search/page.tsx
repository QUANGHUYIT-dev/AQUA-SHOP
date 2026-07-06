import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SearchPageClient from "@/components/features/search/SearchPageClient";

function SearchFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
