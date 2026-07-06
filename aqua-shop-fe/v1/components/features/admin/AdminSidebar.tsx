"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fish,
  FolderTree,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  ScanLine,
  Store,
  Tag,
  Users,
  Warehouse,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/admin-auth";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { href: ROUTES.ADMIN, label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: ROUTES.ADMIN_POS, label: "Bán tại quầy", icon: ScanLine },
  { href: ROUTES.ADMIN_ORDERS, label: "Đơn hàng", icon: PackageCheck },
  { href: ROUTES.ADMIN_PRODUCTS, label: "Sản phẩm", icon: Package },
  { href: ROUTES.ADMIN_INVENTORY, label: "Tồn kho", icon: Warehouse },
  { href: ROUTES.ADMIN_CATEGORIES, label: "Danh mục", icon: FolderTree },
  { href: ROUTES.ADMIN_BRANDS, label: "Thương hiệu", icon: Tag },
  { href: ROUTES.ADMIN_BANNERS, label: "Banner", icon: Image },
  { href: ROUTES.ADMIN_CUSTOMERS, label: "Khách hàng", icon: Users },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-ocean-950 text-white">
      <div className="border-b border-slate-800 px-5 py-5">
        <Link href={ROUTES.ADMIN} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500">
            <Fish className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">Aqua Shop</p>
            <p className="text-[11px] uppercase tracking-widest text-teal-300">
              Admin
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const { href, label, icon: Icon } = item;
          const exact = "exact" in item ? item.exact : false;
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        {user && (
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-medium text-white">
              {user.fullName || user.email}
            </p>
            <p className="text-xs text-slate-400">
              {getRoleLabel(user.role)}
            </p>
          </div>
        )}
        <Link
          href={ROUTES.HOME}
          className="mb-2 flex items-center gap-2 px-1 py-2 text-sm text-slate-300 transition-colors hover:text-white"
        >
          <Store className="h-4 w-4" />
          Về cửa hàng
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 px-1 py-2 text-sm text-red-300 transition-colors hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
