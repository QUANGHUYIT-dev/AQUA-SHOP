import type { StaffRole } from "@/types/admin";
import { ROUTES } from "@/constants/routes";

export const STAFF_ROLES: StaffRole[] = ["ADMIN", "STAFF", "WAREHOUSE"];

export function isStaffRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.trim().toUpperCase();
  return STAFF_ROLES.includes(normalized as StaffRole);
}

export function isAdminPath(path: string): boolean {
  return path === ROUTES.ADMIN || path.startsWith("/admin/");
}

/** Sau login: staff → /admin (hoặc trang admin được yêu cầu), khách → redirect hoặc trang chủ. */
export function resolvePostLoginRedirect(
  role: string | undefined | null,
  redirectParam: string | null,
): { path: string; forbiddenAdmin?: boolean } {
  const requested = redirectParam?.trim() ?? "";

  if (isStaffRole(role)) {
    if (requested && isAdminPath(requested)) {
      return { path: requested };
    }
    return { path: ROUTES.ADMIN };
  }

  if (requested && isAdminPath(requested)) {
    return { path: ROUTES.HOME, forbiddenAdmin: true };
  }

  return { path: requested || ROUTES.HOME };
}

export function getRoleLabel(role?: string | null): string {
  if (!role) return "—";
  const normalized = role.trim().toUpperCase();
  const labels: Record<string, string> = {
    ADMIN: "Quản trị viên",
    STAFF: "Nhân viên",
    WAREHOUSE: "Kho",
    CUSTOMER: "Khách hàng",
  };
  return labels[normalized] ?? role;
}
