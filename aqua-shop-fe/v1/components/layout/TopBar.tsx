"use client";

import Link from "next/link";
import {
  Banknote,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Truck,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isStaffRole } from "@/lib/admin-auth";
import { ROUTES } from "@/constants/routes";

const SERVICE_ITEMS = [
  {
    icon: Truck,
    label: "Giao hàng toàn quốc",
    href: ROUTES.CONTACT,
  },
  {
    icon: Banknote,
    label: "Nhận hàng thanh toán sau (COD)",
    href: ROUTES.CONTACT,
  },
  {
    icon: ClipboardList,
    label: "Đơn hàng của tôi",
    href: ROUTES.ORDERS,
  },
] as const;

function Divider() {
  return (
    <span
      className="mx-3 hidden h-3 w-px shrink-0 bg-slate-300 sm:inline-block"
      aria-hidden="true"
    />
  );
}

export default function TopBar() {
  const { isHydrated, isAuthenticated, user, logout } = useAuth();
  const showAdminLink = isAuthenticated && isStaffRole(user?.role);

  return (
    <div className="border-b border-slate-200 bg-slate-100">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav
          className="hidden min-w-0 items-center lg:flex"
          aria-label="Thông tin dịch vụ"
        >
          {SERVICE_ITEMS.map((item, index) => (
            <div key={item.label} className="flex items-center">
              {index > 0 && <Divider />}
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-700 transition-colors hover:text-ocean-800"
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>

        <nav
          className="ml-auto flex items-center"
          aria-label="Tài khoản"
        >
          {!isHydrated ? (
            <div className="h-4 w-28" aria-hidden="true" />
          ) : isAuthenticated && user ? (
            <>
              {showAdminLink && (
                <>
                  <Link
                    href={ROUTES.ADMIN}
                    className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-teal-700 transition-colors hover:text-teal-900"
                  >
                    <LayoutDashboard
                      className="h-3.5 w-3.5 shrink-0"
                      strokeWidth={1.75}
                    />
                    <span>Quản trị</span>
                  </Link>
                  <Divider />
                </>
              )}
              <Link
                href={ROUTES.PROFILE}
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-700 transition-colors hover:text-ocean-800"
              >
                <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="max-w-[140px] truncate sm:max-w-none">
                  {user.fullName || user.email}
                </span>
              </Link>
              <Divider />
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-700 transition-colors hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-700 transition-colors hover:text-ocean-800"
              >
                <User className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span>Đăng nhập</span>
              </Link>
              <Divider />
              <Link
                href={ROUTES.LOGIN}
                className="text-[11px] font-medium uppercase tracking-wide text-slate-700 transition-colors hover:text-ocean-800"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
