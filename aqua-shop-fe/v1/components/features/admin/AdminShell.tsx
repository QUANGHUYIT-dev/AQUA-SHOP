"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { ROUTES } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";
import AdminSidebar from "@/components/features/admin/AdminSidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { isLoading, allowed, error } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md border border-red-100 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-red-700">{error ?? SYSTEM_MESSAGES.ADMIN_FORBIDDEN}</p>
          <button
            type="button"
            onClick={() => router.push(ROUTES.HOME)}
            className="mt-4 text-sm font-semibold text-teal-600 hover:underline"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
