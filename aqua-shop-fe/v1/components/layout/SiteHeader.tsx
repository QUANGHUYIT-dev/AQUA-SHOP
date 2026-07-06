"use client";

import { Suspense } from "react";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import CategoryNavBar from "@/components/layout/CategoryNavBar";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/constants/routes";
import { usePathname, useSearchParams } from "next/navigation";

// 1. Tách phần ruột có chứa logic useSearchParams ra đây
function SiteHeaderContent() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery =
    pathname === ROUTES.SEARCH ? (searchParams.get("q") ?? "") : "";

  return (
    <>
      <TopBar />
      <Header
        key={`${pathname}:${searchQuery}`}
        cartCount={itemCount}
        initialSearchQuery={searchQuery}
      />
      <CategoryNavBar />
    </>
  );
}

// 2. Component chính export ra ngoài sẽ được bọc trong Suspense
// fallback={...} bạn có thể để giao diện Header trống hoặc TopBar tĩnh nếu muốn, ở đây để tạm một khung chứa để tránh giật giao diện.
export default function SiteHeader() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[100px] bg-white animate-pulse" /> // Tạo hiệu ứng loading nhẹ khi build/render
      }
    >
      <SiteHeaderContent />
    </Suspense>
  );
}
