"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Fish, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolvePostLoginRedirect } from "@/lib/admin-auth";
import { ROUTES } from "@/constants/routes";
import { SYSTEM_MESSAGES } from "@/constants/systemMessages";

// 1. CHUYỂN TOÀN BỘ CODE CŨ THÀNH MỘT COMPONENT NỘI BỘ
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook này cần nằm trong Suspense
  const { isHydrated, isAuthenticated, user, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const { path } = resolvePostLoginRedirect(user?.role, redirectParam);
    router.replace(path);
  }, [isHydrated, isAuthenticated, user?.role, redirectParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login({
        username: username.trim(),
        password,
      });

      const { path, forbiddenAdmin } = resolvePostLoginRedirect(
        loggedInUser.role,
        redirectParam,
      );

      if (forbiddenAdmin) {
        setError(SYSTEM_MESSAGES.ADMIN_FORBIDDEN);
        router.push(ROUTES.HOME);
        router.refresh();
        return;
      }

      router.push(path);
      router.refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-600 to-teal-500 shadow-lg">
            <Fish className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ocean-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500">
            Chào mừng trở lại Aqua Shop
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
        >
          {error && (
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-700 to-teal-600 py-3 text-sm font-semibold text-white transition-all hover:from-ocean-800 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link
              href={ROUTES.HOME}
              className="font-medium text-teal-600 hover:text-teal-700"
            >
              Về trang chủ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// 2. COMPONENT CHÍNH EXPORT DEFAULT ĐỂ BỌC SUSPENSE AN TOÀN TUYỆT ĐỐI
export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
