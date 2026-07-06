"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, Loader2, Package, Tag, Users } from "lucide-react";
import { getAdminDashboardStats } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/constants/routes";
import AdminPageHeader from "@/components/features/admin/AdminPageHeader";
import AdminStatCard from "@/components/features/admin/AdminStatCard";

const QUICK_LINKS = [
  {
    href: ROUTES.ADMIN_PRODUCTS,
    label: "Quản lý sản phẩm",
    description: "Xem, lọc và ngừng bán sản phẩm",
    icon: Package,
  },
  {
    href: ROUTES.ADMIN_CATEGORIES,
    label: "Quản lý danh mục",
    description: "Cây danh mục sản phẩm",
    icon: FolderTree,
  },
  {
    href: ROUTES.ADMIN_BRANDS,
    label: "Quản lý thương hiệu",
    description: "Danh sách thương hiệu",
    icon: Tag,
  },
  {
    href: ROUTES.ADMIN_CUSTOMERS,
    label: "Quản lý khách hàng",
    description: "Danh sách tài khoản khách",
    icon: Users,
  },
] as const;

export default function AdminDashboardClient() {
  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    brandCount: 0,
    customerCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getAdminDashboardStats();
        if (!cancelled) {
          setStats(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Tổng quan"
        description="Bảng điều khiển quản trị Aqua Shop"
      />

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="border border-red-100 bg-red-50 px-6 py-10 text-center text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Sản phẩm"
              value={stats.productCount}
              icon={Package}
              accent="teal"
            />
            <AdminStatCard
              label="Danh mục"
              value={stats.categoryCount}
              icon={FolderTree}
              accent="blue"
            />
            <AdminStatCard
              label="Thương hiệu"
              value={stats.brandCount}
              icon={Tag}
              accent="amber"
            />
            <AdminStatCard
              label="Khách hàng"
              value={stats.customerCount}
              icon={Users}
              accent="violet"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-4 border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-ocean-900">{label}</p>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
